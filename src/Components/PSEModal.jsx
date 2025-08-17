import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTachometerAlt } from 'react-icons/fa';

const escalaRanges = {
  RPE_10: { min: 0, max: 10, label: '0–10' },
  CR10: { min: 0, max: 10, label: '0–10 (CR10)' },
  BORG_6_20: { min: 6, max: 20, label: '6–20 (Borg)' }
};

/**
 * props:
 * - open, onClose
 * - mode: 'serie' | 'sesion'
 * - context:
 *    si mode==='serie': { student_id, rutina_id, ejercicio_id, serie_id, ejNombre, serieNum }
 *    si mode==='sesion': { student_id, rutina_id, rutinaNombre }
 * - onSaved(pse) -> callback al guardar
 * - onSubmit(payload) -> función async que llama al endpoint correspondiente
 */
export default function PSEModal({
  open,
  onClose,
  mode,
  context,
  onSaved,
  onSubmit
}) {
  const [escala, setEscala] = useState('RPE_10');
  const [rpeReal, setRpeReal] = useState('');
  const [rir, setRir] = useState('');
  const [duracion, setDuracion] = useState(''); // solo sesión
  const [comentarios, setComentarios] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setEscala('RPE_10');
      setRpeReal('');
      setRir('');
      setDuracion('');
      setComentarios('');
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const rpeRange = escalaRanges[escala];
  const titulo = useMemo(() => {
    if (mode === 'serie')
      return `Registrar PSE / RIR - ${context?.ejNombre || ''} · Serie ${
        context?.serieNum || ''
      }`;
    return `Registrar sRPE (sesión) - ${context?.rutinaNombre || ''}`;
  }, [mode, context]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSaving(true);
  try {
    const payloadBase = {
      escala,
      rpe_real: rpeReal === '' ? null : Number(rpeReal),
      comentarios: comentarios?.trim() || null
    };

    let payload;

    if (mode === 'serie') {
      payload = {
        ...payloadBase,
        student_id: Number(context.student_id),
        rutina_id: context.rutina_id != null ? Number(context.rutina_id) : null,
        bloque_id: context.bloque_id != null ? Number(context.bloque_id) : null,
        ejercicio_id: Number(context.ejercicio_id),
        serie_id: Number(context.serie_id),
        rir: rir === '' ? null : Number(rir)
      };
    } else if (mode === 'bloque') {
      payload = {
        ...payloadBase,
        nivel: 'bloque',
        student_id: Number(context.student_id),
        rutina_id: Number(context.rutina_id),
        bloque_id: Number(context.bloque_id)
      };
    } else if (mode === 'ejercicio') {
      payload = {
        ...payloadBase,
        nivel: 'ejercicio',
        student_id: Number(context.student_id),
        rutina_id: Number(context.rutina_id),
        bloque_id: Number(context.bloque_id),
        ejercicio_id: Number(context.ejercicio_id)
      };
    } else {
      // 'sesion' / 'rutina'
      payload = {
        ...payloadBase,
        student_id: Number(context.student_id),
        rutina_id: Number(context.rutina_id),
        duracion_min: duracion === '' ? null : Number(duracion)
      };
    }

    // Debug opcional:
    // console.log('[PSE submit]', mode, payload);

    const res = await onSubmit(payload);
    onSaved?.(res?.pse);
    alert('✅ Registro guardado correctamente');
    onClose();
  } catch (err) {
    const msg =
      err?.response?.data?.mensajeError || '❌ No se pudo guardar el PSE';
    alert(msg);
    setError(msg);
  } finally {
    setSaving(false);
  }
};

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && onClose()}
          />
          <motion.div
            className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            <div
              className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaTachometerAlt className="text-blue-600" />
                  <h3 className="font-extrabold text-lg">{titulo}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  disabled={saving}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">
                      Escala
                    </label>
                    <select
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      value={escala}
                      onChange={(e) => setEscala(e.target.value)}
                    >
                      <option value="RPE_10">RPE 0–10</option>
                      <option value="CR10">CR10</option>
                      <option value="BORG_6_20">Borg 6–20</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">
                      RPE real{' '}
                      <span className="text-gray-400">({rpeRange.label})</span>
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      value={rpeReal}
                      onChange={(e) => setRpeReal(e.target.value)}
                      min={rpeRange.min}
                      max={rpeRange.max}
                      step="1"
                      required
                    />
                  </div>

                  {mode === 'serie' ? (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        RIR (0–10)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="mt-1 w-full border rounded-lg px-3 py-2"
                        value={rir}
                        onChange={(e) => setRir(e.target.value)}
                        min={0}
                        max={10}
                        step="1"
                        placeholder="Opcional"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Duración sesión (min)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="mt-1 w-full border rounded-lg px-3 py-2"
                        value={duracion}
                        onChange={(e) => setDuracion(e.target.value)}
                        min={0}
                        max={1440}
                        step="1"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    Comentarios
                  </label>
                  <textarea
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    rows={3}
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Notas rápidas (dolor, fatiga, técnica, etc.)"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 font-semibold">
                    {error}
                  </div>
                )}

                <div className="pt-1 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
