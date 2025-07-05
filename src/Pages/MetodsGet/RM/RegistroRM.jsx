import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import ModalSuccess from '../../../Components/Forms/ModalSuccess';
import ModalError from '../../../Components/Forms/ModalError';

export default function RegistroRM({ studentId, onClose }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  useEffect(() => {
    const fetchEjercicios = async () => {
      try {
        const yaExisteParaHoy = rms.some(
          (r) =>
            r.ejercicio === form.ejercicio &&
            new Date(r.fecha).toDateString() === new Date().toDateString()
        );

        if (yaExisteParaHoy) {
          alert('Ya registraste este ejercicio hoy.');
          return;
        }
        
        const res = await axios.get('https://vps-5097245-x.dattaweb.com/api/ejercicios');
        setEjercicios(res.data); // Suponiendo que es un array de strings
      } catch (err) {
        console.warn(
          'No se pudo cargar la lista de ejercicios. Se usará una por defecto.'
        );
        setEjercicios([
          'Sentadilla',
          'Peso Muerto',
          'Press Banca',
          'Remo con Barra',
          'Press Militar',
          'Dominadas lastradas'
        ]);
      }
    };
    fetchEjercicios();
  }, []);

  const formik = useFormik({
    initialValues: {
      ejercicio: '',
      peso_levantado: '',
      repeticiones: '',
      comentario: ''
    },
    validationSchema: Yup.object({
      ejercicio: Yup.string().required('Seleccione un ejercicio.'),
      peso_levantado: Yup.number()
        .min(1, 'Debe ser mayor a 0')
        .required('Ingrese un peso.'),
      repeticiones: Yup.number()
        .integer('Debe ser un número entero.')
        .min(1, 'Debe ser mayor a 0')
        .required('Ingrese repeticiones.')
    }),
    onSubmit: async (values) => {
      setError(null);
      setSuccessMsg(null);
      setLoading(true);

      try {
        const res = await axios.post('https://vps-5097245-x.dattaweb.com/student-rm', {
          student_id: studentId,
          ...values,
          comentario: values.comentario.trim() || null
        });

        if (res.status !== 200) throw new Error('Error al registrar RM');
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 2000);
        formik.resetForm();

        setTimeout(() => {
          onClose(true);
        }, 1000);
      } catch (err) {
        setError(err.response?.data?.mensajeError || 'Error al guardar');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      {/* Ejercicio */}
      <div>
        <label
          htmlFor="ejercicio"
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Ejercicio
        </label>
        <select
          name="ejercicio"
          id="ejercicio"
          value={formik.values.ejercicio}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Seleccione un ejercicio</option>
          {ejercicios.map((e, i) => (
            <option key={i} value={e}>
              {e}
            </option>
          ))}
        </select>
        {formik.touched.ejercicio && formik.errors.ejercicio && (
          <p className="text-sm text-red-600 mt-1">{formik.errors.ejercicio}</p>
        )}
      </div>

      {/* Peso y Reps */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="peso_levantado"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Peso (kg)
          </label>
          <input
            type="number"
            name="peso_levantado"
            step="0.01"
            value={formik.values.peso_levantado}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {formik.touched.peso_levantado && formik.errors.peso_levantado && (
            <p className="text-sm text-red-600 mt-1">
              {formik.errors.peso_levantado}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="repeticiones"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Repeticiones
          </label>
          <input
            type="number"
            name="repeticiones"
            min="1"
            step="1"
            value={formik.values.repeticiones}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {formik.touched.repeticiones && formik.errors.repeticiones && (
            <p className="text-sm text-red-600 mt-1">
              {formik.errors.repeticiones}
            </p>
          )}
        </div>
      </div>

      {/* Comentario */}
      <div>
        <label
          htmlFor="comentario"
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Comentario (opcional)
        </label>
        <textarea
          name="comentario"
          rows={3}
          value={formik.values.comentario}
          onChange={formik.handleChange}
          className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Mensajes */}
      {error && (
        <div className="flex items-center text-red-600 gap-2 text-sm">
          <FiAlertCircle className="text-lg" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center text-green-600 gap-2 text-sm">
          <FiCheckCircle className="text-lg" />
          {successMsg}
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md text-white font-semibold ${
          loading
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } transition`}
      >
        {loading ? 'Registrando...' : 'Registrar RM'}
      </button>
      <ModalSuccess
        textoModal="RM Guardado con éxito"
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </form>
  );
}
