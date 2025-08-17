import axios from 'axios';

const API =
  import.meta.env.VITE_API_URL || 'https://vps-5097245-x.dattaweb.com';

export const getUltimosPorSerie = async (serieIds = []) => {
  if (!serieIds.length) return { data: [] };
  const { data } = await axios.get(`${API}/pse/ultimos-por-serie`, {
    params: { serie_ids: serieIds.join(',') }
  });
  return data; // { data: [ { id, serie_id, rpe_real, rir, fecha_registro, ... } ] }
};

export const createPSESerie = async (payload) => {
  // payload: { student_id, serie_id, ejercicio_id, rutina_id?, rpe_real, rir?, escala?, comentarios? }
  const { data } = await axios.post(`${API}/pse/serie`, payload);
  return data; // { message, pse }
};

export const createPSESesion = async (payload) => {
  // payload: { student_id, rutina_id, rpe_real, duracion_min, escala?, comentarios? }
  const { data } = await axios.post(`${API}/pse/sesion`, payload);
  return data; // { message, pse }
};

export const getCargaSesion = async (params) => {
  // params: { student_id, rutina_id, fecha_desde?, fecha_hasta? }
  const { data } = await axios.get(`${API}/pse/carga-sesion`, { params });
  return data; // { carga_sesion, registros }
};

export const createPSEGeneric = async (payload) => {
  // payload incluye nivel: 'bloque' | 'ejercicio' (o 'rutina'/'serie' si quisieras)
  const { data } = await axios.post(`${API}/pse`, payload);
  return data; // { message, pse }
};
