// src/pages/LogsGlobalAlumno.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiSearch,
  FiCalendar,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCw,
  FiArrowLeft,
  FiGrid,
  FiActivity,
  FiHash
} from 'react-icons/fi';
import Navbar from '../../../Components/Header/NavBar/NavBar';
import NavbarStaff from '../../staff/NavbarStaff';
import { formatDdMmYyyySmart } from '../../../utils/fechas';

const API = 'https://vps-5097245-x.dattaweb.com';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default function LogsGlobalAlumno() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // query params
  const student_id = sp.get('student_id') || '';
  const [page, setPage] = useState(Number(sp.get('page') || 1));
  const [limit, setLimit] = useState(Number(sp.get('limit') || 20));
  const [q, setQ] = useState(sp.get('q') || '');
  const [dateFrom, setDateFrom] = useState(sp.get('date_from') || '');
  const [dateTo, setDateTo] = useState(sp.get('date_to') || '');

  // data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const canSearch = useMemo(() => Boolean(student_id), [student_id]);
  const topRef = useRef(null);

  // sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (student_id) next.set('student_id', student_id);
    next.set('page', String(page));
    next.set('limit', String(limit));
    if (q) next.set('q', q);
    if (dateFrom) next.set('date_from', dateFrom);
    if (dateTo) next.set('date_to', dateTo);
    setSp(next, { replace: true });
  }, [student_id, page, limit, q, dateFrom, dateTo, setSp]);

  // fetch colores de bloques (para acentos)
  useEffect(() => {
    let cancel = false;
    axios
      .get(`${API}/rutina-colores`)
      .then(
        (res) => !cancel && setColors(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => !cancel && setColors([]));
    return () => {
      cancel = true;
    };
  }, []);

  const getColorHex = (id) =>
    colors.find((c) => c.id === id)?.color_hex || '#93c5fd'; // azul claro fallback

  // fetch logs
  useEffect(() => {
    if (!canSearch) return;
    let cancel = false;
    const fetchData = async () => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await axios.get(
          `${API}/routine_exercise_logs/global`,
          {
            params: {
              student_id,
              page,
              limit,
              q: q || undefined,
              date_from: dateFrom || undefined,
              date_to: dateTo || undefined
            }
          }
        );
        if (cancel) return;
        setRows(Array.isArray(data?.rows) ? data.rows : []);
        setTotal(Number(data?.total || 0));
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        if (!cancel) {
          setRows([]);
          setTotal(0);
          setErr('No se pudo cargar el registro global.');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancel = true;
    };
  }, [student_id, page, limit, q, dateFrom, dateTo, canSearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const clearFilters = () => {
    setQ('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const setToday = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;
    setDateFrom(today);
    setDateTo(today);
    setPage(1);
  };

  return (
    <>
      <NavbarStaff></NavbarStaff>
      <div className="min-h-screen bg-blue-600">
        {/* Decor superior */}
        <div className="relative">
          <div className="absolute -top-24 right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -top-10 left-[-40px] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div ref={topRef} className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          {/* Header */}
          <header className="pt-6 sm:pt-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition"
            >
              <FiArrowLeft /> Volver
            </button>

            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Registro global del alumno
            </h1>
            <div className="mt-1 text-white/80">
              Alumno ID: <b className="text-white">{student_id || '—'}</b>
            </div>
          </header>

          {/* Filtros sticky (glass) */}
          <div className="sticky top-0 z-20 mt-5">
            <div className="backdrop-blur bg-white/25 border border-white/30 shadow-xl rounded-2xl">
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* búsqueda */}
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-semibold text-white/90 mb-1">
                      Buscar (rutina / bloque / ejercicio)
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                      <input
                        value={q}
                        onChange={(e) => {
                          setQ(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Ej: Curl, Pecho, Fuerza"
                        className="w-full rounded-xl pl-10 pr-10 py-2.5 bg-white/90 focus:bg-white text-gray-900 placeholder-gray-400 border border-white/70 focus:ring-2 focus:ring-white/60 outline-none"
                      />
                      {q && (
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setQ('');
                            setPage(1);
                          }}
                          aria-label="Limpiar búsqueda"
                        >
                          <FiXCircle />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* fechas */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-white/90 mb-1">
                      Desde
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-xl pl-10 pr-3 py-2.5 bg-white/90 focus:bg-white text-gray-900 border border-white/70 focus:ring-2 focus:ring-white/60 outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-white/90 mb-1">
                      Hasta
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-xl pl-10 pr-3 py-2.5 bg-white/90 focus:bg-white text-gray-900 border border-white/70 focus:ring-2 focus:ring-white/60 outline-none"
                      />
                    </div>
                  </div>

                  {/* acciones */}
                  <div className="md:col-span-3 flex gap-2 md:justify-end">
                    <button
                      onClick={setToday}
                      className="flex-1 md:flex-none px-3 py-2.5 rounded-xl bg-white/30 hover:bg-white/40 text-white font-semibold text-sm transition"
                      title="Filtrar hoy"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={clearFilters}
                      className="flex-1 md:flex-none px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition"
                      disabled={loading}
                    >
                      Limpiar
                    </button>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-white/90">/ pág</label>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="rounded-lg px-2 py-2 bg-white/90 text-gray-900 border border-white/70 outline-none"
                      >
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                      <button
                        onClick={() => setPage((p) => p)}
                        className="px-3 py-2 rounded-xl bg-white/30 hover:bg-white/40 text-white transition"
                        title="Refrescar"
                      >
                        <FiRotateCw />
                      </button>
                    </div>
                  </div>
                </div>

                {/* resumen */}
                <div className="mt-2 text-[12px] text-white/90">
                  {loading ? (
                    'Cargando…'
                  ) : (
                    <>
                      Mostrando <b>{from}</b>–<b>{to}</b> de <b>{total}</b>{' '}
                      registros
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* contenido */}
          <main className="mt-6">
            {err && (
              <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 shadow">
                {err}
              </div>
            )}

            {/* skeletons */}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden border border-white/30 bg-white/40 backdrop-blur"
                  >
                    <div className="h-10 bg-white/50 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-white/60 animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-white/60 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && rows.length === 0 && (
              <div className="p-6 rounded-2xl border border-white/40 bg-white/40 backdrop-blur text-white shadow text-center">
                No hay registros para los filtros aplicados.
              </div>
            )}

            {!loading && rows.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rows.map((r) => {
                  const color = getColorHex(r?.bloque?.color_id);
                  return (
                    <article
                      key={r.id}
                      className="rounded-2xl border border-white/40 bg-white/95 shadow-xl overflow-hidden"
                    >
                      {/* header rutina con barra de color */}
                      <div
                        className="px-4 py-2 text-xs text-gray-700 flex items-center justify-between"
                        style={{
                          background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0) 70%)`
                        }}
                      >
                        <div className="truncate">
                          <span className="font-semibold">
                            {r.rutina?.nombre ? r.rutina.nombre : 'Rutina'}
                          </span>
                          <span className="mx-1 text-gray-500">·</span>
                          <span className="tabular-nums text-gray-700">
                            Fecha de carga: {formatDdMmYyyySmart(r.fecha)}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          ID #{r.id}
                        </span>
                      </div>

                      {/* body */}
                      <div className="p-4">
                        {/* chips breadcrumb */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${color}20`,
                              color: '#1e40af'
                            }}
                          >
                            <FiGrid className="text-[12px]" />
                            {r.bloque?.nombre || 'Bloque'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                            <FiActivity className="text-[12px]" />
                            {r.ejercicio?.nombre || 'Ejercicio'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            <FiHash className="text-[12px]" />
                            Serie {r.serie?.numero_serie ?? '—'}
                          </span>
                        </div>

                        {/* peso + fecha */}
                        <div className="flex items-baseline justify-between">
                          <div className="text-3xl font-black tracking-tight text-gray-900">
                            {r.peso != null
                              ? `${Number(r.peso).toFixed(2)} kg`
                              : '— kg'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fmtDate(r.fecha)}
                          </div>
                        </div>

                        {/* observaciones */}
                        {r.observaciones && (
                          <p className="mt-2 text-sm text-gray-600 italic line-clamp-3">
                            {r.observaciones}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* paginación */}
            {!loading && total > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-white/90">
                  Mostrando <b className="text-white">{from}</b>–
                  <b className="text-white">{to}</b> de{' '}
                  <b className="text-white">{total}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                  >
                    « Primera
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <FiChevronLeft className="inline -mt-0.5" /> Anterior
                  </button>
                  <div className="text-sm text-white/90">
                    Página <b className="text-white">{page}</b> /{' '}
                    {Math.max(1, Math.ceil(total / limit))}
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                    onClick={() =>
                      setPage((p) => Math.min(Math.ceil(total / limit), p + 1))
                    }
                    disabled={page >= Math.ceil(total / limit)}
                  >
                    Siguiente <FiChevronRight className="inline -mt-0.5" />
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
                    onClick={() => setPage(Math.ceil(total / limit))}
                    disabled={page >= Math.ceil(total / limit)}
                  >
                    Última »
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
