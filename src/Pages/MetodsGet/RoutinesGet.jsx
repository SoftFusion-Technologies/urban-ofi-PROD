import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaRegClock, FaYoutube } from 'react-icons/fa';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import NavbarStaff from '../staff/NavbarStaff';
import ParticlesBackground from '../../Components/ParticlesBackground';
import ButtonBack from '../../Components/ButtonBack'
export default function RoutinesGet() {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  const { id: studentId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const instructorId = searchParams.get('instructor_id');

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        let url = '';

        if (userId) {
          url = `https://vps-5097245-x.dattaweb.com/routines-by-instructor?instructor_id=${userId}`;
        } else if (studentId) {
          url = `https://vps-5097245-x.dattaweb.com/routines?student_id=${studentId}`;
        } else {
          url = `https://vps-5097245-x.dattaweb.com/routines`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener las rutinas');
        const data = await response.json();
        setRutinas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, [studentId, instructorId]);

  // Shimmer loader (mejor UX visual)
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
        <ButtonBack />
        <ParticlesBackground />
        <div className="w-60 h-12 rounded-xl bg-white/20 animate-pulse mb-3"></div>
        <div className="w-80 h-36 rounded-2xl bg-white/10 animate-pulse"></div>
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (rutinas.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
        <ButtonBack />
        <ParticlesBackground />
        <p className="text-center text-white/90 text-lg">
          No hay rutinas disponibles.
        </p>
      </div>
    );

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground />
      <div className="relative min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 pt-24 pb-20 px-2 sm:px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-10 drop-shadow-xl tracking-tight"
        >
          Rutinas Asignadas
        </motion.h1>

        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <AnimatePresence>
            {rutinas.map((rutina, i) => (
              <motion.div
                key={rutina.id}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl rounded-3xl p-6 hover:shadow-blue-400/30 transition-all duration-300"
              >
                {/* Fecha y estado */}
                <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-blue-900 tracking-tight">
                    {new Date(rutina.fecha).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </h3>
                  <span
                    className={`flex items-center gap-2 px-3 py-1 rounded-2xl text-base font-semibold shadow-sm ${
                      rutina.completado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {rutina.completado ? (
                      <>
                        <FaCheckCircle className="text-green-500" /> Completado
                      </>
                    ) : (
                      <>
                        <FaRegClock className="text-yellow-400" /> Pendiente
                      </>
                    )}
                  </span>
                </div>
                {/* Ejercicios */}
                <div className="flex flex-col gap-4">
                  {rutina.exercises.map((ej, j) => (
                    <div
                      key={ej.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-blue-50/90 border-l-4 border-blue-600 rounded-xl px-4 py-3 shadow-sm hover:bg-blue-100 transition relative"
                    >
                      {/* Tag color si existe */}
                      {ej.colorData && (
                        <span
                          className="absolute -left-3 -top-2 sm:static sm:mr-4 inline-flex items-center gap-2 px-3 py-1 rounded-xl shadow border-2 border-white text-white font-bold text-xs"
                          style={{
                            background: ej.colorData.color_hex,
                            boxShadow: `0 2px 12px 0 ${ej.colorData.color_hex}33`,
                            minWidth: 80
                          }}
                          title={ej.colorData.descripcion}
                        >
                          {ej.colorData.nombre}
                        </span>
                      )}
                      <div className="flex-1 w-full">
                        <h4 className="text-blue-800 font-bold uppercase text-sm mb-1 tracking-wide flex items-center gap-2">
                          {ej.musculo}
                        </h4>
                        <p className="text-gray-800 text-[15px] whitespace-pre-line leading-relaxed font-medium">
                          {ej.descripcion}
                        </p>
                      </div>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          ej.musculo + ' ' + ej.descripcion
                        )}`}
                        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-1 rounded-lg shadow ml-auto"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver ejercicios en YouTube"
                      >
                        <FaYoutube className="text-base" />
                        Video
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
