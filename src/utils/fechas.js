// utils/fechas.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

/**
 * Muestra DD-MM-YYYY a partir de:
 * - MySQL DATETIME: "YYYY-MM-DD HH:mm:ss" (sin zona)
 * - ISO UTC: "YYYY-MM-DDTHH:mm:ssZ"
 * - DATEONLY: "YYYY-MM-DD"
 */
export function formatDdMmYyyySmart(input) {
  if (!input) return '';

  const str = String(input);

  // 1) DATEONLY (sin hora)
  if (
    str.length >= 10 &&
    str[4] === '-' &&
    str[7] === '-' &&
    (str.length === 10 || str[10] !== 'T')
  ) {
    // tomar solo los 10 primeros caracteres, sin construir Date (evita TZ)
    const [y, m, d] = str.slice(0, 10).split('-');
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // 2) DATETIME MySQL "YYYY-MM-DD HH:mm:ss" → interpretarlo como hora local AR
  if (str.includes(' ') && !str.endsWith('Z')) {
    // Reemplazo espacio por 'T' y parseo con dayjs.tz en AR
    const normalized = str.replace(' ', 'T');
    const d = dayjs.tz(normalized, 'YYYY-MM-DDTHH:mm:ss', TZ);
    return d.isValid() ? d.format('DD-MM-YYYY') : '';
  }

  // 3) ISO con Z → viene en UTC, convertir a AR
  const d = dayjs.utc(str).tz(TZ);
  return d.isValid() ? d.format('DD-MM-YYYY') : '';
}
