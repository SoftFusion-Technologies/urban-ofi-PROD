import React, { useEffect, useState } from 'react';
import ParticlesBackground from '../../Components/ParticlesBackground';

const MAX_COLORS = 8; // Máximo a mostrar antes del botón "Mostrar más"

export default function ColoresRutinaCrud() {
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    color_hex: '#ef4444',
    descripcion: ''
  });
  const [feedback, setFeedback] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const endpoint = 'https://vps-5097245-x.dattaweb.com/rutina-colores';

  const fetchColores = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setColores(data);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Error al cargar colores' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColores();
  }, []);

  const openModal = (color) => {
    setEditing(color || null);
    setForm(
      color
        ? {
            nombre: color.nombre,
            color_hex: color.color_hex,
            descripcion: color.descripcion || ''
          }
        : { nombre: '', color_hex: '#ef4444', descripcion: '' }
    );
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setFeedback({ type: 'error', msg: 'El nombre es obligatorio' });
      return;
    }
    try {
      setLoading(true);
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${endpoint}/${editing.id}` : endpoint;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      setModalOpen(false);
      setFeedback({
        type: 'success',
        msg: editing ? 'Color actualizado' : 'Color creado'
      });
      fetchColores();
    } catch {
      setFeedback({ type: 'error', msg: 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este color?')) return;
    setDeletingId(id);
    try {
      await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', msg: 'Color eliminado' });
      fetchColores();
    } catch {
      setFeedback({ type: 'error', msg: 'Error al eliminar' });
    } finally {
      setDeletingId(null);
    }
  };

  // Colores a mostrar según el límite
  const displayedColors = showAll ? colores : colores.slice(0, MAX_COLORS);

  return (
    <section className="relative w-full min-h-screen mx-auto bg-white">
      <ParticlesBackground />
      {/* Fondo gradiente y partículas */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 opacity-95" />
      </div>
      {/* Capa principal */}
      <div className="relative z-10 mx-auto max-w-3xl px-2 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
            🎨 Colores de Rutinas
          </h1>
          <button
            onClick={() => openModal(null)}
            className="bg-gradient-to-r from-blue-400 via-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2 rounded-2xl shadow-xl font-semibold tracking-wider transition duration-150 border-2 border-white/10"
          >
            + Nuevo color
          </button>
        </div>
        {feedback && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold ${
              feedback.type === 'error'
                ? 'bg-red-700 text-white shadow-xl'
                : 'bg-green-700 text-white shadow-xl'
            } animate-pulse`}
          >
            {feedback.msg}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="animate-spin w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full inline-block" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedColors.map((color, idx) => (
                <div
                  key={color.id}
                  className="relative transition-transform hover:-rotate-2 hover:scale-[1.03] active:scale-100"
                  style={{ perspective: 600 }}
                >
                  <div
                    className="rounded-xl shadow-2xl border-4 p-5 flex gap-5 items-center bg-gradient-to-br from-gray-900/60 via-blue-900/50 to-blue-800/70"
                    style={{
                      borderColor: color.color_hex,
                      boxShadow:
                        '8px 12px 32px 0 rgba(0,0,0,0.18), 0 0 0 6px rgba(255,255,255,0.03)',
                      transform: idx % 2 ? 'skewY(-4deg)' : 'skewY(4deg)'
                    }}
                  >
                    <div
                      className="rounded-xl w-20 h-20 border-4 border-white shadow-md"
                      style={{
                        background: color.color_hex,
                        boxShadow: '0 0 0 4px #fff, 0 6px 18px rgba(0,0,0,0.13)'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xl text-white drop-shadow">
                        {color.nombre}
                      </div>
                      <div className="text-xs text-gray-200 mb-1">
                        <span className="font-mono">{color.color_hex}</span>
                      </div>
                      <div className="text-white/90 text-xs">
                        {color.descripcion}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <button
                        className="text-cyan-300 hover:text-white transition text-lg"
                        title="Editar"
                        onClick={() => openModal(color)}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-pink-300 hover:text-white transition text-lg"
                        title="Eliminar"
                        onClick={() => handleDelete(color.id)}
                        disabled={deletingId === color.id}
                      >
                        {deletingId === color.id ? (
                          <span className="inline-block w-6 h-6 animate-spin border-2 border-pink-400 border-t-transparent rounded-full" />
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {colores.length > MAX_COLORS && (
              <div className="flex justify-center mt-10">
                <button
                  className="px-5 py-2 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 shadow-lg hover:scale-105 transition"
                  onClick={() => setShowAll((show) => !show)}
                >
                  {showAll
                    ? 'Mostrar menos'
                    : `Mostrar ${colores.length - MAX_COLORS} más`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal crear/editar */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-800/95 via-gray-900/95 to-blue-700/95 rounded-3xl shadow-2xl w-full max-w-md p-8 relative border-2 border-blue-600 animate-fade-in">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white text-2xl transition"
                title="Cerrar"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4 text-white tracking-wide">
                {editing ? 'Editar color' : 'Nuevo color'}
              </h2>
              <form className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Nombre del color <span className="text-pink-300">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    className="w-full rounded-lg border border-blue-300 bg-white/80 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-semibold shadow-sm"
                    maxLength={30}
                    required
                    placeholder="Ej: Rojo fuerte"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={form.color_hex}
                    onChange={(e) =>
                      setForm({ ...form, color_hex: e.target.value })
                    }
                    className="w-16 h-10 p-0 border-2 border-blue-300 bg-white/80 rounded-lg cursor-pointer shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    className="w-full rounded-lg border border-blue-300 bg-white/80 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-semibold shadow-sm"
                    maxLength={60}
                    placeholder="Breve descripción opcional"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-900 text-white px-4 py-2 rounded-lg font-semibold shadow"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg"
                  >
                    {editing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
