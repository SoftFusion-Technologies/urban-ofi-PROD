/*
 * Programador: Equipo
 * Fecha Creación: 18 / 10 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Componente de login específico para profesores de Pilates. Basado en el diseño
 * del `LoginForm.jsx` pero apuntando al endpoint `/loginPilates` y usando
 * el contexto de autenticación del proyecto.
 */

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Alerta from "../Error";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../Styles/login.css";
import { useInstructorAuth } from "../../AuthContextInstructores";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

Modal.setAppElement("#root");

const LoginProfesorPilates = () => {
  useEffect(() => {
    localStorage.removeItem("userLevel");
  }, []);

  useEffect(() => {
    const element = document.getElementById("login");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { loginInstructor } = useInstructorAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validate = (vals) => {
    const errs = {};
    if (!vals.email) errs.email = "El correo es requerido";
    else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(vals.email))
      errs.email = "Correo inválido";
    if (!vals.password) errs.password = "La contraseña es requerida";
    else if (vals.password.length < 6) errs.password = "Mínimo 6 caracteres";
    return errs;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      axios
        .post("https://vps-5097245-x.dattaweb.com/login_profesores", values)
        .then((res) => {
          if (res.data.message === "Success") {
            loginInstructor(
              res.data.token,
              values.email,
              res.data.level,
              res.data.id,
            );
            navigate("/pilates/instructor");
          } else {
            setModalMessage("Usuario o Contraseña incorrectos");
            setIsModalOpen(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          setModalMessage("Error de conexión");
          setIsModalOpen(true);
        });
    }
  };

  return (
    <div
      id="login"
      className="h-screen w-full loginbg flex items-center justify-center bg-cover bg-center relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{
          scale: 1.01,
          boxShadow: "0 8px 30px rgba(59,130,246,0.3)",
        }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-[95%] max-w-md mx-auto"
      >
        <h1 className="text-3xl titulo uppercase font-bold text-center text-blue-600 mb-2">
          Bienvenido Profesor Pilates
        </h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-gray-500 mb-6"
        >
          Iniciá sesión con tu correo y contraseña
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              className="w-full mt-1 p-3 bg-blue-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              onChange={handleInput}
            />
            {errors.email && <Alerta>{errors.email}</Alerta>}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
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
            {errors.password && <Alerta>{errors.password}</Alerta>}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-blue-500 text-white w-full py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-600 transition-all"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </motion.button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400 italic">
          "El esfuerzo de hoy es el éxito de mañana"
        </p>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Error Modal"
        className="flex justify-center items-center h-screen"
        overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center"
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

export default LoginProfesorPilates;
