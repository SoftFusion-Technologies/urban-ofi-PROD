import { useState } from "react";
import axios from "axios";

const useInsertClientePilates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const insertCliente = async (
    clienteData,
    inscripcionData,
    modify = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      let clienteId;

      if (modify && clienteData.id) {
        // Modificación del cliente existente (no se toca la inscripción)
        const response = await axios.put(
          `https://vps-5097245-x.dattaweb.com/clientes-pilates/${clienteData.id}`,
          clienteData
        );
        clienteId = response.data.cliente.id;
      } else {
        // Crear cliente nuevo
        const response = await axios.post(
          "https://vps-5097245-x.dattaweb.com/clientes/insertar",
          clienteData
        );
        clienteId = response.data.cliente.id;

        try {
          // Intentar crear inscripción
          await axios.post("https://vps-5097245-x.dattaweb.com/inscripciones-pilates", {
            ...inscripcionData,
            id_cliente: clienteId,
          });
        } catch (errorInscripcion) {
          // Si falla la inscripción, eliminar cliente recién creado
          await axios.delete(`https://vps-5097245-x.dattaweb.com/clientes-pilates/con-inscripciones/${clienteId}`);
          throw new Error(
            `La inscripción falló y se eliminó el cliente: ${errorInscripcion.response?.data?.mensajeError || errorInscripcion.message}`
          );
        }
      }

      setSuccess(true);
      return { clienteId };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insertCliente, loading, error, success };
};

export default useInsertClientePilates;
