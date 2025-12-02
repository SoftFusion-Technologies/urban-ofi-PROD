import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaPlayCircle,
  FaDumbbell,
  FaClock,
  FaRedoAlt,
  FaRegStickyNote
} from 'react-icons/fa';

// ─────────────────────────────────────────────
// Helper para URL de video (usando lo que ya tenés)
// ─────────────────────────────────────────────
function buildYouTubeUrl(ej = {}) {
  if (ej.video_url) return ej.video_url; // si viene curado desde el catálogo

  const tokens = [
    ej.nombre || '',
    'técnica',
    'ejecución',
    'gym',
    'español'
  ].filter(Boolean);

  const q = encodeURIComponent(tokens.join(' '));
  return `https://www.youtube.com/results?search_query=${q}`;
}

// ─────────────────────────────────────────────
// Mapea color_id de bloque a estilos de glass
// ─────────────────────────────────────────────
function getBloqueClasses(colorId) {
  switch (colorId) {
    case 1:
      return 'from-emerald-500/20 via-emerald-500/5 to-emerald-500/0 border-emerald-400/70';
    case 2:
      return 'from-sky-500/20 via-sky-500/5 to-sky-500/0 border-sky-400/70';
    case 3:
      return 'from-amber-500/20 via-amber-500/5 to-amber-500/0 border-amber-400/70';
    case 4:
      return 'from-rose-500/20 via-rose-500/5 to-rose-500/0 border-rose-400/70';
    default:
      return 'from-zinc-800/40 via-zinc-900/40 to-zinc-900/0 border-zinc-700/80';
  }
}

