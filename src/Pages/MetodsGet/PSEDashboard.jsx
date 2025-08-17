import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FaFilter,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTachometerAlt,
  FaClock,
  FaChartLine
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

import {
  createPSEGeneric,
  createPSESerie,
  createPSESesion
} from '../../api/pseApi';
import PSEModal from '../../Components/PSEModal';

const API = import.meta.env.VITE_API_URL || 'https://vps-5097245-x.dattaweb.com';

const TABS = [
  { key: 'rutina', label: 'Sesión' },
  { key: 'bloque', label: 'Bloque' },
  { key: 'ejercicio', label: 'Ejercicio' },
  { key: 'serie', label: 'Serie' }
];

const EscalaBadge = ({ escala }) => (
  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-sm">
    {escala}
  </span>
);

const RpeChip = ({ rpe }) => {
  const cls =
    rpe == null
      ? 'bg-slate-200 text-slate-700'
      : rpe >= 9
      ? 'bg-red-600 text-white'
      : rpe >= 7
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}
    >
      RPE {rpe ?? '-'}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="grid grid-cols-12 gap-3 px-3 py-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="col-span-2">
        <div className="h-4 bg-slate-200/60 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
);

export default function PSEDashboard() {
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const qpStudent = search.get('student_id') || '';
  const [tab, setTab] = useState(search.get('nivel') || 'serie');
  const [page, setPage] = useState(Number(search.get('page') || 1));
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // Filtros
  const [studentId, setStudentId] = useState(qpStudent);
  const [rutinaId, setRutinaId] = useState('');
  const [bloqueId, setBloqueId] = useState('');
  const [ejercicioId, setEjercicioId] = useState('');
  const [serieId, setSerieId] = useState('');
  const [escala, setEscala] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [buscar, setBuscar] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('serie');
  const [modalCtx, setModalCtx] = useState(null);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // KPIs rápidos
  const avgRPE = useMemo(() => {
    const list = rows.map((r) => Number(r.rpe_real)).filter((n) => !isNaN(n));
    if (!list.length) return null;
    const sum = list.reduce((a, b) => a + b, 0);
    return (sum / list.length).toFixed(1);
  }, [rows]);

  const hiRPEpct = useMemo(() => {
    const list = rows.map((r) => Number(r.rpe_real)).filter((n) => !isNaN(n));
    if (!list.length) return null;
    const hi = list.filter((n) => n >= 9).length;
    return Math.round((100 * hi) / list.length);
  }, [rows]);

  // Params
  const queryParams = useMemo(() => {
    const params = { nivel: tab, page, pageSize };
    if (studentId) params.student_id = studentId;
    if (rutinaId) params.rutina_id = rutinaId;
    if (bloqueId) params.bloque_id = bloqueId;
    if (ejercicioId) params.ejercicio_id = ejercicioId;
    if (serieId) params.serie_id = serieId;
    if (escala) params.escala = escala;
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;
    if (buscar) params.q = buscar;
    return params;
  }, [
    tab,
    page,
    pageSize,
    studentId,
    rutinaId,
    bloqueId,
    ejercicioId,
    serieId,
    escala,
    fechaDesde,
    fechaHasta,
    buscar
  ]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/pse`, { params: queryParams });
      setRows(data?.data || []);
      setTotal(data?.meta?.total || 0);
    } catch {
      toast.error('No se pudo cargar la lista de PSE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    const url = new URL(window.location.href);
    Object.entries({ nivel: tab, page, student_id: studentId }).forEach(
      ([k, v]) => {
        if (v) url.searchParams.set(k, v);
        else url.searchParams.delete(k);
      }
    );
    navigate(`${url.pathname}${url.search}`, { replace: true });
  }, [JSON.stringify(queryParams)]);

  // CRUD
  const openCreate = (nivel) => {
    setModalMode(nivel);
    setModalCtx({
      student_id: Number(studentId) || undefined,
      rutina_id: Number(rutinaId) || undefined,
      bloque_id: Number(bloqueId) || undefined,
      ejercicio_id: Number(ejercicioId) || undefined,
      serie_id: Number(serieId) || undefined
    });
    setModalOpen(true);
  };

  const onSubmitModal = async (payload) => {
    if (modalMode === 'serie') return await createPSESerie(payload);
    if (modalMode === 'sesion' || modalMode === 'rutina')
      return await createPSESesion(payload);
    return await createPSEGeneric({ nivel: modalMode, ...payload });
  };

  const onSavedModal = () => {
    toast.success('✅ Registro guardado');
    fetchList();
  };

  const onEdit = (row) => {
    setModalMode(row.nivel);
    setModalCtx({
      student_id: row.student_id,
      rutina_id: row.rutina_id,
      bloque_id: row.bloque_id,
      ejercicio_id: row.ejercicio_id,
      serie_id: row.serie_id,
      _initial: {
        escala: row.escala,
        rpe_real: row.rpe_real,
        rir: row.rir,
        comentarios: row.comentarios,
        duracion_min: row.duracion_min
      },
      _editId: row.id
    });
    setModalOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este registro de PSE?')) return;
    try {
      await axios.delete(`${API}/pse/${id}`);
      toast.success('Registro eliminado');
      fetchList();
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  // UI helpers
  const TabButton = ({ t }) => {
    const active = tab === t.key;
    return (
      <button
        onClick={() => {
          setTab(t.key);
          setPage(1);
        }}
        className={`relative px-4 py-2 rounded-full text-sm font-bold transition
          ${active ? 'text-white' : 'text-slate-700'}
        `}
      >
        <span
          className={`absolute inset-0 rounded-full transition
          ${
            active
              ? 'bg-blue-600 shadow-lg'
              : 'bg-white/70 border border-slate-200 hover:bg-white'
          }`}
        />
        <span className="relative">{t.label}</span>
      </button>
    );
  };

  const ColsHeader = () => (
    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
      <div className="col-span-2">Fecha</div>
      {tab !== 'rutina' && <div className="col-span-2">Contexto</div>}
      <div className="col-span-2">Escala</div>
      <div className="col-span-2">RPE / RIR</div>
      <div className="col-span-2">Notas</div>
      <div className="col-span-2 text-right">Acciones</div>
    </div>
  );

  const RowItem = ({ r }) => (
    <motion.div
      layout
      className="grid grid-cols-12 gap-3 items-center px-4 py-3 rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow transition"
    >
      <div className="col-span-2 text-sm text-slate-800 flex items-center gap-2">
        <FaClock className="text-slate-400" />
        {dayjs(r.fecha_registro).format('DD/MM/YYYY HH:mm')}
      </div>
      {tab !== 'rutina' && (
        <div className="col-span-2 text-xs text-slate-700">
          {tab === 'bloque' && <span>Bloque #{r.bloque_id}</span>}
          {tab === 'ejercicio' && (
            <span>
              Ejercicio #{r.ejercicio_id}
              {r?.ejercicio?.nombre ? ` · ${r.ejercicio.nombre}` : ''}
            </span>
          )}
          {tab === 'serie' && (
            <span>
              Serie #{r.serie_id} · Ej #{r.ejercicio_id}
            </span>
          )}
        </div>
      )}
      <div className="col-span-2 flex items-center gap-2">
        <EscalaBadge escala={r.escala} />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <RpeChip rpe={r.rpe_real} />
        {r.rir != null && (
          <span className="text-[11px] font-semibold text-slate-600">
            RIR {r.rir}
          </span>
        )}
        {tab === 'rutina' && r.duracion_min != null && (
          <span className="text-[11px] font-semibold text-slate-600">
            · {r.duracion_min} min
          </span>
        )}
      </div>
      <div className="col-span-2 text-xs text-slate-700 line-clamp-2">
        {r.comentarios || '—'}
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <button
          onClick={() => onEdit(r)}
          className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 text-xs shadow-sm"
          aria-label="Editar"
        >
          <FaEdit /> Editar
        </button>
        <button
          onClick={() => onDelete(r.id)}
          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 text-xs shadow-sm"
          aria-label="Eliminar"
        >
          <FaTrash /> Eliminar
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Toaster position="top-right" />
      {/* Barra superior sticky */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                PSE / RPE
              </h2>
              <FaChartLine className="text-blue-600" />
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full px-3 py-2 shadow-sm">
                <FaSearch className="text-slate-400" />
                <input
                  className="outline-none text-sm w-56 bg-transparent placeholder-slate-400"
                  placeholder="Buscar comentario…"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                />
              </div>
              <button
                onClick={() => openCreate(tab)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-blue-700"
              >
                <FaPlus /> Nuevo {TABS.find((t) => t.key === tab)?.label}
              </button>
            </div>
          </div>

          {/* Tabs pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <TabButton key={t.key} t={t} />
            ))}
            <button
              onClick={() => {
                setTab('rutina');
                setPage(1);
                openCreate('rutina');
              }}
              className="relative px-4 py-2 rounded-full text-sm font-semibold text-slate-700"
            >
              <span className="absolute inset-0 rounded-full bg-white/70 border border-slate-200 hover:bg-white" />
              <span className="relative">
                <FaTachometerAlt className="inline-block mr-2" />
                Registrar sRPE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-600">
              Total registros
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{total}</p>
          </div>
          <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-600">Promedio RPE</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {avgRPE ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-600">% RPE ≥ 9</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {hiRPEpct != null ? `${hiRPEpct}%` : '—'}
            </p>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-3">
            <FaFilter /> Filtros
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
              placeholder="Rutina ID"
              value={rutinaId}
              onChange={(e) => setRutinaId(e.target.value)}
            />
            {tab !== 'rutina' && (
              <input
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
                placeholder="Bloque ID"
                value={bloqueId}
                onChange={(e) => setBloqueId(e.target.value)}
              />
            )}
            {(tab === 'ejercicio' || tab === 'serie') && (
              <input
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
                placeholder="Ejercicio ID"
                value={ejercicioId}
                onChange={(e) => setEjercicioId(e.target.value)}
              />
            )}
            {tab === 'serie' && (
              <input
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
                placeholder="Serie ID"
                value={serieId}
                onChange={(e) => setSerieId(e.target.value)}
              />
            )}
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
              value={escala}
              onChange={(e) => setEscala(e.target.value)}
            >
              <option value="">Escala</option>
              <option value="RPE_10">RPE_10</option>
              <option value="CR10">CR10</option>
              <option value="BORG_6_20">BORG_6_20</option>
            </select>

            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />

            <button
              onClick={() => {
                setPage(1);
                fetchList();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow hover:bg-slate-800"
            >
              Aplicar
            </button>
            <button
              onClick={() => {
                setRutinaId('');
                setBloqueId('');
                setEjercicioId('');
                setSerieId('');
                setEscala('');
                setFechaDesde('');
                setFechaHasta('');
                setBuscar('');
                setPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              Limpiar
            </button>
          </div>
          {/* Quick chips (opcional) */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setEscala('RPE_10');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full border transition ${
                escala === 'RPE_10'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              RPE 0–10
            </button>
            <button
              onClick={() => {
                setEscala('');
                setFechaDesde('');
                setFechaHasta('');
                setPage(1);
              }}
              className="px-3 py-1 rounded-full border bg-white border-slate-200 hover:bg-slate-50"
            >
              Quitar filtros
            </button>
          </div>
        </div>

        {/* Lista desktop */}
        <div className="hidden md:block">
          <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur shadow-sm">
            <ColsHeader />
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : rows.length ? (
                  rows.map((r) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                    >
                      <RowItem r={r} />
                    </motion.div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <div className="text-4xl">📝</div>
                    <p className="mt-2 text-slate-700 font-semibold">
                      No hay registros aún
                    </p>
                    <p className="text-slate-500 text-sm">
                      Crea el primero con el botón “Nuevo{' '}
                      {TABS.find((t) => t.key === tab)?.label}”.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Lista mobile (cards) */}
        <div className="md:hidden space-y-3">
          <AnimatePresence>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur p-3 shadow-sm"
                >
                  <div className="h-4 w-24 bg-slate-200/70 rounded-full animate-pulse mb-2" />
                  <div className="h-3 w-48 bg-slate-200/70 rounded-full animate-pulse mb-3" />
                  <div className="h-8 w-full bg-slate-200/70 rounded-xl animate-pulse" />
                </div>
              ))
            ) : rows.length ? (
              rows.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-slate-800">
                      {dayjs(r.fecha_registro).format('DD/MM HH:mm')}
                    </div>
                    <EscalaBadge escala={r.escala} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <RpeChip rpe={r.rpe_real} />
                    {r.rir != null && (
                      <span className="text-[11px] font-semibold text-slate-600">
                        RIR {r.rir}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-700 mb-2">
                    {r.comentarios || '—'}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(r)}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 text-xs shadow-sm"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 text-xs shadow-sm"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500">
                Sin resultados
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Paginación */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Total: <strong>{total}</strong>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white/80"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/pág
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-600">
                {page}/{pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB en mobile */}
      <button
        onClick={() => openCreate(tab)}
        className="md:hidden fixed bottom-5 right-5 rounded-full h-14 w-14 flex items-center justify-center shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
        aria-label="Nuevo registro"
      >
        <FaPlus />
      </button>

      {/* Modal */}
      <PSEModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode === 'rutina' ? 'sesion' : modalMode}
        context={modalCtx}
        onSubmit={onSubmitModal}
        onSaved={onSavedModal}
      />
    </div>
  );
}
