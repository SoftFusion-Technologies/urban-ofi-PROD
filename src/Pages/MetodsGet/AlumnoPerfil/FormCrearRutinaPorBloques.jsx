// FormCrearRutinaPorBloques.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormCrearRutinaPorBloques = ({
  studentId,
  instructorId,
  onClose,
  onRutinaCreada
}) => {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [bloques, setBloques] = useState([
    { bloque: '', descripcion: '', color_id: null }
  ]);

  const [cargando, setCargando] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalColorIdx, setModalColorIdx] = useState(null);
  const [modalEjercicioIdx, setModalEjercicioIdx] = useState(null);
  const [modalBloquesEjercicio, setModalBloquesEjercicio] = useState(null);

  const [coloresDisponibles, setColoresDisponibles] = useState([]);
  const [ejerciciosProfesor, setEjerciciosProfesor] = useState([]);
  const [busquedaEjercicio, setBusquedaEjercicio] = useState('');

  const URL = 'https://vps-5097245-x.dattaweb.com/';

  useEffect(() => {
    axios
      .get(`${URL}rutina-colores`)
      .then((res) => setColoresDisponibles(res.data));
    axios
      .get(`${URL}ejercicios-profes`)
      .then((res) => setEjerciciosProfesor(res.data));
  }, []);

  const handleAgregarBloque = () => {
    setBloques((prev) => [
      ...prev,
      { bloque: '', descripcion: '', color_id: null }
    ]);
  };

  const handleEliminarBloque = (index) => {
    setBloques((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBloqueChange = (index, campo, valor) => {
    const actualizados = [...bloques];
    actualizados[index][campo] = valor;
    setBloques(actualizados);
  };

  const seleccionarEjercicioYDescripcion = async (index, ejercicio) => {
    try {
      const res = await axios.get(
        `${URL}ejercicios-profes/${ejercicio.id}/bloques`
      );
      const bloquesDB = res.data;
      handleBloqueChange(index, 'bloque', ejercicio.nombre);
      if (bloquesDB.length <= 1) {
        handleBloqueChange(index, 'descripcion', bloquesDB[0]?.contenido || '');
        setModalEjercicioIdx(null);
      } else {
        setModalEjercicioIdx(null);
        setModalBloquesEjercicio({
          index,
          nombre: ejercicio.nombre,
          bloques: bloquesDB
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) return alert('Ingresa fecha');

    for (let i = 0; i < bloques.length; i++) {
      const b = bloques[i];
      if (!b.bloque.trim() || !b.descripcion.trim())
        return alert(`Completa el bloque #${i + 1}`);
    }

    try {
      setCargando(true);
      const fechaObj = new Date(fecha);
      const mes = fechaObj.getMonth() + 1;
      const anio = fechaObj.getFullYear();
      const fechaHoy = new Date().toISOString().split('T')[0];
      const fechaDesde = desde || fechaHoy;
      const fechaHasta = hasta || fechaHoy;

      const resRutina = await axios.post(`${URL}routines`, {
        student_id: parseInt(studentId),
        instructor_id: instructorId,
        mes,
        anio,
        fecha
      });

      const routine_id = resRutina.data.id;

      const ejerciciosParaEnviar = bloques.map((b, i) => ({
        routine_id,
        musculo: b.bloque,
        descripcion: b.descripcion,
        orden: i + 1,
        desde: fechaDesde,
        hasta: fechaHasta,
        color_id: b.color_id || null
      }));

      await axios.post(`${URL}routine_exercises`, ejerciciosParaEnviar);

      setModalSuccess(true);
      setTimeout(() => {
        setModalSuccess(false);
        if (onRutinaCreada) onRutinaCreada();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Error al guardar rutina');
    } finally {
      setCargando(false);
    }
  };

  const handleEjercicioChange = (index, campo, valor) => {
    if (!bloques[index]) return; // previene errores de índice inválido
    const nuevos = [...bloques];
    nuevos[index][campo] = valor;
    setBloques(nuevos);
  };

  return (
    <div className="px-4 py-6 sm:p-8 bg-white shadow-md rounded-2xl max-w-4xl mx-auto w-full">
      <h2 className="uppercase titulo mb-6 text-3xl font-extrabold text-center text-gray-900">
        Crear Rutina por Bloques
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Fecha de rutina */}
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* BLOQUES */}
        <div className="space-y-6">
          {bloques.map((bloque, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                  Nombre del bloque
                  <span className="block text-xs text-gray-400 font-normal">
                    Ejemplo: “Entrada en calor”, “Bloque 1”, etc.
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md shadow transition"
                  onClick={() => setModalEjercicioIdx(i)}
                >
                  Seleccionar ejercicio
                </button>
              </div>

              <input
                type="text"
                value={bloque.bloque}
                onChange={(e) =>
                  handleBloqueChange(i, 'bloque', e.target.value)
                }
                placeholder="Nombre del bloque"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Descripción del bloque
                </label>
                <textarea
                  rows={4}
                  value={bloque.descripcion}
                  onChange={(e) =>
                    handleBloqueChange(i, 'descripcion', e.target.value)
                  }
                  placeholder="Ejercicios, tips, variantes, etc."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Vigencia desde
                  </label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full rounded-md border px-4 py-3 text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Vigencia hasta
                  </label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="w-full rounded-md border px-4 py-3 text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalColorIdx(i)}
                  className="text-sm text-blue-600 underline"
                >
                  🎨 Asignar color
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminarBloque(i)}
                  className="text-sm text-red-500 underline"
                >
                  Eliminar bloque
                </button>
              </div>

              {/* Visualización de color */}
              {bloque.color_id && (
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{
                      backgroundColor:
                        coloresDisponibles.find((c) => c.id === bloque.color_id)
                          ?.color_hex || '#fff'
                    }}
                  />
                  <span className="font-semibold">
                    {
                      coloresDisponibles.find((c) => c.id === bloque.color_id)
                        ?.nombre
                    }
                  </span>
                  <span className="text-gray-500 italic">
                    –
                    {
                      coloresDisponibles.find((c) => c.id === bloque.color_id)
                        ?.descripcion
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botones inferiores */}
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-3 sm:space-y-0 pt-6">
          <button
            type="button"
            onClick={handleAgregarBloque}
            className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 font-medium rounded-lg transition"
          >
            + Agregar bloque
          </button>

          <button
            type="submit"
            disabled={cargando}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold rounded-lg transition"
          >
            {cargando ? 'Guardando...' : 'Guardar rutina'}
          </button>
        </div>
      </form>

      {/* Modal de selección de color */}
      {modalColorIdx !== null && bloques[modalColorIdx] && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              onClick={() => setModalColorIdx(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-5 text-gray-800">
              Selecciona un color para el ejercicio
            </h3>
            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleEjercicioChange(modalColorIdx, 'color_id', null);
                  setModalColorIdx(null);
                }}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs"
              >
                Sin color
              </button>
            </div>
            {/* SCROLLABLE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-2">
              {coloresDisponibles.map((col) => {
                const seleccionado =
                  bloques[modalColorIdx]?.color_id === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      handleEjercicioChange(modalColorIdx, 'color_id', col.id);
                      setModalColorIdx(null);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-4 px-3 py-4 shadow-lg transition-all duration-150 cursor-pointer ${
                      seleccionado
                        ? 'border-blue-600 ring-2 ring-blue-400 scale-105'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{
                      background: col.color_hex,
                      color: '#fff',
                      minHeight: 90,
                      boxShadow: '0 2px 12px 0 #0001'
                    }}
                    title={col.nombre}
                  >
                    <span className="font-bold text-base">{col.nombre}</span>
                    <span className="block text-xs mb-1 text-white/90 text-center">
                      {col.descripcion}
                    </span>
                    {seleccionado && (
                      <span className="mt-2 inline-block w-5 h-5 rounded-full border-2 border-white bg-white/60 items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de bloques */}
      {modalEjercicioIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto p-6 relative animate-fade-in">
            <button
              onClick={() => setModalEjercicioIdx(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-blue-900">
              Seleccionar ejercicio rápido
            </h3>
            <input
              type="text"
              className="w-full mb-3 rounded-md border border-blue-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Buscar ejercicio…"
              value={busquedaEjercicio}
              onChange={(e) => setBusquedaEjercicio(e.target.value)}
              autoFocus
            />
            <div className="max-h-80 overflow-y-auto flex flex-col gap-1">
              {ejerciciosProfesor.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  Sin ejercicios…
                </div>
              ) : (
                ejerciciosProfesor.map((ej) => (
                  <button
                    key={ej.id}
                    type="button"
                    onClick={() =>
                      seleccionarEjercicioYDescripcion(modalEjercicioIdx, ej)
                    }
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-100/80 transition"
                  >
                    <span className="text-blue-900 font-semibold">
                      {ej.nombre}
                    </span>{' '}
                    <span className="text-gray-500">– {ej.profesor?.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de bloques del ejercicio seleccionado */}
      {modalBloquesEjercicio && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-bold mb-4">
              Bloques disponibles para {modalBloquesEjercicio.nombre}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {modalBloquesEjercicio.bloques.map((b, idx) => (
                <div
                  key={idx}
                  className="border p-3 rounded cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    handleBloqueChange(
                      modalBloquesEjercicio.index,
                      'descripcion',
                      b.contenido
                    );
                    setModalBloquesEjercicio(null);
                  }}
                >
                  <pre className="whitespace-pre-wrap text-sm">
                    {b.contenido}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h3 className="text-green-600 font-bold text-xl mb-2">
              ¡Rutina creada!
            </h3>
            <p className="text-gray-600">Se guardó correctamente.</p>
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg"
              onClick={() => setModalSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCrearRutinaPorBloques;
