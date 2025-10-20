import { useState, useEffect } from "react";
import axios from "axios";

const URL = "https://vps-5097245-x.dattaweb.com";

const useConsultaDB = (endpoint) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}${endpoint}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

export default useConsultaDB;
