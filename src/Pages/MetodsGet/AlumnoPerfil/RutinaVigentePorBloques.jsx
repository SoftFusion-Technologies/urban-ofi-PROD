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
  FaTachometerAlt
} from 'react-icons/fa';
import ModalSuccess from '../../../Components/Forms/ModalSuccess';
import ModalError from '../../../Components/Forms/ModalError';
import { formatDdMmYyyySmart } from '../../../utils/fechas';
import HeaderRutinas from '../../Components/HeaderRutinas';
// ─────────────────────────────────────────────────────────────
// COPIA del original, solo cambia el fetch y se agrega la UI de vigencia
// ─────────────────────────────────────────────────────────────

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
        <div className="space-y-10 overflow-y-auto" style={{ maxHeight: 480 }}>
          {rutinas.map((rutina) => (
            <div
              key={rutina.id}
              className="rounded-2xl bg-white/90 p-6 shadow-xl border border-blue-100"
            >
              {/* Header con vigencia */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  {rutina.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">
                      {rutina.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Bloques */}
              {!(rutina.bloques || []).length ? (
                <p className="text-center text-gray-500">
                  Se eliminaron bloques en esta rutina
                </p>
              ) : (
                <ul className="space-y-10">
                  {(rutina.bloques || []).map((bloque) => {
                    const color = getColor(bloque.color_id);
                    return (
                      <li
                        key={bloque.id}
                        className="rounded-2xl bg-white/90 p-6 shadow-xl border border-gray-100"
                        style={{ backgroundColor: color.color_hex || '#fff' }}
                      >
                        <div className="mb-5 flex items-center gap-2 flex-wrap">
                          <h4
                            className="font-extrabold text-2xl tracking-tight mb-0"
                            style={{
                              color: getContrastText(
                                color.color_hex || '#ffffff'
                              )
                            }}
                          >
                            {bloque.nombre || 'Bloque sin nombre'}
                          </h4>
                          {isAlumno && (
                            <button
                              onClick={() => openPSEBloque(bloque, rutina)}
                              className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                              title="Registrar PSE del bloque"
                            >
                              <FaTachometerAlt />
                              RPE Bloque
                            </button>
                          )}

                          {hasPerms && (
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => onAgregarEjercicio(bloque)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/80 hover:bg-white text-green-600 hover:text-green-800 shadow-sm"
                                title="Agregar ejercicio"
                                aria-label="Agregar ejercicio"
                              >
                                <FaPlus />
                              </button>
                              {/* <button
                                onClick={() => onEliminarBloque(bloque)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/80 hover:bg-white text-red-600 hover:text-red-800 shadow-sm"
                                title="Eliminar bloque"
                                aria-label="Eliminar bloque"
                              >
                                <FaTrash />
                              </button> */}
                            </div>
                          )}
                        </div>

                        {/* Ejercicios */}
                        <ul className="space-y-6">
                          {(bloque.ejercicios || []).map((ej) => (
                            <li
                              key={ej.id}
                              className="flex flex-col px-6 py-4 rounded-xl shadow border border-gray-200 bg-white/95"
                            >
                              <div className="mb-2">
                                <div className="flex items-start justify-between">
                                  <h5 className="text-lg font-bold text-blue-700 uppercase break-words leading-snug">
                                    {ej.nombre}
                                  </h5>

                                  {hasPerms && (
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => onEditarEjercicio(ej)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Editar ejercicio"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => onEliminarEjercicio(ej)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Eliminar ejercicio"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isAlumno && (
                                  <div className="mt-1 flex flex-col gap-1">
                                    <a
                                      href={buildYouTubeUrl(ej)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-semibold"
                                    >
                                      <FaYoutube className="text-red-600" /> Ver
                                      video
                                    </a>
                                    {/* 
                                    <button
                                      type="button"
                                      onClick={() => handleNecesitoAyuda(ej)}
                                      disabled={enviandoAyudaId === ej.id}
                                      className={`text-left text-xs font-semibold underline-offset-2 ${
                                        enviandoAyudaId === ej.id
                                          ? 'text-gray-400 cursor-wait'
                                          : 'text-green-600 hover:underline'
                                      }`}
                                    >
                                      {enviandoAyudaId === ej.id
                                        ? 'Enviando…'
                                        : 'Necesito ayuda'}
                                    </button> */}
                                  </div>
                                )}
                              </div>

                              {ej.notas && (
                                <p className="text-sm text-gray-600 mb-2 italic">
                                  {ej.notas}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {(ej.series || []).map((serie) => (
                                  <div
                                    key={serie.id}
                                    className="bg-gray-50 border border-blue-300 rounded-lg p-3 shadow-sm relative cursor-pointer md:hover:ring-2 md:hover:ring-blue-200"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openLogModal(ej, serie)}
                                    onKeyDown={(e) => {
                                      if (['Enter', ' '].includes(e.key)) {
                                        e.preventDefault();
                                        openLogModal(e, serie);
                                      }
                                    }}
                                    aria-label={`Abrir registro de ${ej.nombre} - Serie ${serie.numero_serie}`}
                                  >
                                    {hasPerms && (
                                      <div
                                        className="absolute right-2 top-2 flex items-center gap-2 sm:-mt-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          onClick={() => onEditarSerie(serie)}
                                          className="text-blue-600 hover:text-blue-800"
                                          title="Editar serie"
                                        >
                                          <FaEdit />
                                        </button>
                                        <button
                                          onClick={() => onEliminarSerie(serie)}
                                          className="text-red-600 hover:text-red-800"
                                          title="Eliminar serie"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>
                                    )}

                                    <p className="text-sm text-gray-800">
                                      <strong>
                                        Serie {serie.numero_serie}
                                      </strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Reps:{' '}
                                      <strong>{serie.repeticiones}</strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Peso: <strong>{serie.kg} kg</strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Tiempo: <strong>{serie.tiempo}</strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Descanso:{' '}
                                      <strong>{serie.descanso}</strong>
                                    </p>
                                    {/* Botón registrar PSE (no abre el log) */}
                                    {isAlumno && (
                                      <div className="mt-2">
                                        <button
                                          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openPSESerie(
                                              ej,
                                              serie,
                                              bloque,
                                              rutina.id
                                            ); // 👈 PASAR bloque
                                          }}
                                        >
                                          <FaTachometerAlt />
                                          Registrar PSE/SER
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Acciones de la rutina (por bloque o por rutina, según tu UX) */}
                        <div className="mt-6 flex justify-center gap-6">
                          <button
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition text-sm font-semibold"
                            onClick={() => {
                              if (isAlumno) {
                                setPseMode('sesion');
                                setPseCtx({
                                  student_id: rutina?.student_id ?? studentId,
                                  rutina_id: rutina?.id,
                                  rutinaNombre: rutina?.nombre
                                });
                                setPseModalOpen(true);
                              } else {
                                alert('Solo alumnos pueden registrar sRPE');
                              }
                            }}
                          >
                            ✅ Cargar Rutina (sRPE)
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
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
