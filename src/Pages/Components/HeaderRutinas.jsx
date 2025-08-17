import { useEffect, useState } from 'react';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

// helpers para los inputs date
const tsUtcToLocalDate = (ts) =>
  ts ? dayjs.utc(ts).tz(TZ).format('YYYY-MM-DD') : '';
const dateOnlyToInput = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '');

export default function HeaderRutinasFijo({
  rutinas,
  formatDdMmYyyySmart,
  onUpdated
}) {
  const rutina = rutinas?.[0] || null;
  const [editMode, setEditMode] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar valores cuando cambia la rutina
  useEffect(() => {
    if (!rutina) {
      setDesde('');
      setHasta('');
      setEditMode(false);
      return;
    }
    setDesde(tsUtcToLocalDate(rutina.desde)); // ✅ sin -1 día
    setHasta(rutina.hasta ? dateOnlyToInput(rutina.hasta) : '');
    setEditMode(false);
  }, [rutina?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!rutina) return;
    try {
      setSaving(true);
      const payload = {
        ...(desde ? { desde: `${desde} 00:00:00` } : {}),
        ...(hasta === '' ? { hasta: null } : hasta ? { hasta } : {})
      };
      await fetch(`https://vps-5097245-x.dattaweb.com/rutinas/${rutina.id}/fechas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditMode(false);
      onUpdated?.();
    } catch (e) {
      console.error(e);
      alert('No se pudieron actualizar las fechas.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!rutina) return;
    setDesde(tsUtcToLocalDate(rutina.desde));
    setHasta(rutina.hasta ? dateOnlyToInput(rutina.hasta) : '');
    setEditMode(false);
  };

  return (
    <div className="relative">
      <h2 className="titulo uppercase text-3xl font-bold text-center text-gray-800">
        Rutinas vigentes
        {rutinas.length > 0 && !editMode && (
          <>
            <br />
            <span className="text-lg font-normal text-gray-500 block mt-2 tracking-wide">
              DESDE {formatDdMmYyyySmart(rutina.desde)} HASTA{' '}
              {rutina.hasta ? formatDdMmYyyySmart(rutina.hasta) : 'Indefinida'}
            </span>
          </>
        )}
        {rutinas.length > 0 && editMode && (
          <>
            <br />
            <span className="block mt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-lg font-normal text-gray-500 tracking-wide">
                    DESDE
                  </span>
                  <input
                    type="date"
                    className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                  />
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-lg font-normal text-gray-500 tracking-wide">
                    HASTA
                  </span>
                  <input
                    type="date"
                    className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    placeholder="Indefinida"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 shadow-sm transition disabled:opacity-60"
                    title="Guardar"
                    aria-label="Guardar"
                  >
                    <FaCheck />
                  </button>

                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 transition disabled:opacity-60"
                    title="Cancelar"
                    aria-label="Cancelar"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </span>
          </>
        )}
      </h2>

      {/* Lápiz flotante: no desplaza ni rompe el centrado */}
      {rutina && !editMode && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
          onClick={() => setEditMode(true)}
          title="Editar fechas"
          aria-label="Editar fechas"
        >
          <FaPencilAlt className="text-lg" />
        </button>
      )}
    </div>
  );
}
