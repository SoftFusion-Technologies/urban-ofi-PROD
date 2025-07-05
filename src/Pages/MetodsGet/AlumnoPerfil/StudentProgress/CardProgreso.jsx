import React, { useState, useEffect } from 'react';
import axios from 'axios';
function ProgresoCard({ progreso }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    peso: progreso.peso,
    altura: progreso.altura,
    grasa: progreso.grasa_corporal,
    cintura: progreso.cintura,
    comentario: progreso.comentario || ''
  });
  const progresoId = progreso.id || null;
  if (!progresoId) {
    console.error('No se encontró ID para progreso:', progreso);
  }

  const fechaFormateada = new Date(progreso.fecha).toLocaleDateString(
    undefined,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );

  // Parseamos valores que vienen como strings numéricos
  const peso = parseFloat(progreso.peso);
  const altura = parseFloat(progreso.altura);
  const grasa = parseFloat(progreso.grasa);
  const cintura = parseFloat(progreso.cintura);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('ID para actualizar:', progresoId);
      await axios.put(`https://vps-5097245-x.dattaweb.com/student-progress/${progresoId}`, {
        peso: parseFloat(formData.peso),
        altura_cm: formData.altura
          ? parseFloat(formData.altura).toFixed(2)
          : null,
        grasa_corporal:
          formData.grasa !== '' ? parseFloat(formData.grasa) : null,
        cintura: parseFloat(formData.cintura),
        comentario: formData.comentario
      });
      
      setEditMode(false);
      // Ideal: refrescar datos padre o manejar el estado global
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      // Mostrar error al usuario si querés
    }
  };
  return (
    <div className="min-w-[200px] max-w-[250px] border border-blue-400 rounded-lg p-4 bg-blue-50 shadow-sm flex-shrink-0">
      <p className="font-semibold text-blue-700 mb-3">{fechaFormateada}</p>

      <p className="flex justify-between items-center gap-2">
        <span className="font-semibold">Peso:</span>{' '}
        {!editMode ? (
          `${Number(formData.peso).toFixed(1)} kg`
        ) : (
          <input
            type="number"
            name="peso"
            step="0.1"
            value={formData.peso}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        )}
      </p>

      <p className="flex justify-between items-center gap-2">
        <span className="font-semibold">Altura:</span>{' '}
        {!editMode ? (
          `${Number(formData.altura).toFixed(1)} cm`
        ) : (
          <input
            type="number"
            name="altura"
            step="0.1"
            value={formData.altura}
            onChange={handleChange}
            className="border rounded px-2 py-1 max-w-[100px]"
          />
        )}
      </p>

      <p className="flex justify-between items-center gap-2">
        <span className="font-semibold">Grasa corporal:</span>{' '}
        {!editMode ? (
          `${Number(formData.grasa).toFixed(2)} %`
        ) : (
          <input
            type="number"
            name="grasa"
            step="0.01"
            value={formData.grasa}
            onChange={handleChange}
            className="border rounded px-2 py-1 max-w-[100px]"
          />
        )}
      </p>

      <p className="flex justify-between items-center gap-2">
        <span className="font-semibold">Cintura:</span>{' '}
        {!editMode ? (
          `${Number(formData.cintura).toFixed(1)} cm`
        ) : (
          <input
            type="number"
            name="cintura"
            step="0.1"
            value={formData.cintura}
            onChange={handleChange}
            className="border rounded px-2 py-1 max-w-[100px]"
          />
        )}
      </p>
      <p className="flex justify-between items-center">
        <span className="font-semibold">Comentario:</span>{' '}
        {!editMode ? (
          <span className="italic text-gray-600">
            {formData.comentario || '—'}
          </span>
        ) : (
          <textarea
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            rows={3}
            className="border rounded px-2 py-1 max-w-[200px] resize-none"
          />
        )}
      </p>

      {/* ver de implementar a futuro */}
      {/* <div className="mt-3 flex gap-3 justify-end">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="text-blue-600 text-sm hover:underline"
          >
            Editar
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="text-green-600 text-sm hover:underline"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({
                  peso: progreso.peso,
                  altura: progreso.altura,
                  grasa: progreso.grasa_corporal,
                  cintura: progreso.cintura,
                  comentario: progreso.comentario || ''
                });
              }}
              className="text-red-500 text-sm hover:underline"
            >
              Cancelar
            </button>
          </>
        )}
      </div> */}
    </div>
  );
}

