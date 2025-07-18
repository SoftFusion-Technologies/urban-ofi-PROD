import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ParticlesBackground from '../../Components/ParticlesBackground';
import NavbarStaff from '../staff/NavbarStaff';
// Custom Modal
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] max-w-xs w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function EjerciciosProfesorCrud({ profesorId }) {
  const API_URL = 'https://vps-5097245-x.dattaweb.com/ejercicios-profes'; // Ajusta el endpoint
  const [ejercicios, setEjercicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [editModal, setEditModal] = useState(null); // { id, nombre }
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const porPagina = 10;
  const inputNuevoRef = useRef();

  // Animación feedback
  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => setFeedback(null), 1700);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  // Fetch
  useEffect(() => {
    cargarEjercicios();
    // eslint-disable-next-line
  }, [busqueda, pagina]);

  async function cargarEjercicios() {
    setLoading(true);
    try {
      // Filtra por nombre
      const res = await axios.get(API_URL, {
        params: { profesor_id: profesorId, filtro: busqueda }
      });
      setEjercicios(res.data);
      setPaginas(Math.max(1, Math.ceil(res.data.length / porPagina)));
    } catch {
      // setFeedback({ tipo: "error", msg: "Error al cargar ejercicios" });
    } finally {
      setLoading(false);
    }
  }

  // CRUD
  async function crearEjercicio(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setLoading(true);
    try {
      await axios.post(API_URL, {
        nombre: nuevoNombre,
        profesor_id: profesorId
      });
      setFeedback({ tipo: 'ok', msg: 'Ejercicio creado' });
      setNuevoNombre('');
      inputNuevoRef.current?.focus();
      cargarEjercicios();
    } catch {
      setFeedback({ tipo: 'error', msg: 'Error al crear' });
    } finally {
      setLoading(false);
    }
  }

  function abrirEditar(ej) {
    setEditModal({ ...ej });
  }
  async function guardarEditar(e) {
    e.preventDefault();
    if (!editModal.nombre.trim()) return;
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${editModal.id}`, {
        nombre: editModal.nombre
      });
      setFeedback({ tipo: 'ok', msg: 'Actualizado' });
      setEditModal(null);
      cargarEjercicios();
    } catch {
      setFeedback({ tipo: 'error', msg: 'Error al editar' });
    } finally {
      setLoading(false);
    }
  }
  async function eliminarEjercicio(id) {
    if (!window.confirm('¿Eliminar ejercicio?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setFeedback({ tipo: 'ok', msg: 'Eliminado' });
      cargarEjercicios();
    } catch {
      setFeedback({ tipo: 'error', msg: 'Error al eliminar' });
    } finally {
      setLoading(false);
    }
  }

  // Paginado
  const ejerciciosMostrar = ejercicios
    .filter(
      (ej) =>
        !busqueda || ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    .slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 py-0 px-0">
      <NavbarStaff />
      <ParticlesBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 pb-12">
        <h2 className="text-3xl font-extrabold text-white mb-5 text-center drop-shadow tracking-tight">
          🏋️ Ejercicios de Profesor
        </h2>
        {/* Buscador y crear */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center justify-between w-full">
          <input
            type="text"
            className="flex-1 rounded-xl border-0 px-4 py-3 placeholder-gray-300 bg-white/10 text-white focus:ring-2 focus:ring-blue-400 transition text-lg shadow"
            placeholder="Buscar ejercicio..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
          <form
            className="flex gap-2 w-full sm:w-auto"
            onSubmit={crearEjercicio}
          >
            <input
              ref={inputNuevoRef}
              type="text"
              className="rounded-xl border-0 px-4 py-3 text-gray-900 bg-white/80 placeholder-gray-400 focus:ring-2 focus:ring-green-400 transition w-full sm:w-auto shadow"
              placeholder="Nuevo ejercicio"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              maxLength={100}
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-5 py-3 transition shadow-lg"
              disabled={loading}
            >
              + Crear
            </button>
          </form>
        </div>
        {/* Feedback animado */}
        {feedback && (
          <div
            className={`mb-5 px-6 py-3 rounded-xl text-base font-semibold shadow-lg transition-all
              ${
                feedback.tipo === 'error'
                  ? 'bg-red-500/90 text-white animate-shake'
                  : 'bg-green-500/90 text-white animate-popIn'
              }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 w-full">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white/20 rounded-2xl animate-pulse"
              />
            ))
          ) : ejerciciosMostrar.length === 0 ? (
            <div className="col-span-2 text-center text-white/70 text-lg font-medium py-14">
              Sin ejercicios…
            </div>
          ) : (
            ejerciciosMostrar.map((ej) => (
              <div
                key={ej.id}
                className="rounded-2xl bg-gradient-to-br from-blue-200/70 via-white/90 to-blue-50/80 shadow-2xl px-6 py-5 flex flex-col gap-3 relative hover:scale-[1.02] transition cursor-pointer"
              >
                <span className="text-blue-900 font-bold text-lg">
                  {ej.nombre}
                </span>
                <div className="flex gap-2 absolute top-3 right-3">
                  <button
                    onClick={() => abrirEditar(ej)}
                    className="text-yellow-600 bg-yellow-50/60 hover:bg-yellow-100/90 rounded-full p-2 shadow transition"
                    title="Editar"
                  >
                    <span className="sr-only">Editar</span>✏️
                  </button>
                  <button
                    onClick={() => eliminarEjercicio(ej.id)}
                    className="text-red-600 bg-red-50/60 hover:bg-red-100/90 rounded-full p-2 shadow transition"
                    title="Eliminar"
                  >
                    <span className="sr-only">Eliminar</span>🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Paginación */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            className="px-3 py-1 rounded bg-white/10 text-white font-bold shadow hover:bg-white/20 transition disabled:opacity-50"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
          >
            ←
          </button>
          <span className="text-white/90 font-semibold text-lg">
            Página <b>{pagina}</b> / {paginas}
          </span>
          <button
            className="px-3 py-1 rounded bg-white/10 text-white font-bold shadow hover:bg-white/20 transition disabled:opacity-50"
            disabled={pagina === paginas || paginas === 0}
            onClick={() => setPagina((p) => p + 1)}
          >
            →
          </button>
        </div>
      </div>

      {/* Modal editar */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}>
        <form className="flex flex-col gap-6" onSubmit={guardarEditar}>
          <h3 className="text-2xl font-extrabold text-blue-800 mb-2">
            Editar ejercicio
          </h3>
          <input
            type="text"
            className="rounded-xl border border-blue-300 px-4 py-3 text-gray-900 text-lg"
            value={editModal?.nombre || ''}
            onChange={(e) =>
              setEditModal({ ...editModal, nombre: e.target.value })
            }
            maxLength={100}
            required
          />
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setEditModal(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded-lg font-bold"
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
