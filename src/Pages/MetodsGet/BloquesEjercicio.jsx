import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaDumbbell,
  FaCalendarDay,
  FaPlus,
  FaUserPlus,
  FaArrowLeft,
  FaTrash,
  FaEdit,
  FaTimes,
  FaSearch,
  FaUserCheck
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import NavbarStaff from '../staff/NavbarStaff';
import ParticlesBackground from '../../Components/ParticlesBackground';
import { useAuth } from '../../AuthContext';
import clsx from 'clsx';

function agregarSaltosDeLineaAuto(textoPlano) {
  return textoPlano
    .split('\n') // por si ya vienen saltos
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '')
    .map((linea) => {
      if (
        /^(D[ií]a\s*\d+|Circuito|Intro|Parte|Final|Nota|Bloque|Desp|Sección|Seccion|Rutina|)/i.test(
          linea
        )
      ) {
        return `\n${linea}`; // salto antes de títulos
      }
      return linea;
    })
    .join('\n');
}

export default function BloquesEjercicio() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [bloques, setBloques] = useState([]);
  const [ejercicio, setEjercicio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [editandoBloqueId, setEditandoBloqueId] = useState(null);

  const [alumnos, setAlumnos] = useState([]);
  const [modalAsignarVisible, setModalAsignarVisible] = useState(false);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [bloqueSeleccionadoParaAsignar, setBloqueSeleccionadoParaAsignar] =
    useState(null);

  const [colorRutinaId, setColorRutinaId] = useState(null);
  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  const [modalColorVisible, setModalColorVisible] = useState(false);

  useEffect(() => {
    axios
      .get(`https://vps-5097245-x.dattaweb.com/rutina-colores`)
      .then((res) => setColoresDisponibles(res.data));
  }, []);

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await fetch('https://vps-5097245-x.dattaweb.com/students'); // Usá tu endpoint real
        const data = await res.json();
        setAlumnos(data);
      } catch (error) {
        console.error('Error al obtener alumnos', error);
      }
    };

    fetchAlumnos();
  }, []);

  const [busquedaAlumnos, setBusquedaAlumnos] = useState('');
  const [paginaAlumnos, setPaginaAlumnos] = useState(1);
  const alumnosPorPagina = 10;

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((a) =>
      `${a.nomyape} ${a.dni}`
        .toLowerCase()
        .includes(busquedaAlumnos.toLowerCase())
    );
  }, [alumnos, busquedaAlumnos]);

  const alumnosPaginados = useMemo(() => {
    return alumnosFiltrados.slice(0, paginaAlumnos * alumnosPorPagina);
  }, [alumnosFiltrados, paginaAlumnos]);

  const [desde, setDesde] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [hasta, setHasta] = useState(() => {
    const fechaHasta = new Date();
    fechaHasta.setDate(fechaHasta.getDate() + 7); // Por defecto +7 días
    return fechaHasta.toISOString().slice(0, 10);
  });

  const fetchBloques = async () => {
    try {
      const res = await axios.get(
        `https://vps-5097245-x.dattaweb.com/ejercicios-profes/${id}/bloques`
      );
      setBloques(res.data);
    } catch (error) {
      console.error('Error al obtener bloques:', error);
    }
  };

  const fetchEjercicio = async () => {
    try {
      const res = await axios.get(
        `https://vps-5097245-x.dattaweb.com/ejercicios-profes/${id}`
      );
      setEjercicio(res.data);
    } catch (error) {
      console.error('Error al obtener ejercicio:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEjercicio();
      fetchBloques();
    }
  }, [id]);

  function formatearContenidoEjercicio(textoPlano) {
    let resultado = '';
    const regex =
      /(D[ií]a \d+|Circuito final|Intro|Parte \d+|Final|Sección \d+|Nota|Bloque \d+):?/gi;
    const partes = textoPlano.split(regex).filter((p) => p.trim() !== '');

    for (let i = 0; i < partes.length; i++) {
      const parte = partes[i].trim();
      const esTitulo = regex.test(parte + ':'); // fuerza coincidencia exacta

      if (esTitulo || /^D[ií]a \d+$/i.test(parte)) {
        resultado += (resultado ? '\n\n' : '') + parte.replace(/:?\s*$/, ':'); // Título con :
      } else {
        // Insertar \n antes de cada ejercicio detectado por "nombre: algo"
        const ejercicios = parte
          .split(/(?=\b[A-ZÁÉÍÓÚÑ][^\n:]{2,}?:)/g)
          .map((ej) => ej.trim());
        for (let j = 0; j < ejercicios.length; j++) {
          const linea = ejercicios[j];
          if (linea) resultado += '\n' + linea;
        }
      }
    }

    return resultado.trim();
  }

  const guardarBloque = async () => {
    if (!nuevoContenido.trim()) return;

    // Aplicar formato automático
    const contenidoFormateado = formatearContenidoEjercicio(nuevoContenido);

    try {
      if (editandoBloqueId) {
        await axios.put(
          `https://vps-5097245-x.dattaweb.com/bloques-ejercicio/${editandoBloqueId}`,
          {
            contenido: contenidoFormateado
          }
        );
      } else {
        await axios.post(
          `https://vps-5097245-x.dattaweb.com/ejercicios-profes/${id}/bloques`,
          {
            contenido: contenidoFormateado
          }
        );
      }

      setShowModal(false);
      setNuevoContenido('');
      setEditandoBloqueId(null);
      fetchBloques();
    } catch (error) {
      console.error('Error al guardar bloque:', error);
    }
  };

  const eliminarBloque = async (bloqueId) => {
    const confirmar = window.confirm(
      '¿Estás seguro de que querés eliminar este bloque? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    try {
      await axios.delete(`https://vps-5097245-x.dattaweb.com/bloques-ejercicio/${bloqueId}`);
      fetchBloques();
    } catch (error) {
      console.error('Error al eliminar bloque:', error);
    }
  };

  const abrirEdicion = (bloque) => {
    setNuevoContenido(bloque.contenido);
    setEditandoBloqueId(bloque.id);
    setShowModal(true);
  };

  const fechaHoyArgentina = new Date().toLocaleDateString('fr-CA', {
    timeZone: 'America/Argentina/Buenos_Aires'
  });

  const handleAsignarBloque = async () => {
    if (!bloqueSeleccionadoParaAsignar || alumnosSeleccionados.length === 0) {
      alert('Seleccioná al menos un alumno');
      return;
    }

    try {
      setCargandoAsignacion(true);

      // ✅ Usar el contenido tal cual, ya formateado
      const contenidoFormateado = agregarSaltosDeLineaAuto(
        bloqueSeleccionadoParaAsignar.contenido
      );

      for (const alumno of alumnosSeleccionados) {
        // Crear rutina
        const rutinaRes = await fetch('https://vps-5097245-x.dattaweb.com/routines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: alumno.id,
            instructor_id: userId,
            fecha: fechaHoyArgentina,
            mes: new Date().getMonth() + 1,
            anio: new Date().getFullYear(),
            completado: 0
          })
        });

        const rutinaData = await rutinaRes.json();
        const rutinaId = rutinaData.id;

        // ✅ Guardar contenido entero como un solo registro
        await fetch('https://vps-5097245-x.dattaweb.com/routine_exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routine_id: rutinaId,
            musculo: ejercicio?.nombre || 'Bloque sin nombre',
            descripcion: contenidoFormateado,
            orden: 1,
            desde: new Date(`${desde}T00:00:00-03:00`),
            hasta: new Date(`${hasta}T00:00:00-03:00`),

            series: null,
            repeticiones: null,
            tiempo: null,
            descanso: null,
            color_id: colorRutinaId
          })
        });
      }

      alert('Rutina asignada correctamente 🎉');
      setModalAsignarVisible(false);
      setAlumnosSeleccionados([]);
    } catch (error) {
      console.error('Error al asignar bloque:', error);
      alert('Hubo un error al asignar el bloque');
    } finally {
      setCargandoAsignacion(false);
    }
  };

  return (
    <>
      <NavbarStaff></NavbarStaff>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-10 relative">
        <ParticlesBackground></ParticlesBackground>
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm"
          >
            <FaArrowLeft /> Volver
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl titulo uppercase font-bold mb-2 text-center flex items-center justify-center gap-3">
            <FaDumbbell className="text-pink-500" /> Bloques del Ejercicio
          </h1>

          {ejercicio && (
            <div className="text-center text-gray-300 mb-8">
              <p className="text-xl font-semibold">{ejercicio.nombre}</p>
              <p className="text-sm text-gray-400">
                Creado por: {ejercicio.profesor?.name}
              </p>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
            >
              <FaPlus /> Nuevo Bloque
            </button>
          </div>

          <div className="space-y-8">
            {bloques.map((bloque, index) => {
              const lineas = bloque.contenido.trim().split('\n');
              const titulo = lineas[0];
              const contenido = lineas.slice(1).join('\n');

              return (
                <motion.div
                  key={bloque.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl"
                >
                  {/* Encabezado */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h2 className="text-xl font-bold text-pink-400 flex items-center gap-2">
                      <FaDumbbell className="text-lg" /> {titulo}
                    </h2>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FaCalendarDay />
                      {new Date(bloque.creado_en).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Contenido */}
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-200 bg-white/5 p-4 rounded-xl shadow-inner border border-white/10">
                    {contenido}
                  </pre>

                  {/* Acciones */}
                  <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEdicion(bloque)}
                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-500 text-sm"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => eliminarBloque(bloque.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setModalAsignarVisible(true);
                        setBloqueSeleccionadoParaAsignar(bloque);
                      }}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
                    >
                      <FaUserPlus className="text-base" />
                      Asignar alumnos
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {bloques.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-10">
                No hay bloques cargados aún.
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl text-gray-800">
            <h2 className="text-2xl font-bold mb-2">
              {editandoBloqueId
                ? 'Editar Bloque de Ejercicio'
                : 'Crear Nuevo Bloque'}
            </h2>

            {ejercicio && (
              <p className="text-sm mb-4 text-gray-500">
                Ejercicio: <strong>{ejercicio.nombre}</strong>
              </p>
            )}

            <label
              htmlFor="contenido"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Contenido del bloque:
            </label>
            <textarea
              id="contenido"
              rows={10}
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
              placeholder={`Ejemplo:\nDía 2:\nAperturas inclinadas con mancuernas: 12 reps\nPress plano con barra: 10, 8, 6\nCruz de polea: 10 reps\n\nCircuito final:\nFondos: 12\nPush-ups: 15\n→ 4 vueltas`}
              className="w-full border border-gray-300 rounded-xl p-3 resize-none text-sm bg-gray-50"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditandoBloqueId(null);
                  setNuevoContenido('');
                }}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarBloque}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {editandoBloqueId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAsignarVisible && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl border border-white/20"
          >
            {/* Cerrar */}
            <button
              onClick={() => setModalAsignarVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <FaTimes size={22} />
            </button>

            {/* Título */}
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center tracking-tight uppercase">
              <FaUserPlus className="inline mr-2 text-green-600" />
              Asignar rutina a alumnos
            </h2>

            {/* Buscador */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={busquedaAlumnos}
                onChange={(e) => setBusquedaAlumnos(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />
              <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
            </div>

            {/* Rango de fechas */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">
                  Desde
                </label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600">
                  Hasta
                </label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                />
              </div>
            </div>

            {/* Listado */}
            {alumnosFiltrados.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No se encontraron alumnos
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto mb-4 space-y-2 pr-1 custom-scrollbar">
                {alumnosPaginados.map((alumno) => {
                  const selected = alumnosSeleccionados.some(
                    (a) => a.id === alumno.id
                  );
                  return (
                    <label
                      key={alumno.id}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all border',
                        selected
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : 'hover:bg-gray-100 border-transparent text-gray-700'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAlumnosSeleccionados((prev) => [
                              ...prev,
                              alumno
                            ]);
                          } else {
                            setAlumnosSeleccionados((prev) =>
                              prev.filter((a) => a.id !== alumno.id)
                            );
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-green-600 border-gray-300"
                      />
                      <span className="text-sm font-medium">
                        {alumno.nomyape} – DNI: {alumno.dni}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setModalColorVisible(true)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4"
            >
              🎨 Seleccionar color de rutina
            </button>

            {colorRutinaId && (
              <div className="text-xs text-gray-600 mb-4">
                Color seleccionado:{' '}
                {
                  coloresDisponibles.find((col) => col.id === colorRutinaId)
                    ?.descripcion
                }
              </div>
            )}
            {modalColorVisible && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
                >
                  {/* Cerrar */}
                  <button
                    onClick={() => setModalColorVisible(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                    aria-label="Cerrar"
                  >
                    <FaTimes size={22} />
                  </button>

                  {/* Título */}
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center tracking-tight uppercase">
                    🎨 Seleccionar Color de Rutina
                  </h2>

                  {/* Selector de colores */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {coloresDisponibles.map((col) => {
                      const seleccionado = colorRutinaId === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => {
                            setColorRutinaId(col.id);
                            setModalColorVisible(false);
                          }}
                          type="button"
                          className={clsx(
                            'rounded-xl p-4 border-2 transition flex flex-col items-center justify-center text-sm font-semibold text-white shadow-md',
                            seleccionado
                              ? 'border-green-600 scale-105 shadow-lg'
                              : 'border-transparent hover:border-white/30'
                          )}
                          style={{
                            backgroundColor: col.color_hex
                          }}
                        >
                          <span className="truncate">{col.nombre}</span>
                          <span className="mt-1 text-[11px] font-normal text-white/90 text-center">
                            {col.descripcion}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Ver más */}
            {alumnosFiltrados.length > alumnosPorPagina && (
              <div className="text-center mb-4">
                <button
                  onClick={() => setPaginaAlumnos((prev) => prev + 1)}
                  className="text-green-700 text-sm font-semibold hover:underline"
                >
                  Ver más alumnos
                </button>
              </div>
            )}

            {/* Asignar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAsignarBloque}
              disabled={cargandoAsignacion}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargandoAsignacion ? 'Asignando rutina...' : '✅ Asignar rutina'}
            </motion.button>
          </motion.div>
        </div>
      )}
    </>
  );
}