export default function CardProgreso({ studentId }) {
  const [progresoData, setProgresoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchProgreso = async () => {
      setLoading(true);
      setError(null);
      try {
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // enero = 1
        const anioActual = fechaActual.getFullYear();

        const res = await fetch(
          `https://vps-5097245-x.dattaweb.com/students/${studentId}/progress-comparison?mes=${mesActual}&anio=${anioActual}`
        );
        if (!res.ok) throw new Error('Error al cargar progreso');
        const data = await res.json();
        setProgresoData(data); // Ya te viene filtrado del backend
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgreso();
  }, [studentId]);

  if (loading) return <p>Cargando progreso...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (
    !progresoData ||
    !progresoData.comparison ||
    progresoData.comparison.length === 0
  ) {
    return <p>No hay progreso para mostrar.</p>;
  }

  // Usamos el primer elemento comparison (puede cambiarse si quieres mostrar otro)
  const {
    progresosDelMes = [],
    totalProgresosEnMes,
    diferenciaPeso,
    cumplioObjetivoPeso,
    pesoRestanteParaObjetivo,
    objetivo,
    estadoObjetivo,
    mes,
    anio
  } = progresoData.comparison[0];

  if (progresosDelMes.length === 0)
    return <p>No hay progresos para mostrar.</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-blue-700/30">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b border-blue-700/40 pb-2">
        Listado de Progreso
        {/* - Objetivo: {objetivo} */}
        {/* ({estadoObjetivo}) */}
      </h2>

      {/* Contenedor horizontal con scroll para los progresos */}
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-2">
        {progresosDelMes.map((prog) => (
          <ProgresoCard
            key={prog.id || prog.someOtherId || prog.fecha}
            progreso={prog}
          />
        ))}
      </div>

      <hr className="my-6 border-blue-700/30" />

      {/* Resumen mensual */}
      <div className="space-y-3 text-gray-800 text-sm">
        <p>
          <span className="font-semibold text-blue-700">
            Total progresos en el mes:
          </span>{' '}
          {totalProgresosEnMes}
        </p>
        <p>
          <span className="font-semibold text-blue-700">
            Diferencia de peso:
          </span>{' '}
          <span
            className={
              diferenciaPeso > 0
                ? 'text-red-600'
                : diferenciaPeso < 0
                ? 'text-green-600'
                : 'text-gray-700'
            }
          >
            {diferenciaPeso > 0 ? '+' : ''}
            {diferenciaPeso} kg
          </span>
        </p>
        <p>
          <span className="font-semibold text-blue-700">
            Cumplió objetivo peso:
          </span>{' '}
          {cumplioObjetivoPeso ? 'Sí' : 'No'}
        </p>
        <p>
          <span className="font-semibold text-blue-700">
            Peso restante para objetivo:
          </span>{' '}
          {pesoRestanteParaObjetivo} kg
        </p>
      </div>
      <div>
        {cumplioObjetivoPeso ? (
          <div className="mt-3 bg-green-100 border border-green-400 rounded p-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600"
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
            <span className="font-semibold text-green-700">
              ¡Felicidades! Objetivo cumplido.
            </span>
          </div>
        ) : (
          <p>
            <span className="font-semibold text-blue-700">
              Cumplió objetivo peso:
            </span>{' '}
            No
          </p>
        )}
      </div>
    </div>
  );
}
