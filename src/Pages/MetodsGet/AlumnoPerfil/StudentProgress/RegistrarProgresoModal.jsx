// RegistrarProgresoModal.jsx
import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const RegistrarProgresoModal = ({ semana, studentId, onClose }) => {
  const [objetivoMensual, setObjetivoMensual] = useState(null);
  const [formData, setFormData] = React.useState({
    fecha: '',
    peso_kg: '',
    altura_cm: '',
    grasa_corporal: '',
    cintura_cm: '',
    comentario: ''
  });

  const URL = 'https://vps-5097245-x.dattaweb.com/';
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchObjetivo = async () => {
      try {
        const today = new Date();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        const { data } = await axios.get(`${URL}student-monthly-goals`, {
          params: { student_id: studentId, mes, anio }
        });

        if (data && data.length > 0) {
          setObjetivoMensual(data[0]); // asumimos que data es un array
        } else {
          setObjetivoMensual(null); // si no hay datos
        }
      } catch (error) {
        console.error('Error al obtener el objetivo mensual:', error);
      }
    };

    if (studentId) fetchObjetivo();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Definimos una lista de los campos numéricos que queremos validar
    const camposNumericos = [
      'grasa_corporal',
      'cintura_cm',
      'altura_cm',
      'peso_kg',
      'imc',
      'edad'
    ];

    // Construimos el objeto para enviar reemplazando '' por el valor en objetivoMensual o 0
    const dataToSend = {
      ...formData,
      student_id: studentId
    };

    camposNumericos.forEach((campo) => {
      if (
        formData[campo] === '' ||
        formData[campo] === null ||
        formData[campo] === undefined
      ) {
        // Si el campo está vacío, tomamos el valor de objetivoMensual o 0
        dataToSend[campo] = parseFloat(objetivoMensual?.[campo]) || 0;
      } else {
        // Si tiene valor, parseamos a float
        dataToSend[campo] = parseFloat(formData[campo]);
      }
    });

    try {
      await axios.post(`${URL}student-progress`, dataToSend);
      alert('Progreso registrado');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // bloquea scroll
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const modal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Semana {semana} - Registrar Progreso
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-4 bg-white rounded-lg shadow-md"
        >
          {objetivoMensual && (
            <div className="text-sm text-gray-600 mb-2">
              <p>
                Objetivo: <strong>{objetivoMensual.objetivo}</strong>
              </p>
              <p>
                IMC anterior: <strong>{objetivoMensual.imc}</strong>
              </p>
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del control
            </label>
            <input
              type="date"
              name="fecha"
              required
              value={formData.fecha}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            {objetivoMensual?.peso_kg && (
              <p className="text-xs text-blue-600 mb-1">
                Peso Registrado: <strong>{objetivoMensual.peso_kg} kg</strong>
              </p>
            )}
            <input
              type="number"
              name="peso_kg"
              step="0.01"
              required
              placeholder="Ej: 70.5"
              value={formData.peso_kg}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Altura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura (cm)
            </label>
            {objetivoMensual?.altura_cm && (
              <p className="text-xs text-blue-600 mb-1">
                Altura Registrado:{' '}
                <strong>{objetivoMensual.altura_cm} cm</strong>
              </p>
            )}
            <input
              type="number"
              name="altura_cm"
              step="0.01"
              placeholder="Ej: 175.0"
              value={formData.altura_cm}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Grasa Corporal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              % Grasa corporal
            </label>
            {objetivoMensual?.grasa_corporal && (
              <p className="text-xs text-blue-600 mb-1">
                Grasa Registrado:{' '}
                <strong>{objetivoMensual.grasa_corporal} %</strong>
              </p>
            )}
            <input
              type="number"
              name="grasa_corporal"
              step="0.01"
              placeholder="Ej: 22.5"
              value={formData.grasa_corporal}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Cintura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cintura (cm)
            </label>
            {objetivoMensual?.cintura_cm && (
              <p className="text-xs text-blue-600 mb-1">
                Cintura Registrado:{' '}
                <strong>{objetivoMensual.cintura_cm} cm</strong>
              </p>
            )}
            <input
              type="number"
              name="cintura_cm"
              step="0.01"
              placeholder="Ej: 85.0"
              value={formData.cintura_cm}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario (opcional)
            </label>
            <textarea
              name="comentario"
              rows="3"
              placeholder="Observaciones sobre el progreso del estudiante"
              value={formData.comentario}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById('modal-root'));
};

export default RegistrarProgresoModal;
