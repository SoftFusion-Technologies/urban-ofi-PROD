// SeriesEditorPro.jsx
import React from 'react';

function batchOrLoop({
  patches,
  onBulkUpdate,
  actualizarSerie,
  startTransition
}) {
  if (onBulkUpdate) {
    onBulkUpdate(patches); // 1 solo set
  } else {
    startTransition(() => {
      patches.forEach((p) => {
        actualizarSerie(p.bloqueIdx, p.ejIdx, p.serieIdx, p.field, p.value);
      });
    });
  }
}

const SeriesRow = React.memo(
  function SeriesRow({
    i,
    s,
    soloReps,
    refs,
    onChangeField,
    onStepReps,
    onCopyRepsToEmpty
  }) {
    const inputRef = (field) => (el) => {
      refs.current[field][i] = el;
    };

    const onKeyNav = (e, field) => {
      if (!['Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? -1 : 1;
      const next = e.key === 'Enter' ? i + 1 : i + delta;
      const arr = refs.current[field];
      if (next >= 0 && next < arr.length) {
        arr[next]?.focus?.();
        arr[next]?.select?.();
      }
    };

    // inputs numéricos: guardo local y commiteo en blur (suaviza mobile)
    const [localReps, setLocalReps] = React.useState(s.repeticiones ?? '');
    const [localKg, setLocalKg] = React.useState(s.kg ?? '');

    React.useEffect(() => setLocalReps(s.repeticiones ?? ''), [s.repeticiones]);
    React.useEffect(() => setLocalKg(s.kg ?? ''), [s.kg]);

    return (
      <>
        <div className="text-sm text-slate-700">S{i + 1}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-md border"
            onClick={() => onStepReps(i, -1)}
            aria-label="Restar repetición"
          >
            −
          </button>

          <input
            ref={inputRef('reps')}
            type="number"
            inputMode="numeric"
            className="p-2 rounded-md border text-sm w-full"
            placeholder="Reps"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={() => onChangeField(i, 'repeticiones', localReps)}
            onKeyDown={(e) => onKeyNav(e, 'reps')}
          />

          {Number(s.repeticiones) > 0 && (
            <button
              type="button"
              className="px-2 py-1 rounded-md border text-xs whitespace-nowrap"
              onClick={() => onCopyRepsToEmpty(Number(s.repeticiones))}
            >
              Copiar
            </button>
          )}

          <button
            type="button"
            className="w-9 h-9 rounded-md border"
            onClick={() => onStepReps(i, +1)}
            aria-label="Sumar repetición"
          >
            +
          </button>
        </div>

        {!soloReps && (
          <>
            <input
              ref={inputRef('desc')}
              type="text"
              className="p-2 rounded-md border text-sm"
              placeholder="Ej: 60s"
              value={s.descanso ?? ''}
              onChange={(e) => onChangeField(i, 'descanso', e.target.value)}
              onKeyDown={(e) => onKeyNav(e, 'desc')}
            />
            <input
              ref={inputRef('time')}
              type="text"
              className="p-2 rounded-md border text-sm"
              placeholder="Ej: TUT 3-1-3"
              value={s.tiempo ?? ''}
              onChange={(e) => onChangeField(i, 'tiempo', e.target.value)}
              onKeyDown={(e) => onKeyNav(e, 'time')}
            />
            <input
              ref={inputRef('kg')}
              type="number"
              inputMode="numeric"
              className="p-2 rounded-md border text-sm"
              placeholder="Kg"
              value={localKg}
              onChange={(e) => setLocalKg(e.target.value)}
              onBlur={() => onChangeField(i, 'kg', localKg)}
              onKeyDown={(e) => onKeyNav(e, 'kg')}
            />
          </>
        )}
      </>
    );
  },
  // shallow compare por campos usados
  (prev, next) => {
    const a = prev.s,
      b = next.s;
    return (
      prev.soloReps === next.soloReps &&
      a.repeticiones === b.repeticiones &&
      a.descanso === b.descanso &&
      a.tiempo === b.tiempo &&
      a.kg === b.kg
    );
  }
);

export default function SeriesEditorPro({
  ej,
  bloqueIdx,
  ejIdx,
  actualizarSerie,
  replicarEjercicio,
  onBulkUpdate, // opcional: (patches[]) => void  (recomendado para máxima performance)
  className = '',
  defaultSoloReps = true
}) {
  const [soloReps, setSoloReps] = React.useState(defaultSoloReps);
  const [, startTransition] = React.useTransition();

  // refs para navegación
  const refs = React.useRef({
    reps: Array(ej.series.length),
    desc: Array(ej.series.length),
    time: Array(ej.series.length),
    kg: Array(ej.series.length)
  });

  // ------- derivados memo -------
  const { firstVal, emptyIdxs, canProgress, progressionLabel, step } =
    React.useMemo(() => {
      const toInt = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
      };
      const isFilled = (n) => Number.isFinite(n) && n > 0;

      const reps = ej.series.map((s) => toInt(s.repeticiones));
      const total = reps.length;
      const firstFilledIdx = reps.findIndex(isFilled);
      const _firstVal = firstFilledIdx >= 0 ? reps[firstFilledIdx] : null;
      const _emptyIdxs = reps
        .map((n, i) => (!isFilled(n) ? i : -1))
        .filter((i) => i !== -1);
      const secondFilledIdx =
        firstFilledIdx >= 0
          ? reps.findIndex((n, i) => i > firstFilledIdx && isFilled(n))
          : -1;

      const _canProg = firstFilledIdx >= 0 && secondFilledIdx >= 0;
      const a = _canProg ? reps[firstFilledIdx] : null;
      const b = _canProg ? reps[secondFilledIdx] : null;
      const _step = _canProg ? a - b : null;

      let label = null;
      if (_canProg) {
        let seq = [a, b];
        let prev = b;
        for (let i = secondFilledIdx + 1; i < total; i++) {
          prev = Math.max(1, prev - _step);
          seq.push(prev);
        }
        label = seq.join('→');
      }

      return {
        firstVal: _firstVal,
        emptyIdxs: _emptyIdxs,
        canProgress: _canProg,
        progressionLabel: label,
        step: _step
      };
    }, [ej.series]);

  // ------- acciones memo -------
  const changeField = React.useCallback(
    (i, field, value) => {
      batchOrLoop({
        patches: [{ bloqueIdx, ejIdx, serieIdx: i, field, value }],
        onBulkUpdate,
        actualizarSerie,
        startTransition
      });
    },
    [bloqueIdx, ejIdx, onBulkUpdate, actualizarSerie, startTransition]
  );

  const stepReps = React.useCallback(
    (i, delta) => {
      const curr = Number(ej.series[i].repeticiones) || 0;
      const next = Math.max(0, curr + delta);
      changeField(i, 'repeticiones', next);
    },
    [ej.series, changeField]
  );

  const copyRepsToEmpty = React.useCallback(
    (val) => {
      const patches = emptyIdxs.map((serieIdx) => ({
        bloqueIdx,
        ejIdx,
        serieIdx,
        field: 'repeticiones',
        value: val
      }));
      if (patches.length) {
        batchOrLoop({
          patches,
          onBulkUpdate,
          actualizarSerie,
          startTransition
        });
      }
    },
    [
      emptyIdxs,
      bloqueIdx,
      ejIdx,
      onBulkUpdate,
      actualizarSerie,
      startTransition
    ]
  );

  const applyProgression = React.useCallback(() => {
    if (!canProgress) return;
    const patches = [];
    const reps = ej.series.map((s) => Number(s.repeticiones) || 0);
    const firstFilledIdx = reps.findIndex((n) => n > 0);
    const secondFilledIdx = reps.findIndex(
      (n, i) => i > firstFilledIdx && n > 0
    );
    let prev = reps[secondFilledIdx];
    for (let i = secondFilledIdx + 1; i < reps.length; i++) {
      const next = Math.max(1, prev - step);
      patches.push({
        bloqueIdx,
        ejIdx,
        serieIdx: i,
        field: 'repeticiones',
        value: next
      });
      prev = next;
    }
    if (patches.length) {
      batchOrLoop({ patches, onBulkUpdate, actualizarSerie, startTransition });
    }
  }, [
    canProgress,
    step,
    ej.series,
    bloqueIdx,
    ejIdx,
    onBulkUpdate,
    actualizarSerie,
    startTransition
  ]);

  const bulkFill = React.useCallback(
    (field, val, { soloVacias = true } = {}) => {
      const patches = [];
      ej.series.forEach((s, i) => {
        const curr =
          field === 'repeticiones' || field === 'kg'
            ? Number(s[field])
            : s[field];
        const vacia =
          field === 'repeticiones' || field === 'kg' ? !(curr > 0) : !curr;
        if (!soloVacias || vacia) {
          patches.push({ bloqueIdx, ejIdx, serieIdx: i, field, value: val });
        }
      });
      if (patches.length) {
        batchOrLoop({
          patches,
          onBulkUpdate,
          actualizarSerie,
          startTransition
        });
      }
    },
    [
      ej.series,
      bloqueIdx,
      ejIdx,
      onBulkUpdate,
      actualizarSerie,
      startTransition
    ]
  );

  // ------- UI -------
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            replicarEjercicio(bloqueIdx, ejIdx);
          }}
        >
          Replicar
        </button>

        <button
          type="button"
          className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs"
          onClick={() => setSoloReps((v) => !v)}
        >
          {soloReps ? 'Mostrar avanzado' : 'Solo reps'}
        </button>

        {/* Relleno masivo Reps */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-slate-600">Reps:</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="→ vacías"
            className="w-20 h-9 px-2 border rounded-md text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                bulkFill('repeticiones', e.currentTarget.value, {
                  soloVacias: true
                });
            }}
            aria-label="Rellenar reps (vacías)"
          />
          <button
            type="button"
            className="px-2 py-1 border rounded-md text-xs"
            onClick={(e) => {
              const input = e.currentTarget.previousSibling;
              bulkFill('repeticiones', input.value, { soloVacias: true });
            }}
          >
            Aplicar
          </button>
          <button
            type="button"
            className="px-2 py-1 border rounded-md text-xs"
            title="Rellenar todas (pisar)"
            onClick={(e) => {
              const input = e.currentTarget.previousSibling.previousSibling;
              bulkFill('repeticiones', input.value, { soloVacias: false });
            }}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Sugerencias */}
      <div className="flex flex-wrap items-center gap-2">
        {Number.isFinite(firstVal) && emptyIdxs.length > 0 && (
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
            onClick={() => copyRepsToEmpty(firstVal)}
          >
            {ej.series.length} × {firstVal}
          </button>
        )}
        {canProgress && (
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm"
            onClick={applyProgression}
          >
            Progresión {progressionLabel}
          </button>
        )}
      </div>

      {/* Layout responsive */}
      {/* Mobile: cards */}
      <div className="grid md:hidden gap-3">
        {ej.series.map((s, i) => (
          <div key={i} className="rounded-xl border p-3 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Serie S{i + 1}
              </span>
              {Number(s.repeticiones) > 0 && (
                <button
                  type="button"
                  className="px-2 py-1 rounded-md border text-xs"
                  onClick={() => copyRepsToEmpty(Number(s.repeticiones))}
                >
                  Copiar a vacías
                </button>
              )}
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
              <button
                type="button"
                className="w-10 h-10 rounded-md border"
                onClick={() => stepReps(i, -1)}
              >
                −
              </button>
              {/* input controlado con commit onBlur */}
              <SeriesRow
                // reuse estructura pero solo reps aquí → aprovechamos memo
                i={i}
                s={s}
                soloReps={true}
                refs={refs}
                onChangeField={changeField}
                onStepReps={stepReps}
                onCopyRepsToEmpty={copyRepsToEmpty}
              />
              <button
                type="button"
                className="w-10 h-10 rounded-md border"
                onClick={() => stepReps(i, +1)}
              >
                +
              </button>
            </div>

            {!soloReps && (
              <div className="grid grid-cols-2 gap-2">
                {/* solo renderizo campos avanzados */}
                <input
                  ref={(el) => (refs.current.desc[i] = el)}
                  type="text"
                  className="w-full h-9 px-3 rounded-md border"
                  placeholder="Descanso (ej: 60s)"
                  value={s.descanso ?? ''}
                  onChange={(e) => changeField(i, 'descanso', e.target.value)}
                />
                <input
                  ref={(el) => (refs.current.time[i] = el)}
                  type="text"
                  className="w-full h-9 px-3 rounded-md border"
                  placeholder="Tiempo / TUT"
                  value={s.tiempo ?? ''}
                  onChange={(e) => changeField(i, 'tiempo', e.target.value)}
                />
                <input
                  ref={(el) => (refs.current.kg[i] = el)}
                  type="number"
                  inputMode="numeric"
                  className="col-span-2 w-full h-9 px-3 rounded-md border"
                  placeholder="Kg"
                  value={s.kg ?? ''}
                  onChange={(e) => changeField(i, 'kg', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: tabla compacta (usa filas memoizadas) */}
      <div
        className={`hidden md:grid ${
          soloReps ? 'grid-cols-[70px_1fr]' : 'grid-cols-[70px_1fr_1fr_1fr_1fr]'
        } gap-2 items-center`}
      >
        <div className="text-xs font-semibold text-slate-500">Serie</div>
        <div className="text-xs font-semibold text-slate-500">Reps</div>
        {!soloReps && (
          <>
            <div className="text-xs font-semibold text-slate-500">Descanso</div>
            <div className="text-xs font-semibold text-slate-500">Tiempo</div>
            <div className="text-xs font-semibold text-slate-500">Kg</div>
          </>
        )}

        {ej.series.map((s, i) => (
          <SeriesRow
            key={i}
            i={i}
            s={s}
            soloReps={soloReps}
            refs={refs}
            onChangeField={changeField}
            onStepReps={stepReps}
            onCopyRepsToEmpty={copyRepsToEmpty}
          />
        ))}
      </div>
    </div>
  );
}
