// SeriesSelector.jsx
import React, { useCallback } from 'react';

export default function SeriesSelector({
  value = 1,
  min = 1,
  max = 10,
  onChange = () => {},
  className = ''
}) {
  const setSafe = useCallback(
    (v) => onChange(Math.min(max, Math.max(min, Number(v) || min))),
    [min, max, onChange]
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label={`Cantidad de series (${min}-${max})`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSafe(value - 1);
        if (e.key === 'ArrowRight') setSafe(value + 1);
      }}
      tabIndex={0}
    >
      {/* Botonera 1..10: clic = set inmediato */}
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => {
          const active = n === Number(value);
          return (
            <button
              key={n}
              type="button"
              onClick={() => setSafe(n)}
              className={[
                'h-9 min-w-9 px-3 rounded-xl text-sm font-semibold border transition',
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-orange-50 border-gray-300'
              ].join(' ')}
              aria-pressed={active}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Input chico para tipeo rápido */}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setSafe(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="w-16 mb-2 h-9 text-center border rounded-md"
        aria-label="Editar cantidad de series manualmente"
      />
    </div>
  );
}
