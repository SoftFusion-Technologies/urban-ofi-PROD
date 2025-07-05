import React, { useState, useEffect } from 'react';

export default function ModalFeedback({
  isVisible,
  onClose,
  rutinaId,
  studentId
}) {
  const [gusto, setGusto] = useState(null);
  const [dificultad, setDificultad] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState(null);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);

      // Obtener nombre del alumno
      fetch(`https://vps-5097245-x.dattaweb.com/students/${studentId}`)
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo obtener el alumno');
          return res.json();
        })
        .then((data) => {
          setStudentName(data.nomyape || 'Estudiante');
        })
        .catch(() => {
          setStudentName('Estudiante');
        });
    } else {
      setTimeout(() => setShowModal(false), 300);
    }
  }, [isVisible, studentId]);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (gusto === null || dificultad === '') {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://vps-5097245-x.dattaweb.com/routine-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routine_id: rutinaId,
          student_id: studentId,
          gusto,
          dificultad,
          comentario: comentario.trim() || null
        })
      });

      if (!response.ok) {
        // Intentamos obtener el mensaje de error del backend
        const errorData = await response.json();
        // Si viene mensaje personalizado, úsalo, sino uno genérico
        throw new Error(errorData.mensajeError || 'Error al enviar feedback');
      }

      setSuccess('¡Gracias por tu feedback!');
      setGusto(null);
      setDificultad('');
      setComentario('');

      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gradient-to-r from-black/70 via-black/50 to-black/70 backdrop-blur-md z-50 transition-opacity duration-500 ${
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 mx-4 relative
      transform transition-transform duration-500
      ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-4xl font-thin transition-colors duration-300 focus:outline-none"
        >
          &times;
        </button>

        {/* Saludo personalizado */}
        <h2 className="text-xl uppercase titulo font-extrabold text-gray-900 mb-8 text-center tracking-wide select-none">
          {studentName
            ? `Hola ${studentName.split(' ')[0]}, ¿qué te pareció la rutina?`
            : 'Enviar Feedback'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="font-semibold text-gray-700 text-lg">
              ¿Te gustó la rutina? <span className="text-red-500">*</span>
            </legend>
            <div className="flex gap-10 justify-center mt-1">
              <label className="flex items-center gap-3 cursor-pointer text-green-600 font-semibold text-lg">
                <input
                  type="radio"
                  name="gusto"
                  value="true"
                  checked={gusto === true}
                  onChange={() => setGusto(true)}
                  required
                  className="accent-green-500 w-6 h-6"
                />
                Sí
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-red-600 font-semibold text-lg">
                <input
                  type="radio"
                  name="gusto"
                  value="false"
                  checked={gusto === false}
                  onChange={() => setGusto(false)}
                  required
                  className="accent-red-500 w-6 h-6"
                />
                No
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col">
            <label
              htmlFor="dificultad"
              className="font-semibold text-gray-700 text-lg mb-2"
            >
              Dificultad <span className="text-red-500">*</span>
            </label>
            <select
              id="dificultad"
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-transparent text-lg"
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              <option value="fácil">Fácil</option>
              <option value="normal">Normal</option>
              <option value="difícil">Difícil</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="comentario"
              className="font-semibold text-gray-700 text-lg mb-2"
            >
              Comentario (opcional)
            </label>
            <textarea
              id="comentario"
              rows={5}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe aquí tu comentario..."
              className="resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-transparent text-lg placeholder-gray-400"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-center text-red-600 font-semibold tracking-wide"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="alert"
              className="text-center text-green-600 font-semibold tracking-wide"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white text-xl font-bold transition ${
              loading
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
