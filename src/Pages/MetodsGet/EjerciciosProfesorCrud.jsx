import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ParticlesBackground from '../../Components/ParticlesBackground';
import NavbarStaff from '../staff/NavbarStaff';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
  const navigate = useNavigate();

  const porPagina = 26;
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
      const params = {};

      // if (profesorId) {
      //   params.profesor_id = profesorId;
      // }

      if (busqueda && busqueda.trim()) {
        params.filtro = busqueda.trim();
      }

      const res = await axios.get(API_URL, { params });
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-8 pb-12">
        <h2 className="text-3xl titulo uppercase font-extrabold text-white mb-5 text-center drop-shadow tracking-tight">
          Ejercicios Definidos
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
            className={`mb-5 px-6 py-3 rounded-xl  text-sm md:text-base font-semibold shadow-lg transition-all
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
                onClick={() =>
                  navigate(`/dashboard/configurar-ejercicios/${ej.id}`)
                }
                className="relative group rounded-2xl bg-white/90 shadow-md hover:shadow-xl hover:scale-[1.015] transition-all px-6 py-5 flex flex-col gap-2 cursor-pointer"
              >
                <div className="text-blue-900 font-bold text-xl">
                  {ej.nombre}
                </div>

                {ej.profesor?.name && (
                  <div className="text-sm text-gray-600">
                    Creado por:{' '}
                    <span className="font-medium">{ej.profesor.name}</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEditar(ej);
                    }}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-2 rounded-full shadow transition"
                    title="Editar"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarEjercicio(ej.id);
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full shadow transition"
                    title="Eliminar"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Paginación */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-30 shadow"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span className="text-white text-lg font-medium">
            Página <strong>{pagina}</strong> de {paginas}
          </span>
          <button
            className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-30 shadow"
            disabled={pagina === paginas || paginas === 0}
            onClick={() => setPagina((p) => p + 1)}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Modal editar */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}>
        <form
          className="flex flex-col gap-5 p-6 bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto"
          onSubmit={guardarEditar}
        >
          <h3 className="text-2xl font-bold text-blue-800 text-center">
            Editar ejercicio
          </h3>
          <input
            type="text"
            className="rounded-xl border border-blue-300 px-4 py-3 text-gray-800 text-base w-full"
            value={editModal?.nombre || ''}
            onChange={(e) =>
              setEditModal({ ...editModal, nombre: e.target.value })
            }
            maxLength={100}
            required
          />
          <div className="flex justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={() => setEditModal(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition"
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
