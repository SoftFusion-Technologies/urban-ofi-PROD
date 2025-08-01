import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Modal from '../../../Components/Modal'; // Asegúrate de importar tu Modal actualizado
import { useRef } from 'react';
import { useAuth } from '../../../AuthContext';

const FormCrearRutina = ({ onClose, onRutinaCreada }) => {
  const { id: studentId } = useParams();
  const { userId } = useAuth();

  const hoy = new Date();
  const fechaInput = hoy.toISOString().slice(0, 10);
  const fechaTexto = `${String(hoy.getDate()).padStart(2, '0')}/${String(
    hoy.getMonth() + 1
  ).padStart(2, '0')}/${hoy.getFullYear()}`;

  const [fecha, setFecha] = useState(fechaInput);

  const [modalEjercicioIdx, setModalEjercicioIdx] = useState(null);
  const [ejerciciosProfesor, setEjerciciosProfesor] = useState([]); // array desde BD
  const [busquedaEjercicio, setBusquedaEjercicio] = useState('');

  const [modalBloquesEjercicio, setModalBloquesEjercicio] = useState(null); // { index, nombre, bloques }

  const [modoBloques, setModoBloques] = useState(false);

  // Cargar ejercicios del profe al montar
  useEffect(() => {
    // Reemplaza con tu endpoint y lógica de auth
    fetch(`https://vps-5097245-x.dattaweb.com/ejercicios-profes`)
      .then((res) => res.json())
      .then(setEjerciciosProfesor)
      .catch(() => setEjerciciosProfesor([]));
  }, [userId]);

  const ejerciciosProfesorFiltrados = ejerciciosProfesor.filter((ej) =>
    ej.nombre.toLowerCase().includes(busquedaEjercicio.toLowerCase())
  );

  function abrirModalSeleccionarEjercicio(idx) {
    setModalEjercicioIdx(idx);
    setBusquedaEjercicio('');
  }

  const seleccionarEjercicioYDescripcion = async (index, ejercicio) => {
    try {
      const res = await axios.get(
        `https://vps-5097245-x.dattaweb.com/ejercicios-profes/${ejercicio.id}/bloques`
      );
      const bloques = res.data;

      // Setea el nombre del ejercicio
      handleEjercicioChange(index, 'musculo', ejercicio.nombre);

      if (bloques.length <= 1) {
        // Insertar directamente si hay uno solo
        handleEjercicioChange(
          index,
          'descripcion',
          bloques[0]?.contenido || ''
        );
        setModalEjercicioIdx(null);
      } else {
        // Mostrar modal de selección de bloque
        setModalEjercicioIdx(null); // cerramos el modal anterior
        setModalBloquesEjercicio({ index, nombre: ejercicio.nombre, bloques });
      }
    } catch (error) {
      console.error('Error al obtener bloques:', error);
    }
  };

  const [ejercicios, setEjercicios] = useState([
    {
      musculo: '',
      descripcion: '',
      orden: 1,
      series: '',
      repeticiones: '',
      tiempo: '',
      descanso: ''
    }
  ]);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  const [modalColorIdx, setModalColorIdx] = useState(null); // null = cerrado, index = ejercicio abierto

  const [modalSuccess, setModalSuccess] = useState(false);

  const URL = 'https://vps-5097245-x.dattaweb.com/';

  useEffect(() => {
    fetch(`${URL}rutina-colores`)
      .then((res) => res.json())
      .then((data) => setColoresDisponibles(data));
  }, []);

  const contenedorEjerciciosRef = useRef(null);

  const handleAgregarEjercicio = () => {
    if (ejercicios.length >= 10) return; // Límite de 10 ejercicios
    setEjercicios([
      ...ejercicios,
      {
        musculo: '',
        descripcion: '',
        orden: ejercicios.length + 1,
        series: '',
        repeticiones: '',
        tiempo: '',
        descanso: ''
      }
    ]);

    // Pequeño timeout para que el DOM actualice antes de hacer scroll
    setTimeout(() => {
      if (contenedorEjerciciosRef.current) {
        contenedorEjerciciosRef.current.scrollTop =
          contenedorEjerciciosRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleEjercicioChange = (index, campo, valor) => {
    if (!ejercicios[index]) return; // previene errores de índice inválido
    const nuevos = [...ejercicios];
    nuevos[index][campo] = valor;
    setEjercicios(nuevos);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fecha) {
      alert('Por favor, ingresa la fecha de la rutina.');
      return;
    }
    for (let i = 0; i < ejercicios.length; i++) {
      const ej = ejercicios[i];
      if (!ej.musculo.trim() || !ej.descripcion.trim()) {
        alert(`Por favor, completa todos los campos del ejercicio #${i + 1}.`);
        return;
      }
    }

    try {
      const fechaObj = new Date(fecha);
      const mes = fechaObj.getMonth() + 1;
      const anio = fechaObj.getFullYear();
      const fechaHoy = new Date().toISOString().split('T')[0];
      const fechaDesde = desde || fechaHoy;
      const fechaHasta = hasta || fechaHoy;

      // 1. Chequear e insertar nuevos ejercicios del profesor
      for (let ej of ejercicios) {
        const yaExiste = ejerciciosProfesor.find(
          (x) =>
            x.nombre.trim().toLowerCase() === ej.musculo.trim().toLowerCase()
        );
        if (!yaExiste) {
          await axios.post(`${URL}ejercicios-profes`, {
            nombre: ej.musculo,
            profesor_id: userId
          });
        }
      }

      // 2. Crear rutina
      const rutinaResponse = await axios.post(`${URL}routines`, {
        student_id: parseInt(studentId),
        instructor_id: userId,
        mes,
        anio,
        fecha
      });
      const routine_id = rutinaResponse.data.id;
      if (!routine_id)
        throw new Error('No se recibió el ID de la rutina creada');

      // 3. Armar ejercicios para enviar
      const ejerciciosParaEnviar = ejercicios.map((ej) => ({
        routine_id,
        musculo: ej.musculo,
        descripcion: ej.descripcion,
        orden: ej.orden,
        series: ej.series || null,
        repeticiones: ej.repeticiones || null,
        tiempo: ej.tiempo || null,
        descanso: ej.descanso || null,
        desde: fechaDesde,
        hasta: fechaHasta,
        color_id: ej.color_id || null
      }));

      // 4. Enviar ejercicios asociados
      await axios.post(`${URL}routine_exercises`, ejerciciosParaEnviar);

      setModalSuccess(true);
      setFecha('');
      setEjercicios([{ musculo: '', descripcion: '', orden: 1 }]);
      setTimeout(() => {
        setModalSuccess(false);
        if (onRutinaCreada) onRutinaCreada();
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert('Error al crear la rutina: ' + error.message);
    }
  };

  const eliminarEjercicio = (index) => {
    const nuevos = [...ejercicios];
    nuevos.splice(index, 1);
    setEjercicios(nuevos);
  };

  useEffect(() => {
    if (modalColorIdx !== null && !ejercicios[modalColorIdx]) {
      setModalColorIdx(null);
    }
  }, [ejercicios.length]);

  return (
    <div className="p-6 sm:p-8 bg-white shadow-md rounded-xl max-w-3xl mx-auto  w-full">
      <h2 className="titulo uppercase mb-2 text-3xl font-extrabold text-center text-gray-900">
        Crear Rutina
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="fecha"
            className="block mb-2 text-sm font-semibold text-gray-700"
          >
            Fecha de rutina
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div
          ref={contenedorEjerciciosRef}
          className="max-h-[400px] overflow-y-auto pr-2 space-y-6"
        >
          {ejercicios.map((ej, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor={`musculo-${index}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Músculo o nombre del bloque
                  <span className="block text-xs text-gray-400 font-normal">
                    Ejemplo: “Pecho”, “Entrada en calor”, “Bloque 1”...
                  </span>
                </label>
                <button
                  type="button"
                  className="ml-4 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition"
                  onClick={() => abrirModalSeleccionarEjercicio(index)}
                >
                  Seleccionar
                </button>
              </div>

              <input
                id={`musculo-${index}`}
                type="text"
                value={ej.musculo}
                onChange={(e) =>
                  handleEjercicioChange(index, 'musculo', e.target.value)
                }
                maxLength={100}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition mb-4"
              />

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color del ejercicio
                </label>

                {/* Muestra el color actual (si tiene) */}
                {ej.color_id ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-6 h-6 rounded-full border border-gray-300"
                      style={{
                        background:
                          coloresDisponibles.find((c) => c.id === ej.color_id)
                            ?.color_hex || '#fff'
                      }}
                    />
                    <span className="font-semibold text-xs text-gray-700">
                      {coloresDisponibles.find((c) => c.id === ej.color_id)
                        ?.nombre || 'Sin color'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalColorIdx(index)}
                      className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 text-xs transition"
                    >
                      Cambiar color
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalColorIdx(index)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 text-xs transition"
                  >
                    Asignar color
                  </button>
                )}

                {/* Mostrar descripción si hay color */}
                {ej.color_id && (
                  <div className="text-xs text-gray-600 mt-1 ml-2">
                    {coloresDisponibles.find((c) => c.id === ej.color_id)
                      ?.descripcion || ''}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 text-right">
                {ej.musculo.length}/100 caracteres
              </div>

              <label
                htmlFor={`descripcion-${index}`}
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Descripción o aclaraciones
              </label>
              <textarea
                id={`descripcion-${index}`}
                value={ej.descripcion}
                onChange={(e) =>
                  handleEjercicioChange(index, 'descripcion', e.target.value)
                }
                placeholder="Detalles, aclaraciones, variantes o tips para este ejercicio…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                rows={3}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ej.series}
                    onChange={(e) =>
                      handleEjercicioChange(index, 'series', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                    placeholder="Ej: 4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repeticiones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ej.repeticiones}
                    onChange={(e) =>
                      handleEjercicioChange(
                        index,
                        'repeticiones',
                        e.target.value
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                    placeholder="Ej: 12"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tiempo
                  </label>
                  <input
                    type="text"
                    value={ej.tiempo}
                    onChange={(e) =>
                      handleEjercicioChange(index, 'tiempo', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                    placeholder="Ej: 60s"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descanso
                  </label>
                  <input
                    type="text"
                    value={ej.descanso}
                    onChange={(e) =>
                      handleEjercicioChange(index, 'descanso', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                    placeholder="Ej: 1 min"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="desde"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    Desde
                  </label>
                  <input
                    id="desde"
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="hasta"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    Hasta
                  </label>
                  <input
                    id="hasta"
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                onClick={() => eliminarEjercicio(index)}
                className="text-red-500 hover:text-red-700 text-sm mt-2"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={handleAgregarEjercicio}
            disabled={ejercicios.length >= 10}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowedrounded-lg px-6 py-3 font-medium transition"
          >
            + Agregar ejercicio
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold transition"
          >
            Guardar rutina
          </button>
        </div>
      </form>

      {modalSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setModalSuccess(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-8 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            style={{ animationDuration: '300ms' }}
          >
            <svg
              className="mx-auto mb-4 h-14 w-14 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              ¡Rutina creada!
            </h3>
            <p className="mb-6 text-gray-600">
              La rutina fue guardada correctamente para el alumno seleccionado.
            </p>
            <button
              onClick={() => setModalSuccess(false)}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {modalColorIdx !== null && ejercicios[modalColorIdx] && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              onClick={() => setModalColorIdx(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-5 text-gray-800">
              Selecciona un color para el ejercicio
            </h3>
            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleEjercicioChange(modalColorIdx, 'color_id', null);
                  setModalColorIdx(null);
                }}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs"
              >
                Sin color
              </button>
            </div>
            {/* SCROLLABLE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-2">
              {coloresDisponibles.map((col) => {
                const seleccionado =
                  ejercicios[modalColorIdx]?.color_id === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      handleEjercicioChange(modalColorIdx, 'color_id', col.id);
                      setModalColorIdx(null);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-4 px-3 py-4 shadow-lg transition-all duration-150 cursor-pointer ${
                      seleccionado
                        ? 'border-blue-600 ring-2 ring-blue-400 scale-105'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{
                      background: col.color_hex,
                      color: '#fff',
                      minHeight: 90,
                      boxShadow: '0 2px 12px 0 #0001'
                    }}
                    title={col.nombre}
                  >
                    <span className="font-bold text-base">{col.nombre}</span>
                    <span className="block text-xs mb-1 text-white/90 text-center">
                      {col.descripcion}
                    </span>
                    {seleccionado && (
                      <span className="mt-2 inline-block w-5 h-5 rounded-full border-2 border-white bg-white/60 items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {modalEjercicioIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto p-6 relative animate-fade-in">
            <button
              onClick={() => setModalEjercicioIdx(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-blue-900">
              Seleccionar ejercicio rápido
            </h3>
            <input
              type="text"
              className="w-full mb-3 rounded-md border border-blue-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Buscar ejercicio…"
              value={busquedaEjercicio}
              onChange={(e) => setBusquedaEjercicio(e.target.value)}
              autoFocus
            />
            <div className="max-h-80 overflow-y-auto flex flex-col gap-1">
              {ejerciciosProfesorFiltrados.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  Sin ejercicios…
                </div>
              ) : (
                ejerciciosProfesorFiltrados.map((ej) => (
                  <button
                    key={ej.id}
                    type="button"
                    onClick={() =>
                      seleccionarEjercicioYDescripcion(modalEjercicioIdx, ej)
                    }
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-100/80 transition"
                  >
                    <span className="text-blue-900 font-semibold">
                      {ej.nombre}
                    </span>{' '}
                    <span className="text-gray-500">– {ej.profesor?.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {modalBloquesEjercicio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
              onClick={() => setModalBloquesEjercicio(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              Elegí un bloque para{' '}
              <span className="text-pink-600">
                {modalBloquesEjercicio.nombre}
              </span>
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {modalBloquesEjercicio.bloques.map((bloque) => (
                <div
                  key={bloque.id}
                  onClick={() => {
                    handleEjercicioChange(
                      modalBloquesEjercicio.index,
                      'descripcion',
                      bloque.contenido
                    );
                    setModalBloquesEjercicio(null);
                  }}
                  className="border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-lg px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap"
                >
                  {bloque.contenido}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCrearRutina;
