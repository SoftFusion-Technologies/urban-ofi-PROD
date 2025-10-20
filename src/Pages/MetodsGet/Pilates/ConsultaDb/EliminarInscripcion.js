// hooks/useDeleteInscripcionesPilates.js
import { useState } from "react";
import axios from "axios";

const useDeleteInscripcionesPilates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteInscripciones = async (clienteId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await axios.delete(`https://vps-5097245-x.dattaweb.com/inscripciones-pilates/${clienteId}`);

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.mensajeError || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteInscripciones, loading, error, success };
};

export default useDeleteInscripcionesPilates;
