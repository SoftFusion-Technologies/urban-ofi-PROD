/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (LoginForm.jsx) es el componente el cual realiza el logeo de los usuarios mendiante una validacion de la base de datos y un token de sesion.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Alerta from '../Error';
import { useNavigate } from 'react-router-dom';
import Validation from './LoginValidation';
import axios from 'axios';
import '../../Styles/login.css';
import { useAuth } from '../../AuthContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
Modal.setAppElement('#root');

const LoginForm = () => {
  useEffect(() => {
    localStorage.removeItem('userLevel');
  }, []);
  useEffect(() => {
    const element = document.getElementById('login');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  const location = useLocation();
  const isAlumno = location.pathname === '/soyalumno';

  const [values, setValues] = useState({
    email: '',
    password: '',
    telefono: '',
    dni: ''
  });

  const navigate = useNavigate();
  const { login, loginAlumno } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = Validation(values, location.pathname);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      const endpoint = isAlumno
        ? 'https://vps-5097245-x.dattaweb.com/loginAlumno'
        : 'https://vps-5097245-x.dattaweb.com/login';

      const payload = isAlumno
        ? { telefono: values.telefono, dni: values.dni }
        : { email: values.email, password: values.password };

      axios
        .post(endpoint, payload)
        .then((res) => {
          setLoading(false);
          if (res.data.message === 'Success') {
            if (isAlumno) {
              loginAlumno(res.data.token, res.data.nomyape, res.data.id); // guardar el id
              localStorage.setItem('userLevel', 'alumno'); // <-- GUARDAR EL TIPO DE LOGIN
              navigate(`/miperfil/student/${res.data.id}`); // redirigir con id
            } else {
              login(res.data.token, values.email, res.data.level, res.data.id);
              localStorage.setItem('userLevel', res.data.level); // admin, instructor, etc.
              navigate('/dashboard');
            }
          } else {
            setModalMessage('Usuario o Contraseña incorrectos');
            setIsModalOpen(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  };
  return (
    <div className="h-screen w-full loginbg flex items-center justify-center bg-cover bg-center relative">
      {/* Tarjeta animada */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{
          scale: 1.01,
          boxShadow: '0 8px 30px rgba(59,130,246,0.3)'
        }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-[95%] max-w-md mx-auto"
      >
        <h1 className="text-3xl titulo uppercase font-bold text-center text-blue-600 mb-2">
          {isAlumno ? 'Bienvenido Alumno' : 'Bienvenido Profe'}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-gray-500 mb-6"
        >
          {isAlumno
            ? 'Ingresá tu teléfono y DNI para entrar a tu perfil de alumno'
            : 'Iniciá sesión para continuar'}
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email o Teléfono */}
          <div>
            <label
              htmlFor={isAlumno ? 'telefono' : 'email'}
              className="block text-sm font-medium text-gray-700"
            >
              {isAlumno ? 'Teléfono' : 'Correo Electrónico'}
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              id={isAlumno ? 'telefono' : 'email'}
              type={isAlumno ? 'text' : 'email'}
              name={isAlumno ? 'telefono' : 'email'}
              placeholder={isAlumno ? 'Ej: 3811234567' : 'ejemplo@correo.com'}
              className="w-full mt-1 p-3 bg-blue-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              onChange={handleInput}
            />
            {isAlumno
              ? errors.telefono && <Alerta>{errors.telefono}</Alerta>
              : errors.email && <Alerta>{errors.email}</Alerta>}
          </div>

          {/* Contraseña o DNI */}
          <div>
            <label
              htmlFor={isAlumno ? 'dni' : 'password'}
              className="block text-sm font-medium text-gray-700"
            >
              {isAlumno ? 'DNI' : 'Contraseña'}
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id={isAlumno ? 'dni' : 'password'}
                type={showPassword ? 'text' : 'password'}
                name={isAlumno ? 'dni' : 'password'}
                placeholder={isAlumno ? 'Documento de Identidad' : '••••••••'}
                className="w-full mt-1 p-3 bg-blue-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all pr-10"
                onChange={handleInput}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isAlumno
              ? errors.dni && <Alerta>{errors.dni}</Alerta>
              : errors.password && <Alerta>{errors.password}</Alerta>}
          </div>

          {/* Botón de envío */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-blue-500 text-white w-full py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-600 transition-all"
            >
              Iniciar Sesión
            </motion.button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400 italic">
          "El esfuerzo de hoy es el éxito de mañana"
        </p>
      </motion.div>

      {/* Modal de error */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Error Modal"
        className="flex justify-center items-center h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Error</h2>
          <p>{modalMessage}</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginForm;
