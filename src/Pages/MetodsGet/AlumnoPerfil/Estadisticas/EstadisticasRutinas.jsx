import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

function EstadisticasAlumno({ studentId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rutinas, setRutinas] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  const mesActual = today.getMonth() + 1;
  const anioActual = today.getFullYear();
  const URL = 'https://vps-5097245-x.dattaweb.com/estadisticas';

  useEffect(() => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(
        `${URL}/rutinas-por-alumno?student_id=${studentId}&mes=${mesActual}&anio=${anioActual}`
      ).then((res) => {
        if (!res.ok) throw new Error('Error al cargar rutinas');
        return res.json();
      }),
      fetch(`${URL}/ranking-activos?mes=${mesActual}&anio=${anioActual}`).then(
        (res) => {
          if (!res.ok) throw new Error('Error al cargar ranking');
          return res.json();
        }
      )
    ])
      .then(([rutinasData, rankingData]) => {
        setRutinas(rutinasData);
        setRanking(rankingData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [studentId, mesActual, anioActual]);

  if (loading)
    return <div className="text-center p-4">Cargando estadísticas...</div>;
  if (error) return <div className="text-center text-red-600 p-4">{error}</div>;
  if (!rutinas || !ranking) return null;

  const porcentajeCompletadas =
    rutinas.total_rutinas_cargadas === 0
      ? 0
      : Math.round(
          (rutinas.total_rutinas_completadas / rutinas.total_rutinas_cargadas) *
            100
        );

  const rankingToShow = showAll ? ranking : ranking.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-5xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl p-10 space-y-12 border border-gray-100"
    >
      <section>
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Actividad del Mes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-6 shadow-lg bg-white border border-blue-200"
          >
            <p className="text-gray-600 text-sm mb-1 text-center">
              Rutinas Asignadas
            </p>
            <p className="text-4xl font-bold text-blue-600 text-center">
              {rutinas.total_rutinas_cargadas}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-6 shadow-lg bg-white border border-green-200"
          >
            <p className="text-gray-600 text-sm mb-1 text-center">
              Completadas
            </p>
            <p className="text-4xl font-bold text-green-600 text-center">
              {rutinas.total_rutinas_completadas}
            </p>
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Progreso:{' '}
            <span className="text-green-700">{porcentajeCompletadas}%</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentajeCompletadas}%` }}
              transition={{ duration: 1 }}
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Ranking de Alumnos Activos
        </h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow p-6">
          <ol className="divide-y divide-gray-100">
            {rankingToShow.map(
              (
                { student_id, nomyape, rutinas_asignadas, rutinas_completadas },
                index
              ) => (
                <li
                  key={student_id}
                  className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition"
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <FaCrown className="text-yellow-400" />}
                    <span className="font-medium text-gray-700">
                      {index + 1}. {nomyape}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <p>
                      Asignadas:{' '}
                      <span className="font-semibold text-gray-800">
                        {rutinas_asignadas}
                      </span>
                    </p>
                    <p>
                      Completadas:{' '}
                      <span className="font-semibold text-green-600">
                        {rutinas_completadas}
                      </span>
                    </p>
                  </div>
                </li>
              )
            )}
          </ol>
          {ranking.length > 3 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition"
              >
                {showAll ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

export default EstadisticasAlumno;
