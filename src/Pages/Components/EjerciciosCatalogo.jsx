import React, { useEffect, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import EjercicioModal from './EjercicioModal';
import ButtonBack from '../../Components/ButtonBack';
import ParticlesBackground from '../../Components/ParticlesBackground';
import NavbarStaff from '../staff/NavbarStaff';
const API_URL = 'https://vps-5097245-x.dattaweb.com/catalogo-ejercicios';

export default function EjerciciosCatalogo() {
  const [ejercicios, setEjercicios] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const limit = 10;
  const maxBotones = 5; // máximo botones visibles

  // Debounce
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchEjercicios = async (page = 1, q = '') => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit,
        ...(q && { q })
      }).toString();

      const res = await fetch(`${API_URL}?${query}`);
      const data = await res.json();

      setEjercicios(data.rows || []);
      setTotalPaginas(Math.ceil((data.total || 0) / limit));
      setPaginaActual(page);
    } catch (error) {
      console.error('Error cargando ejercicios', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este ejercicio?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchEjercicios(paginaActual, search);
    } catch (error) {
      console.error('Error eliminando ejercicio', error);
    }
  };

  const handleSearch = (q) => {
    setSearch(q);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        fetchEjercicios(1, q);
      }, 400)
    );
  };

  useEffect(() => {
    fetchEjercicios();
  }, []);

  // Paginación dinámica
  const getPaginasVisibles = () => {
    let start = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let end = Math.min(totalPaginas, start + maxBotones - 1);

    if (end - start + 1 < maxBotones) {
      start = Math.max(1, end - maxBotones + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <NavbarStaff />
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 h-contain pt-10 pb-10">
        <ParticlesBackground></ParticlesBackground>
        <div className="p-4 max-w-7xl mx-auto">
          {/* Header */}
          <ButtonBack></ButtonBack>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl mt-2 font-extrabold bg-gradient-to-r text-blue-600 titulo uppercase bg-clip-text">
              Ejercicios predefinidos
            </h1>
            <div className="flex gap-2 w-full md:w-auto ">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border text-white rounded-lg pl-10 pr-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <FaSearch className="absolute left-3 top-3 text-white" />
              </div>
              <button
                onClick={() => {
                  setEditData(null);
                  setModalOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FaPlus /> Nuevo
              </button>
            </div>
          </div>

          {/* Lista de ejercicios */}
          {loading ? (
            <div className="p-6 text-center text-gray-500">Cargando...</div>
          ) : ejercicios.length > 0 ? (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {ejercicios.map((ej) => (
                <motion.div
                  key={ej.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                  whileHover={{ scale: 1.02 }}
                >
                  <h2 className="text-sm font-bold text-gray-800 uppercase">
                    {ej.nombre}
                  </h2>
                  <p className="text-sm text-gray-500">{ej.musculo || '-'}</p>
                  {ej.aliases && (
                    <p className="text-xs text-gray-400 italic">{ej.aliases}</p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setEditData(ej);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(ej.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No se encontraron ejercicios
            </div>
          )}

          {/* Paginación escalable */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              <button
                disabled={paginaActual === 1}
                onClick={() => fetchEjercicios(1, search)}
                className={`px-3 py-1 rounded-lg ${
                  paginaActual === 1
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FaAngleDoubleLeft />
              </button>

              <button
                disabled={paginaActual === 1}
                onClick={() => fetchEjercicios(paginaActual - 1, search)}
                className={`px-3 py-1 rounded-lg ${
                  paginaActual === 1
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FaChevronLeft />
              </button>

              {getPaginasVisibles().map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => fetchEjercicios(pagina, search)}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    pagina === paginaActual
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {pagina}
                </button>
              ))}

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => fetchEjercicios(paginaActual + 1, search)}
                className={`px-3 py-1 rounded-lg ${
                  paginaActual === totalPaginas
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FaChevronRight />
              </button>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => fetchEjercicios(totalPaginas, search)}
                className={`px-3 py-1 rounded-lg ${
                  paginaActual === totalPaginas
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {modalOpen && (
              <EjercicioModal
                onClose={() => setModalOpen(false)}
                onSave={() => fetchEjercicios(paginaActual, search)}
                editData={editData}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
