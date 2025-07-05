/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 26 / 05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAlataAlumno.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from 'react'; // (NUEVO)

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import ParticlesBackground from '../ParticlesBackground';
import axios from 'axios';
// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormAlataAlumno = ({ isOpen, onClose, user, setSelectedUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  const [profesores, setProfesores] = useState([]);

  useEffect(() => {
    const obtenerProfesores = async () => {
      try {
        const res = await axios.get('https://vps-5097245-x.dattaweb.com/users');
        const instructores = res.data.filter(
          (user) => user.level === 'instructor'
        );
        setProfesores(instructores);
      } catch (error) {
        console.log('Error al obtener profesores:', error);
      }
    };

    obtenerProfesores();
  }, []);
  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
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

    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true)
  });

  const handleSubmitAlumno = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (
        valores.nomyape === '' ||
        valores.telefono === '' ||
        valores.dni === '' ||
        valores.objetivo === '' ||
        !valores.user_id
      ) {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        const url = user
          ? `https://vps-5097245-x.dattaweb.com/students/${user.id}`
          : 'https://vps-5097245-x.dattaweb.com/students/';
        const method = user ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!respuesta.ok) {
          throw new Error(
            `Error en la solicitud ${method}: ${respuesta.status}`
          );
        }

        const data = await respuesta.json();

        if (method === 'PUT') {
          setTextoModal('Alumno actualizado correctamente.');
        } else {
          setTextoModal('Alumno creado correctamente.');
        }

        console.log('Registro insertado correctamente:', data);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);
      setErrorModal(true);
      setTimeout(() => {
        setErrorModal(false);
      }, 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedUser(null);
    }
    onClose();
  };

  return (
    <div
      className={`h-screen w-screen mt-16 fixed inset-0 flex pt-10 justify-center ${
        isOpen ? 'block' : 'hidden'
      } bg-gray-800 bg-opacity-75 z-50`}
    >
      <div className={`container-inputs`}>
        {/*
                Formik es una biblioteca de formularios React de terceros.
                Proporciona programación y validación de formularios básicos.
                Se basa en componentes controlados
                y reduce en gran medida el tiempo de programación de formularios.
            */}
        <Formik
          // valores con los cuales el formulario inicia y este objeto tambien lo utilizo para cargar los datos en la API
          innerRef={formikRef}
          initialValues={{
            nomyape: user ? user.nomyape : '',
            telefono: user ? user.telefono : '',
            dni: user ? user.dni : '',
            objetivo: user ? user.objetivo : '',
            user_id: user ? user.user_id : '', // profesor asignado
            created_at: user ? user.created_at : new Date(),
            updated_at: user ? user.updated_at : new Date()
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitAlumno(values);

            resetForm();
          }}
          validationSchema={nuevoAlumnoSchema}
        >
          {({ errors, touched, setFieldValue }) => {
            return (
              <div className="py-0 max-h-[500px] max-w-[400px] w-[400px] overflow-y-auto bg-white rounded-xl">
                {/* Cuando se haga el modal, sacarle el padding o ponerle uno de un solo digito */}
                <div className="w-full max-w-md mx-auto px-4">
                  <Form className="bg-white rounded-xl shadow-md w-full">
                    <div className="flex justify-between items-center px-4 pt-4">
                      <div className="tools flex gap-2">
                        <div className="circle">
                          <span className="red toolsbox"></span>
                        </div>
                        <div className="circle">
                          <span className="yellow toolsbox"></span>
                        </div>
                        <div className="circle">
                          <span className="green toolsbox"></span>
                        </div>
                      </div>
                      <div
                        className="text-xl cursor-pointer"
                        onClick={handleClose}
                      >
                        ×
                      </div>
                    </div>

                    {/* Nombre y Apellido */}
                    <div className="mb-3 px-4">
                      <Field
                        id="nomyape"
                        name="nomyape"
                        type="text"
                        placeholder="Nombre y Apellido"
                        maxLength="70"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.nomyape && touched.nomyape && (
                        <Alerta>{errors.nomyape}</Alerta>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div className="mb-3 px-4">
                      <Field
                        id="telefono"
                        name="telefono"
                        type="text"
                        placeholder="Teléfono"
                        maxLength="15"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.telefono && touched.telefono && (
                        <Alerta>{errors.telefono}</Alerta>
                      )}
                    </div>

                    {/* DNI */}
                    <div className="mb-3 px-4">
                      <Field
                        id="dni"
                        name="dni"
                        type="text"
                        placeholder="DNI"
                        maxLength="15"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.dni && touched.dni && (
                        <Alerta>{errors.dni}</Alerta>
                      )}
                    </div>

                    {/* Objetivo */}
                    <div className="mb-3 px-4">
                      <Field
                        id="objetivo"
                        name="objetivo"
                        type="text"
                        placeholder="Objetivo"
                        maxLength="200"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.objetivo && touched.objetivo && (
                        <Alerta>{errors.objetivo}</Alerta>
                      )}
                    </div>

                    {/* Selección Profesor */}
                    <div className="mb-5 px-4">
                      <label
                        htmlFor="user_id"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Profesor asignado
                      </label>
                      <div className="relative">
                        <Field
                          as="select"
                          id="user_id"
                          name="user_id"
                          className="appearance-none w-full px-4 py-3 bg-white border border-gray-300 text-sm text-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="" disabled>
                            Selecciona un profesor
                          </option>
                          {profesores.map((profesor) => (
                            <option key={profesor.id} value={profesor.id}>
                              {profesor.name}
                            </option>
                          ))}
                        </Field>
                        {/* Flecha custom (puedes omitirla si no querés extra UI) */}
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.user_id}
                        </p>
                      )}
                    </div>

                    {/* Botón Submit */}
                    <div className="flex justify-center py-4">
                      <input
                        type="submit"
                        value={user ? 'Actualizar' : 'Crear Alumno'}
                        className="bg-blue-500 py-2 px-5 rounded-xl text-white font-bold hover:cursor-pointer hover:bg-[#1D4ED8] transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </Form>
                </div>
              </div>
            );
          }}
        </Formik>
      </div>
      <ModalSuccess
        textoModal={textoModal}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>
  );
};
//Se elimina los default prosp, quedo desactualizado
// FormAlataAlumno.defaultProps = {
//   users: {},
// };

export default FormAlataAlumno;
