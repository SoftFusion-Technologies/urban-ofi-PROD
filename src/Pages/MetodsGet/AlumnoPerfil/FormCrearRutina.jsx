import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Modal from '../../../Components/Modal'; // Asegúrate de importar tu Modal actualizado
import { useRef } from 'react';
import { useAuth } from '../../../AuthContext';

const FormCrearRutina = ({ onClose, onRutinaCreada }) => {
  const { id: studentId } = useParams();
  const { userId } = useAuth();

  const hoy = new Date();
  const fechaInput = hoy.toISOString().slice(0, 10);
  const fechaTexto = `${String(hoy.getDate()).padStart(2, '0')}/${String(
    hoy.getMonth() + 1
  ).padStart(2, '0')}/${hoy.getFullYear()}`;

  const [fecha, setFecha] = useState(fechaInput);

  const [ejercicios, setEjercicios] = useState([
    { musculo: '', descripcion: '', orden: 1 }
  ]);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [modalSuccess, setModalSuccess] = useState(false);

  const URL = 'https://vps-5097245-x.dattaweb.com/';

  const contenedorEjerciciosRef = useRef(null);

  const handleAgregarEjercicio = () => {
    if (ejercicios.length >= 10) return; // Límite de 10 ejercicios
    setEjercicios([
      ...ejercicios,
      { musculo: '', descripcion: '', orden: ejercicios.length + 1 }
    ]);
    // Pequeño timeout para que el DOM actualice antes de hacer scroll
    setTimeout(() => {
      if (contenedorEjerciciosRef.current) {
        contenedorEjerciciosRef.current.scrollTop =
          contenedorEjerciciosRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleEjercicioChange = (index, campo, valor) => {
    const nuevos = [...ejercicios];
    nuevos[index][campo] = valor;
    setEjercicios(nuevos);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar fecha
    if (!fecha) {
      alert('Por favor, ingresa la fecha de la rutina.');
      return;
    }

    // Validar que no haya ejercicios vacíos
    for (let i = 0; i < ejercicios.length; i++) {
      const ej = ejercicios[i];
      if (!ej.musculo.trim() || !ej.descripcion.trim()) {
        alert(`Por favor, completa todos los campos del ejercicio #${i + 1}.`);
        return;
      }
    }

    try {
      // Obtener mes y anio desde la fecha seleccionada
      const fechaObj = new Date(fecha);
      const mes = fechaObj.getMonth() + 1;
      const anio = fechaObj.getFullYear();

      // Obtener fecha actual en formato yyyy-mm-dd
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Si no se selecciona ninguna fecha, usar la actual
      const fechaDesde = desde || fechaHoy;
      const fechaHasta = hasta || fechaHoy;

      // 1. Crear rutina
      const rutinaResponse = await axios.post(`${URL}routines`, {
        student_id: parseInt(studentId),
        instructor_id: userId,
        mes,
        anio,
        fecha
      });

      const routine_id = rutinaResponse.data.id;

      if (!routine_id) {
        throw new Error('No se recibió el ID de la rutina creada');
      }

      // 2. Armar ejercicios para enviar
      const ejerciciosParaEnviar = ejercicios.map((ej) => ({
        routine_id,
        musculo: ej.musculo,
        descripcion: ej.descripcion,
        orden: ej.orden,
        desde: fechaDesde,
        hasta: fechaHasta
      }));

      // 3. Enviar ejercicios asociados
      await axios.post(`${URL}routine_exercises`, ejerciciosParaEnviar);
      // 4. Mostrar mensaje de éxito
      setModalSuccess(true);

      // Limpiar campos
      setFecha('');
      setEjercicios([{ musculo: '', descripcion: '', orden: 1 }]);
      // 5. Esperar unos segundos, luego limpiar y cerrar
      setTimeout(() => {
        setModalSuccess(false);

        // Callback para recargar rutinas
        if (onRutinaCreada) onRutinaCreada();

        // Cerrar modal
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert('Error al crear la rutina: ' + error.message);
    }
  };

  const eliminarEjercicio = (index) => {
    const nuevos = [...ejercicios];
    nuevos.splice(index, 1);
    setEjercicios(nuevos);
  };

  return (
    <div className="p-6 sm:p-8 bg-white shadow-md rounded-xl max-w-3xl mx-auto mt-10 w-full">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
        Crear Rutina
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="fecha"
            className="block mb-2 text-sm font-semibold text-gray-700"
          >
            Fecha de rutina
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div
          ref={contenedorEjerciciosRef}
          className="max-h-[400px] overflow-y-auto pr-2 space-y-6"
        >
          {ejercicios.map((ej, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <label
                htmlFor={`musculo-${index}`}
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Músculo
              </label>
              <input
                id={`musculo-${index}`}
                type="text"
                value={ej.musculo}
                onChange={(e) =>
                  handleEjercicioChange(index, 'musculo', e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition mb-4"
              />

              <label
                htmlFor={`descripcion-${index}`}
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Descripción del ejercicio
              </label>
              <textarea
                id={`descripcion-${index}`}
                value={ej.descripcion}
                onChange={(e) =>
                  handleEjercicioChange(index, 'descripcion', e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="desde"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    Desde
                  </label>
                  <input
                    id="desde"
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="hasta"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    Hasta
                  </label>
                  <input
                    id="hasta"
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                onClick={() => eliminarEjercicio(index)}
                className="text-red-500 hover:text-red-700 text-sm mt-2"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={handleAgregarEjercicio}
            disabled={ejercicios.length >= 10}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg px-6 py-3 font-medium transition"
          >
            + Agregar ejercicio
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold transition"
          >
            Guardar rutina
          </button>
        </div>
      </form>

      {modalSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setModalSuccess(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-8 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            style={{ animationDuration: '300ms' }}
          >
            <svg
              className="mx-auto mb-4 h-14 w-14 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              ¡Rutina creada!
            </h3>
            <p className="mb-6 text-gray-600">
              La rutina fue guardada correctamente para el alumno seleccionado.
            </p>
            <button
              onClick={() => setModalSuccess(false)}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCrearRutina;
