/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 26 / 05 / 2025
 * Versión: 2.0 (UI modernizada)
 *
 * Descripción:
 *  Este archivo (FormAlataAlumno.jsx) es el componente donde realizamos un formulario para
 *  la tabla students, este formulario aparece en la web del staff.
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import ParticlesBackground from '../ParticlesBackground';
import { useAuth } from '../../AuthContext';

const FormAlataAlumno = ({ isOpen, onClose, user, setSelectedUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');
  const [profesores, setProfesores] = useState([]);

  const { userLevel, userId } = useAuth();
  const formikRef = useRef(null);

  useEffect(() => {
    const obtenerProfesores = async () => {
      try {
        const res = await axios.get('https://vps-5097245-x.dattaweb.com/users');
        setProfesores(res.data || []);
      } catch (error) {
        console.log('Error al obtener usuarios:', error);
        setProfesores([]);
      }
    };

    obtenerProfesores();
  }, []);

  // Validación Yup
  const nuevoAlumnoSchema = Yup.object().shape({
    nomyape: Yup.string()
      .min(3, 'El nombre completo es muy corto')
      .max(100, 'El nombre completo es muy largo')
      .required('El nombre completo es obligatorio'),
    dni: Yup.string()
      .matches(/^\d+$/, 'Solo se permiten números')
      .min(7, 'El DNI es muy corto')
      .max(10, 'El DNI es muy largo')
      .required('El DNI es obligatorio'),
    user_id: Yup.number()
      .typeError('Debe seleccionar un profesor')
      .required('Debe asignar un profesor'),
    rutina_tipo: Yup.string()
      .oneOf(['personalizado', 'general'], 'Debe elegir una rutina')
      .required('El tipo de rutina es obligatorio'),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true)
  });

  const handleSubmitAlumno = async (valores) => {
    try {
      if (
        valores.nomyape === '' ||
        valores.telefono === '' ||
        valores.dni === '' ||
        !valores.user_id
      ) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      const url = user
        ? `https://vps-5097245-x.dattaweb.com/students/${user.id}`
        : 'https://vps-5097245-x.dattaweb.com/students/';
      const method = user ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method,
        body: JSON.stringify({ ...valores }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!respuesta.ok) {
        throw new Error(`Error en la solicitud ${method}: ${respuesta.status}`);
      }

      const data = await respuesta.json();

      setTextoModal(
        method === 'PUT'
          ? 'Alumno actualizado correctamente.'
          : 'Alumno creado correctamente.'
      );

      console.log('Registro insertado correctamente:', data);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);
      setErrorModal(true);
      setTimeout(() => setErrorModal(false), 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedUser(null);
    }
    onClose();
  };

  const tituloModal = user ? 'Editar alumno' : 'Nuevo alumno';
  const subtituloModal = user
    ? 'Actualizá la información del alumno.'
    : 'Cargá los datos del nuevo alumno.';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Fondo oscuro + partículas */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-slate-900/90 to-emerald-900/60" />
            <div className="absolute inset-0">
              <ParticlesBackground />
            </div>

            {/* Contenedor centrado */}
            <Formik
              innerRef={formikRef}
              initialValues={{
                nomyape: user ? user.nomyape : '',
                telefono: user ? user.telefono : '',
                dni: user ? user.dni : '',
                objetivo: user ? user.objetivo : '',
                user_id: user
                  ? user.user_id
                  : userLevel === 'instructor'
                  ? userId
                  : '',
                rutina_tipo: user ? user.rutina_tipo : 'personalizado',
                created_at: user ? user.created_at : new Date(),
                updated_at: user ? user.updated_at : new Date()
              }}
              enableReinitialize
              onSubmit={async (values, { resetForm }) => {
                await handleSubmitAlumno(values);
                resetForm();
              }}
              validationSchema={nuevoAlumnoSchema}
            >
              {({ errors, touched }) => (
                <motion.div
                  key="modal-alumno"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full max-w-lg md:max-w-2xl"
                >
                  {/* Card glass */}
                  <div className="relative rounded-3xl border border-emerald-500/60 bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 backdrop-blur-2xl shadow-[0_0_55px_rgba(16,185,129,0.55)] overflow-hidden">
                    {/* Halo */}
                    <div className="pointer-events-none absolute -inset-px rounded-3xl border border-emerald-400/25 shadow-[0_0_95px_rgba(16,185,129,0.5)]" />

                    {/* Header */}
                    <div className="relative z-10 px-5 sm:px-7 pt-4 pb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200 mb-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Gestión de alumnos</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-white">
                          {tituloModal}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                          {subtituloModal}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-emerald-400/80 transition"
                        aria-label="Cerrar"
                      >
                        ×
                      </button>
                    </div>

                    <Form className="relative z-10 px-5 sm:px-7 pb-5 pt-1 max-h-[80vh] overflow-y-auto custom-scroll">
                      {/* Grid inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-3">
                        {/* Nombre y Apellido */}
                        <div className="col-span-1 md:col-span-2">
                          <label
                            htmlFor="nomyape"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            Nombre y Apellido{' '}
                            <span className="text-emerald-400">*</span>
                          </label>
                          <Field
                            id="nomyape"
                            name="nomyape"
                            type="text"
                            placeholder="Ej: Luciano Díaz"
                            maxLength="70"
                            className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80 shadow-inner"
                          />
                          {errors.nomyape && touched.nomyape && (
                            <Alerta>{errors.nomyape}</Alerta>
                          )}
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label
                            htmlFor="telefono"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            Teléfono <span className="text-emerald-400">*</span>
                          </label>
                          <Field
                            id="telefono"
                            name="telefono"
                            type="text"
                            placeholder="Ej: 3815 000000"
                            maxLength="15"
                            className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                          />
                          {errors.telefono && touched.telefono && (
                            <Alerta>{errors.telefono}</Alerta>
                          )}
                        </div>

                        {/* DNI */}
                        <div>
                          <label
                            htmlFor="dni"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            DNI <span className="text-emerald-400">*</span>
                          </label>
                          <Field
                            id="dni"
                            name="dni"
                            type="text"
                            placeholder="Ej: 40123456"
                            maxLength="15"
                            className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                          />
                          {errors.dni && touched.dni && (
                            <Alerta>{errors.dni}</Alerta>
                          )}
                        </div>

                        {/* Tipo de Rutina */}
                        <div>
                          <label
                            htmlFor="rutina_tipo"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            Tipo de Rutina{' '}
                            <span className="text-emerald-400">*</span>
                          </label>
                          <Field
                            as="select"
                            id="rutina_tipo"
                            name="rutina_tipo"
                            className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                          >
                            <option value="personalizado">Personalizado</option>
                            <option value="general">General</option>
                          </Field>
                          {errors.rutina_tipo && touched.rutina_tipo && (
                            <Alerta>{errors.rutina_tipo}</Alerta>
                          )}
                        </div>

                        {/* Objetivo */}
                        <div className="md:col-span-2">
                          <label
                            htmlFor="objetivo"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            Objetivo
                          </label>
                          <Field
                            id="objetivo"
                            name="objetivo"
                            as="textarea"
                            rows={2}
                            placeholder="Ej: Bajar de peso, mejorar fuerza, preparación para competencia…"
                            maxLength="200"
                            className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80 resize-y"
                          />
                          {errors.objetivo && touched.objetivo && (
                            <Alerta>{errors.objetivo}</Alerta>
                          )}
                        </div>

                        {/* Selección Profesor */}
                        <div className="md:col-span-2">
                          <label
                            htmlFor="user_id"
                            className="block text-xs font-semibold text-zinc-300 mb-1"
                          >
                            Profesor asignado{' '}
                            <span className="text-emerald-400">*</span>
                          </label>

                          <div className="relative">
                            <Field
                              as="select"
                              id="user_id"
                              name="user_id"
                              className="block w-full px-3 py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80 appearance-none"
                            >
                              <option value="" disabled>
                                Seleccioná un profesor
                              </option>
                              {profesores.map((usuario) => (
                                <option key={usuario.id} value={usuario.id}>
                                  {usuario.name}
                                </option>
                              ))}
                            </Field>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              <svg
                                className="w-4 h-4 text-zinc-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M19 9l-7 7-7-7"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>

                          {errors.user_id && touched.user_id && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.user_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer: botones */}
                      <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="inline-flex items-center justify-center rounded-full border border-zinc-700/80 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-900 hover:border-zinc-500 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        >
                          {user ? 'Actualizar alumno' : 'Crear alumno'}
                        </button>
                      </div>

                      {/* Nota pequeña */}
                      <p className="mt-3 text-[10px] text-zinc-500">
                        Los campos marcados con{' '}
                        <span className="text-emerald-400">*</span> son
                        obligatorios.
                      </p>
                    </Form>
                  </div>
                </motion.div>
              )}
            </Formik>
          </div>
        )}
      </AnimatePresence>

      {/* Modales de feedback */}
      <ModalSuccess
        textoModal={textoModal}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </>
  );
};

export default FormAlataAlumno;
