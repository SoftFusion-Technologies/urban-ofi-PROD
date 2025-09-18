import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import LogPesoModal from './StudentProgress/LogPesoModal';
import ModalFeedback from './Feedbacks/ModalFeedback';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaYoutube,
  FaTachometerAlt,
  FaChevronRight,
  FaEllipsisV
} from 'react-icons/fa';
import ModalSuccess from '../../../Components/Forms/ModalSuccess';
import ModalError from '../../../Components/Forms/ModalError';
import { formatDdMmYyyySmart } from '../../../utils/fechas';
import HeaderRutinas from '../../Components/HeaderRutinas';
// ─────────────────────────────────────────────────────────────
// COPIA del original, solo cambia el fetch y se agrega la UI de vigencia
// ─────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

import PSEModal from '../../../Components/PSEModal';
import {
  getUltimosPorSerie,
  createPSESerie,
  createPSESesion,
  createPSEGeneric
} from '../../../api/pseApi';
const diasSemana = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

function EditarEjercicioModal({ open, onClose, ejercicio, onSaved }) {
  const [form, setForm] = useState({
    nombre: ejercicio?.nombre || '',
    notas: ejercicio?.notas || '',
    orden: ejercicio?.orden ?? ''
  });

  useEffect(() => {
    setForm({
      nombre: ejercicio?.nombre || '',
      notas: ejercicio?.notas || '',
      orden: ejercicio?.orden ?? ''
    });
  }, [ejercicio]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://vps-5097245-x.dattaweb.com/ejercicios/${ejercicio.id}`, {
        nombre: form.nombre,
        notas: form.notas,
        orden: form.orden === '' ? null : Number(form.orden)
      });
      onClose();
      await onSaved?.();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el ejercicio.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <h3 className="text-lg font-bold mb-4">Editar ejercicio</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Notas"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
          />
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Orden"
            value={form.orden}
            onChange={(e) => setForm({ ...form, orden: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditarSerieModal({ open, onClose, serie, onSaved }) {
  const [form, setForm] = useState({
    numero_serie: serie?.numero_serie ?? '',
    repeticiones: serie?.repeticiones ?? '',
    kg: serie?.kg ?? '',
    tiempo: serie?.tiempo ?? '',
    descanso: serie?.descanso ?? ''
  });

  useEffect(() => {
    setForm({
      numero_serie: serie?.numero_serie ?? '',
      repeticiones: serie?.repeticiones ?? '',
      kg: serie?.kg ?? '',
      tiempo: serie?.tiempo ?? '',
      descanso: serie?.descanso ?? ''
    });
  }, [serie]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://vps-5097245-x.dattaweb.com/series/${serie.id}`, {
        numero_serie:
          form.numero_serie === '' ? null : Number(form.numero_serie),
        repeticiones:
          form.repeticiones === '' ? null : Number(form.repeticiones),
        kg: form.kg === '' ? null : Number(form.kg),
        tiempo: form.tiempo === '' ? null : form.tiempo,
        descanso: form.descanso === '' ? null : form.descanso
      });
      onClose();
      await onSaved?.();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la serie.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <h3 className="text-lg font-bold mb-4">Editar serie</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="N° Serie"
              value={form.numero_serie}
              onChange={(e) =>
                setForm({ ...form, numero_serie: e.target.value })
              }
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="Reps"
              value={form.repeticiones}
              onChange={(e) =>
                setForm({ ...form, repeticiones: e.target.value })
              }
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              step="0.01"
              placeholder="Kg"
              value={form.kg}
              onChange={(e) => setForm({ ...form, kg: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Tiempo"
              value={form.tiempo}
              onChange={(e) => setForm({ ...form, tiempo: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Descanso"
              value={form.descanso}
              onChange={(e) => setForm({ ...form, descanso: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgregarEjercicioModal({ open, onClose, bloque, onSaved }) {
  const [form, setForm] = useState({
    nombre: '',
    notas: '',
    orden: bloque?.ordenSugerido ?? 1
  });
  const [series, setSeries] = useState([
    { numero_serie: 1, repeticiones: '', kg: '', tiempo: '', descanso: '' },
    { numero_serie: 2, repeticiones: '', kg: '', tiempo: '', descanso: '' },
    { numero_serie: 3, repeticiones: '', kg: '', tiempo: '', descanso: '' }
  ]);

  useEffect(() => {
    setForm((f) => ({ ...f, orden: bloque?.ordenSugerido ?? 1 }));
  }, [bloque]);
  if (!open || !bloque) return null;

  const setSerie = (idx, k, v) =>
    setSeries((arr) => arr.map((s, i) => (i === idx ? { ...s, [k]: v } : s)));
  const addSerie = () =>
    setSeries((arr) => [
      ...arr,
      {
        numero_serie: (arr[arr.length - 1]?.numero_serie || arr.length) + 1,
        repeticiones: '',
        kg: '',
        tiempo: '',
        descanso: ''
      }
    ]);
  const removeSerie = (idx) =>
    setSeries((arr) => arr.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resEj = await axios.post('https://vps-5097245-x.dattaweb.com/ejercicios', {
        bloque_id: bloque.id,
        nombre: form.nombre.trim(),
        notas: form.notas || null,
        orden: Number(form.orden) || 1
      });
      const ejercicioId = resEj.data?.ejercicio?.id ?? resEj.data?.id;
      if (!ejercicioId) throw new Error('No se obtuvo id del ejercicio');

      const payloads = series.map((s) => ({
        ejercicio_id: ejercicioId,
        numero_serie: Number(s.numero_serie) || null,
        repeticiones: s.repeticiones !== '' ? Number(s.repeticiones) : null,
        kg: s.kg !== '' ? Number(s.kg) : null,
        tiempo: s.tiempo || null,
        descanso: s.descanso || null
      }));
      await Promise.all(
        payloads.map((p) => axios.post('https://vps-5097245-x.dattaweb.com/series', p))
      );

      onClose();
      await onSaved?.();
    } catch (err) {
      console.error(err);
      alert('No se pudo crear el ejercicio/series.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <h3 className="text-lg font-bold mb-4">
          Nuevo ejercicio en:{' '}
          <span className="text-emerald-700">{bloque?.nombre}</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2 md:col-span-2"
              placeholder="Nombre del ejercicio"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Orden"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: e.target.value })}
            />
          </div>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Notas"
            rows={2}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Series</h4>
            <button
              type="button"
              onClick={addSerie}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <FaPlus /> Agregar serie
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {series.map((s, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  placeholder="N°"
                  value={s.numero_serie}
                  onChange={(e) =>
                    setSerie(idx, 'numero_serie', e.target.value)
                  }
                />
                <input
                  type="number"
                  className="border rounded px-2 py-1"
                  placeholder="Reps"
                  value={s.repeticiones}
                  onChange={(e) =>
                    setSerie(idx, 'repeticiones', e.target.value)
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="border rounded px-2 py-1"
                  placeholder="Kg"
                  value={s.kg}
                  onChange={(e) => setSerie(idx, 'kg', e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Tiempo"
                  value={s.tiempo}
                  onChange={(e) => setSerie(idx, 'tiempo', e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Descanso"
                    value={s.descanso}
                    onChange={(e) => setSerie(idx, 'descanso', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSerie(idx)}
                    className="text-red-600 hover:text-red-800 px-2"
                    title="Quitar serie"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Normalizador y helpers de video (igual que original) ───────────────────
const norm = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const MUSCLE_SYNONYMS = [
  /* … mismos grupos del original … */
];
const containsAny = (text, keys) => {
  const t = norm(text);
  return keys.some((k) => t.includes(norm(k)));
};
function getMuscleFromEjercicio(ej = {}) {
  const prefer = norm(ej.musculo || '');
  if (prefer) return prefer;
  const text = [ej.nombre, ej.aliases, ej.tags].filter(Boolean).join(' ');
  const found = MUSCLE_SYNONYMS.find((m) => containsAny(text, m.keys));
  return found?.group || '';
}
function buildYouTubeUrl(ej = {}) {
  if (ej.video_url) return ej.video_url;
  const m = getMuscleFromEjercicio(ej);
  const tokens = [
    ej.nombre || '',
    m,
    'técnica',
    'ejecución',
    'gym',
    'español'
  ].filter(Boolean);
  const q = encodeURIComponent(tokens.join(' '));
  return `https://www.youtube.com/results?search_query=${q}`;
}

// ── Componente principal (vigencia) ────────────────────────────────────────
const RutinaVigentePorBloques = ({ studentId, actualizar }) => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalErrorTexto, setModalErrorTexto] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);

  const [colores, setColores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [ejercicioActivo, setEjercicioActivo] = useState(null);
  const [serieActiva, setSerieActiva] = useState(null);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRutinaId, setFeedbackRutinaId] = useState(null);

  const [ultimoLog, setUltimoLog] = useState(null);
  const [historialLogs, setHistorialLogs] = useState([]);

  const { nomyape, userLevel } = useAuth();
  const hasPerms = userLevel === 'admin' || userLevel === 'instructor';

  const [editEjModalOpen, setEditEjModalOpen] = useState(false);
  const [ejercicioEdit, setEjercicioEdit] = useState(null);

  const [editSerieModalOpen, setEditSerieModalOpen] = useState(false);
  const [serieEdit, setSerieEdit] = useState(null);

  const [addEjModalOpen, setAddEjModalOpen] = useState(false);
  const [bloqueDestino, setBloqueDestino] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTexto, setModalTexto] = useState('');

  const isAlumno =
    userLevel === '' || userLevel === 'alumno' || userLevel == null;

  const hoy = new Date();
  const nombreDiaHoy = diasSemana[hoy.getDay()];

  const [fuenteRutinas, setFuenteRutinas] = useState(null); // 'propias' | 'asignadas' | null
  const [pseModalOpen, setPseModalOpen] = useState(false);
  const [pseMode, setPseMode] = useState(null); // 'serie' | 'sesion'
  const [pseCtx, setPseCtx] = useState(null); // contexto para el modal
  const [ultPSEMap, setUltPSEMap] = useState({}); // { [serie_id]: { rpe_real, rir, fecha_registro } }

  // Obtiene todos los ids de serie de la rutina actual
  const allSerieIds = useMemo(() => {
    const ids = [];
    for (const b of rutinas?.bloques || []) {
      for (const ej of b?.ejercicios || []) {
        for (const s of ej?.series || []) {
          if (s?.id) ids.push(s.id);
        }
      }
    }
    return ids;
  }, [rutinas]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!allSerieIds.length) {
        setUltPSEMap({});
        return;
      }
      try {
        const res = await getUltimosPorSerie(allSerieIds); // { data: [...] }
        if (cancel) return;
        const map = {};
        for (const r of res?.data || []) {
          map[r.serie_id] = {
            rpe_real: r.rpe_real,
            rir: r.rir,
            fecha_registro: r.fecha_registro
          };
        }
        setUltPSEMap(map);
      } catch (e) {
        console.error('getUltimosPorSerie error', e);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [allSerieIds.join(',')]);
  const cargarRutinas = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Propias vigentes (tu endpoint actual)
      const resPropias = await axios.get(
        `https://vps-5097245-x.dattaweb.com/rutinas/alumno/${studentId}/vigentes`
      );
      const propias = Array.isArray(resPropias.data) ? resPropias.data : [];
      if (propias.length > 0) {
        setRutinas(propias);
        setFuenteRutinas('propias');
        return;
      }

      // 2) Si no hay propias, probar asignadas “por fecha” con HOY
      const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const resAsig = await axios.get(
        `https://vps-5097245-x.dattaweb.com/rutinas/asignadas/vigentes-por-fecha/${studentId}?fecha=${hoy}`
      );
      const asignadas = Array.isArray(resAsig.data) ? resAsig.data : [];

      setRutinas(asignadas);
      setFuenteRutinas(asignadas.length ? 'asignadas' : null);
    } catch (err) {
      console.error(err);
      setRutinas([]);
      setFuenteRutinas(null);
      setError('No se pudieron cargar las rutinas vigentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (cancel) return;
      await cargarRutinas();
    })();
    return () => {
      cancel = true;
    };
  }, [studentId, actualizar]);

  useEffect(() => {
    let cancel = false;
    axios
      .get('https://vps-5097245-x.dattaweb.com/rutina-colores')
      .then((res) => !cancel && setColores(res.data || []))
      .catch(() => !cancel && setColores([]));
    return () => {
      cancel = true;
    };
  }, []);

  const getColor = (color_id) =>
    colores.find((c) => c.id === color_id) || {
      color_hex: '#f8fafc',
      nombre: ''
    };

  const openLogModal = async (ej, serie) => {
    setEjercicioActivo({ ...ej, student_id: studentId });
    setSerieActiva(serie);
    setModalOpen(true);

    try {
      const last = await axios.get(
        `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/last`,
        {
          params: { student_id: studentId, serie_id: serie.id }
        }
      );
      setUltimoLog(last.data || null);
    } catch {
      setUltimoLog(null);
    }

    try {
      const hist = await axios.get(
        `https://vps-5097245-x.dattaweb.com/routine_exercise_logs/history`,
        {
          params: { student_id: studentId, serie_id: serie.id, limit: 3 }
        }
      );
      setHistorialLogs(hist.data || []);
    } catch {
      setHistorialLogs([]);
    }
  };

  function hexToRgb(hex = '#000000') {
    let h = hex?.replace('#', '') || '000000';
    if (h.length === 3)
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function yiqBrightness(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  function getContrastText(hexFondo) {
    const y = yiqBrightness(hexFondo);
    return y >= 170 ? '#0f172a' : '#ffffff';
  }

  const onEditarEjercicio = (ej) => {
    if (!hasPerms) return;
    setEjercicioEdit(ej);
    setEditEjModalOpen(true);
  };
  const onEliminarEjercicio = async (ej) => {
    if (!hasPerms) return;
    if (!window.confirm(`¿Eliminar el ejercicio "${ej.nombre}" y sus series?`))
      return;
    try {
      await axios.delete(`https://vps-5097245-x.dattaweb.com/ejercicios/${ej.id}`);
      await cargarRutinas();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar el ejercicio.');
    }
  };

  const onEditarSerie = (serie) => {
    if (!hasPerms) return;
    setSerieEdit(serie);
    setEditSerieModalOpen(true);
  };
  const onEliminarSerie = async (serie) => {
    if (!hasPerms) return;
    if (!window.confirm(`¿Eliminar Serie ${serie.numero_serie}?`)) return;
    try {
      await axios.delete(`https://vps-5097245-x.dattaweb.com/series/${serie.id}`);
      await cargarRutinas();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar la serie.');
    }
  };

  const onAgregarEjercicio = (bloque) => {
    if (!hasPerms) return;
    const ordenSugerido =
      (bloque.ejercicios || []).reduce((m, e) => Math.max(m, e.orden || 0), 0) +
      1;
    setBloqueDestino({ ...bloque, ordenSugerido });
    setAddEjModalOpen(true);
  };

  const API_BLOQUES = 'https://vps-5097245-x.dattaweb.com/bloques';
  const onEliminarBloque = async (bloque) => {
    if (!hasPerms) return;
    if (
      !window.confirm(
        `¿Eliminar el bloque "${bloque.nombre}"? Esto eliminará también sus ejercicios y series.`
      )
    )
      return;
    try {
      await axios.delete(`${API_BLOQUES}/${bloque.id}`);
      await cargarRutinas();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar el bloque.');
    }
  };

  const [enviandoAyudaId, setEnviandoAyudaId] = useState(null);
  const handleNecesitoAyuda = async (ej) => {
    if (!ej?.id) return;
    try {
      setEnviandoAyudaId(ej.id);
      const mensaje = `El alumno ${nomyape} necesita ayuda con "${ej.nombre}".`;
      await axios.post('https://vps-5097245-x.dattaweb.com/routine_requests', {
        student_id: studentId,
        ejercicio_id: ej.id,
        mensaje
      });
      setModalTexto('Solicitud registrada. Pronto un profesor te ayudará.');
      setModalVisible(true);
    } catch (error) {
      if (error.response?.data?.mensajeError) {
        const msg = error.response.data.mensajeError;
        if (msg.includes('solicitud pendiente')) {
          setModalErrorTexto(
            'Ya solicitaste ayuda para este ejercicio. Por favor, esperá al instructor.'
          );
        } else if (msg.includes('Faltan campos')) {
          setModalErrorTexto(
            'Por favor completá todos los campos antes de enviar.'
          );
        } else {
          setModalErrorTexto('Error: ' + msg);
        }
      } else {
        setModalErrorTexto('Error al enviar la solicitud. Intenta nuevamente.');
      }
      setModalErrorVisible(true);
    } finally {
      setEnviandoAyudaId(null);
    }
  };

  const openPSESerie = (ej, serie, bloque, idRutina) => {
    setPseMode('serie');
    setPseCtx({
      student_id: studentId,
      rutina_id: idRutina, // ✅
      bloque_id: bloque?.id, // ✅ MUY IMPORTANTE
      ejercicio_id: ej?.id,
      serie_id: serie?.id,
      ejNombre: ej?.nombre,
      serieNum: serie?.numero_serie
    });
    setPseModalOpen(true);
  };

  const openPSEBloque = (bloque, rutina) => {
    setPseMode('bloque');
    setPseCtx({
      student_id: rutina?.student_id ?? studentId,
      rutina_id: rutina?.id,
      bloque_id: bloque?.id
    });
    setPseModalOpen(true);
  };

  const openPSEEjercicio = (ej, bloque, rutina) => {
    setPseMode('ejercicio');
    setPseCtx({
      student_id: rutina?.student_id ?? studentId,
      rutina_id: rutina?.id,
      bloque_id: bloque?.id,
      ejercicio_id: ej?.id,
      ejNombre: ej?.nombre
    });
    setPseModalOpen(true);
  };

  const handlePSESubmit = async (payload) => {
    if (pseMode === 'serie') return await createPSESerie(payload);
    if (pseMode === 'sesion') return await createPSESesion(payload);
    // bloque / ejercicio usan el genérico
    return await createPSEGeneric(payload);
  };

  // cuando guarda, refrescamos el último RPE si es por serie
  const handlePSESaved = (pse) => {
    if (pseMode === 'serie' && pse?.serie_id) {
      setUltPSEMap((prev) => ({
        ...prev,
        [pse.serie_id]: {
          rpe_real: pse.rpe_real,
          rir: pse.rir,
          fecha_registro: pse.fecha_registro
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-3xl max-w-3xl mx-auto shadow-2xl">
        <h2 className="titulo uppercase text-4xl font-bold mb-6 text-center text-gray-800">
          {nombreDiaHoy.toUpperCase()}
        </h2>
        <p className="text-center text-gray-500">Cargando rutinas…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-gray-50 rounded-3xl max-w-3xl mx-auto shadow-2xl">
        <h2 className="titulo uppercase text-4xl font-bold mb-6 text-center text-gray-800">
          {nombreDiaHoy.toUpperCase()}
        </h2>
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

    // ========== Subcomponentes (definidos dentro para reutilizar helpers/handlers) ==========
  
    // Bottom Sheet con detalle de ejercicio
    const ExerciseDetailSheet = ({ open, onClose, ej }) => {
      // Opcional: bloquear el scroll del body mientras está abierto (mejora UX)
      useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = prev;
        };
      }, [open]);
  
      if (!open) return null;
  
      return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  
          {/* Panel: ahora en flex-col con altura máxima controlada */}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: 'min(85svh, 85vh)' }}
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          >
            {/* Header */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
              <div className="flex items-start gap-3">
                <h3 className="flex-1 titulo text-xl font-bold text-gray-900">
                  {ej?.nombre}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 rounded-full h-9 w-9 grid place-content-center hover:bg-gray-100 active:scale-[.98]"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
  
              {/* Atajos arriba (video / notas breves) */}
              <div className="mt-2 space-y-3">
                {isAlumno && (
                  <a
                    href={buildYouTubeUrl(ej)}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-sm font-semibold underline text-red-600"
                  >
                    Ver video
                  </a>
                )}
                {!!ej?.notas && (
                  <p className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    {ej.notas}
                  </p>
                )}
              </div>
            </div>
  
            {/* CONTENIDO SCROLLEABLE: flex-1 + min-h-0 + overflow-y-auto */}
            <div
              className="px-5 pb-6 pr-4 flex-1 min-h-0 overflow-y-auto overscroll-contain"
              style={{
                // dejar aire para la curvatura inferior y barras del SO
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)'
              }}
            >
              <h4 className="mt-2 mb-2 font-semibold text-gray-800">Series</h4>
  
              <motion.ul
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={listVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {(ej?.series || []).map((serie) => {
                  const ult = ultPSEMap?.[serie.id];
                  return (
                    <motion.li
                      key={serie.id}
                      className="rounded-xl border border-blue-300 bg-gray-50 p-3 shadow-sm"
                      variants={itemVariants}
                      layout
                    >
                      {/* …tu contenido de la serie tal cual… */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-800">
                          <strong>Serie {serie.numero_serie}</strong>
                        </p>
                        {ult ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            PSE {ult.rpe_real} (RIR {ult.rir})
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Sin registro
                          </span>
                        )}
                      </div>
  
                      <div className="mt-1 grid grid-cols-2 gap-2 text-[12px] text-gray-700">
                        <div>
                          Reps: <strong>{serie.repeticiones}</strong>
                        </div>
                        <div>
                          Peso: <strong>{serie.kg} kg</strong>
                        </div>
                        <div>
                          Tiempo: <strong>{serie.tiempo}</strong>
                        </div>
                        <div>
                          Descanso: <strong>{serie.descanso}</strong>
                        </div>
                      </div>
  
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold active:scale-[.98]"
                          onClick={() => openLogModal(ej, serie)}
                        >
                          Registrar PESO
                        </button>
                        {isAlumno && (
                          <button
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold active:scale-[.98]"
                            onClick={() =>
                              openPSESerie(
                                ej,
                                serie,
                                ej.__bloqueRef,
                                ej.__rutinaId
                              )
                            }
                          >
                            Registrar PSE/SER
                          </button>
                        )}
                      </div>
  
                      {hasPerms && (
                        <div className="mt-2 flex items-center gap-3 text-[13px]">
                          <button
                            onClick={() => onEditarSerie(serie)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminarSerie(serie)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </motion.ul>
  
              {/* Espaciador extra por seguridad (que el último item nunca quede tapado) */}
              <div
                style={{ height: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
              />
            </div>
  
            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 text-center text-xs text-gray-500">
              Desarrollado por{' '}
              <a
                href="https://softfusion.com.ar/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-pink-600 hover:underline"
              >
                SoftFusion
              </a>
            </div>
          </motion.div>
        </div>
      );
    };
  
    const ActionSheet = ({ open, onClose, title, actions = [] }) => {
      // lock scroll del fondo mientras está abierto
      useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = prev;
        };
      }, [open]);
  
      if (!open) return null;
      return (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          {/* sheet */}
          <div className="absolute inset-x-0 bottom-0 max-h-[60vh] rounded-t-3xl bg-white shadow-2xl">
            <div className="pt-2 pb-1 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-4">
              {title && (
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  {title}
                </h3>
              )}
              <div className="divide-y overflow-y-auto overscroll-contain max-h-[48vh]">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 py-3 ${
                      a.danger
                        ? 'text-red-600'
                        : a.primary
                        ? 'text-blue-700'
                        : 'text-gray-800'
                    } hover:bg-gray-50`}
                    onClick={() => {
                      a.onClick?.();
                      onClose();
                    }}
                  >
                    {a.icon && (
                      <span className="w-6 h-6 grid place-content-center">
                        {a.icon}
                      </span>
                    )}
                    <span className="text-[15px] font-medium">{a.label}</span>
                  </button>
                ))}
              </div>
              <button
                className="mt-3 w-full h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    };
  
    // Tarjeta compacta de ejercicio (con “Ver mejor”)
    // ======== Card de ejercicio responsive & pro ========
  
    // Lista: controla el "stagger" (cascada)
    const listVariants = {
      hidden: {},
      show: {
        transition: {
          delayChildren: 0.2,
          staggerChildren: 0.15, // 1→2→3→4
          staggerDirection: 1
        }
      },
      exit: {
        transition: {
          staggerChildren: 0.06,
          staggerDirection: -1 // 4→3→2→1
        }
      }
    };
  
    // Ítem: entrada y salida suaves
    const itemVariants = {
      hidden: { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 360, damping: 28 }
      },
      exit: { opacity: 0, y: 12, transition: { duration: 0.18 } }
    };
  
    const EjercicioCompacto = ({ ej }) => {
      const [openDetail, setOpenDetail] = useState(false);
      const [actionsOpen, setActionsOpen] = useState(false); // mobile: sheet de acciones
  
      const totalSeries = (ej.series || []).length;
      const first = (ej.series || [])[0];
      const ultPrimera = first ? ultPSEMap?.[first.id] : null;
  
      return (
        <>
          <li className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow active:scale-[.995]">
            <div className="flex items-start gap-3">
              {/* Monograma (usar sm, no xs) */}
              <div className="mt-0.5 hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-xs font-extrabold text-blue-700 uppercase">
                  {(ej.nombre || 'E')[0]}
                </span>
              </div>
  
              {/* Contenido */}
              <div className="min-w-0 flex-1">
                {/* Header: título + acciones (grid responsivo) */}
                <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                  {/* Título truncable */}
                  <h5 className="min-w-0 truncate text-[15px] font-bold text-gray-900 uppercase tracking-tight">
                    {ej.nombre}
                  </h5>
  
                  {/* Acciones admin */}
                  <div className="justify-self-end flex items-center gap-1">
                    {/* Desktop: icon buttons */}
                    {hasPerms && (
                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          onClick={() => onEditarEjercicio(ej)}
                          className="h-9 w-9 grid place-content-center rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                          title="Editar ejercicio"
                          aria-label="Editar ejercicio"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onEliminarEjercicio(ej)}
                          className="h-9 w-9 grid place-content-center rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
                          title="Eliminar ejercicio"
                          aria-label="Eliminar ejercicio"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
  
                    {/* Mobile: kebab abre ActionSheet fijo al viewport */}
                    {hasPerms && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionsOpen(true);
                        }}
                        className="sm:hidden h-9 w-9 grid place-content-center rounded-lg hover:bg-gray-100"
                        aria-label="Más acciones"
                      >
                        <FaEllipsisV />
                      </button>
                    )}
                  </div>
                </div>
  
                {/* Notas (compactas) */}
                {!!ej.notas && (
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {ej.notas}
                  </p>
                )}
  
                {/* Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {totalSeries} series
                  </span>
                  {first && (
                    <>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {first.repeticiones} reps (S1)
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {first.kg} kg (S1)
                      </span>
                    </>
                  )}
                  {ultPrimera && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      PSE {ultPrimera.rpe_real}
                    </span>
                  )}
                </div>
  
                {/* CTAs: full-width en mobile, inline en sm+ */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2">
                  <button
                    className="h-10 sm:h-auto sm:text-xs px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg bg-gray-900 text-white font-semibold active:scale-[.98]"
                    onClick={() => setOpenDetail(true)}
                  >
                    Ver mejor
                  </button>
  
                  {isAlumno && (
                    <a
                      href={buildYouTubeUrl(ej)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-10 sm:h-auto sm:text-xs px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg bg-red-600 text-white font-semibold active:scale-[.98]"
                    >
                      <FaYoutube className="text-white" />
                      Ver video
                    </a>
                  )}
                </div>
              </div>
            </div>
          </li>
  
          {/* ActionSheet (mobile) */}
          <ActionSheet
            open={actionsOpen}
            onClose={() => setActionsOpen(false)}
            title="Acciones del ejercicio"
            actions={[
              {
                label: 'Editar ejercicio',
                icon: <FaEdit />,
                primary: true,
                onClick: () => onEditarEjercicio(ej)
              },
              {
                label: 'Eliminar ejercicio',
                icon: <FaTrash />,
                danger: true,
                onClick: () => onEliminarEjercicio(ej)
              }
            ]}
          />
  
          {/* Sheet de detalle */}
          <AnimatePresence>
            {openDetail && (
              <ExerciseDetailSheet
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                ej={ej}
              />
            )}
          </AnimatePresence>
        </>
      );
    };
  

  // Acordeón de Bloque
  // ======== Acordeón de bloque con progreso ========

  // Panel del acordeón: altura auto con fade
  const accordionVariants = {
    collapsed: { height: 0, opacity: 0 },
    open: { height: 'auto', opacity: 1, transition: { duration: 0.22 } }
  };

  // Lista con cascada normal al entrar y reversa al salir
  const accordListVariants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15, // 1→2→3...
        staggerDirection: 1
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.06,
        staggerDirection: -1 // ...3→2→1
      }
    }
  };

  // Ítem (cada ejercicio)
  const accordItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 420, damping: 30 }
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.16 } }
  };

  const BloqueAccordion = ({ bloque, rutina }) => {
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // kebab mobile
    const color = getColor(bloque.color_id);
    const textColor = getContrastText(color.color_hex || '#ffffff');

    const ejerciciosWithRefs = (bloque.ejercicios || []).map((e) => ({
      ...e,
      __bloqueRef: bloque,
      __rutinaId: rutina.id
    }));

    useEffect(() => {
      if (!open) setMenuOpen(false);
    }, [open]);

    return (
      <li
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        style={{ backgroundColor: color.color_hex || '#fff' }}
      >
        {/* Header "falso botón" para evitar nested <button> */}
        <div
          role="button"
          tabIndex={0}
          className="w-full px-4 py-3 flex flex-wrap items-center gap-2 gap-y-2 cursor-pointer select-none hover:bg-black/5 active:scale-[.99] rounded-lg transition"
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
          aria-expanded={open}
        >
          {/* Chevron */}
          <span
            className={`h-5 w-5 grid place-content-center rounded-md transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
            style={{ color: textColor, backgroundColor: 'rgba(0,0,0,.08)' }}
            aria-hidden="true"
          >
            <FaChevronRight size={12} />
          </span>

          {/* Título */}
          <h4
            className="min-w-0 flex-1 font-extrabold text-base sm:text-lg tracking-tight truncate"
            style={{ color: textColor }}
          >
            {bloque.nombre || 'Bloque sin nombre'}
          </h4>

          {/* Badge */}
          <span
            className="text-[11px] px-2 py-0.5 rounded-full border"
            style={{
              color: textColor,
              borderColor: 'rgba(0,0,0,.15)',
              background: 'rgba(255,255,255,.35)'
            }}
          >
            {(bloque.ejercicios || []).length} ej.
          </span>

          {/* Acciones */}
          <div
            className="ml-auto relative flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {isAlumno && (
              <button
                onClick={() => openPSEBloque(bloque, rutina)}
                className="hidden sm:inline-flex h-8 px-3 rounded-lg bg-white/80 hover:bg-white text-[12px] font-semibold hover:shadow-sm transition-colors"
                style={{ color: textColor }}
                title="Registrar RPE del bloque"
              >
                RPE Bloque
              </button>
            )}

            {hasPerms && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onAgregarEjercicio(bloque)}
                  className="h-8 px-3 rounded-lg bg-white/80 hover:bg-white text-green-700 text-[12px] font-semibold hover:shadow-sm transition-colors"
                  title="Agregar ejercicio"
                >
                  Agregar
                </button>
                <button
                  onClick={() => onEliminarBloque(bloque)}
                  className="h-8 px-3 rounded-lg bg-white/80 hover:bg-white text-red-600 text-[12px] font-semibold hover:shadow-sm transition-colors"
                  title="Eliminar bloque"
                >
                  Eliminar
                </button>
              </div>
            )}

            <div className="flex sm:hidden items-center gap-1">
              {isAlumno && (
                <button
                  onClick={() => openPSEBloque(bloque, rutina)}
                  className="h-9 w-9 grid place-content-center rounded-lg bg-white/80 hover:bg-white hover:shadow-sm transition"
                  title="RPE Bloque"
                  aria-label="RPE Bloque"
                  style={{ color: textColor }}
                >
                  RPE
                </button>
              )}

              {hasPerms && (
                <>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-9 w-9 grid place-content-center rounded-lg bg-white/80 hover:bg-white hover:shadow-sm transition"
                    title="Más acciones"
                    aria-label="Más acciones"
                    aria-expanded={menuOpen}
                  >
                    <FaEllipsisV />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-gray-200 bg-white shadow-xl py-1"
                      role="menu"
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-green-700"
                        onClick={() => {
                          setMenuOpen(false);
                          onAgregarEjercicio(bloque);
                        }}
                        role="menuitem"
                      >
                        <FaPlus /> Agregar ejercicio
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                        onClick={() => {
                          setMenuOpen(false);
                          onEliminarBloque(bloque);
                        }}
                        role="menuitem"
                      >
                        <FaTrash /> Eliminar bloque
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenido animado del acordeón */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              className="bg-white/95 pt-1 px-0 flex flex-col min-h-0"
              style={{ maxHeight: 'min(65svh, 65vh)' }} // límite sano de alto
              variants={accordionVariants}
              initial="collapsed"
              animate="open"
              exit="collapsed"
            >
              {/* Scroller REAL va acá (no en el <ul>) */}
              <div
                className="px-3 flex-1 min-h-0 overflow-y-auto overscroll-contain [overscroll-behavior:contain] [scrollbar-gutter:stable]"
                // para iOS
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <motion.ul
                  className="space-y-3 pr-1 pb-6" // pb-6 = aire al final
                  variants={accordListVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {(ejerciciosWithRefs || []).map((ej) => (
                    <motion.li key={ej.id} variants={accordItemVariants} layout>
                      <EjercicioCompacto ej={ej} />
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };
  return (
    <div className="p-6 bg-gray-50 rounded-3xl max-w-3xl mx-auto shadow-2xl">
      <HeaderRutinas
        rutinas={rutinas}
        formatDdMmYyyySmart={formatDdMmYyyySmart}
        onUpdated={cargarRutinas} // para refrescar después de guardar
      />

      {rutinas.length === 0 ? (
        <p className="text-center text-gray-500 mt-7">
          No hay rutinas vigentes.
        </p>
      ) : (
        <div
          className="space-y-6 overflow-y-auto px-1 md:snap-y md:snap-mandatory"
          style={{ maxHeight: 520 }}
        >
          {rutinas.map((rutina) => {
            // === Chips de vigencia (asumiendo campos start_date y end_date en ISO) ===
            const start = rutina.start_date
              ? new Date(rutina.start_date)
              : null;
            const end = rutina.end_date ? new Date(rutina.end_date) : null;
            const hoy = new Date();
            let estado = 'Activa';
            if (end && end < hoy) estado = 'Vencida';
            else if (start && start > hoy) estado = 'Próxima';

            const fmt = (d) =>
              d
                ? d.toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short'
                  })
                : '—';

            return (
              <article
                key={rutina.id}
                className="snap-start bg-white/95 rounded-2xl shadow-xl border border-blue-100 p-4"
              >
                {/* Header compacto con vigencia */}
                <header className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 grid place-content-center">
                    <span className="text-sm font-bold text-blue-700">RX</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-extrabold text-lg text-gray-800 leading-tight">
                      {rutina.nombre || 'Rutina sin nombre'}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {/* Estado */}
                      <span
                        className={
                          'text-[11px] px-2 py-1 rounded-full border ' +
                          (estado === 'Activa'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : estado === 'Próxima'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200')
                        }
                      >
                        {estado}
                      </span>

                      {/* Rango */}
                      {/* <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        {fmt(start)} → {fmt(end)}
                      </span> */}

                      {!!rutina.descripcion && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {rutina.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acción sRPE (solo alumno) */}
                  {isAlumno && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold active:scale-[.98]"
                      onClick={() => {
                        setPseMode('sesion');
                        setPseCtx({
                          student_id: rutina?.student_id ?? studentId,
                          rutina_id: rutina?.id,
                          rutinaNombre: rutina?.nombre
                        });
                        setPseModalOpen(true);
                      }}
                    >
                      Cargar sRPE
                    </button>
                  )}
                </header>

                {/* Lista de bloques como acordeones (con el mismo componente pro) */}
                <ul className="mt-4 space-y-3">
                  {(rutina.bloques || []).length === 0 ? (
                    <li className="text-center text-gray-500 py-4">
                      Se eliminaron bloques en esta rutina
                    </li>
                  ) : (
                    (rutina.bloques || []).map((bloque) => (
                      <BloqueAccordion
                        key={bloque.id}
                        bloque={bloque}
                        rutina={rutina}
                        isAlumno={isAlumno}
                        hasPerms={hasPerms}
                        onAgregarEjercicio={onAgregarEjercicio}
                        onEliminarBloque={onEliminarBloque}
                        openPSEBloque={openPSEBloque}
                        onEditarEjercicio={onEditarEjercicio}
                        onEliminarEjercicio={onEliminarEjercicio}
                        onEditarSerie={onEditarSerie}
                        onEliminarSerie={onEliminarSerie}
                        openLogModal={openLogModal}
                        openPSESerie={openPSESerie}
                      />
                    ))
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      <ModalSuccess
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        textoModal={modalTexto}
      />
      <ModalError
        isVisible={modalErrorVisible}
        onClose={() => setModalErrorVisible(false)}
        textoModal={modalErrorTexto}
      />

      <ModalFeedback
        isVisible={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setFeedbackRutinaId(null);
        }}
        rutinaId={feedbackRutinaId}
        studentId={studentId}
      />

      <LogPesoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ejercicio={ejercicioActivo || {}}
        serie={serieActiva || {}}
        ultimoLog={ultimoLog}
        logs={historialLogs}
        onSave={cargarRutinas}
      />

      {hasPerms && (
        <EditarEjercicioModal
          open={editEjModalOpen}
          onClose={() => setEditEjModalOpen(false)}
          ejercicio={ejercicioEdit}
          onSaved={cargarRutinas}
        />
      )}

      {hasPerms && (
        <EditarSerieModal
          open={editSerieModalOpen}
          onClose={() => setEditSerieModalOpen(false)}
          serie={serieEdit}
          onSaved={cargarRutinas}
        />
      )}

      {hasPerms && (
        <AgregarEjercicioModal
          open={addEjModalOpen}
          onClose={() => setAddEjModalOpen(false)}
          bloque={bloqueDestino}
          onSaved={cargarRutinas}
        />
      )}
      <PSEModal
        open={pseModalOpen}
        onClose={() => setPseModalOpen(false)}
        mode={pseMode} // 'sesion' | 'bloque' | 'ejercicio' | 'serie'
        context={pseCtx}
        onSubmit={handlePSESubmit}
        onSaved={(pse) => {
          // opcional: refrescar badges/últimos PSE por nivel si llevás mapas
          if (pseMode === 'serie' && pse?.serie_id) {
            setUltPSEMap((prev) => ({
              ...prev,
              [pse.serie_id]: {
                rpe_real: pse.rpe_real,
                rir: pse.rir,
                fecha_registro: pse.fecha_registro
              }
            }));
          }
        }}
      />
    </div>
  );
};

export default RutinaVigentePorBloques;
