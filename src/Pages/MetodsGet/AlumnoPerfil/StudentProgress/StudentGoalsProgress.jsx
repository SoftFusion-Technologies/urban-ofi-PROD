import { useState, useEffect } from 'react';

const dificultadColors = {
  fácil: 'bg-green-200 text-green-800',
  normal: 'bg-yellow-200 text-yellow-800',
  difícil: 'bg-red-200 text-red-800'
};

export default function StudentGoalsProgress({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGoalMesAnio, setExpandedGoalMesAnio] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://vps-5097245-x.dattaweb.com/students/${studentId}/progress`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <p>Cargando objetivos...</p>;
  if (!data || !data.monthlyGoals || data.monthlyGoals.length === 0)
    return <p>No hay objetivos mensuales registrados.</p>;

  // Aquí guardamos las rutinas para el alumno, las usaremos al expandir
  const routines = data.routines || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {data.monthlyGoals.map((goal) => {
        // clave única por mes y año (ya que no hay id)
        const goalKey = `${goal.mes}-${goal.anio}`;

        // para expandir/collapse
        const isExpanded = expandedGoalMesAnio === goalKey;

        // Filtrar las rutinas que correspondan a ese mes y año del objetivo
        const goalRoutines = routines.filter(
          (r) => r.mes === goal.mes && r.anio === goal.anio
        );

        return (
          <div
            key={goalKey}
            className="border rounded-lg shadow-sm p-4 bg-white"
          >
            <header
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpandedGoalMesAnio(isExpanded ? null : goalKey)
              }
            >
              <h3 className="text-lg font-semibold">
                Objetivo - {goal.mes}/{goal.anio}
              </h3>
              <button className="text-blue-600 hover:underline">
                {isExpanded ? 'Ocultar' : 'Ver más'}
              </button>
            </header>

            <p className="mt-2 text-gray-700 italic">{goal.objetivo}</p>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {goalRoutines.length === 0 ? (
                  <p className="text-gray-500">Sin rutinas asociadas.</p>
                ) : (
                  goalRoutines.map((routine) => (
                    <div
                      key={routine.rutina_id}
                      className="border rounded-md p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Rutina: {new Date(routine.fecha).toLocaleDateString()}
                        </span>

                        {routine.feedback ? (
                          <div className="flex space-x-3 text-sm">
                            <span
                              className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                routine.feedback.gusto
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-200 text-red-800'
                              }`}
                              title={
                                routine.feedback.gusto
                                  ? 'Le gustó'
                                  : 'No le gustó'
                              }
                            >
                              {routine.feedback.gusto ? '👍' : '👎'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded ${
                                dificultadColors[routine.feedback.dificultad] ||
                                ''
                              }`}
                              title={`Dificultad: ${
                                routine.feedback.dificultad || 'N/A'
                              }`}
                            >
                              {routine.feedback.dificultad || 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">
                            Sin feedback
                          </span>
                        )}
                      </div>

                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 hover:underline">
                          Ver ejercicios y solicitudes
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {!routine.ejercicios ||
                          routine.ejercicios.length === 0 ? (
                            <li className="text-gray-500 italic">
                              No hay ejercicios cargados.
                            </li>
                          ) : (
                            routine.ejercicios.map((ex) => (
                              <li
                                key={ex.ejercicio_id}
                                className="border rounded p-2 bg-white"
                              >
                                <p>
                                  <strong>Músculo:</strong> {ex.musculo}
                                </p>
                                <p>
                                  <strong>Ejercicio:</strong> {ex.descripcion}
                                </p>
                                {ex.solicitud && (
                                  <div
                                    className={`mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium ${
                                      ex.solicitud.estado === 'pendiente'
                                        ? 'bg-yellow-200 text-yellow-800'
                                        : 'bg-green-200 text-green-800'
                                    }`}
                                  >
                                    {ex.solicitud.estado === 'pendiente'
                                      ? 'Solicitud pendiente'
                                      : 'Solicitud atendida'}
                                    : {ex.solicitud.mensaje}
                                  </div>
                                )}
                              </li>
                            ))
                          )}
                        </ul>
                      </details>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
