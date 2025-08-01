import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import ModalSuccess from '../../../Components/Forms/ModalSuccess';
import ModalError from '../../../Components/Forms/ModalError';
import ModalFeedback from './Feedbacks/ModalFeedback';
import LogPesoModal from './StudentProgress/LogPesoModal';
import { FaTrash } from 'react-icons/fa';

function formatearDescripcionBloque(
  texto,
  onVideoClick,
  onAyudaClick,
  onEditarLinea,
  onEliminarLinea,
  userLevel,
  rutinaId,
  ejercicioId,
  idx,
  colorHex
) {
  const lineas = texto.split('\n').filter((linea) => linea.trim() !== '');
  function esColorOscuro(hex) {
    if (!hex) return false;
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminancia < 128; // Si es menor a 128, es oscuro
  }

  return (
    <div className="flex flex-col gap-3 mt-1">
      {lineas.map((linea, lineaIdx) => {
        const clean = linea.trim();

        const esTitulo =
          /[:：]\s*$/.test(clean) || // termina en :
          /^(D[ií]a|Circuito|Parte|Bloque|Desp|Final|Intro|Sección|Seccion|Nota)/i.test(
            clean
          ) ||
          /^[A-ZÁÉÍÓÚÜÑ\s]{3,30}$/.test(clean); // línea en mayúsculas, sin números, típica de títulos

        if (esTitulo) {
          return (
            <div
              key={lineaIdx}
              className="text-sm font-bold uppercase tracking-wide"
              style={{
                color: esColorOscuro(colorHex) ? '#ffffff' : '#1e40af' // azul oscuro solo si es fondo claro
              }}
            >
              {clean.replace(/[:：]\s*$/, '')}
            </div>
          );
        }

        return (
          <div
            key={lineaIdx}
            className="bg-white/90 border border-gray-300 rounded-lg p-3 flex flex-col gap-1 shadow-sm"
          >
            <div className="text-sm text-gray-800 whitespace-pre-line">
              {clean}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 mt-1">
              {userLevel === '' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onVideoClick(clean)}
                    className="text-blue-600 hover:underline text-xs font-semibold"
                  >
                    Ver video
                  </button>
                  <button
                    onClick={() => onAyudaClick(clean)}
                    className="text-green-600 hover:underline text-xs font-semibold"
                  >
                    Necesito Ayuda
                  </button>
                </div>
              )}

              {(userLevel === 'admin' || userLevel === 'instructor') && (
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() =>
                      onEditarLinea(rutinaId, ejercicioId, idx, clean, lineaIdx)
                    }
                    className="text-yellow-600 hover:underline text-xs font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      onEliminarLinea(rutinaId, ejercicioId, idx, clean)
                    }
                    className="text-red-600 hover:underline text-xs font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const diasSemana = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

// Función que parsea una fecha en formato YYYY-MM-DD a Date local
function parseFechaSinZona(fechaStr) {
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  return new Date(anio, mes - 1, dia); // mes es 0-based
}

function ListaRutinas({ studentId, actualizar }) {
  const [editando, setEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { nomyape, userId, userLevel } = useAuth();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rutinaFeedbackId, setRutinaFeedbackId] = useState(null);

  const URL = 'https://vps-5097245-x.dattaweb.com/routines';

  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  useEffect(() => {
    fetch('https://vps-5097245-x.dattaweb.com/rutina-colores')
      .then((res) => res.json())
      .then((data) => setColoresDisponibles(data));
  }, []);

  // GLOBALES PARA GESTIONAR LOS MODALES DE ERROR
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTexto, setModalTexto] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorTexto, setModalErrorTexto] = useState('');
  // GLOBALES PARA GESTIONAR LOS MODALES DE ERROR

  const [modalOpen, setModalOpen] = useState(false);
  const [ejercicioActivo, setEjercicioActivo] = useState(null);
  const [ultimoLog, setUltimoLog] = useState(null);
  const [historialLogs, setHistorialLogs] = useState([]);

  const handleOpenModal = async (ej) => {
    setEjercicioActivo({ ...ej, student_id: studentId });
    setModalOpen(true);
    setUltimoLog(null);
    setHistorialLogs([]);
    try {
      // Último log
      const resLast = await axios.get(
        `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/last?student_id=${studentId}&routine_exercise_id=${ej.id}`
      );
      setUltimoLog(resLast.data);
    } catch {
      setUltimoLog(null);
    }
    try {
      // Historial mini
      const resHistory = await axios.get(
        `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/history?student_id=${studentId}&routine_exercise_id=${ej.id}&limit=3`
      );
      setHistorialLogs(resHistory.data || []);
    } catch {
      setHistorialLogs([]);
    }
  };

  const hoy = new Date();
  const nombreDiaHoy = diasSemana[hoy.getDay()];

  const fetchRutinas = async () => {
    try {
      const res = await axios.get(`${URL}?student_id=${studentId}`);
      setRutinas(res.data);
    } catch (err) {
      setError('Error al cargar rutinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutinas();
  }, [studentId, actualizar]);

  if (loading) return <p>Cargando rutinas...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Filtrar rutinas para hoy
  const rutinasHoy = rutinas.filter((rutina) => {
    const fechaRutina = parseFechaSinZona(rutina.fecha);
    return (
      fechaRutina.getFullYear() === hoy.getFullYear() &&
      fechaRutina.getMonth() === hoy.getMonth() &&
      fechaRutina.getDate() === hoy.getDate()
    );
  });

  // Agrupar ejercicios por músculo
  const ejerciciosPorMusculo = {};
  rutinasHoy.forEach((rutina) => {
    rutina.exercises?.forEach((ej) => {
      if (!ejerciciosPorMusculo[ej.musculo]) {
        ejerciciosPorMusculo[ej.musculo] = [];
      }
      ejerciciosPorMusculo[ej.musculo].push(ej.descripcion);
    });
  });

  function limpiarBusqueda(texto) {
    // Quita repeticiones al principio (ej: 4 x 10, 4X20, etc)
    let limpio = texto.replace(/^\d+\s?[xX]\s?\d+\s*/, '');

    // Quita números separados por guiones (ej: 25-20-15-12-10-8)
    limpio = limpio.replace(/(\d+(-\d+)+)/g, '');

    // Quita números sueltos que no sean parte de palabras
    limpio = limpio.replace(/\b\d+\b/g, '');

    // Limpia espacios extras
    limpio = limpio.trim();

    return limpio;
  }

  const handleGuardarEdicion = async (
    routineId,
    exerciseId,
    ejercicioIndex,
    textoEditado,
    textoOriginal = '' // Valor por defecto para evitar errores
  ) => {
    try {
      setLoadingEdit(true);

      // Validaciones iniciales
      if (!textoEditado || !textoOriginal) {
        alert('Error: Faltan datos para editar');
        return;
      }

      console.log('📝 Datos para editar:', {
        routineId,
        exerciseId,
        ejercicioIndex,
        textoOriginal,
        textoEditado
      });

      // Buscar rutina
      const rutina = rutinas.find((r) => r.id === routineId);
      if (!rutina) throw new Error('Rutina no encontrada');

      // Buscar ejercicio
      const ejercicio = rutina.exercises.find((ej) => ej.id === exerciseId);
      if (!ejercicio) throw new Error('Ejercicio no encontrado');

      // Reemplazar la línea exacta por coincidencia de contenido
      const lineas = ejercicio.descripcion.split('\n');
      const nuevasLineas = lineas.map((linea) => {
        return linea.trim() === textoOriginal.trim()
          ? textoEditado.trim()
          : linea;
      });

      const descripcionActualizada = nuevasLineas.join('\n').trim();

      // Enviar la actualización
      await axios.put(`${URL}/${routineId}/routines_exercises/${exerciseId}`, {
        descripcion: descripcionActualizada
      });

      // Actualizar estado local
      setRutinas((prevRutinas) =>
        prevRutinas.map((rutina) => {
          if (rutina.id === routineId) {
            return {
              ...rutina,
              exercises: rutina.exercises.map((ej) => {
                if (ej.id === exerciseId) {
                  return { ...ej, descripcion: descripcionActualizada };
                }
                return ej;
              })
            };
          }
          return rutina;
        })
      );

      setEditando(null);
    } catch (error) {
      console.error('Error al guardar la edición:', error);
      alert('Error al guardar la edición');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEliminarLinea = async (
    routineId,
    exerciseId,
    ejercicioIndex,
    lineaTexto // este es el texto de la línea, ej: "Push-ups: 15"
  ) => {
    try {
      setLoading(true);

      const rutina = rutinas.find((r) => r.id === routineId);
      if (!rutina) throw new Error('Rutina no encontrada');

      const ejercicio = rutina.exercises.find((ej) => ej.id === exerciseId);
      if (!ejercicio) throw new Error('Ejercicio no encontrado');

      const lineas = ejercicio.descripcion.split('\n');

      const indexToRemove = lineas.findIndex(
        (linea) =>
          linea.trim().toLowerCase().replace(/\s+/g, ' ') ===
          lineaTexto.trim().toLowerCase().replace(/\s+/g, ' ')
      );

      if (indexToRemove === -1) {
        console.error('No se encontró la línea exacta');
        alert('No se encontró la línea a eliminar');
        return;
      }

      // Eliminar la línea
      lineas.splice(indexToRemove, 1);

      const descripcionActualizada = lineas.join('\n').trim();

      // Enviar al backend
      await axios.put(`${URL}/${routineId}/routines_exercises/${exerciseId}`, {
        descripcion: descripcionActualizada
      });

      // Actualizar estado local
      setRutinas((prevRutinas) =>
        prevRutinas.map((r) => {
          if (r.id === routineId) {
            return {
              ...r,
              exercises: r.exercises.map((ej) => {
                if (ej.id === exerciseId) {
                  return { ...ej, descripcion: descripcionActualizada };
                }
                return ej;
              })
            };
          }
          return r;
        })
      );
    } catch (error) {
      console.error('ERROR real:', error);
      alert('Error al eliminar la línea');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarMusculo = async (routineId, oldMuscle) => {
    const newMuscle = prompt(`Editar músculo "${oldMuscle}":`, oldMuscle);
    if (!newMuscle || newMuscle.trim() === '' || newMuscle === oldMuscle)
      return;

    try {
      const res = await axios.put(`${URL}/${routineId}/muscle/${oldMuscle}`, {
        newMuscle
      });
      alert(res.data.message);
      fetchRutinas(); // Actualizar vista
    } catch (err) {
      console.error(err);
      alert('Error al editar el nombre del músculo.');
    }
  };

  const handleEliminarMusculo = async (routineId, musculo) => {
    if (
      !window.confirm(
        `¿Eliminar todos los ejercicios del músculo "${musculo}"?`
      )
    )
      return;

    try {
      const res = await axios.delete(`${URL}/${routineId}/${musculo}`);
      alert(res.data.message);
      fetchRutinas();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar ejercicios del músculo.');
    }
  };

  const handleNecesitoAyuda = async (routineId, exerciseId, exerciseName) => {
    try {
      const mensaje = `El alumno ${nomyape} necesita ayuda con ${exerciseName}`;
      const response = await axios.post(
        `https://vps-5097245-x.dattaweb.com/routine_requests`,
        {
          student_id: studentId,
          routine_id: routineId,
          exercise_id: exerciseId,
          mensaje: mensaje
        }
      );
      setModalTexto('Solicitud registrada. Pronto un profesor te ayudará.');
      setModalVisible(true);
      // alert('Solicitud registrada. Pronto un profesor te ayudará.');
    } catch (error) {
      if (error.response) {
        const mensaje = error.response.data.mensajeError;

        if (
          mensaje ===
          'Ya existe una solicitud pendiente para este ejercicio con el mismo mensaje'
        ) {
          setModalErrorTexto(
            'Ya solicitaste ayuda para este ejercicio. Por favor, esperá al instructor.'
          );
          setModalErrorVisible(true);
        } else if (mensaje === 'Faltan campos obligatorios') {
          setModalErrorTexto(
            'Por favor completá todos los campos antes de enviar.'
          );
          setModalErrorVisible(true);
        } else {
          setModalErrorTexto('Error: ' + mensaje);
          setModalErrorVisible(true);
        }
      } else {
        setModalErrorTexto('Error al enviar la solicitud. Intenta nuevamente.');
        setModalErrorVisible(true);
      }
    }
  };

  const handleCompletarRutina = async (rutinaId) => {
    try {
      const res = await fetch(`${URL}/${rutinaId}/completar`, {
        method: 'PUT'
      });
      const data = await res.json(); // si el back no devuelve JSON, esto fallará
      if (data.success) {
        setRutinas((prev) =>
          prev.map((r) => (r.id === rutinaId ? { ...r, completada: true } : r))
        );
        setModalTexto('Rutina marcada como completada.');
        setModalVisible(true);
      } else {
        throw new Error(data.message || 'Error al completar rutina');
      }
    } catch (error) {
      setModalErrorTexto(error.message);
      setModalErrorVisible(true);
    }
  };

  const handleEliminarRutina = async (routineId) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar esta rutina completa? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${URL}/${routineId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('No se pudo eliminar la rutina');

      setModalTexto('Rutina eliminada correctamente');
      setModalVisible(true);
      fetchRutinas();
    } catch (error) {
      setModalErrorTexto(error.message || 'Error al eliminar rutina');
      setModalErrorVisible(true);
    }
  };

  function getColorById(id) {
    return coloresDisponibles.find((c) => c.id === id);
  }

  const fetchLogsYUltimoLog = async () => {
    // fetch historial
    const resHistory = await axios.get(
      `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/history?student_id=${studentId}&routine_exercise_id=${ejercicioActivo.id}&limit=3`
    );
    setHistorialLogs(resHistory.data || []);

    // fetch último log
    const resLast = await axios.get(
      `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/last?student_id=${studentId}&routine_exercise_id=${ejercicioActivo.id}`
    );
    setUltimoLog(resLast.data || null);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-3xl max-w-2xl mx-auto shadow-2xl ">
      <h2 className="titulo uppercase text-4xl font-bold mb-6 text-center text-gray-800">
        {nombreDiaHoy.toUpperCase()}
      </h2>

      {rutinasHoy.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay rutinas cargadas para hoy
        </p>
      ) : (
        <div className="space-y-10 overflow-y-auto" style={{ maxHeight: 480 }}>
          {rutinasHoy.map((rutina) => {
            const ejerciciosPorMusculo = {};
            rutina.exercises?.forEach((ej) => {
              if (!ejerciciosPorMusculo[ej.musculo]) {
                ejerciciosPorMusculo[ej.musculo] = [];
              }
              ejerciciosPorMusculo[ej.musculo].push(ej);
              console.log(rutina);
            });

            return (
              <div key={rutina.id}>
                {Object.entries(ejerciciosPorMusculo).map(
                  ([musculo, ejercicios]) => (
                    <div
                      key={musculo}
                      className="rounded-2xl bg-white/90 p-8 shadow-xl border border-blue-100 mb-12"
                    >
                      {(userLevel === 'admin' ||
                        userLevel === 'instructor') && (
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => handleEliminarRutina(rutina.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                          >
                            Eliminar rutina:{' '}
                            {rutina.exercises
                              ?.map((ej) => ej.musculo)
                              .join(', ')}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h3 className="font-extrabold text-3xl text-blue-700 tracking-tight">
                          {musculo.toUpperCase()}
                        </h3>

                        {(userLevel === 'admin' ||
                          userLevel === 'instructor') && (
                          <div className="flex gap-4">
                            <button
                              onClick={() =>
                                handleEditarMusculo(rutina.id, musculo)
                              }
                              className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow"
                            >
                              ✏️ Editar Músculo
                            </button>
                            <button
                              onClick={() =>
                                handleEliminarMusculo(rutina.id, musculo)
                              }
                              className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow"
                            >
                              🗑️ Eliminar Músculo
                            </button>
                          </div>
                        )}
                      </div>
                      <ul className="space-y-6">
                        {ejercicios.map((ej, idx) => {
                          const colorData = getColorById(ej.color_id);

                          const esEditando =
                            editando &&
                            editando.routineId === rutina.id &&
                            editando.exerciseId === ej.id &&
                            (editando.lineaIndex === idx ||
                              editando.lineaIndex == null);

                          return (
                            <li
                              key={ej.id}
                              className="flex flex-col px-6 py-5 rounded-xl shadow mb-1"
                              style={{
                                backgroundColor: `${
                                  colorData?.color_hex || '#f8fafc'
                                }`, // por defecto slate-50
                                border: '1px solid #e5e7eb' // gris claro similar a border-gray-200
                              }}
                            >
                              {/* PILL DE COLOR – va arriba del contenido, no tapa nada */}
                              {colorData && (
                                <span
                                  className="inline-flex flex-col sm:flex-row sm:items-center gap-1 px-4 py-2 mb-3 w-fit rounded-xl shadow border-2"
                                  style={{
                                    background: colorData.color_hex,
                                    color: '#fff',
                                    minWidth: 110,
                                    borderColor: '#fff',
                                    boxShadow: `0 2px 12px 0 ${colorData.color_hex}33`,
                                    fontSize: '1rem'
                                  }}
                                  title={colorData.descripcion}
                                >
                                  <span className="font-bold text-sm drop-shadow">
                                    {colorData.nombre}
                                  </span>
                                  {colorData.descripcion && (
                                    <span className="text-xs font-normal text-white/80 sm:ml-3 whitespace-pre-line">
                                      {colorData.descripcion}
                                    </span>
                                  )}
                                </span>
                              )}

                              <div className="flex gap-3 items-center mb-2 w-full">
                                <span className="text-red-500 text-xl"></span>
                                {esEditando ? (
                                  <div className="w-full flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      className="border border-gray-300 rounded px-3 py-2 flex-1 max-w-full sm:max-w-[220px]"
                                      value={editando?.textoEditado || ''}
                                      onChange={(e) =>
                                        setEditando((prev) => ({
                                          ...prev,
                                          textoEditado: e.target.value
                                        }))
                                      }
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleGuardarEdicion(
                                            editando?.routineId,
                                            editando?.exerciseId,
                                            editando?.ejercicioIndex,
                                            editando?.textoEditado,
                                            editando?.textoOriginal
                                          );
                                        }

                                        if (e.key === 'Escape')
                                          setEditando(null);
                                      }}
                                    />
                                    <div className="flex flex-row gap-2 sm:ml-2">
                                      <button
                                        onClick={() =>
                                          handleGuardarEdicion(
                                            editando?.routineId,
                                            editando?.exerciseId,
                                            editando?.ejercicioIndex,
                                            editando?.textoEditado,
                                            editando?.textoOriginal
                                          )
                                        }
                                        className="text-green-600 hover:text-green-800 text-xl"
                                        title="Guardar"
                                      >
                                        ✅
                                      </button>
                                      <button
                                        onClick={() => setEditando(null)}
                                        className="text-red-600 hover:text-red-800 text-xl"
                                        title="Cancelar"
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {formatearDescripcionBloque(
                                      ej.descripcion,
                                      (linea) =>
                                        window.open(
                                          `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                            linea
                                          )}`,
                                          '_blank'
                                        ),
                                      (linea) =>
                                        handleNecesitoAyuda(
                                          rutina.id,
                                          ej.id,
                                          linea
                                        ),
                                      (
                                        routineId,
                                        exerciseId,
                                        idx,
                                        linea,
                                        lineaIdx
                                      ) => {
                                        setEditando({
                                          routineId,
                                          exerciseId,
                                          ejercicioIndex: idx,
                                          sublineaIndex: lineaIdx,
                                          textoOriginal: linea,
                                          textoEditado: linea
                                        });
                                      },
                                      (routineId, exerciseId, idx, lineaIdx) =>
                                        handleEliminarLinea(
                                          rutina.id,
                                          ej.id,
                                          idx,
                                          lineaIdx // <- el subíndice real
                                        ),
                                      userLevel,
                                      rutina.id,
                                      ej.id,
                                      idx,
                                      colorData?.color_hex // <--- NUEVO
                                    )}
                                  </>
                                )}
                              </div>
                              {/* Panel de datos */}
                              <div className="flex flex-wrap gap-4 text-base font-medium text-gray-700 mt-2">
                                {ej.series && (
                                  <span
                                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm cursor-pointer hover:ring-2 ring-blue-200 transition"
                                    onClick={() => handleOpenModal(ej)}
                                    title="Cargar registro de peso/reps"
                                  >
                                    <span>🔁</span>Series:{' '}
                                    <span className="font-bold">
                                      {ej.series}
                                    </span>
                                  </span>
                                )}
                                {ej.repeticiones && (
                                  <span
                                    className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm cursor-pointer hover:ring-2 ring-green-200 transition"
                                    onClick={() => handleOpenModal(ej)}
                                    title="Cargar registro de peso/reps"
                                  >
                                    <span>🔢</span>Reps:{' '}
                                    <span className="font-bold">
                                      {ej.repeticiones}
                                    </span>
                                  </span>
                                )}
                                {ej.tiempo && (
                                  <span
                                    className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm cursor-pointer hover:ring-2 ring-yellow-200 transition"
                                    onClick={() => handleOpenModal(ej)}
                                    title="Cargar registro de peso/reps"
                                  >
                                    <span>⏱️</span>Tiempo:{' '}
                                    <span className="font-bold">
                                      {ej.tiempo}
                                    </span>
                                  </span>
                                )}
                                {ej.descanso && (
                                  <span
                                    className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm cursor-pointer hover:ring-2 ring-indigo-200 transition"
                                    onClick={() => handleOpenModal(ej)}
                                    title="Cargar registro de peso/reps"
                                  >
                                    <span>💤</span>Descanso:{' '}
                                    <span className="font-bold">
                                      {ej.descanso}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {userLevel === '' && (
                        <div className="mt-7 flex justify-center gap-6">
                          {rutina.completada ? (
                            <p className="text-green-600 font-semibold self-center text-lg">
                              ✅ Rutina completada
                            </p>
                          ) : (
                            <button
                              className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition font-semibold text-lg"
                              onClick={() => handleCompletarRutina(rutina.id)}
                            >
                              Completar Rutina
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={`Dar feedback para la rutina ${
                              rutina.nombre || rutina.id
                            }`}
                            className="bg-green-600 text-white px-5 py-3 rounded-xl shadow hover:bg-green-700 transition font-semibold text-lg"
                            onClick={() => {
                              setRutinaFeedbackId(rutina.id);
                              setFeedbackModalOpen(true);
                            }}
                          >
                            Dar Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      <ModalSuccess
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        textoModal={modalTexto}
      />
      <ModalError
        isVisible={modalErrorVisible}
        onClose={() => setModalErrorVisible(false)}
        textoModal={modalErrorTexto}
      />
      <ModalFeedback
        isVisible={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        rutinaId={rutinaFeedbackId}
        studentId={studentId}
      />
      <LogPesoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ejercicio={ejercicioActivo || {}}
        ultimoLog={ultimoLog}
        onSave={fetchLogsYUltimoLog}
        logs={historialLogs}
      />
    </div>
  );
}

export default ListaRutinas;
