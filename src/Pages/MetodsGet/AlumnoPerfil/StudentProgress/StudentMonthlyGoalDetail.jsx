import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import RegistrarProgresoModal from './RegistrarProgresoModal';
import CardProgreso from './CardProgreso';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const StudentMonthlyGoalDetail = ({ studentId, reloadTrigger }) => {
  const [goal, setGoal] = useState(null);
  const [formData, setFormData] = useState({ ...goal });
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(true);

  const [mostrarModalProgreso, setMostrarModalProgreso] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);
  const [mostrarFormSemana, setMostrarFormSemana] = useState(null);

  useEffect(() => {
    setFormData(goal);
  }, [goal]);

  
  const fetchGoal = async () => {
    try {
      const fechaActual = new Date();
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();

      const queryString = new URLSearchParams({
        student_id: studentId,
        mes,
        anio
      }).toString();

      const res = await axios.get(
        `https://vps-5097245-x.dattaweb.com/student-monthly-goals?${queryString}`
      );

      // Si el endpoint devuelve un array (porque usas findAll), tomá el primer elemento o el que corresponda
      const objetivo =
        Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

      setGoal(objetivo);
    } catch (error) {
      console.error('Error al obtener el objetivo:', error);
      setGoal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [studentId, reloadTrigger]);

  if (loading)
    return <div className="text-center mt-10 text-gray-500">Cargando...</div>;

  if (!goal)
    return (
      <div className="text-center mt-10 text-blue-900">
        No cargo el objetivo aún.
      </div>
    );

  const estado = goal.estado || 'EN_PROGRESO'; // Mueve esta línea aquí, después de la validación

  // Calcular días desde la creación
  const createdAt = dayjs(goal.created_at);
  const hoy = dayjs();
  const diasDesdeCreacion = hoy.diff(createdAt, 'day');

  // Función para saber si ya existe un registro de progreso para una semana específica
  const progresoYaRegistrado = (semana) => {
    if (!goal.progressList || !Array.isArray(goal.progressList)) return false;

    // Siempre crear nuevas instancias para evitar mutación
    const inicioSemana = dayjs(goal.created_at).add((semana - 1) * 7, 'day');
    const finSemana = dayjs(goal.created_at).add(semana * 7, 'day');

    console.log(
      `Semana ${semana}: desde ${inicioSemana.format(
        'YYYY-MM-DD'
      )} hasta ${finSemana.format('YYYY-MM-DD')}`
    );

    return goal.progressList.some((p) => {
      const fechaProgreso = dayjs(p.fecha);
      const dentroRango = fechaProgreso.isBetween(
        inicioSemana,
        finSemana,
        null,
        '[]' // incluye límites
      );
      console.log(
        `  Fecha progreso: ${fechaProgreso.format(
          'YYYY-MM-DD'
        )} está dentro? ${dentroRango}`
      );
      return dentroRango;
    });
  };

  // Calcular semanas disponibles
  const semanasDisponibles = [];
  for (let i = 1; i <= 4; i++) {
    if (diasDesdeCreacion >= i * 7 && !progresoYaRegistrado(i)) {
      semanasDisponibles.push(i);
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    // Comparar si hubo cambios
    const noCambios = JSON.stringify(formData) === JSON.stringify(goal);

    if (noCambios) {
      // No hubo cambios, solo salir del modo edición
      setEditMode(false);
      setFormData(goal); // opcional, para resetear si acaso
      return;
    }

    try {
      const res = await axios.put(
        `https://vps-5097245-x.dattaweb.com/student-monthly-goals/${goal.id}`,
        formData
      );
      setEditMode(false);
      setGoal(res.data.updatedGoal);
      fetchGoal();
    } catch (err) {
      console.error('Error al actualizar objetivo', err);
    }
  };
  
  

  const campos = [
    { label: 'Mes', key: 'mes' },
    { label: 'Año', key: 'anio' },
    { label: 'Altura', key: 'altura_cm', unit: 'cm' },
    { label: 'Peso', key: 'peso_kg', unit: 'kg' },
    { label: 'Edad', key: 'edad', unit: 'años' },
    { label: 'Grasa Corporal', key: 'grasa_corporal', unit: '%' },
    { label: 'Cintura', key: 'cintura_cm', unit: 'cm' },
    { label: 'IMC', key: 'imc' }
  ];
  return (
    <>
      <div
        className="max-w-4xl mx-auto mt-6
      flex flex-col md:flex-row items-start gap-y-6 md:gap-x-10
      transition-transform duration-200 hover:scale-[1.02]"
      >
        {/* Objetivo mensual */}
        <div className="flex-1 bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-blue-700 tracking-wide">
              Objetivo:{' '}
              {!editMode ? (
                <span className="font-normal">{goal.objetivo}</span>
              ) : (
                <input
                  type="text"
                  name="objetivo"
                  value={formData.objetivo ?? ''}
                  onChange={handleChange}
                  className="border-b border-blue-600 focus:outline-none focus:border-blue-800 font-normal"
                  style={{ minWidth: '250px' }}
                />
              )}
            </h3>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                aria-label="Editar objetivo"
              >
                ✏️ Editar
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="text-green-600 text-sm font-medium hover:text-green-800 transition-colors"
                  aria-label="Guardar cambios"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(goal);
                  }}
                  className="text-red-500 text-sm font-medium hover:text-red-700 transition-colors"
                  aria-label="Cancelar edición"
                >
                  ✖️ Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Contenido campos */}
          {!editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700 text-sm md:text-base">
              {campos.map(({ label, key, unit }) => (
                <div
                  key={key}
                  className="flex justify-between items-center border-b border-gray-200 pb-1 last:border-b-0"
                >
                  <span className="font-semibold text-blue-600">{label}:</span>
                  <span className="ml-4 font-normal text-gray-900">{`${
                    goal[key] ?? '—'
                  } ${unit ?? ''}`}</span>
                </div>
              ))}

              <div className="col-span-1 md:col-span-2 flex justify-between items-center border-b border-gray-200 pb-1 last:border-b-0">
                <span className="font-semibold text-blue-600">
                  Control Antropométrico:
                </span>
                <span className="ml-4 font-normal text-gray-900">
                  {goal.control_antropometrico ?? '—'}
                </span>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-sm md:text-base"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {campos.map(({ label, key, unit }) => (
                  <motion.div
                    key={key}
                    variants={itemVariants}
                    className="flex flex-col mb-4"
                  >
                    <label
                      htmlFor={key}
                      className="font-semibold text-blue-600 mb-1"
                    >
                      {label}:
                    </label>
                    {key === 'anio' || key === 'mes' ? (
                      <span className="text-gray-900">{`${goal[key] ?? '—'} ${
                        unit ?? ''
                      }`}</span>
                    ) : (
                      <input
                        id={key}
                        type="text"
                        name={key}
                        value={formData[key] ?? ''}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      />
                    )}
                  </motion.div>
                ))}

                <motion.div
                  className="col-span-1 md:col-span-2 flex justify-between items-center"
                  variants={itemVariants}
                >
                  <label
                    htmlFor="control_antropometrico"
                    className="font-semibold text-blue-600 "
                  >
                    Control Antropométrico:
                  </label>
                  <input
                    id="control_antropometrico"
                    type="text"
                    name="control_antropometrico"
                    value={formData.control_antropometrico ?? ''}
                    onChange={handleChange}
                    className="ml-4 border border-gray-300 rounded px-3 py-1 w-full max-w-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Botones registrar progreso */}
          <div className="mt-8 space-y-3">
            {semanasDisponibles.length === 0 ? (
              <p className="text-gray-600 text-center italic">
                No hay semanas disponibles para registrar progreso.
              </p>
            ) : (
              semanasDisponibles.map((semana) => (
                <button
                  key={semana}
                  onClick={() => setMostrarFormSemana(semana)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Registrar progreso semana ${semana}`}
                >
                  Registrar progreso semana {semana}
                </button>
              ))
            )}
          </div>

          {/* Footer fechas */}
          <footer className="mt-6 text-xs text-gray-400 italic text-right select-none space-y-0.5">
            <time dateTime={goal.created_at}>
              Creado: {new Date(goal.created_at).toLocaleString()}
            </time>
            <br />
            <time dateTime={goal.updated_at}>
              Actualizado: {new Date(goal.updated_at).toLocaleString()}
            </time>
          </footer>
        </div>

        {/* CardProgreso a la derecha en desktop, debajo en móvil */}
        <div className="w-full md:w-96 flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <CardProgreso studentId={studentId} />
        </div>
      </div>

      {mostrarFormSemana && (
        <RegistrarProgresoModal
          semana={mostrarFormSemana}
          studentId={studentId}
          onClose={() => setMostrarFormSemana(null)}
        />
      )}
    </>
  );
};

export default StudentMonthlyGoalDetail;
