import { useEffect, useState } from 'react';
import NavbarStaff from '../../../staff/NavbarStaff';
import ParticlesBackground from '../../../../Components/ParticlesBackground';
import SinFeedback from './SinFeedback';
import ButtonBack from '../../../../Components/ButtonBack';
const FeedbackList = ({ instructorId, studentId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState(null);
  const [showExercises, setShowExercises] = useState(true);

  useEffect(() => {
    // Obtener nombre del alumno
    fetch(`https://vps-5097245-x.dattaweb.com/students/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener el alumno');
        return res.json();
      })
      .then((data) => {
        setStudentName(data.nomyape || 'Estudiante');
      })
      .catch(() => {
        setStudentName('Estudiante');
      });
  }, [studentId]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Incluyo instructorId en la query string para filtrar
        const url = `https://vps-5097245-x.dattaweb.com/routine-feedbacks?instructor_id=${instructorId}&student_id=${studentId}`;

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Error al cargar los feedbacks');

        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchFeedbacks();
    }
  }, [instructorId]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-300">Cargando feedbacks...</p>
    );
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (feedbacks.length === 0)
    return (
      <SinFeedback mensaje="Aún no ha enviado feedback de sus rutinas." />
    );

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground />
      <main className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 min-h-screen py-12 px-4 sm:px-8 md:px-12">
        <ButtonBack></ButtonBack>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl titulo uppercase font-extrabold text-white mb-12 tracking-wide text-center">
            Feedbacks de Rutinas de {studentName}
          </h2>

          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((fb) => (
              <article
                key={fb.feedback_id}
                className="bg-white rounded-xl shadow-xl border border-gray-300 p-7 flex flex-col hover:shadow-2xl transition-shadow duration-300"
                aria-label={`Feedback del alumno ${
                  fb.alumno
                } para rutina del ${new Date(
                  fb.rutina.fecha
                ).toLocaleDateString()}`}
              >
                <header className="mb-5">
                  <time
                    dateTime={new Date(fb.rutina.fecha).toISOString()}
                    className="block text-sm text-gray-400 mb-1 tracking-wide"
                  >
                    Fecha Rutina:{' '}
                    {new Date(fb.rutina.fecha).toLocaleDateString()}
                  </time>
                  <h3 className="uppercase mt-5 text-2xl font-semibold text-blue-900 truncate">
                    Opinión
                  </h3>
                </header>

                <section className="mb-6 text-gray-700 text-base leading-relaxed space-y-3 flex-grow">
                  <p>
                    <strong className="font-medium text-gray-900">
                      ¿Le gusto?:
                    </strong>{' '}
                    {fb.gusto ? 'Sí' : 'No'}
                  </p>
                  <p>
                    <strong className="font-medium text-gray-900">
                      Dificultad:
                    </strong>{' '}
                    {fb.dificultad}
                  </p>
                  <p>
                    <strong className="font-medium text-gray-900">
                      Comentario:
                    </strong>{' '}
                    {fb.comentario || '-'}
                  </p>
                  {/* <p>
                    <strong className="font-medium text-gray-900">
                      Instructor:
                    </strong>{' '}
                    {fb.instructor}
                  </p> */}
                </section>
                <section className="mt-4">
                  <button
                    onClick={() => setShowExercises(!showExercises)}
                    className="text-blue-700 hover:underline font-semibold text-sm mb-2"
                  >
                    {showExercises ? 'Ocultar ejercicios' : 'Ver ejercicios'}
                  </button>

                  {showExercises && (
                    <div className="mt-2 transition-all duration-300 ease-in-out">
                      <ul className="list-disc list-inside space-y-2 max-h-48 overflow-y-auto text-gray-600 text-sm">
                        {fb.rutina.exercises.length > 0 ? (
                          fb.rutina.exercises.map((ex) => (
                            <li key={ex.id}>
                              <span className="font-semibold text-blue-900">
                                {ex.musculo}:
                              </span>{' '}
                              {ex.descripcion
                                .trim()
                                .split('\n')
                                .map((line, i) => (
                                  <p key={i} className="pl-2">
                                    {line}
                                  </p>
                                ))}
                            </li>
                          ))
                        ) : (
                          <li>No hay ejercicios</li>
                        )}
                      </ul>
                    </div>
                  )}
                </section>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default FeedbackList;
