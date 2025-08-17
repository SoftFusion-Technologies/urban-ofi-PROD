import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  RefreshCcw,
  Loader2,
  X,
  Users,
  CalendarDays,
  Clock,
  UserRoundCheck,
  SquareStack,
  ListChecks,
  ArrowLeftCircle,
  Eye,
  UserPlus
} from 'lucide-react';
import ParticlesBackground from '../../Components/ParticlesBackground';
import ButtonBack from '../../Components/ButtonBack';
import {
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaBan
} from 'react-icons/fa';


import clsx from 'clsx';

// ====== ESTILOS/VARIANTS ======
const glass = 'bg-white/10 backdrop-blur-xl border border-white/10';
const panel = 'rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.25)]';
const chipBase =
  'px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase';
const btnSoft =
  'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition';

// Motion
const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};
const listTransition = { type: 'spring', stiffness: 120, damping: 16 };
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const BASE_URL = 'https://vps-5097245-x.dattaweb.com';
const RUTINAS_LIST_ROUTE = '/rutinasss'; // listado actual
const RUTINA_DETALLE_ROUTE = (id) => `/rutinas/${id}/completa`;

export const Toolbar = React.memo(function Toolbar({
  q,
  onChangeQ,
  onClearQ,
  vigentes,
  onToggleVigentes,
  users,
  instructorId,
  onSelectInstructor,
  meta,
  errorUsers,
  loadingUsers
}) {
  const initials = (name) => {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  return (
    <div className="sticky top-0 z-20">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 pt-3`}>
        <div className={`${glass} ${panel} px-3 sm:px-5 py-3`}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 mr-auto">
              <ButtonBack />
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-white uppercase tracking-wide">
                <Users className="w-5 h-5 opacity-80" />
                Rutinas
                {meta?.total ? (
                  <span className="text-sm text-gray-300 font-normal normal-case tracking-normal">
                    ({meta.total} en total)
                  </span>
                ) : null}
              </h2>
            </div>

            {/* 🔎 Buscar */}
            <div className="relative w-full sm:w-72">
              <Search
                className="w-4 h-4 text-white/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                className="w-full text-white placeholder:text-white/60 pl-9 pr-9 py-2 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                placeholder="Buscar por rutina o alumno…"
                value={q}
                onChange={(e) => onChangeQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 text-white/80"
                  onClick={onClearQ}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro Vigentes */}
            <button
              type="button"
              onClick={onToggleVigentes}
              className={`${btnSoft} ${
                vigentes ? 'ring-2 ring-emerald-400/30' : ''
              }`}
              title="Mostrar solo vigentes (consulta al backend)"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">
                {vigentes ? 'Vigentes' : 'Todas'}
              </span>
            </button>
          </div>

          {/* Chips de profesores */}
          <div className="mt-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 pb-1 min-w-max">
              <button
                type="button"
                onClick={() => onSelectInstructor('')}
                className={`px-3 py-1.5 rounded-full transition whitespace-nowrap border border-white/10 ${
                  !instructorId
                    ? 'bg-cyan-500/80 text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Todos
              </button>

              {loadingUsers && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando
                  instructores…
                </div>
              )}

              {!loadingUsers && errorUsers && (
                <span className="text-sm text-red-300">{errorUsers}</span>
              )}

              {!loadingUsers &&
                !errorUsers &&
                (Array.isArray(users) ? users : []).map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => onSelectInstructor(String(u.id))}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 transition whitespace-nowrap ${
                      String(instructorId) === String(u.id)
                        ? 'bg-cyan-500/80 text-white'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                    title={u.email}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white text-xs font-semibold">
                      {initials(u.name)}
                    </span>
                    <span className="text-sm font-medium">{u.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function RutinasExplorer() {
  // ===== Filtros =====
  const [q, setQ] = useState('');
  const [vigentes, setVigentes] = useState(false);
  const [instructorId, setInstructorId] = useState('');

  // ===== Datos =====
  const [users, setUsers] = useState([]);
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    pageSize: 20,
    total: 0
  });

  // ===== UI =====
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorList, setErrorList] = useState('');

  // Drawer detalle
  const [openId, setOpenId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const abortRef = useRef(null);

  // Modal de asignar
  const [modalAsignarVisible, setModalAsignarVisible] = useState(false);
  const [rutinaSeleccionadaParaAsignar, setRutinaSeleccionadaParaAsignar] =
    useState(null);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);

  // Alumnos
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [busquedaAlumnos, setBusquedaAlumnos] = useState('');
  const [paginaAlumnos, setPaginaAlumnos] = useState(1);
  const alumnosPorPagina = 10;

  // Fechas
  const [desde, setDesde] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [hasta, setHasta] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Cargar alumnos desde el backend
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await fetch(`${BASE_URL}/students`);
        if (!res.ok) throw new Error('No se pudieron cargar los alumnos');
        const data = await res.json();
        setAlumnos(Array.isArray(data) ? data : data?.data ?? []);
      } catch (e) {
        console.error('Error al obtener alumnos', e);
      }
    };
    fetchAlumnos();
  }, []);

  // Filtro y paginado en memoria
  const alumnosFiltrados = useMemo(() => {
    const q = busquedaAlumnos.toLowerCase();
    return (alumnos || []).filter((a) =>
      `${a.nomyape ?? ''} ${a.dni ?? ''}`.toLowerCase().includes(q)
    );
  }, [alumnos, busquedaAlumnos]);

  const alumnosPaginados = useMemo(() => {
    return alumnosFiltrados.slice(0, paginaAlumnos * alumnosPorPagina);
  }, [alumnosFiltrados, paginaAlumnos, alumnosPorPagina]);

  // ===== Helpers =====
  const fetchJSON = async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  };
  const buildQuery = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    return qs.toString();
  };
  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const initials = (name) => {
    if (!name) return '?';
    const p = String(name).trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase();
  };

  const resumenRutina = (r) => {
    let bloques = r?.bloques?.length || 0;
    let ejercicios = 0,
      series = 0;
    (r?.bloques || []).forEach((b) => {
      ejercicios += b?.ejercicios?.length || 0;
      (b?.ejercicios || []).forEach((e) => {
        series += e?.series?.length || 0;
      });
    });
    return { bloques, ejercicios, series };
  };

  // ===== Usuarios permitidos =====
  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        setErrorUsers('');
        const json = await fetchJSON(`${BASE_URL}/users`);
        const allowed = new Set(['instructor', 'admin']); // ajustable
        setUsers(
          (Array.isArray(json) ? json : []).filter((u) => allowed.has(u.level))
        );
      } catch (e) {
        setErrorUsers(e.message || 'Error al cargar usuarios');
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // ===== Listado (pedimos view=full para tener bloques) =====
  const fetchList = async (page = 1) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoadingList(true);
    setErrorList('');
    try {
      const params = {
        page,
        pageSize: meta.pageSize || 20,
        orderBy: 'created_at',
        orderDir: 'DESC',
        view: 'full', // 👈 clave: bloques en la respuesta
        q: q || undefined,
        vigentes: vigentes ? 'true' : undefined,
        instructor_id: instructorId || undefined
      };
      const url = `${BASE_URL}${RUTINAS_LIST_ROUTE}?${buildQuery(params)}`;
      const json = await fetchJSON(url, { signal: abortRef.current.signal });
      setList(json.data || []);
      setMeta(json.meta || { page, totalPages: 1, pageSize: 20, total: 0 });
    } catch (e) {
      if (e.name !== 'AbortError')
        setErrorList(e.message || 'Error al cargar rutinas');
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    fetchList(1); /* eslint-disable-line */
  }, [q, vigentes, instructorId]);

  // ===== Detalle =====
  const openDrawer = async (rutina) => {
    setOpenId(rutina.id);
    if (rutina?.bloques?.length) {
      setDetalle(rutina);
      return;
    }
    try {
      setLoadingDetalle(true);
      const json = await fetchJSON(
        `${BASE_URL}${RUTINA_DETALLE_ROUTE(rutina.id)}`
      );
      setDetalle(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetalle(false);
    }
  };
  const closeDrawer = () => {
    setOpenId(null);
    setDetalle(null);
  };

  // Si la rutina de la card no trae bloques, pedimos el detalle
  const ensureRutinaCompleta = async (r) => {
    if (r?.bloques?.length) return r;
    const res = await fetch(`${BASE_URL}${RUTINA_DETALLE_ROUTE(r.id)}`);
    if (!res.ok) throw new Error('No se pudo cargar el detalle de la rutina');
    return await res.json();
  };

  const openAsignarDesdeRutina = (rutina) => {
    setRutinaSeleccionadaParaAsignar(rutina);
    setModalAsignarVisible(true);

    // Reset selección
    setAlumnosSeleccionados([]);
    setBusquedaAlumnos('');
    setPaginaAlumnos(1);

    // Prefill fechas (opcional: desde la rutina seleccionada)
    const d = rutina?.desde ? new Date(rutina.desde) : new Date();
    const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toISOString()
      .slice(0, 10);
    setDesde(iso);

    setHasta(rutina?.hasta ?? ''); // '' = indefinida
  };

  // IMPORTANTE: tener el id del instructor en el scope (userId).
  // Si no tenés userId, tratamos de usar el de la rutina como fallback.
  const handleAsignarRutinaCompleta = async () => {
    if (!rutinaSeleccionadaParaAsignar) {
      alert('No hay rutina seleccionada');
      return;
    }
    if (alumnosSeleccionados.length === 0) {
      alert('Seleccioná al menos un alumno');
      return;
    }
    if (!desde) {
      alert('Seleccioná la fecha "Desde"');
      return;
    }
    if (hasta && new Date(hasta) < new Date(desde)) {
      alert('"Hasta" no puede ser anterior a "Desde"');
      return;
    }

    try {
      setCargandoAsignacion(true);

      const rutinaId = rutinaSeleccionadaParaAsignar.id;
      const body = {
        student_ids: alumnosSeleccionados.map((a) => a.id),
        desde, // "YYYY-MM-DD"
        hasta: hasta || null // null = indefinida
      };

      const res = await fetch(`${BASE_URL}/rutinas/${rutinaId}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.mensajeError || 'No se pudo asignar la rutina');
      }

      // UX
      alert('Rutina asignada correctamente 🎉');
      setModalAsignarVisible(false);
      setAlumnosSeleccionados([]);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error al asignar la rutina');
    } finally {
      setCargandoAsignacion(false);
    }
  };

  // ===== UI =====
  const RutinaCard = ({ r }) => {
    const { bloques, ejercicios, series } = resumenRutina(r);

    return (
      <motion.div
        layout
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={listTransition}
        className={[
          // Card base
          'relative rounded-2xl bg-white shadow-sm transition',
          // Sutil borde azul con “aurora” al hover
          'border border-gray-200 hover:shadow-[0_18px_50px_rgba(2,6,23,0.10)]',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl',
          'after:opacity-0 hover:after:opacity-100 after:transition-opacity',
          'after:ring-1 after:ring-inset after:ring-blue-200/60'
        ].join(' ')}
      >
        <div className="p-4 sm:p-5">
          {/* Header + CTA */}
          <div className="flex items-start justify-between gap-3">
            {/* Título + meta */}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-wide text-gray-900 ">
                {r.nombre}
              </h3>

              <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <UserRoundCheck className="w-4 h-4 text-gray-400" />
                  {r.instructor?.name || r.instructor?.nombre || '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  {r.alumno?.nomyape || '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  {formatDate(r.desde)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(r.hasta)}
                </span>
              </div>
            </div>
            {/* Botonera responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
              {/* Asignar (abre modal) */}
              <button
                onClick={() => openAsignarDesdeRutina(r)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 w-full sm:w-auto
             bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
             border border-blue-700 shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                title="Asignar rutina"
                aria-label="Asignar rutina"
              >
                <UserPlus className="w-4 h-4" />
                <span>Asignar</span>
              </button>

              {/* Ver (secundario) */}
              <button
                onClick={() => openDrawer(r)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 w-full sm:w-auto
                         bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900
                         border border-gray-300 shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-200"
                title="Ver rutina"
                aria-label="Ver rutina"
              >
                <Eye className="w-4 h-4" />
                <span>Ver</span>
              </button>
            </div>
          </div>

          {/* Métricas compactas */}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <SquareStack className="w-4 h-4 text-gray-400" /> {bloques}{' '}
              bloques
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-gray-400" /> {ejercicios}{' '}
              ejercicios
            </span>
            <span className="inline-flex items-center gap-1.5">
              Σ {series} series
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const DrawerDetalle = () => (
    <AnimatePresence>
      {openId && (
        <motion.div className="fixed inset-0 z-40" {...fadeIn}>
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <motion.aside
            className={`absolute right-0 top-0 h-full w-full sm:w-[760px] ${glass} ${panel} bg-white/10 text-white flex flex-col`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          >
            <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/70">
                  Rutina
                </div>
                <div className="text-lg font-semibold">
                  {detalle?.nombre || '—'}
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className={`${btnSoft} border-white/20`}
              >
                <ArrowLeftCircle className="w-4 h-4" />
                Cerrar
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 text-sm text-white/80 flex flex-wrap gap-x-4 gap-y-1 border-b border-white/10">
              <span className="inline-flex items-center gap-1">
                <UserRoundCheck className="w-4 h-4" />{' '}
                {detalle?.instructor?.name ||
                  detalle?.instructor?.nombre ||
                  '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" /> {detalle?.alumno?.nomyape || '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" /> Desde{' '}
                {formatDate(detalle?.desde)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> Hasta {formatDate(detalle?.hasta)}
              </span>
            </div>

            {/* Pestañas por bloque */}
            <div className="px-4 sm:px-6 pt-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {(detalle?.bloques || [])
                  .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                  .map((b, idx) => (
                    <a
                      key={b.id}
                      href={`#bloque-${b.id}`}
                      className={`${btnSoft} text-white/90`}
                    >
                      {b.nombre || `Bloque ${idx + 1}`}{' '}
                      {typeof b.color_id === 'number' ? `· #${b.color_id}` : ''}
                    </a>
                  ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              {loadingDetalle && !detalle && (
                <div className="p-4 text-sm text-white/80 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
                </div>
              )}

              {(detalle?.bloques || [])
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                .map((b, idx) => (
                  <section id={`bloque-${b.id}`} key={b.id} className="mt-4">
                    <div className="sticky top-0   py-2 mb-2">
                      <div className="text-base font-semibold">
                        {b.nombre || `Bloque ${idx + 1}`}{' '}
                        {typeof b.color_id === 'number' ? (
                          <span className="text-xs text-white/70">
                            · Color #{b.color_id}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {(b.ejercicios || [])
                      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                      .map((e) => (
                        <div
                          key={e.id}
                          className={`${glass} ${panel} border-white/10 p-3 mb-3`}
                        >
                          <div className="font-semibold uppercase tracking-wide text-white">
                            {e.nombre}
                          </div>
                          {e.notas && (
                            <div className="text-sm text-white/80 mt-1">
                              notas: {e.notas}
                            </div>
                          )}

                          <div className="mt-2 overflow-x-auto">
                            <table className="min-w-[520px] text-sm text-black/90">
                              <thead>
                                <tr className="text-left">
                                  <th className="pr-4 font-semibold text-black/80">
                                    Serie
                                  </th>
                                  <th className="pr-4 font-semibold text-black/80">
                                    Reps
                                  </th>
                                  <th className="pr-4 font-semibold text-black/80">
                                    Kg
                                  </th>
                                  <th className="pr-4 font-semibold text-black/80">
                                    Descanso
                                  </th>
                                  <th className="pr-4 font-semibold text-black/80">
                                    Tiempo
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(e.series || [])
                                  .sort(
                                    (a, b) =>
                                      (a.numero_serie ?? 0) -
                                      (b.numero_serie ?? 0)
                                  )
                                  .map((s) => (
                                    <tr
                                      key={s.id}
                                      className="border-t border-white/10"
                                    >
                                      <td className="pr-4 py-1">
                                        {s.numero_serie ?? '—'}
                                      </td>
                                      <td className="pr-4">
                                        {s.repeticiones ?? '—'}
                                      </td>
                                      <td className="pr-4">{s.kg ?? '—'}</td>
                                      <td className="pr-4">
                                        {s.descanso ?? '—'}
                                      </td>
                                      <td className="pr-4">
                                        {s.tiempo ?? '—'}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                  </section>
                ))}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const isRangoInvalido = !!(
    hasta &&
    desde &&
    new Date(hasta) < new Date(desde)
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
      <ParticlesBackground />

      <Toolbar
        q={q}
        onChangeQ={setQ}
        onClearQ={() => setQ('')}
        vigentes={vigentes}
        onToggleVigentes={() => setVigentes((v) => !v)}
        users={users}
        instructorId={instructorId}
        onSelectInstructor={setInstructorId}
        meta={meta}
        errorUsers={errorUsers}
        loadingUsers={loadingUsers}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {errorList && (
          <div className={`${glass} ${panel} p-3 text-sm text-red-100`}>
            {errorList}
          </div>
        )}

        {loadingList && !list.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`${panel} ${glass} border-white/10 p-4 animate-pulse`}
              >
                <div className="h-5 w-48 bg-white/10 rounded mb-2" />
                <div className="h-4 w-80 bg-white/5 rounded mb-2" />
                <div className="h-4 w-60 bg-white/5 rounded" />
                <div className="mt-3 h-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {!list.length ? (
              <div
                className={`${panel} ${glass} border-white/10 p-10 text-center text-white/90`}
              >
                <svg
                  className="w-8 h-8 mx-auto text-white/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 5h18M7 8h10M4 12h16M6 16h12M8 20h8" />
                </svg>
                <p className="mt-3">
                  No se encontraron rutinas con los filtros actuales.
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                transition={listTransition}
              >
                {list.map((r) => (
                  <RutinaCard key={r.id} r={r} />
                ))}
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                className={`${btnSoft} text-white`}
                disabled={meta.page <= 1}
                onClick={() => fetchList(meta.page - 1)}
              >
                Anterior
              </button>
              <span className="text-sm text-white">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                className={`${btnSoft} text-white`}
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchList(meta.page + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      <DrawerDetalle />
      <AnimatePresence>
        {modalAsignarVisible && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl border border-white/20"
            >
              {/* Cerrar */}
              <button
                onClick={() => setModalAsignarVisible(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                aria-label="Cerrar"
              >
                <FaTimes size={22} />
              </button>

              {/* Título */}
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1 text-center tracking-tight uppercase">
                Asignar rutina a alumnos
              </h2>
              {rutinaSeleccionadaParaAsignar && (
                <p className="text-center text-sm text-gray-600 mb-4">
                  Rutina:{' '}
                  <span className="font-semibold">
                    {rutinaSeleccionadaParaAsignar.nombre}
                  </span>
                </p>
              )}

              {/* Buscador */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={busquedaAlumnos}
                  onChange={(e) => {
                    setBusquedaAlumnos(e.target.value);
                    setPaginaAlumnos(1);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>

              {/* Rango de fechas (mejorado) */}
              <div className="mb-4 space-y-3">
                {/* Fila responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* DESDE */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Desde
                    </label>
                    <div
                      className={clsx(
                        'relative flex items-center rounded-xl border bg-white transition',
                        'focus-within:ring-2 focus-within:ring-blue-300',
                        isRangoInvalido
                          ? 'border-red-300 ring-red-200'
                          : 'border-gray-300'
                      )}
                    >
                      <span className="pl-3 pr-2 text-gray-400">
                        <FaCalendarAlt />
                      </span>
                      <input
                        type="date"
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                        className="w-full rounded-xl py-2 pr-3 outline-none bg-transparent text-sm"
                        aria-invalid={isRangoInvalido}
                      />
                    </div>
                  </div>

                  {/* HASTA */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Hasta{' '}
                      <span className="text-gray-400 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <div
                      className={clsx(
                        'relative flex items-center rounded-xl border bg-white transition',
                        'focus-within:ring-2 focus-within:ring-blue-300',
                        isRangoInvalido
                          ? 'border-red-300 ring-red-200'
                          : 'border-gray-300'
                      )}
                    >
                      <span className="pl-3 pr-2 text-gray-400">
                        <FaClock />
                      </span>
                      <input
                        type="date"
                        value={hasta ?? ''}
                        onChange={(e) => setHasta(e.target.value)}
                        className="w-full rounded-xl py-2 pr-10 outline-none bg-transparent text-sm"
                        placeholder="Indefinida"
                        aria-invalid={isRangoInvalido}
                      />
                      {hasta && (
                        <button
                          type="button"
                          onClick={() => setHasta('')}
                          className="absolute right-2 inline-flex items-center gap-1 text-[11px] font-semibold
                               text-gray-600 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-gray-100"
                          title="Quitar fecha hasta (indefinida)"
                        >
                          <FaBan className="opacity-80" /> Limpiar
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Dejar vacío para indefinida.
                    </p>
                  </div>
                </div>

                {/* Atajos rápidos */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-gray-500 mr-1">
                    Atajos:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDesde(new Date().toISOString().slice(0, 10))
                    }
                    className="text-[12px] px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setHasta(d.toISOString().slice(0, 10));
                    }}
                    className="text-[12px] px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  >
                    +7 días
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasta('')}
                    className="text-[12px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
                  >
                    <FaBan className="w-3 h-3" /> Indefinida
                  </button>
                </div>

                {/* Validación */}
                {isRangoInvalido && (
                  <p className="text-[12px] text-red-600 mt-1">
                    “Hasta” no puede ser anterior a “Desde”.
                  </p>
                )}
              </div>

              {/* Listado de alumnos */}
              {alumnosFiltrados.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No se encontraron alumnos
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto mb-4 space-y-2 pr-1">
                  {alumnosPaginados.map((alumno) => {
                    const selected = alumnosSeleccionados.some(
                      (a) => a.id === alumno.id
                    );
                    return (
                      <label
                        key={alumno.id}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all border',
                          selected
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'hover:bg-gray-100 border-transparent text-gray-700'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAlumnosSeleccionados((prev) => [
                                ...prev,
                                alumno
                              ]);
                            } else {
                              setAlumnosSeleccionados((prev) =>
                                prev.filter((a) => a.id !== alumno.id)
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium">
                          {alumno.nomyape}{' '}
                          {alumno.dni ? `– DNI: ${alumno.dni}` : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Ver más */}
              {alumnosFiltrados.length > alumnosPaginados.length && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => setPaginaAlumnos((prev) => prev + 1)}
                    className="text-blue-700 text-sm font-semibold hover:underline"
                  >
                    Ver más alumnos
                  </button>
                </div>
              )}

              {/* Acción */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAsignarRutinaCompleta}
                disabled={cargandoAsignacion || isRangoInvalido}
                className={clsx(
                  'w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
                  'px-4 py-3 rounded-xl font-semibold text-lg shadow-md transition',
                  'disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
                )}
              >
                {cargandoAsignacion ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="4"
                      />
                      <path
                        d="M22 12a10 10 0 0 1-10 10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                    Asignando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Asignar
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
