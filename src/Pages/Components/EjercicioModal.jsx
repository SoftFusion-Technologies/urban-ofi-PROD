import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const API_URL = 'https://vps-5097245-x.dattaweb.com/catalogo-ejercicios';

export default function EjercicioModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState({
    nombre: editData?.nombre || '',
    musculo: editData?.musculo || '',
    aliases: editData?.aliases || '',
    tags: editData?.tags || '',
    video_url: editData?.video_url || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editData ? 'PUT' : 'POST';
      const url = editData ? `${API_URL}/${editData.id}` : API_URL;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error guardando ejercicio', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {editData ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Músculo"
            value={form.musculo}
            onChange={(e) => setForm({ ...form, musculo: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Aliases"
            value={form.aliases}
            onChange={(e) => setForm({ ...form, aliases: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Tags"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="url"
            placeholder="Video URL"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaSave /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
