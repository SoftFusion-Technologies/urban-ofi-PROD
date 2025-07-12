import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import ModalSuccess from '../../../Components/Forms/ModalSuccess';
import ModalError from '../../../Components/Forms/ModalError';
import ModalFeedback from './Feedbacks/ModalFeedback';

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

  // GLOBALES PARA GESTIONAR LOS MODALES DE ERROR
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTexto, setModalTexto] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorTexto, setModalErrorTexto] = useState('');
  // GLOBALES PARA GESTIONAR LOS MODALES DE ERROR

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
    lineaIndex,
    textoEditado
  ) => {
    try {
      setLoadingEdit(true);

      // Encontrar la rutina y el ejercicio actual
      const rutina = rutinas.find((r) => r.id === routineId);
      if (!rutina) throw new Error('Rutina no encontrada');

      const ejercicio = rutina.exercises.find((ej) => ej.id === exerciseId);
      if (!ejercicio) throw new Error('Ejercicio no encontrado');

      // Dividir la descripción actual en líneas
      const lineas = ejercicio.descripcion.split(/\n|(?=\d+\s?[xX]\s?\d+)/g);

      // Comprobar si el texto editado es igual a la línea original
      if (lineas[lineaIndex] === textoEditado.trim()) {
        // No hubo cambios, salir del modo edición y no hacer nada
        setEditando(null);
        setLoadingEdit(false);
        return;
      }

      // Reemplazar solo la línea editada por el texto nuevo
      lineas[lineaIndex] = textoEditado;

      // Volver a unir todas las líneas en una sola descripción
      const descripcionActualizada = lineas.join('\n').trim();

      // Llamar a la API con la descripción completa actualizada
      await axios.put(`${URL}/${routineId}/routines_exercises/${exerciseId}`, {
        descripcion: descripcionActualizada
      });

      // Actualizar el estado local
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
      alert('Error al guardar la edición');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEliminarLinea = async (routineId, exerciseId, lineaIndex) => {
    try {
      setLoading(true);

      // Buscar la rutina y ejercicio
      const rutina = rutinas.find((r) => r.id === routineId);
      if (!rutina) throw new Error('Rutina no encontrada');

      const ejercicio = rutina.exercises.find((ej) => ej.id === exerciseId);
      if (!ejercicio) throw new Error('Ejercicio no encontrado');

      // Dividir la descripción en líneas o valores (por espacio o salto de línea)
      let lineas = ejercicio.descripcion.split(/\n|(?=\d+\s?[xX]\s?\d+)/g);

      // Eliminar la línea (valor) por índice
      lineas.splice(lineaIndex, 1);

      // Volver a unir la descripción
      const descripcionActualizada = lineas.join(' ').trim();

      // Actualizar la descripción en backend (PUT)
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
    } catch (error) {
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

  function agruparLineas(lineas) {
    const agrupadas = [];
    let buffer = '';

    // Palabras que indican continuación probable aunque empiece con mayúscula
    const palabrasContinuacion = [
      'EN',
      'CON',
      'DE',
      'Y',
      'O',
      'A',
      'POR',
      'SIN'
    ];

    for (let linea of lineas) {
      linea = linea.trim();
      if (!linea) continue;

      const esSerie = /^[\d\s\-xX+()]+$/.test(linea) || /^\(?\d/.test(linea);
      const tieneMarcador = /^[●*📌]/.test(linea);
      const primeraPalabra = linea.split(' ')[0].toUpperCase();

      if (esSerie && buffer) {
        // Si es serie y ya hay buffer, unir y guardar
        buffer += ' ' + linea;
        agrupadas.push(buffer.trim());
        buffer = '';
      } else if (esSerie) {
        // Serie sola
        agrupadas.push(linea.trim());
      } else if (tieneMarcador) {
        // Nueva descripción clara (marca delante)
        if (buffer) agrupadas.push(buffer.trim());
        buffer = linea;
      } else if (buffer && palabrasContinuacion.includes(primeraPalabra)) {
        // Si la línea comienza con palabra de continuación, unir con buffer
        buffer += ' ' + linea;
      } else {
        // Nueva descripción (o primera)
        if (buffer) agrupadas.push(buffer.trim());
        buffer = linea;
      }
    }

    if (buffer) agrupadas.push(buffer.trim());

    return agrupadas;
  }

  function formatearLineaEnJSX(ejercicio) {
    const regex = /(.*?)(\d[\d\-xX]*)$/;
    const match = ejercicio.match(regex);
    if (match) {
      const descripcion = match[1].trim();
      const repeticiones = match[2].trim();
      return (
        <>
          <span className="font-semibold text-gray-900">{descripcion}</span>
          <span className="text-gray-500 ml-2">({repeticiones})</span>
        </>
      );
    }
    return <span>{ejercicio.trim()}</span>;
  }

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
            });

            return (
              <div key={rutina.id}>
                {(userLevel === 'admin' || userLevel === 'instructor') && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleEliminarRutina(rutina.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      🗑️ Eliminar rutina completa
                    </button>
                  </div>
                )}

                {Object.entries(ejerciciosPorMusculo).map(
                  ([musculo, ejercicios]) => (
                    <div
                      key={musculo}
                      className="rounded-2xl bg-white/90 p-8 shadow-xl border border-blue-100 mb-12"
                    >
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
                          const esEditando =
                            editando &&
                            editando.routineId === rutina.id &&
                            editando.exerciseId === ej.id &&
                            (editando.lineaIndex === idx ||
                              editando.lineaIndex == null);

                          return (
                            <li
                              key={ej.id}
                              className="flex flex-col bg-slate-50/80 px-6 py-5 rounded-xl shadow border border-gray-200 mb-1"
                            >
                              <div className="flex gap-3 items-center mb-2 w-full">
                                <span className="text-red-500 text-xl">📌</span>
                                {esEditando ? (
                                  <div className="w-full flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      className="border border-gray-300 rounded px-3 py-2 flex-1 max-w-full sm:max-w-[220px]"
                                      value={textoEditado}
                                      autoFocus
                                      onChange={(e) =>
                                        setTextoEditado(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleGuardarEdicion(
                                            rutina.id,
                                            ej.id,
                                            idx,
                                            textoEditado
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
                                            rutina.id,
                                            ej.id,
                                            idx,
                                            textoEditado
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
                                    <span className="font-medium text-lg flex-1">
                                      {formatearLineaEnJSX(ej.descripcion)}
                                    </span>
                                    {(userLevel === 'admin' ||
                                      userLevel === 'instructor') && (
                                      <div className="flex flex-wrap gap-2 ml-2 mt-2 md:mt-0">
                                        <button
                                          onClick={() => {
                                            setEditando({
                                              routineId: rutina.id,
                                              exerciseId: ej.id,
                                              lineaIndex: idx
                                            });
                                            setTextoEditado(ej.descripcion);
                                          }}
                                          className="text-yellow-600 hover:underline text-xs font-semibold"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleEliminarLinea(
                                              rutina.id,
                                              ej.id,
                                              idx
                                            )
                                          }
                                          className="text-red-600 hover:underline text-xs font-semibold"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              {/* Panel de datos */}
                              <div className="flex flex-wrap gap-4 text-base font-medium text-gray-700 mt-2">
                                {ej.series && (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                                    <span>🔁</span>Series:{' '}
                                    <span className="font-bold">
                                      {ej.series}
                                    </span>
                                  </span>
                                )}
                                {ej.repeticiones && (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                                    <span>🔢</span>Reps:{' '}
                                    <span className="font-bold">
                                      {ej.repeticiones}
                                    </span>
                                  </span>
                                )}
                                {ej.tiempo && (
                                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
                                    <span>⏱️</span>Tiempo:{' '}
                                    <span className="font-bold">
                                      {ej.tiempo}
                                    </span>
                                  </span>
                                )}
                                {ej.descanso && (
                                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">
                                    <span>💤</span>Descanso:{' '}
                                    <span className="font-bold">
                                      {ej.descanso}
                                    </span>
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-3 mt-3">
                                {userLevel === '' && (
                                  <>
                                    <button
                                      onClick={() =>
                                        window.open(
                                          `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                            musculo + ' ' + ej.descripcion
                                          )}`,
                                          '_blank'
                                        )
                                      }
                                      className="text-blue-500 hover:underline text-base font-semibold"
                                    >
                                      Ver video
                                    </button>
                                    <button
                                      className="text-green-600 hover:underline text-base font-semibold"
                                      onClick={() =>
                                        handleNecesitoAyuda(
                                          rutina.id,
                                          ej.id,
                                          ej.descripcion
                                        )
                                      }
                                    >
                                      Necesito Ayuda
                                    </button>
                                  </>
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
    </div>
  );
}

export default ListaRutinas;
