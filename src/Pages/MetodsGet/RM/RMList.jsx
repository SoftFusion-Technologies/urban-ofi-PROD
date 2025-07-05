import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import RMForm from './RegistroRM';
import NavbarStaff from '../../staff/NavbarStaff';
import ParticlesBackground from '../../../Components/ParticlesBackground';
import { RMCard } from './RMCard';
import ButtonBack from '../../../Components/ButtonBack';

export default function RMList({ studentId }) {
  const [rms, setRms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRMs = async () => {
    if (!studentId) {
      setError('No se recibió el ID del alumno');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(
        `https://vps-5097245-x.dattaweb.com/student-rm?student_id=${studentId}`
      );
      setRms(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los registros de RM');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRMs();
  }, [studentId]);

  const closeModal = (reload = false) => {
    setIsOpen(false);
    if (reload) fetchRMs();
  };

  // Agrupar y ordenar los RM por cantidad descendente
  const groupedRMs = Object.entries(
    rms.reduce((acc, rm) => {
      const key = rm.ejercicio;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rm);
      return acc;
    }, {})
  ).sort((a, b) => b[1].length - a[1].length); // Ordenar por cantidad de registros

  return (
    <>
      <NavbarStaff />

      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 min-h-screen pt-10 pb-10">
        <ParticlesBackground />
        <ButtonBack></ButtonBack>
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="titulo w-full text-center md:text-5xl text-3xl font-bold text-white uppercase tracking-tight">
              🏋️‍♂️ Registro de RM
            </h1>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition"
              >
                <FiPlus className="text-lg" />
                Nuevo RM
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-blue-600 text-lg">
              <FiLoader className="animate-spin mr-2 text-2xl" />
              Cargando registros...
            </div>
          ) : error ? (
            <div className="flex justify-center py-16 text-red-500 gap-2">
              <FiAlertCircle className="text-2xl" />
              {error}
            </div>
          ) : rms.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-lg">
              No hay registros de RM. ¡Agrega el primero!
            </div>
          ) : (
            <div className="space-y-16">
              {' '}
              {/* separa verticalmente cada bloque */}
              {groupedRMs.map(([ejercicio, registros]) => (
                <RMCard
                  key={ejercicio}
                  ejercicio={ejercicio}
                  registros={registros}
                  studentId={studentId}
                />
              ))}
            </div>
          )}

          {/* Modal con RMForm */}
          <AnimatePresence>
            {isOpen && (
              <Dialog
                open={isOpen}
                onClose={() => closeModal(false)}
                className="relative z-50"
              >
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  aria-hidden="true"
                />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Dialog.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="bg-white w-full max-w-xl rounded-xl shadow-xl p-6"
                  >
                    <Dialog.Title className="text-lg font-semibold mb-4">
                      Agregar nuevo RM
                    </Dialog.Title>
                    <RMForm studentId={studentId} onClose={closeModal} />
                  </Dialog.Panel>
                </div>
              </Dialog>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}