export default function RutinaHoyModal({ studentId, isOpen, onClose }) {
  const [rutina, setRutina] = useState(null);
  const [fuenteRutinas, setFuenteRutinas] = useState(null); // 'propias' | 'asignadas' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orientation, setOrientation] = useState('portrait');

  // Lock de scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Fetch de rutinas de hoy (propias → asignadas)
  useEffect(() => {
    if (!isOpen || !studentId) return;

    const cargarRutinaHoy = async () => {
      setLoading(true);
      setError(null);
      setRutina(null);
      setFuenteRutinas(null);

      try {
        let rutinaSeleccionada = null;
        let fuente = null;

        // 1) Propias de hoy
        try {
          const resPropias = await fetch(
            `https://vps-5097245-x.dattaweb.com/rutinas/hoy/${studentId}`
          );

          if (resPropias.ok) {
            const dataPropias = await resPropias.json();
            const propias = Array.isArray(dataPropias) ? dataPropias : [];
            if (propias.length > 0) {
              rutinaSeleccionada = propias[0];
              fuente = 'propias';
            }
          }
        } catch (err) {
          console.error('Error cargando rutinas propias de hoy:', err);
        }

        // 2) Si no hay propias, probar asignadas de hoy
        if (!rutinaSeleccionada) {
          try {
            const resAsig = await fetch(
              `https://vps-5097245-x.dattaweb.com/rutinas/asignadas/hoy/${studentId}`
            );

            if (resAsig.ok) {
              const dataAsig = await resAsig.json();
              const asignadas = Array.isArray(dataAsig) ? dataAsig : [];
              if (asignadas.length > 0) {
                rutinaSeleccionada = asignadas[0];
                fuente = 'asignadas';
              }
            }
          } catch (err) {
            console.error('Error cargando rutinas asignadas de hoy:', err);
          }
        }

        if (!rutinaSeleccionada) {
          // Sin rutina para hoy: dejamos rutina=null y mostramos el mensaje amigable
          setRutina(null);
          setFuenteRutinas(null);
        } else {
          setRutina(rutinaSeleccionada);
          setFuenteRutinas(fuente);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las rutinas de hoy.');
      } finally {
        setLoading(false);
      }
    };

    cargarRutinaHoy();
  }, [isOpen, studentId]);

  // Detectar orientación (vertical / horizontal) y adaptar layout
  useEffect(() => {
    const updateOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    const so = window.screen && window.screen.orientation;
    if (so && so.addEventListener) {
      so.addEventListener('change', updateOrientation);
    }

    return () => {
      window.removeEventListener('resize', updateOrientation);
      if (so && so.removeEventListener) {
        so.removeEventListener('change', updateOrientation);
      }
    };
  }, []);

  const resumen = useMemo(() => {
    if (!rutina?.bloques) return { bloques: 0, ejercicios: 0, series: 0 };
    const bloques = rutina.bloques.length;
    let ejercicios = 0;
    let series = 0;

    rutina.bloques.forEach((b) => {
      const ejList = b.ejercicios || [];
      ejercicios += ejList.length;
      ejList.forEach((e) => {
        series += (e.series || []).length;
      });
    });

    return { bloques, ejercicios, series };
  }, [rutina]);

  const formattedFecha =
    rutina?.fecha &&
    new Date(rutina.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

  const containerHeight = orientation === 'portrait' ? 'h-[88vh]' : 'h-[90vh]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-3">
          <motion.div
            key="rutina-hoy-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22 }}
            className={`relative w-full max-w-4xl rounded-[28px] border border-emerald-500/60 bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 backdrop-blur-2xl shadow-[0_0_45px_rgba(16,185,129,0.55)] text-zinc-50 overflow-hidden flex flex-col ${containerHeight}`}
          >
            {/* Halo exterior */}
            <div className="pointer-events-none absolute -inset-px rounded-[28px] border border-emerald-400/20 shadow-[0_0_70px_rgba(16,185,129,0.5)]" />

            {/* HEADER */}
            <div className="relative z-10 px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-500/20 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-300 mb-1">
                  <FaDumbbell className="text-xs" />
                  <span>Rutina de hoy</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {rutina?.alumno?.nomyape || 'Alumno'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formattedFecha || 'Sin fecha asignada'} · {resumen.bloques}{' '}
                  bloques · {resumen.ejercicios} ejercicios · {resumen.series}{' '}
                  series
                  {fuenteRutinas === 'propias' && (
                    <span className="ml-1 text-emerald-300">
                      · Rutina creada por vos
                    </span>
                  )}
                  {fuenteRutinas === 'asignadas' && (
                    <span className="ml-1 text-emerald-300">
                      · Rutina asignada por tu profesor
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-emerald-400/70 transition"
                aria-label="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            {/* CUERPO / CONTENIDO → AHORA SCROLEABLE */}
            <div className="relative z-10 flex-1 px-4 sm:px-6 pb-4 pt-3 overflow-y-auto">
              {/* Info de estado (loading/error/sin datos) */}
              {loading && (
                <div className="min-h-[40vh] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-zinc-300">
                    <div className="h-10 w-10 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                    <p className="text-sm">Cargando rutina de hoy…</p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="min-h-[40vh] flex items-center justify-center text-center">
                  <div>
                    <p className="text-sm text-red-300 mb-2">
                      Ocurrió un problema al cargar la rutina.
                    </p>
                    <p className="text-xs text-zinc-400 mb-4">{error}</p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-600 hover:border-emerald-400/70 hover:text-emerald-200 transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && !rutina && (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
                  <FaClock className="text-3xl text-zinc-500 mb-3" />
                  <p className="text-sm font-medium text-zinc-100">
                    Hoy no tenés una rutina asignada.
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Consultá con tu profesor para que te asigne un plan de
                    entrenamiento.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-600 hover:border-emerald-400/70 hover:text-emerald-200 transition"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {!loading && !error && rutina && (
                <div
                  className={
                    orientation === 'landscape'
                      ? 'grid grid-cols-1 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3'
                      : 'flex flex-col gap-3'
                  }
                >
                  {/* COL IZQUIERDA: bloques + ejercicios */}
                  <div className="space-y-3">
                    {rutina.bloques?.map((bloque) => (
                      <div
                        key={bloque.id}
                        className={`relative rounded-2xl border bg-gradient-to-br ${getBloqueClasses(
                          bloque.color_id
                        )} px-3.5 py-3 sm:px-4 sm:py-3.5 backdrop-blur-xl`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-[11px] text-emerald-300 uppercase tracking-[0.16em] font-semibold">
                              {bloque.nombre || 'Bloque'}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Orden {bloque.orden}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/60 border border-zinc-600/70 px-2 py-1 text-[10px] text-zinc-300">
                            <FaRedoAlt className="text-[10px]" />
                            {bloque.ejercicios?.length || 0} ejercicios
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {(bloque.ejercicios || []).map((ejercicio) => (
                            <div
                              key={ejercicio.id}
                              className="rounded-2xl bg-zinc-950/70 border border-zinc-700/80 px-3 py-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-zinc-50 truncate">
                                    {ejercicio.nombre}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                                    <FaDumbbell className="text-[10px] text-emerald-300" />
                                    Orden {ejercicio.orden}
                                  </p>
                                </div>
                                <a
                                  href={buildYouTubeUrl(ejercicio)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/25 hover:text-emerald-50 transition whitespace-nowrap"
                                >
                                  <FaPlayCircle className="text-xs" />
                                  Ver video
                                </a>
                              </div>

                              {ejercicio.notas && (
                                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-zinc-300">
                                  <FaRegStickyNote className="mt-[2px] text-emerald-300" />
                                  <p className="leading-snug">
                                    {ejercicio.notas}
                                  </p>
                                </div>
                              )}

                              {/* SERIES */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(ejercicio.series || []).map((serie) => (
                                  <div
                                    key={serie.id}
                                    className="rounded-full bg-zinc-900/80 border border-zinc-700/80 px-3 py-1 text-[11px] flex items-center gap-2 text-zinc-200"
                                  >
                                    <span className="font-semibold text-emerald-300">
                                      Serie {serie.numero_serie}
                                    </span>
                                    {serie.repeticiones != null && (
                                      <span>· {serie.repeticiones} reps</span>
                                    )}
                                    {serie.kg && (
                                      <span>· {parseFloat(serie.kg)} kg</span>
                                    )}
                                    {serie.descanso && (
                                      <span>· {serie.descanso}s descanso</span>
                                    )}
                                    {serie.tiempo && (
                                      <span>· {serie.tiempo}s</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COL DERECHA: resumen / tips (visible en horizontal o pantallas más grandes) */}
                  {orientation === 'landscape' && (
                    <div className="hidden sm:flex flex-col border border-emerald-500/30 rounded-2xl bg-zinc-950/70 backdrop-blur-xl px-4 py-3 space-y-3">
                      <p className="text-xs text-zinc-300">
                        <span className="font-semibold text-emerald-300">
                          Tip:
                        </span>{' '}
                        Usá el celular en horizontal para ver mejor los
                        ejercicios y series mientras entrenás.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/80 px-2 py-2">
                          <p className="text-zinc-400 mb-0.5">Bloques</p>
                          <p className="text-lg font-semibold text-emerald-300">
                            {resumen.bloques}
                          </p>
                        </div>
                        <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/80 px-2 py-2">
                          <p className="text-zinc-400 mb-0.5">Ejercicios</p>
                          <p className="text-lg font-semibold text-emerald-300">
                            {resumen.ejercicios}
                          </p>
                        </div>
                        <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/80 px-2 py-2">
                          <p className="text-zinc-400 mb-0.5">Series</p>
                          <p className="text-lg font-semibold text-emerald-300">
                            {resumen.series}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto pt-2 text-[11px] text-zinc-500">
                        Siempre podés volver a este panel desde tu perfil si
                        necesitás repasar la rutina.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
