import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function LogPesoModal({
  open,
  onClose,
  ejercicio, // { id?, nombre?, student_id ... }
  serie, // { id, numero_serie, ... }  <<--- NUEVO
  ultimoLog,
  onSave,
  logs = []
}) {
  const [peso, setPeso] = useState('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editLogId, setEditLogId] = useState(null);
  const inputRef = useRef(null);

  // Al abrir/cambiar modo edición → setear valores
  useEffect(() => {
    if (!open) return;
    if (editLogId) {
      const log = logs.find((l) => l.id === editLogId);
      setPeso(log ? String(log.peso ?? '') : '');
      setObs(log ? log.observaciones ?? '' : '');
    } else {
      setPeso('');
      setObs('');
    }
    setMensaje('');
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open, editLogId, logs]);

  // GUARDAR (nuevo o edición)
  const handleGuardar = async () => {
    if (loading) return;

    const n = Number(peso);
    if (!peso || isNaN(n) || n <= 0 || n > 999.99) {
      setMensaje('Ingresá un peso válido (0.01 a 999.99 kg)');
      return;
    }

    setLoading(true);
    setMensaje('');
    try {
      let res;
      if (editLogId) {
        // EDITAR EXISTENTE
        res = await fetch(
          `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/${editLogId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peso: parseFloat(peso),
              observaciones: obs
            })
          }
        );
      } else {
        // NUEVO LOG  (usa serie_id en lugar de routine_exercise_id)
        res = await fetch('https://vps-5097245-x.dattaweb.com/routine_exercise_logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serie_id: serie?.id, // 👈 obligatorio ahora
            student_id: ejercicio?.student_id, // alumno activo
            fecha: new Date().toISOString().slice(0, 10),
            peso: parseFloat(peso),
            observaciones: obs
          })
        });
      }

      if (res.ok) {
        setMensaje(
          editLogId ? 'Registro actualizado ✔' : 'Registro guardado ✔'
        );
        setTimeout(() => {
          onSave && onSave();
          if (editLogId) {
            setEditLogId(null); // seguir en el modal, pero salir de edición
          } else {
            onClose();
          }
        }, 900);
      } else {
        setMensaje('Hubo un error al guardar. Intenta de nuevo.');
      }
    } catch (err) {
      setMensaje('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR log
  const eliminarLog = async (logId) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    setLoading(true);
    setMensaje('');
    try {
      const res = await fetch(
        `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/${logId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setMensaje('Registro eliminado ✔');
        setTimeout(() => {
          onSave && onSave();
          setEditLogId(null);
          setMensaje('');
        }, 700);
      } else {
        setMensaje('No se pudo eliminar');
      }
    } catch (e) {
      setMensaje('Error al eliminar');
    }
    setLoading(false);
  };

  // EDITAR: carga log en el formulario
  const editarLog = (log) => setEditLogId(log.id);

  // CANCELAR EDICIÓN
  const cancelarEdicion = () => {
    setEditLogId(null);
    setPeso('');
    setObs('');
    setMensaje('');
  };

  const enEdicion = Boolean(editLogId);

  return (
    <Transition
      show={open}
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50"
        onClose={() => {
          if (!loading) {
            setEditLogId(null);
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl shadow-2xl p-6 relative"
        >
          {/* Cerrar */}
          <button
            onClick={() => {
              setEditLogId(null);
              onClose();
            }}
            className="absolute top-3 right-4 text-xl font-bold text-gray-400 hover:text-red-500 disabled:opacity-50"
            disabled={loading}
            aria-label="Cerrar"
          >
            &times;
          </button>

          {/* Título */}
          <h2 className="text-2xl font-bold mb-1 text-blue-700">
            {ejercicio?.nombre || 'Ejercicio'}
            {serie?.numero_serie ? ` — Serie ${serie.numero_serie}` : ''}
          </h2>

          {/* Último peso */}
          <div className="text-sm text-gray-500 mb-4">
            {ultimoLog ? (
              <>
                Último peso: <b>{ultimoLog.peso} kg</b> — {ultimoLog.fecha}
              </>
            ) : (
              <i>Sin registros previos</i>
            )}
          </div>

          {/* Historial (edición rápida) */}
          {logs?.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold text-blue-600 mb-1">
                Historial:
              </div>
              <div className="flex flex-wrap gap-2">
                {logs.slice(0, 3).map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 shadow-sm ${
                      editLogId === l.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex flex-col leading-4">
                      <span className="text-[12px] text-gray-700">
                        {l.fecha}
                      </span>
                      <span className="text-[15px] font-bold text-blue-800">
                        {l.peso} kg
                      </span>
                    </div>
                    <button
                      onClick={() => editarLog(l)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarLog(l.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="space-y-3">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={999.99}
              step={0.01}
              ref={inputRef}
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 bg-blue-50 text-lg"
              placeholder="Peso (kg)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuardar()}
            />
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-gray-50 text-base"
              placeholder="Observaciones (opcional)"
              rows={2}
              value={obs}
              disabled={loading}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-5">
            <button
              className={`flex-1 py-2 rounded-xl text-lg font-bold transition ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleGuardar}
              disabled={loading || !serie?.id || !ejercicio?.student_id}
              title={
                !serie?.id
                  ? 'Falta serie_id'
                  : !ejercicio?.student_id
                  ? 'Falta student_id'
                  : ''
              }
            >
              {enEdicion
                ? loading
                  ? 'Actualizando...'
                  : 'Actualizar'
                : loading
                ? 'Guardando...'
                : 'Guardar registro'}
            </button>

            {enEdicion && (
              <button
                className="flex-1 py-2 rounded-xl text-lg font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                onClick={cancelarEdicion}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Feedback */}
          {mensaje && (
            <div
              className={`mt-3 text-center text-sm ${
                mensaje.includes('✔') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {mensaje}
            </div>
          )}
        </motion.div>
      </Dialog>
    </Transition>
  );
}
