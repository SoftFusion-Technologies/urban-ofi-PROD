import { useEffect, useRef, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AutocompleteEjercicio({
  value,
  onTextChange,
  onSelect,
  minChars = 2,
  limit = 10,
  apiUrl = 'https://vps-5097245-x.dattaweb.com/catalogo-ejercicios',
  placeholder = 'Nombre del ejercicio'
}) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const skipNextRef = useRef(false); // 👈 evita re-buscar tras seleccionar

  useEffect(() => setQ(value || ''), [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    // 👇 Si venimos de un select, NO busques esta vez
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    if (q.trim().length < minChars) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      setOptions([]);
      setOpen(false);
      setHighlight(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: String(limit),
          q
        });
        const res = await fetch(`${apiUrl}?${params.toString()}`, {
          signal: abortRef.current.signal
        });
        const data = await res.json();
        const rows = Array.isArray(data?.rows)
          ? data.rows
          : Array.isArray(data)
          ? data
          : [];
        setOptions(rows);
        setOpen(true);
        setHighlight(rows.length ? 0 : -1);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [q, apiUrl, limit, minChars]);

  function handleSelect(item) {
    // 🔒 Cancelar todo y cerrar
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    skipNextRef.current = true; // 👈 evita que el próximo cambio de q dispare búsqueda
    setOpen(false);
    setOptions([]);
    setHighlight(-1);

    // Actualizar input y notificar selección
    setQ(item.nombre);
    onTextChange?.(item.nombre);
    onSelect?.(item);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open && options.length) setOpen(true);
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlight >= 0 && options[highlight]) {
        handleSelect(options[highlight]);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative"
      ref={wrapperRef}
      role="combobox"
      aria-expanded={open}
    >
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onTextChange?.(e.target.value);
          }}
          onFocus={() => {
            if (options.length) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="border p-2 rounded w-full pr-9"
          aria-autocomplete="list"
          aria-controls="ac-ejercicios-listbox"
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {open && (
        <div
          id="ac-ejercicios-listbox"
          role="listbox"
          className="absolute z-30 mt-1 w-full bg-white border rounded-xl shadow-2xl max-h-64 overflow-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
          )}
          {!loading && options.length === 0 && q.trim().length >= minChars && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Sin resultados
            </div>
          )}
          {!loading &&
            options.map((opt, idx) => (
              <div
                key={opt.id}
                role="option"
                aria-selected={idx === highlight}
                className={`px-3 py-2 cursor-pointer ${
                  idx === highlight ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={() => handleSelect(opt)} // mousedown evita perder foco antes de seleccionar
              >
                <div className="text-sm font-medium text-gray-900">
                  {opt.nombre}
                </div>
                <div className="text-xs text-gray-500">
                  {opt.musculo || '—'}
                </div>
                {opt.aliases && (
                  <div className="text-[11px] text-gray-400 italic truncate">
                    {opt.aliases}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
