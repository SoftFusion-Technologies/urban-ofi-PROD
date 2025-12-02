import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUserCog,
  FaUsers,
  FaCubes,
  FaDumbbell,
  FaPlusCircle,
  FaClipboardList,
  FaWeightHanging,
  FaChartLine,
  FaMobileAlt,
  FaInstagram,
  FaGlobeAmericas
} from 'react-icons/fa';

import NavbarStaff from '../../staff/NavbarStaff';
import ParticlesBackground from '../../../Components/ParticlesBackground';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

import { useNavigate } from 'react-router-dom';
import StudentGoalModal from './StudentProgress/StudentGoalModal';
import StudentMonthlyGoalDetail from './StudentProgress/StudentMonthlyGoalDetail';
import EstadisticasRutinas from './Estadisticas/EstadisticasRutinas';
import { motion } from 'framer-motion';
import ModalCrearRutina from './ModalCrearRutina';
import RutinaPorBloques from './RutinaPorBloques';
import RutinaVigentePorBloques from './RutinaVigentePorBloques';
import RutinaHoyModal from './RutinaHoyModal';

function ActionButton({ onClick, icon: Icon, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={[
        // base
        'group relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white',
        'shadow-sm ring-1 ring-black/5 transition-all duration-200',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10',
        'active:scale-[0.98]',
        // hover lift
        'hover:shadow-md hover:-translate-y-0.5',
        className
      ].join(' ')}
      aria-label={label}
      title={label}
    >
      {/* Glow sutil */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-20 bg-white"></span>
      <Icon className="text-xl" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
function PerfilAlumno() {
  const { id } = useParams();
  console.log(id);

  const [alumno, setAlumno] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [recargarRutinas, setRecargarRutinas] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reloadGoals, setReloadGoals] = useState(false);
  const [mostrarCrearRutina, setMostrarCrearRutina] = useState(false);
  const [mostrarProgramarRutina, setMostrarProgramarRutina] = useState(false);
  const { userId, userLevel } = useAuth();
  const [modoFormulario, setModoFormulario] = useState('bloques'); // 'musculo' o 'bloques'
  console.log('PerfilAlumno → userLevel:', userLevel);

  const [showRoutinePrompt, setShowRoutinePrompt] = useState(false);
  const [showRoutineViewer, setShowRoutineViewer] = useState(false);

  // Mostrar modal de "Ver rutina" 2 segundos después de cargar el perfil
  useEffect(() => {
    // Solo mostrar el modal si:
    // - el alumno ya está cargado
    // - el rol logueado es "alumno"
    if (!alumno) return;
    if (userLevel !== 'alumno') return;
    const timer = setTimeout(() => {
      setShowRoutinePrompt(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [alumno, userLevel]);

  const navigate = useNavigate();

  // Fetch alumno por id
  useEffect(() => {
    async function fetchAlumno() {
      try {
        const res = await fetch(`https://vps-5097245-x.dattaweb.com/students/${id}`);
        if (!res.ok) throw new Error('Error al cargar el perfil');
        const data = await res.json();
        setAlumno(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAlumno();
  }, [id]);

  // Fetch usuarios (instructores) una vez
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const res = await axios.get('https://vps-5097245-x.dattaweb.com/users');
        const instructores = res.data.filter(
          (user) => user.level === 'instructor'
        );
        setUsuarios(instructores);
      } catch (error) {
        console.log('Error al obtener profesores:', error);
      }
    };
    obtenerUsuarios();
  }, []); // solo se ejecuta una vez

  const obtenerNombreProfesor = (userId) => {
    const profesor = usuarios.find((u) => u.id === userId);
    return profesor ? profesor.name : 'Sin asignar';
  };

  const obtenerIdProfesor = (userId) => {
    const profesor = usuarios.find((u) => u.id === userId);
    return profesor ? profesor.id : null; // null si no lo encuentra
    console.log(userId);
  };

  const capitalizeFirst = (str) =>
    str && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      : '';

  if (loading) {
    return (
      <>
        <NavbarStaff />
        <p className="text-center mt-8 text-gray-600">Cargando perfil...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarStaff />
        <p className="text-center mt-8 text-red-600">Error: {error}</p>
      </>
    );
  }

  if (!alumno) {
    return (
      <>
        <NavbarStaff />
        <p className="text-center mt-8 text-gray-600">
          No se encontró el alumno.
        </p>
      </>
    );
  }

  // Si llegamos aquí, alumno ya está cargado y no es null
  return (
    <>
      <NavbarStaff />
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 min-h-screen pt-10 pb-10">
        <ParticlesBackground />

        {userLevel === '' && (
          <StudentGoalModal
            studentId={id}
            onGoalCreated={() => setReloadGoals((prev) => !prev)}
          />
        )}
        <div className="container mx-auto px-4">
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
            {/* PERFIL ALUMNO (card fija) */}
            <div className="w-full max-w-xl mx-auto lg:mx-0">
              <div className="bg-white/95 shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/40">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Imagen del alumno */}
                  <div className="flex justify-center relative">
                    <div className="relative w-36 h-36">
                      {/* Borde giratorio */}
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-lime-400 z-0"
                        style={{
                          animation: 'spin-slow 4s linear infinite',
                          maskImage:
                            'radial-gradient(circle at center, transparent 60%, black 60%)',
                          WebkitMaskImage:
                            'radial-gradient(circle at center, transparent 60%, black 60%)'
                        }}
                      ></div>

                      {/* Imagen del alumno */}
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          alumno.nomyape
                        )}&background=4ade80&color=fff&size=128`}
                        alt="Avatar Alumno"
                        className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-white shadow-md z-10"
                      />
                    </div>
                  </div>

                  {/* Nombre del alumno */}
                  <h2 className="text-center titulo text-2xl font-bold text-gray-800 uppercase tracking-wide mt-6 mb-2">
                    {alumno.nomyape}
                  </h2>

                  {/* Línea separadora */}
                  <div className="border-t border-gray-200 my-4 w-2/4 mx-auto"></div>

                  {/* Botones de acción según el rol */}
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(userLevel === 'admin' || userLevel === 'instructor') && (
                      <ActionButton
                        onClick={() => setMostrarCrearRutina?.(true)}
                        icon={FaPlusCircle}
                        label="Crear Rutina"
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      />
                    )}

                    <ActionButton
                      onClick={() => {
                        if (id) {
                          navigate(
                            `/dashboard/pse?instructor_id=${userId}&student_id=${id}`
                          );
                        } else {
                          alert('Faltan datos para ver los PSE');
                        }
                      }}
                      icon={FaClipboardList}
                      label="Ver PSE"
                      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                    />

                    <ActionButton
                      onClick={() => {
                        if (id) {
                          navigate(`/dashboard/rm?student_id=${id}`);
                        } else {
                          alert('Faltan datos para gestionar la RM');
                        }
                      }}
                      icon={FaWeightHanging}
                      label="Gestionar RM"
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
                    />

                    {userLevel === 'alumno' && (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition"
                        onClick={() => {
                          setShowRoutinePrompt(false);
                          setShowRoutineViewer(true); // abrimos el viewer moderno
                        }}
                      >
                        Ver rutina
                      </button>
                    )}
                    <ActionButton
                      onClick={() =>
                        navigate(`/dashboard/logs-global?student_id=${id}`)
                      }
                      icon={FaChartLine}
                      label="Registro de Pesos"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    />
                  </div>

                  {/* Datos personales */}
                  <div className="space-y-4 text-gray-700 text-[1.05rem]">
                    <p className="flex items-center gap-2">
                      <FaChalkboardTeacher className="text-blue-500 text-lg" />
                      <span>
                        <span className="text-gray-500 font-semibold">
                          Profesor:
                        </span>{' '}
                        <span className="text-gray-800">
                          {obtenerNombreProfesor(alumno.user_id) ||
                            'No disponible'}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone className="text-blue-500 text-lg" />
                      <span>
                        <span className="text-gray-500 font-semibold">
                          Teléfono:
                        </span>{' '}
                        <span className="text-gray-800">
                          {alumno.telefono || 'No disponible'}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FaIdCard className="text-blue-500 text-lg" />
                      <span>
                        <span className="text-gray-500 font-semibold">
                          DNI:
                        </span>{' '}
                        <span className="text-gray-800">
                          {alumno.dni || 'No disponible'}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      {alumno.rutina_tipo === 'personalizado' ? (
                        <FaUserCog className="text-orange-500 text-lg" />
                      ) : (
                        <FaUsers className="text-blue-500 text-lg" />
                      )}
                      <span>
                        <span className="text-gray-500 font-semibold">
                          Tipo de Alumno:
                        </span>{' '}
                        <span className="text-gray-800">
                          {alumno.rutina_tipo
                            ? capitalizeFirst(alumno.rutina_tipo)
                            : 'No disponible'}
                        </span>
                      </span>
                    </p>
                  </div>

                  {/* Fechas */}
                  <div className="text-gray-500 mt-6 text-sm space-y-2">
                    <p className="flex items-center justify-center gap-2">
                      <FaCalendarAlt />
                      Creado:{' '}
                      {alumno.created_at
                        ? new Date(alumno.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <FaCalendarAlt />
                      Actualizado:{' '}
                      {alumno.updated_at
                        ? new Date(alumno.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* COLUMNA DERECHA: RUTINAS */}
            <div className="flex flex-col gap-6 min-h-0">
              {/* Rutina por bloques */}
              <div className="flex-1 min-h-[260px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg">
                <RutinaPorBloques studentId={id} actualizar={recargarRutinas} />
              </div>

              {/* Rutina vigente por bloques */}
              <div className="flex-1 min-h-[260px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg">
                <RutinaVigentePorBloques
                  studentId={id}
                  actualizar={recargarRutinas}
                />
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-center text-white titulo text-4xl mt-10 mb-10">
          OBJETIVO
        </h2>
        <div className="px-4 md:px-46">
          <StudentMonthlyGoalDetail
            studentId={id}
            reloadTrigger={reloadGoals}
          />
        </div>
        <h2 className="text-center text-white titulo text-4xl mt-10 mb-10">
          ESTADÍSTICAS
        </h2>
        <EstadisticasRutinas studentId={id} />
      </div>

      {/* Modal condicional */}
      {/* <Modal
        isOpen={mostrarCrearRutina}
        title="Crear nueva rutina"
        onCancel={() => setMostrarCrearRutina(false)}
        colorIcon="green"
      >
        {modoFormulario === 'bloques' ? (
          <FormCrearRutinaPorBloques
            studentId={id}
            instructorId={userId}
            onClose={() => setMostrarCrearRutina(false)}
            onRutinaCreada={() => {
              setRecargarRutinas((prev) => !prev);
              setMostrarCrearRutina(false);
            }}
          />
        ) : (
          <FormCrearRutina
            studentId={id}
            instructorId={userId}
            onClose={() => setMostrarCrearRutina(false)}
            onRutinaCreada={() => {
              setRecargarRutinas((prev) => !prev);
              setMostrarCrearRutina(false);
            }}
          />
        )}
      </Modal> */}

      {mostrarCrearRutina && (
        <ModalCrearRutina
          studentId={id}
          userId={userId}
          onClose={() => setMostrarCrearRutina(false)}
          onRutinaCreada={() => {
            setRecargarRutinas((prev) => !prev);
            setMostrarCrearRutina(false);
          }}
        />
      )}
      {/* MODAL SIMPLE "VER RUTINA" */}
      {/* MODAL SIMPLE "VER RUTINA" */}
      {userLevel === 'alumno' && showRoutinePrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/90 via-zinc-950/95 to-emerald-900/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md rounded-3xl border border-emerald-500/50 bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 backdrop-blur-2xl shadow-[0_0_45px_rgba(16,185,129,0.6)] px-6 py-6 sm:px-8 sm:py-7 text-center"
          >
            {/* Halo */}
            <div className="pointer-events-none absolute -inset-px rounded-3xl border border-emerald-400/20 shadow-[0_0_70px_rgba(16,185,129,0.45)]" />

            {/* Etiqueta superior */}
            <div className="relative z-10 mb-3 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <FaDumbbell className="text-xs" />
                <span>Rutina recomendada</span>
              </span>
            </div>

            {/* Título */}
            <h3 className="relative z-10 text-xl sm:text-2xl font-semibold text-white mb-2">
              Hola, {alumno.nomyape} 😄
            </h3>

            {/* Hint horizontal */}
            <div className="relative z-10 mb-4 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 text-[11px] text-emerald-100">
                <FaMobileAlt className="text-sm rotate-90" />
                <span className="font-medium">
                  Para una mejor experiencia, girá el teléfono a modo
                  horizontal.
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xs">
                En horizontal vas a ver mejor los bloques, ejercicios y series
                de tu rutina.
              </p>
            </div>

            {/* Texto principal */}
            <p className="relative z-10 text-sm text-zinc-200 mb-5">
              Te recomendamos revisar la rutina vigente para asegurar un
              seguimiento correcto de tu entrenamiento de hoy.
            </p>

            {/* Botones */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition"
                onClick={() => {
                  setShowRoutinePrompt(false);
                  setShowRoutineViewer(true); // abrimos el viewer moderno
                }}
              >
                Ver rutina ahora
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-900 hover:border-emerald-400/60 transition"
                onClick={() => setShowRoutinePrompt(false)}
              >
                La veré después
              </button>
            </div>

            {/* Footer SoftFusion */}
            <div className="relative z-10 mt-6 pt-4 border-t border-emerald-500/15 text-[11px] text-zinc-400 flex flex-col items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-emerald-300/80 text-[10px]">
                Sistema desarrollado por SoftFusion
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://softfusion.com.ar/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 border border-zinc-700/70 hover:border-emerald-400/80 hover:bg-emerald-500/10 transition"
                  title="Sitio web SoftFusion"
                >
                  <FaGlobeAmericas className="text-sm text-emerald-300" />
                </a>
                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 border border-zinc-700/70 hover:border-emerald-400/80 hover:bg-emerald-500/10 transition"
                  title="Instagram SoftFusion"
                >
                  <FaInstagram className="text-sm text-emerald-300" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <RutinaHoyModal
        studentId={id}
        isOpen={userLevel === 'alumno' && showRoutineViewer}
        onClose={() => setShowRoutineViewer(false)}
      />
    </>
  );
}

export default PerfilAlumno;
