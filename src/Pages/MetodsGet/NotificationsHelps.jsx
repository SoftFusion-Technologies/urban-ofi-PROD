import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationsHelps = ({ instructorId }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [atendiendoId, setAtendiendoId] = useState(null);
  const pollingRef = useRef(null);

  const URL = 'https://vps-5097245-x.dattaweb.com';

  useEffect(() => {
    if (!instructorId) return;

    fetchSolicitudes();

    // 🔁 (Opcional) Polling cada 30s
    pollingRef.current = setInterval(fetchSolicitudes, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${URL}/routine_requests`, {
        params: { instructor_id: instructorId, estado: 'pendiente' } // ✅ ya filtrado en backend
      });

      setSolicitudes(data || []);
      setModalOpen((data || []).length > 0);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtender = async (id) => {
    setAtendiendoId(id);

    // 🟢 Optimistic update
    const prev = solicitudes;
    const next = prev.filter((s) => s.id !== id);
    setSolicitudes(next);
    if (next.length === 0) setModalOpen(false);

    try {
      await axios.post(`${URL}/routine_requests/atender/${id}`, {
        instructor_id: instructorId
      });
      // (Opcional) Refrescar desde servidor para quedar 100% en sync
      // await fetchSolicitudes();
    } catch (error) {
      console.error('Error al atender solicitud:', error);

      // 🔁 revertir optimistic si falló
      setSolicitudes(prev);
      setModalOpen(prev.length > 0);

      const msg = error?.response?.data?.mensajeError;
      if (error?.response?.status === 403) {
        alert('No estás autorizado para atender esta solicitud.');
      } else if (error?.response?.status === 404) {
        alert('La solicitud ya no existe.');
      } else if (msg) {
        alert('Error: ' + msg);
      } else {
        alert('Error al atender la solicitud, intente nuevamente.');
      }
    } finally {
      setAtendiendoId(null);
    }
  };

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="titulo uppercase text-xl font-bold text-gray-800 mb-4 text-center">
              Solicitudes de Ayuda
            </h2>

            {loading ? (
              <p className="text-gray-500">Cargando...</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-3">
                  {solicitudes.map((solicitud, index) => {
                    const fecha = new Date(solicitud.created_at);
                    const dia = fecha.toLocaleDateString();
                    const hora = fecha.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <li
                        key={solicitud.id}
                        className="p-4 bg-gray-100 rounded-md shadow-sm text-gray-700 flex flex-col gap-2"
                      >
                        <div>
                          {index + 1} -{' '}
                          <span className="font-medium text-blue-600">
                            {solicitud.mensaje}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Fecha: {dia} - Hora: {hora}
                        </div>
                        <button
                          disabled={atendiendoId === solicitud.id}
                          onClick={() => handleAtender(solicitud.id)}
                          className={`mt-2 w-full py-2 rounded-md shadow-md text-white transition ${
                            atendiendoId === solicitud.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {atendiendoId === solicitud.id
                            ? 'Atendiendo...'
                            : 'Atender'}
                        </button>
                      </li>
                    );
                  })}

                  {solicitudes.length === 0 && (
                    <li className="text-center text-gray-500">
                      No hay solicitudes pendientes.
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={fetchSolicitudes}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-md shadow hover:bg-gray-300 transition"
              >
                Refrescar
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-md shadow-md hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsHelps;
