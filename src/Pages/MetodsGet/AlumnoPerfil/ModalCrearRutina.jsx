import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import clsx from 'clsx';
import AutocompleteEjercicio from '../../Components/AutocompleteEjercicio';
import SeriesSelector from '../../Components/SeriesSelector';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

const generarNombreRutina = () => {
  const fecha = new Date().toLocaleDateString('es-AR');
  return `Rutina del ${fecha}`;
};

const hoy = new Date().toISOString().split('T')[0];

const ModalCrearRutina = ({ studentId, userId, onClose, onRutinaCreada }) => {
  const [nombre, setNombre] = useState(generarNombreRutina());
  const [fecha, setFecha] = useState(hoy);
  const [desde, setDesde] = useState(new Date().toISOString().slice(0, 16));
  const [hasta, setHasta] = useState('');
  const [bloques, setBloques] = useState([
    {
      nombre: 'BLOQUE 1',
      orden: 1,
      color_id: null,
      ejercicios: [
        {
          nombre: '',
          seriesCantidad: '',
          series: [
            {
              numero_serie: 1,
              repeticiones: '',
              descanso: '',
              tiempo: '',
              kg: ''
            }
          ]
        }
      ]
    }
  ]);

  const [modalColorIdx, setModalColorIdx] = useState(null);
  const [coloresDisponibles, setColoresDisponibles] = useState([]);

  const modalRef = useRef(null);

  useEffect(() => {
    fetch('https://vps-5097245-x.dattaweb.com/rutina-colores')
      .then((res) => res.json())
      .then(setColoresDisponibles);
  }, []);

  const agregarBloque = () => {
    const nuevoBloque = {
      nombre: `BLOQUE ${bloques.length + 1}`,
      orden: bloques.length + 1,
      color_id: null,
      ejercicios: [
        {
          nombre: '',
          seriesCantidad: 1,
          series: [
            {
              numero_serie: 1,
              repeticiones: '',
              descanso: '',
              tiempo: '',
              kg: ''
            }
          ]
        }
      ]
    };
    setBloques([...bloques, nuevoBloque]);
  };

  const agregarEjercicio = (bloqueIdx) => {
    setBloques((prev) => {
      const nuevosBloques = [...prev];
      const bloque = { ...nuevosBloques[bloqueIdx] };
      const ejerciciosActuales = [...bloque.ejercicios];

      const nuevoOrden = ejerciciosActuales.length + 1;

      ejerciciosActuales.push({
        nombre: '',
        seriesCantidad: 1,
        orden: nuevoOrden,
        notas: '',
        series: [
          {
            numero_serie: 1,
            repeticiones: '',
            descanso: '',
            tiempo: '',
            kg: ''
          }
        ]
      });

      bloque.ejercicios = ejerciciosActuales;
      nuevosBloques[bloqueIdx] = bloque;

      return nuevosBloques;
    });
  };

  const actualizarEjercicio = (bloqueIdx, ejIdx, campo, valor) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      const ejercicio = nuevos[bloqueIdx].ejercicios[ejIdx];

      if (campo === 'seriesCantidad') {
        // Permitir escritura libre
        ejercicio.seriesCantidad = valor;

        const cant = parseInt(valor);

        // Solo actualizar si es un número válido entre 1 y 10
        if (!isNaN(cant) && cant > 0 && cant <= 10) {
          // Inicializar backup si no existe
          if (!ejercicio.todasLasSeries) {
            ejercicio.todasLasSeries = ejercicio.series;
          }

          // Agregar series si faltan
          while (ejercicio.todasLasSeries.length < cant) {
            ejercicio.todasLasSeries.push({
              numero_serie: ejercicio.todasLasSeries.length + 1,
              repeticiones: '',
              descanso: '',
              tiempo: '',
              kg: ''
            });
          }

          // Mostrar solo las necesarias
          ejercicio.series = ejercicio.todasLasSeries.slice(0, cant);
        }
      } else {
        ejercicio[campo] = valor;
      }

      return nuevos;
    });
  };

  const actualizarSerie = (bloqueIdx, ejIdx, serieIdx, campo, valor) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      nuevos[bloqueIdx].ejercicios[ejIdx].series[serieIdx][campo] = valor;
      return nuevos;
    });
  };

  const replicarEjercicio = (bloqueIdx, ejIdx) => {
    setBloques((prev) => {
      const nuevosBloques = [...prev];
      const bloque = { ...nuevosBloques[bloqueIdx] };
      const ejerciciosActuales = [...bloque.ejercicios];

      const ejercicioOriginal = ejerciciosActuales[ejIdx];

      const nuevaSerie = ejercicioOriginal.series.map((s, i) => ({
        numero_serie: i + 1,
        repeticiones: s.repeticiones,
        descanso: s.descanso,
        tiempo: s.tiempo,
        kg: s.kg
      }));

      const nuevoEjercicio = {
        nombre: '', // El nombre debe estar vacío
        seriesCantidad: ejercicioOriginal.series.length,
        orden: ejerciciosActuales.length + 1,
        notas: '',
        series: nuevaSerie
      };

      ejerciciosActuales.push(nuevoEjercicio);
      bloque.ejercicios = ejerciciosActuales;
      nuevosBloques[bloqueIdx] = bloque;

      return nuevosBloques;
    });
  };

  const eliminarEjercicio = (bloqueIdx, ejIdx) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      const ejerciciosActualizados = nuevos[bloqueIdx].ejercicios.filter(
        (_, i) => i !== ejIdx
      );

      nuevos[bloqueIdx].ejercicios = ejerciciosActualizados;
      return nuevos;
    });
  };

  const handleCrear = async () => {
    if (!nombre || !fecha || !desde || !bloques.length) {
      alert('❌ Por favor completa todos los campos requeridos.');
      return;
    }

    // fecha / desde / hasta pueden venir de <input type="date"> o "datetime-local"
    // 1) Si es solo fecha (YYYY-MM-DD), fijamos las 00:00 locales
    // 2) Si trae hora, se respeta la hora local
    const toUtcIso = (val, isDateOnly = false) => {
      if (!val) return null;
      if (isDateOnly) {
        return dayjs.tz(val, TZ).startOf('day').utc().toISOString();
      }
      // datetime-local u otro string -> interpretar como hora local de Tucumán
      return dayjs.tz(val, TZ).utc().toISOString();
    };

    const rutina = {
      student_id: Number(studentId),
      instructor_id: Number(userId),
      nombre,
      // si tus inputs son date-only para "fecha", cambia el segundo parámetro a true
      fecha: toUtcIso(fecha /* , true */),
      desde: toUtcIso(desde /* , true si es solo fecha */),
      hasta: hasta ? toUtcIso(hasta /* , true si es solo fecha */) : null,
      descripcion: '',
      bloques: bloques.map((bloque, bloqueIdx) => ({
        nombre: bloque.nombre,
        orden: bloqueIdx + 1,
        color_id: bloque.color_id || null,
        ejercicios: bloque.ejercicios.map((ej, ejIdx) => ({
          nombre: ej.nombre,
          orden: ejIdx + 1,
          notas: ej.notas || '',
          series: ej.series.map((serie, serieIdx) => ({
            numero_serie: serieIdx + 1,
            repeticiones: serie.repeticiones,
            descanso: serie.descanso,
            tiempo: serie.tiempo,
            kg: serie.kg
          }))
        }))
      }))
    };

    try {
      const res = await fetch('https://vps-5097245-x.dattaweb.com/rutinas-completas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rutina)
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Rutina creada correctamente');
        onRutinaCreada?.();
        onClose();
      } else {
        alert(`❌ Error: ${data.mensajeError || 'Algo salió mal'}`);
      }
    } catch (error) {
      console.error('Error al crear rutina:', error);
      alert('❌ Error de red al crear rutina');
    }
  };

  const handleBloqueChange = (idx, campo, valor) => {
    setBloques((prev) => {
      const nuevos = [...prev];
      nuevos[idx][campo] = valor;
      return nuevos;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-2">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-screen-sm max-h-[95vh] overflow-y-auto shadow-2xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-3xl titulo uppercase font-extrabold mb-4 text-center tracking-tight text-gray-800">
          Crear Rutina
        </h2>

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nombre de rutina
        </label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 text-lg font-medium"
          placeholder="Nombre de rutina"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-xl"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vigente desde
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-xl"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vigente hasta (opcional)
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-xl"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>

        {bloques.map((bloque, bloqueIdx) => (
          <div
            key={bloqueIdx}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-indigo-700">
                {bloque.nombre}
              </h3>

              <div className="flex items-center gap-3">
                {/* Preview del color */}
                {bloque.color_id && (
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300 shadow"
                    style={{
                      backgroundColor:
                        coloresDisponibles.find((c) => c.id === bloque.color_id)
                          ?.color_hex || 'transparent'
                    }}
                    title={
                      coloresDisponibles.find((c) => c.id === bloque.color_id)
                        ?.nombre || ''
                    }
                  />
                )}

                {/* Botón seleccionar color */}
                <button
                  type="button"
                  onClick={() => setModalColorIdx(bloqueIdx)}
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r bg-blue-600 text-white shadow-md hover:scale-105 transition-all duration-200"
                >
                  Elegir color
                </button>
              </div>
            </div>

            {bloque.ejercicios.map((ej, ejIdx) => (
              <div
                key={ejIdx}
                className="bg-white border border-gray-300 rounded-xl p-4 mb-4 shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => eliminarEjercicio(bloqueIdx, ejIdx)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Eliminar ejercicio"
                  >
                    ✖
                  </button>
                </div>

                {/* <input
                  type="text"
                  className="w-full mb-3 p-2 border rounded-md font-semibold"
                  placeholder="Nombre del ejercicio"
                  value={ej.nombre}
                  onChange={(e) =>
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'nombre',
                      e.target.value
                    )
                  }
                /> */}

                <AutocompleteEjercicio
                  value={ej.nombre}
                  onTextChange={(texto) => {
                    // sigue reflejando lo que escribe el usuario
                    actualizarEjercicio(bloqueIdx, ejIdx, 'nombre', texto);
                  }}
                  onSelect={(item) => {
                    // al seleccionar una opción del catálogo:
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'nombre',
                      item.nombre
                    );
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'catalogo_id',
                      item.id || null
                    ); // si agregaste la col
                    // si querés, podés setear musculo/notas por defecto usando item.musculo / item.tags
                  }}
                  placeholder="Escribe para buscar… (pe, bicep, senta...)"
                  apiUrl="https://vps-5097245-x.dattaweb.com/catalogo-ejercicios"
                  minChars={2}
                  limit={10}
                />

                <input
                  type="text"
                  className="mt-2 w-full mb-3 p-2 border rounded-md font-semibold"
                  placeholder="Notas u Obs. del ejercicio"
                  value={ej.notas}
                  onChange={(e) =>
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'notas',
                      e.target.value
                    )
                  }
                />
                <label className="block mb-1 font-semibold ">
                  Cantidad de series
                </label>
                <SeriesSelector
                  value={ej.seriesCantidad}
                  min={1}
                  max={10}
                  onChange={(nuevo) =>
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'seriesCantidad',
                      nuevo
                    )
                  }
                />
                {/* Botón original Replicar */}
                <button
                  type="button"
                  className="mb-3 px-3 py-1 mt-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    replicarEjercicio(bloqueIdx, ejIdx);
                  }}
                >
                  Replicar
                </button>

                
                {/* ====== SUGERENCIAS RÁPIDAS ====== */}
                {(() => {
                  // Helpers
                  const toInt = (v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? n : NaN;
                  };
                  const isFilled = (n) => Number.isFinite(n) && n > 0;

                  const reps = ej.series.map((s) => toInt(s.repeticiones));
                  const total = reps.length;

                  // Primer valor válido y cuántas vacías quedan
                  const firstFilledIdx = reps.findIndex(isFilled);
                  const firstVal =
                    firstFilledIdx >= 0 ? reps[firstFilledIdx] : null;
                  const emptyIdxs = reps
                    .map((n, i) => (!isFilled(n) ? i : -1))
                    .filter((i) => i !== -1);

                  // Para progresión aritmética si hay S1 y S2
                  const secondFilledIdx =
                    firstFilledIdx >= 0
                      ? reps.findIndex(
                          (n, i) => i > firstFilledIdx && isFilled(n)
                        )
                      : -1;

                  const canProgress =
                    firstFilledIdx >= 0 && secondFilledIdx >= 0;
                  const a = canProgress ? reps[firstFilledIdx] : null;
                  const b = canProgress ? reps[secondFilledIdx] : null;
                  const step = canProgress ? a - b : null; // p.ej. 12 -> 8 => step = 4

                  const handleFillEmpties = (val) => {
                    emptyIdxs.forEach((serieIdx) =>
                      actualizarSerie(
                        bloqueIdx,
                        ejIdx,
                        serieIdx,
                        'repeticiones',
                        val
                      )
                    );
                  };

                  const handleProgression = () => {
                    if (!canProgress) return;
                    let prev = b;
                    for (let i = secondFilledIdx + 1; i < total; i++) {
                      const next = Math.max(1, prev - step);
                      actualizarSerie(
                        bloqueIdx,
                        ejIdx,
                        i,
                        'repeticiones',
                        next
                      );
                      prev = next;
                    }
                  };

                  // Etiqueta human-readable para progresión (ej: 12→8→6→4)
                  const progressionLabel = (() => {
                    if (!canProgress) return null;
                    let seq = [a, b];
                    let prev = b;
                    for (let i = secondFilledIdx + 1; i < total; i++) {
                      prev = Math.max(1, prev - step);
                      seq.push(prev);
                    }
                    return seq.join('→');
                  })();

                  return (
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {/* 1) Rellenar vacías con primer valor encontrado */}
                      {isFilled(firstVal) && emptyIdxs.length > 0 && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                          title="Rellenar series vacías con este valor"
                          onClick={() => handleFillEmpties(firstVal)}
                        >
                          {total} × {firstVal}
                        </button>
                      )}

                      {/* 2) Progresión aritmética desde S1 y S2 */}
                      {canProgress &&
                        step !== 0 &&
                        secondFilledIdx < total - 1 && (
                          <button
                            type="button"
                            className="px-3 py-1 rounded-md bg-orange-600 text-white hover:bg-orange-700 text-sm"
                            title="Completar progresión aritmética"
                            onClick={handleProgression}
                          >
                            Progresión {progressionLabel}
                          </button>
                        )}
                    </div>
                  );
                })()}

                {/* ====== TUS INPUTS DE SERIES ====== */}
                <div className="grid grid-cols-2 gap-2">
                  {ej.series.map((serie, serieIdx) => (
                    <React.Fragment key={serieIdx}>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={`Reps S${serie.numero_serie}`}
                          className="p-2 rounded border w-full pr-14"
                          value={serie.repeticiones}
                          onChange={(e) =>
                            actualizarSerie(
                              bloqueIdx,
                              ejIdx,
                              serieIdx,
                              'repeticiones',
                              e.target.value
                            )
                          }
                        />
                        {/* 3) Mini botón para copiar este valor a las vacías */}
                        {Number(serie.repeticiones) > 0 && (
                          <button
                            type="button"
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            title="Copiar este valor a las series vacías"
                            onClick={() => {
                              const val = Number(serie.repeticiones);
                              ej.series.forEach((s, idx) => {
                                const rep = Number(s.repeticiones);
                                if (!(rep > 0)) {
                                  actualizarSerie(
                                    bloqueIdx,
                                    ejIdx,
                                    idx,
                                    'repeticiones',
                                    val
                                  );
                                }
                              });
                            }}
                          >
                            Copiar
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Descanso"
                        className="p-2 rounded border"
                        value={serie.descanso}
                        onChange={(e) =>
                          actualizarSerie(
                            bloqueIdx,
                            ejIdx,
                            serieIdx,
                            'descanso',
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Tiempo"
                        className="p-2 rounded border"
                        value={serie.tiempo}
                        onChange={(e) =>
                          actualizarSerie(
                            bloqueIdx,
                            ejIdx,
                            serieIdx,
                            'tiempo',
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="number"
                        placeholder="Kg"
                        className="p-2 rounded border"
                        value={serie.kg}
                        onChange={(e) =>
                          actualizarSerie(
                            bloqueIdx,
                            ejIdx,
                            serieIdx,
                            'kg',
                            e.target.value
                          )
                        }
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => agregarEjercicio(bloqueIdx)}
              className="text-green-600 hover:text-green-800 flex items-center gap-2 text-sm font-semibold mt-2"
            >
              <FaPlus /> Agregar ejercicio
            </button>
          </div>
        ))}

        <button
          onClick={agregarBloque}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl mb-6 w-full"
        >
          + Agregar bloque
        </button>

        <button
          onClick={handleCrear}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl w-full"
        >
          ✅ Crear Rutina
        </button>
      </div>
      {modalColorIdx !== null && bloques[modalColorIdx] && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl">
            <button
              onClick={() => setModalColorIdx(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">Selecciona un color</h3>
            <div className="flex flex-wrap gap-4 max-h-[400px] overflow-y-auto">
              {coloresDisponibles.map((col) => {
                const seleccionado =
                  bloques[modalColorIdx]?.color_id === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      handleBloqueChange(modalColorIdx, 'color_id', col.id);
                      setModalColorIdx(null);
                    }}
                    className={`flex-1 min-w-[100px] p-4 rounded-xl border-4 ${
                      seleccionado
                        ? 'border-blue-500 ring-2 ring-blue-300 scale-105'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: col.color_hex,
                      color: 'white',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                    title={col.nombre}
                  >
                    <div className="font-bold text-sm">{col.nombre}</div>
                    <div className="text-xs">{col.descripcion}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalCrearRutina;
