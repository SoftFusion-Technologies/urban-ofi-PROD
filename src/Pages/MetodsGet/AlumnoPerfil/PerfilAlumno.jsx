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
  FaChartLine
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
        {console.log(userLevel)}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start md:gap-6">
            {/* Perfil Alumno (card fija) */}
            <div className="w-full md:max-w-md mx-auto md:mx-0 bg-white shadow-xl rounded-xl p-8 mt-10">
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
                {/* <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
                  <label className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Modo de rutina:
                  </label>

                  <div className="flex w-full sm:w-auto flex-col sm:flex-row rounded-lg overflow-hidden border border-gray-300 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setModoFormulario('bloques')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        modoFormulario === 'bloques'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FaCubes className="text-base" />
                      Bloques
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoFormulario('musculo')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        modoFormulario === 'musculo'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FaDumbbell className="text-base" />
                      Músculo
                    </button>
                  </div>
                </div> */}

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
                      <span className="text-gray-500 font-semibold">DNI:</span>{' '}
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

            {/* Rutinas (ocupa el resto del espacio) */}
            <div className="flex-1 mt-10">
              {/* <ProtectedRoutine> */}
              {/* <ListaRutinas studentId={id} actualizar={recargarRutinas} /> */}
              {/* </ProtectedRoutine> */}
              <RutinaPorBloques
                studentId={id}
                actualizar={recargarRutinas}
              ></RutinaPorBloques>
            </div>
            {/* Rutinas con duracion (ocupa el resto del espacio) */}
            <div className="flex-1 mt-10">
              {/* <ProtectedRoutine> */}
              {/* <RutinasConDuracion studentId={id} /> */}
              <RutinaVigentePorBloques
                studentId={id}
                actualizar={recargarRutinas}
              />
              {/* </ProtectedRoutine> */}
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
    </>
  );
}

export default PerfilAlumno;
