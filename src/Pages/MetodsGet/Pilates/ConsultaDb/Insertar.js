import { useState } from "react";
import axios from "axios";

const BASE_URL = "https://vps-5097245-x.dattaweb.com";

const useInsertar = (endpoint) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (err) {
      setError(err.message || "Error al insertar");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { insert, isLoading, error };
};

export default useInsertar;