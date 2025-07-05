import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { GiWeightLiftingUp, GiStrong, GiMuscleUp } from 'react-icons/gi';
import { MdOutlineFitnessCenter } from 'react-icons/md';
import { FiTrendingUp } from 'react-icons/fi';
import HistorialRMModal from './HistorialRMModal';

const getIcon = (ejercicio) => {
  const e = ejercicio.toLowerCase();
  if (e.includes('press'))
    return <MdOutlineFitnessCenter className="text-3xl text-white" />;
  if (e.includes('sentadilla'))
    return <GiWeightLiftingUp className="text-3xl text-white" />;
  if (e.includes('dominadas'))
    return <GiMuscleUp className="text-3xl text-white" />;
  return <GiStrong className="text-3xl text-white" />;
};

const getColorClass = (ejercicio) => {
  const e = ejercicio.toLowerCase();
  if (e.includes('sentadilla')) return 'from-pink-600 to-red-600';
  if (e.includes('press')) return 'from-indigo-600 to-purple-600';
  if (e.includes('peso muerto')) return 'from-yellow-500 to-orange-500';
  return 'from-sky-600 to-teal-600';
};

const isPR = (rm) => rm.rm_estimada && rm.rm_estimada > 100;

const tablasFuerza = {
  sentadilla: { male: [60, 100, 130, 160], female: [40, 60, 80, 100] },
  'press banca': { male: [50, 80, 110, 140], female: [20, 40, 60, 80] },
  'peso muerto': { male: [70, 120, 160, 200], female: [50, 80, 100, 130] },
  'remo con barra': { male: [40, 70, 100, 130], female: [20, 40, 60, 80] },
  'press militar': { male: [30, 60, 80, 100], female: [15, 30, 50, 70] },
  'dominadas lastradas': { male: [5, 15, 25, 40], female: [0, 5, 15, 25] }
};

const calcularNivelFuerza = (ejercicio, rm, sexo) => {
  if (!sexo || !rm) return 'Desconocido';
  const key = ejercicio.toLowerCase();
  const t = tablasFuerza[key]?.[sexo];
  if (!t) return 'Sin referencia';

  if (rm < t[0]) return 'Novato';
  if (rm < t[1]) return 'Intermedio';
  if (rm < t[2]) return 'Avanzado';
  return 'Élite';
};

const getColorPorNivel = (nivel) => {
  switch (nivel) {
    case 'Novato':
      return 'bg-gray-200 text-gray-800';
    case 'Intermedio':
      return 'bg-blue-200 text-blue-800';
    case 'Avanzado':
      return 'bg-yellow-200 text-yellow-800';
    case 'Élite':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const RMCard = ({ ejercicio, registros, studentId }) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [historialActual, setHistorialActual] = useState([]);
  const [ejercicioActual, setEjercicioActual] = useState('');
  const [sexo, setSexo] = useState(null);

  useEffect(() => {
    async function fetchSexo() {
      const res1 = await fetch(`https://vps-5097245-x.dattaweb.com/students/${studentId}`);
      const student = await res1.json();
      const nombre = student.nomyape.split(' ')[0];
      const res2 = await fetch(
        `https://api.genderize.io?name=${encodeURIComponent(nombre)}`
      );
      const data = await res2.json();
      setSexo(data.gender);
    }
    fetchSexo();
  }, [studentId]);

  const visibles = mostrarTodos ? registros : registros.slice(0, 4);

  const handleVerHistorial = async (ejercicio) => {
    const res = await fetch(
      `https://vps-5097245-x.dattaweb.com/rm-historial?student_id=${studentId}&ejercicio=${encodeURIComponent(
        ejercicio
      )}`
    );
    const data = await res.json();
    setHistorialActual(data);
    setEjercicioActual(ejercicio);
    setModalOpen(true);
  };

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
        {getIcon(ejercicio)}
        {ejercicio}
        <span className="text-white/60 text-sm">({registros.length})</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {visibles.map((rm) => {
          const badge = isPR(rm) ? (
            <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 text-xs rounded-full shadow">
              🔥 Nuevo PR
            </span>
          ) : null;

          const nivel = calcularNivelFuerza(rm.ejercicio, rm.rm_estimada, sexo);

          return (
            <motion.div
              key={rm.id}
              className={`relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${getColorClass(
                rm.ejercicio
              )} text-white`}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {badge}
              <div className="backdrop-blur-sm bg-white/10 p-6 min-h-[300px] h-full flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <div>{getIcon(rm.ejercicio)}</div>
                  <span className="text-xs text-white/80">
                    {new Date(rm.fecha).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold capitalize">{rm.ejercicio}</h3>

                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Peso:</span>{' '}
                    {rm.peso_levantado} kg
                  </p>
                  <p>
                    <span className="font-semibold">Reps:</span>{' '}
                    {rm.repeticiones}
                  </p>
                  <p>
                    <span className="font-semibold">RM Estimado:</span>{' '}
                    {rm.rm_estimada ? `${rm.rm_estimada} kg` : '-'}
                  </p>
                </div>

                {rm.rm_estimada && (
                  <div className="mt-2">
                    <span className="text-sm font-semibold">Nivel:</span>{' '}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getColorPorNivel(
                        nivel
                      )}`}
                    >
                      {nivel}
                    </span>
                  </div>
                )}

                {rm.comentario && (
                  <p className="mt-3 italic text-white/80 border-t border-white/20 pt-2 text-xs">
                    “{rm.comentario}”
                  </p>
                )}

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handleVerHistorial(rm.ejercicio)}
                    className="text-xs bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
                  >
                    Ver Historial
                  </button>
                  <FiTrendingUp className="text-white/80" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {registros.length > 4 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-full shadow-md transition-all duration-300"
          >
            {mostrarTodos ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      )}

      <HistorialRMModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        historial={historialActual}
        ejercicio={ejercicioActual}
      />
    </div>
  );
};
