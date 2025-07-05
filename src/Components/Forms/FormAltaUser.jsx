/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 26 / 05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaUser.jsx) es el componente donde realizamos un formulario para
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

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormAltaUser = ({ isOpen, onClose, user, setSelectedUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoUsersSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'El nombre es muy corto')
      .max(70, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    email: Yup.string()
      .email('Ingrese un correo electrónico válido')
      .max(255, 'El correo electrónico es demasiado largo')
      .required('El Correo Electrónico es Obligatorio'),
    level: Yup.string().required('El Nivel es Obligatorio'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La Contraseña es obligatoria'),
    state: Yup.boolean().required(),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true)
  });

  const handleSubmitUser = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (
        valores.name === '' ||
        valores.email === '' ||
        valores.password === ''
      ) {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        // (NUEVO)
        const url = user
          ? `https://vps-5097245-x.dattaweb.com/users/${user.id}`
          : 'https://vps-5097245-x.dattaweb.com/users/';
        const method = user ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (method === 'PUT') {
          // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal('Usuario actualizado correctamente.');
        } else {
          setTextoModal('Usuario creado correctamente.');
        }

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error(
            'Error en la solicitud ${method}: ' + respuesta.status
          );
        }
        const data = await respuesta.json();
        console.log('Registro insertado correctamente:', data);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

      // Mostrar la ventana modal de error
      setErrorModal(true);

      // Ocultar la ventana modal de éxito después de 3 segundos
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
            name: user ? user.name : '',
            email: user ? user.email : '',
            level: user ? user.level : '',
            // sede: user ? user.sede : '',
            sede: 'central',
            password: user ? user.password : '',
            state: user ? user.state : false,
            created_at: user ? user.created_at : null,
            updated_at: user ? user.updated_at : null
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitUser(values);

            resetForm();
          }}
          validationSchema={nuevoUsersSchema}
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

                    {/* Campo Usuario */}
                    <div className="mb-3 px-4">
                      <Field
                        id="name"
                        type="text"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Usuario"
                        name="name"
                        maxLength="70"
                      />
                      {errors.name && touched.name && (
                        <Alerta>{errors.name}</Alerta>
                      )}
                    </div>

                    {/* Campo Email */}
                    <div className="mb-3 px-4">
                      <Field
                        id="email"
                        type="text"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                        name="email"
                        maxLength="70"
                      />
                      {errors.email && touched.email && (
                        <Alerta>{errors.email}</Alerta>
                      )}
                    </div>

                    {/* Selector Rol */}
                    <div className="mb-4 px-4">
                      <Field
                        as="select"
                        id="level"
                        name="level"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>
                          Tipo de Usuario:
                        </option>
                        <option value="admin">Administrador</option>
                        <option value="instructor">Instructor</option>
                        <option value="alumno">Alumno</option>
                      </Field>
                      {errors.level && touched.level && (
                        <Alerta>{errors.level}</Alerta>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div className="mb-3 px-4">
                      <Field
                        id="password"
                        type="password"
                        className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contraseña"
                        name="password"
                        maxLength="16"
                      />
                      {errors.password && touched.password && (
                        <Alerta>{errors.password}</Alerta>
                      )}
                    </div>

                    {/* Botón */}
                    <div className="flex justify-center py-4">
                      <input
                        type="submit"
                        value={user ? 'Actualizar' : 'Crear Usuario'}
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
// FormAltaUser.defaultProps = {
//   users: {},
// };

export default FormAltaUser;
