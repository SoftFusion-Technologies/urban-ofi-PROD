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
// Función que parsea una fecha en formato YYYY-MM-DD a Date local (sin zona horaria)
function parseFechaSinZona(fechaStr) {
  if (!fechaStr) return null;

  // Si viene con formato ISO completo, tomar solo la parte de la fecha
  const soloFecha = fechaStr.split('T')[0];
  const [anio, mes, dia] = soloFecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

function RutinasConDuracion({ studentId }) {
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

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

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
  }, [studentId]);

  // Normalizar fecha a 00:00:00 para comparaciones (Date)
  function normalizeFecha(date) {
    const f = new Date(date);
    f.setHours(0, 0, 0, 0);
    return f;
  }

  // Avanzar o retroceder fechaSeleccionada
  const cambiarDia = (dias) => {
    setFechaSeleccionada((f) => {
      const nueva = new Date(f);
      nueva.setDate(nueva.getDate() + dias);
      return nueva;
    });
  };

  if (loading) return <p>Cargando rutinas programadas...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const fechaNorm = normalizeFecha(fechaSeleccionada);

  // Filtrar ejercicios que estén vigentes en fechaSeleccionada (tengan desde y hasta y que incluya fecha)
  const rutinasFiltradas = rutinas
    .map((rutina) => {
      // Filtrar solo ejercicios vigentes para la fechaSeleccionada

      const ejerciciosVigentes = rutina.exercises?.filter((ej) => {
        if (!ej.desde || !ej.hasta) return false;

        const desde = normalizeFecha(parseFechaSinZona(ej.desde));
        const hasta = normalizeFecha(parseFechaSinZona(ej.hasta));
        return fechaNorm >= desde && fechaNorm <= hasta;
      });

      return {
        ...rutina,
        exercises: ejerciciosVigentes || []
      };
    })
    .filter((rutina) => rutina.exercises.length > 0); // solo rutinas que tienen ejercicios vigentes

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
  // Función para agrupar líneas igual que en tu componente original
  function agruparLineas(lineas) {
    const agrupadas = [];
    let buffer = '';

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
        buffer += ' ' + linea;
        agrupadas.push(buffer.trim());
        buffer = '';
      } else if (esSerie) {
        agrupadas.push(linea.trim());
      } else if (tieneMarcador) {
        if (buffer) agrupadas.push(buffer.trim());
        buffer = linea;
      } else if (buffer && palabrasContinuacion.includes(primeraPalabra)) {
        buffer += ' ' + linea;
      } else {
        if (buffer) agrupadas.push(buffer.trim());
        buffer = linea;
      }
    }
    if (buffer) agrupadas.push(buffer.trim());
    return agrupadas;
  }

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

  // Formateo de línea con repeticiones (igual que en tu componente)
  function formatearLineaEnJSX(ejercicio) {
    const regex = /(.*?)(\d[\d\-xX]*)$/;
    const match = ejercicio.match(regex);
    if (match) {
      const descripcion = match[1].trim();
      const repeticiones = match[2].trim();
      return (
        <>
          <span className="font-semibold text-gray-900">📌 {descripcion}</span>
          <span className="text-gray-500 ml-2">({repeticiones})</span>
        </>
      );
    }
    return <span>📌 {ejercicio.trim()}</span>;
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

  // Formatear fecha a dd-mm-yyyy
  function formatFechaDDMMYYYY(fecha) {
    const d = fecha.getDate().toString().padStart(2, '0');
    const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const y = fecha.getFullYear();
    return `${d}-${m}-${y}`;
  }

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
    <div className="p-6 bg-gray-100 rounded-lg max-w-xl mx-auto">
      <h2 className="titulo uppercase text-4xl font-bold mb-6 text-center text-gray-800">
        Rutinas vigentes
        {rutinasFiltradas.length > 0 &&
          rutinasFiltradas[0].exercises.length > 0 && (
            <>
              <br />
              <span className="text-sm font-normal text-gray-500">
                desde{' '}
                {formatFechaDDMMYYYY(
                  parseFechaSinZona(rutinasFiltradas[0].exercises[0].desde)
                )}{' '}
                hasta{' '}
                {formatFechaDDMMYYYY(
                  parseFechaSinZona(rutinasFiltradas[0].exercises[0].hasta)
                )}
              </span>
            </>
          )}
      </h2>

      {rutinasFiltradas.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay ejercicios vigentes para esta fecha.
        </p>
      ) : (
        <div
          className="overflow-y-auto pr-2 space-y-6"
          style={{ maxHeight: '393px' }}
        >
          {rutinasFiltradas.map((rutina) => {
            // Agrupar ejercicios por músculo dentro de cada rutina
            const ejerciciosPorMusculo = {};
            rutina.exercises.forEach((ej) => {
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
                      className="text-red-500 hover:text-red-700 text-sm font-semibold underline"
                    >
                      🗑️ Eliminar rutina completa
                    </button>
                  </div>
                )}
                {Object.entries(ejerciciosPorMusculo).map(
                  ([musculo, ejercicios]) => (
                    <div
                      key={musculo}
                      className="bg-white p-4 rounded shadow mb-6"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-blue-600">
                          {musculo.toUpperCase()}
                        </h3>

                        {(userLevel === 'admin' ||
                          userLevel === 'instructor') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditarMusculo(rutina.id, musculo)
                              }
                              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded text-xs font-medium"
                            >
                              ✏️ Editar Músculo
                            </button>
                            <button
                              onClick={() =>
                                handleEliminarMusculo(rutina.id, musculo)
                              }
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium"
                            >
                              🗑️ Eliminar Músculo
                            </button>
                          </div>
                        )}
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                        {ejercicios.map((ej) =>
                          agruparLineas(ej.descripcion.split(/\r?\n/)).map(
                            (linea, idx) => {
                              const ejercicio = linea;
                              // lo demás igual...

                              if (!ejercicio) return null;

                              // Para editar, guardamos el texto completo del ejercicio
                              // Si el ejercicio está en edición, mostramos input, sino texto + botones
                              const esEditando =
                                editando &&
                                editando.routineId === rutina.id &&
                                editando.exerciseId === ej.id &&
                                editando.lineaIndex === idx;

                              // Limpiar texto para búsqueda (solo si no está editando)
                              let busqueda = limpiarBusqueda(ejercicio);
                              if (busqueda.split(' ').length < 3) {
                                busqueda = musculo + ' ' + busqueda;
                              }

                              return (
                                <li
                                  key={idx}
                                  className="flex justify-between items-center"
                                >
                                  {esEditando ? (
                                    <div className="flex items-center w-full space-x-2">
                                      <input
                                        type="text"
                                        value={textoEditado}
                                        autoFocus
                                        onChange={(e) =>
                                          setTextoEditado(e.target.value)
                                        }
                                        className="border rounded px-2 py-1 flex-grow"
                                      />
                                      <button
                                        onClick={() =>
                                          handleGuardarEdicion(
                                            rutina.id,
                                            ej.id,
                                            idx,
                                            textoEditado
                                          )
                                        }
                                        className="text-green-600 hover:text-green-800 text-lg"
                                        title="Guardar"
                                      >
                                        ✅
                                      </button>
                                      <button
                                        onClick={() => setEditando(null)}
                                        className="text-red-600 hover:text-red-800 text-lg"
                                        title="Cancelar"
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="flex-grow">
                                        {formatearLineaEnJSX(ejercicio)}
                                      </span>
                                      <div className="flex space-x-4 ml-4 flex-shrink-0">
                                        {userLevel === '' && (
                                          <>
                                            <button
                                              onClick={() =>
                                                window.open(
                                                  `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                                    busqueda
                                                  )}`,
                                                  '_blank'
                                                )
                                              }
                                              className="text-blue-600 hover:underline"
                                            >
                                              Ver video
                                            </button>
                                            <button
                                              className="text-red-600 hover:underline"
                                              onClick={() =>
                                                handleNecesitoAyuda(
                                                  rutina.id,
                                                  ej.id,
                                                  ejercicio
                                                )
                                              }
                                            >
                                              Necesito Ayuda
                                            </button>
                                          </>
                                        )}

                                        {(userLevel === 'admin' ||
                                          userLevel === 'instructor') && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditando({
                                                  routineId: rutina.id,
                                                  exerciseId: ej.id,
                                                  lineaIndex: idx
                                                });
                                                setTextoEditado(ejercicio);
                                              }}
                                              className="text-yellow-600 hover:underline"
                                            >
                                              Editar
                                            </button>
                                            <button
                                              className="text-red-600 hover:underline"
                                              onClick={() =>
                                                handleEliminarLinea(
                                                  rutina.id,
                                                  ej.id,
                                                  idx
                                                )
                                              }
                                            >
                                              Eliminar
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </li>
                              );
                            }
                          )
                        )}
                      </ul>
                      {userLevel === '' && (
                        <button
                          type="button"
                          aria-label={`Dar feedback para la rutina ${
                            rutina.nombre || rutina.id
                          }`}
                          className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
                          onClick={() => {
                            setRutinaFeedbackId(rutina.id);
                            setFeedbackModalOpen(true);
                          }}
                        >
                          Dar Feedback
                        </button>
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

export default RutinasConDuracion;
