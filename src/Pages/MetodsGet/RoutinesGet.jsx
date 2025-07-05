import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaRegClock } from 'react-icons/fa';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import NavbarStaff from '../staff/NavbarStaff';
import ParticlesBackground from '../../Components/ParticlesBackground';
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

  if (loading)
    return <p className="text-center text-gray-500">Cargando rutinas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (rutinas.length === 0)
    return (
      <p className="text-center text-gray-500">No hay rutinas disponibles.</p>
    );

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground />

      <div className="relative min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 pt-24 pb-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-10 drop-shadow-lg"
        >
          Rutinas Asignadas
        </motion.h1>

        <div className="max-w-6xl mx-auto space-y-8">
          {rutinas.map((rutina) => (
            <motion.div
              key={rutina.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/90 backdrop-blur-md border border-blue-200 shadow-2xl rounded-2xl p-6 hover:shadow-blue-300 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-900">
                  Fecha: {new Date(rutina.fecha).toLocaleDateString('es-AR')}
                </h3>
                <span
                  className={`flex items-center gap-2 font-semibold ${
                    rutina.completado ? 'text-green-600' : 'text-yellow-400'
                  }`}
                >
                  {rutina.completado ? (
                    <>
                      <FaCheckCircle /> Completado
                    </>
                  ) : (
                    <>
                      <FaRegClock /> Pendiente
                    </>
                  )}
                </span>
              </div>

              <div className="grid gap-4">
                {rutina.exercises.map((ej) => (
                  <div
                    key={ej.id}
                    className="bg-blue-50 border-l-4 border-blue-600 rounded px-4 py-3 shadow-sm hover:bg-blue-100 transition"
                  >
                    <h4 className="text-blue-700 font-bold uppercase text-sm mb-1 tracking-wide">
                      {ej.musculo}
                    </h4>
                    <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                      {ej.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
