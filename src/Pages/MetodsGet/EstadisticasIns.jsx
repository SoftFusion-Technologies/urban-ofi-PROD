import React, { useEffect, useState } from 'react';
import '../../Styles/login.css';
import NavbarStaff from '../staff/NavbarStaff';
import axios from 'axios';
import CountUp from 'react-countup';
import 'react-circular-progressbar/dist/styles.css';
import ParticlesBackground from '../../Components/ParticlesBackground';

const EstadisticaCard = ({ titulo, contenido }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/3 m-2 text-center">
      <h3 className="text-xl font-bold text-blue-600">{titulo}</h3>
      <p className="text-3xl font-extrabold text-blue-700 mt-2">
        <CountUp start={0} end={contenido} duration={2.5} separator="," />
      </p>
    </div>
  );
};

const EstadisticasIns = () => {
  const [alumnosPorProfesor, setAlumnosPorProfesor] = useState([]);
  const [rutinasPorProfesor, setRutinasPorProfesor] = useState([]);
  const [ayudasResueltasPorProfesor, setAyudasResueltasPorProfesor] = useState(
    []
  );
  const [feedbacksPorProfesor, setFeedbacksPorProfesor] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentYear] = useState(new Date().getFullYear()); // Año actual

  const [selectedMonthName, setSelectedMonthName] = useState(''); // Nombre del mes seleccionado
  const [selectedYear, setSelectedYear] = useState(currentYear); // Año seleccionado
  const [currentMonth] = useState(new Date().getMonth() + 1); // Mes actual
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // Mes seleccionado
  // Estados adicionales
  const [deleteYear, setDeleteYear] = useState('');

  useEffect(() => {
    // Función para convertir el número del mes al nombre del mes
    const getMonthName = (month) => {
      const months = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE'
      ];
      return months[month - 1];
    };

    // Actualizar el nombre del mes seleccionado
    setSelectedMonthName(getMonthName(selectedMonth));
  }, [selectedMonth]); // Solo se ejecuta cuando `selectedMonth` cambia

  const URL = 'https://vps-5097245-x.dattaweb.com';
  // Fetch de datos desde el backend
  useEffect(() => {
    // fetchTotalAlumnosP(selectedMonth, selectedYear);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('Mes:', selectedMonth);
    console.log('Año:', selectedYear);
    if (selectedMonth && selectedYear) {
      // fetchTotalAlumnosP(selectedMonth, selectedYear);
      fetchAlumnosPorProfesor();
      fetchRutinasPorProfesor();
      fetchAyudasResueltasPorProfesor();
      fetchFeedbacksPorProfesor();
    }
  }, [selectedMonth, selectedYear]);

  const fetchAlumnosPorProfesor = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/alumnos-por-profesor`
      );
      setAlumnosPorProfesor(response.data);
    } catch (error) {
      console.error('Error al obtener alumnos por profesor:', error);
    }
  };

  const fetchRutinasPorProfesor = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/rutinas-por-profesor`,
        {
          params: {
            mes: selectedMonth,
            anio: selectedYear
          }
        }
      );
      setRutinasPorProfesor(response.data);
    } catch (error) {
      console.error('Error al obtener rutinas por profesor:', error);
    }
  };

  const fetchAyudasResueltasPorProfesor = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/ayudas-por-profesor`,
        {
          params: {
            mes: selectedMonth,
            anio: selectedYear
            // instructor_id no se envía para obtener stats de todos
          }
        }
      );
      setAyudasResueltasPorProfesor(response.data);
    } catch (error) {
      console.error('Error al obtener ayudas resueltas:', error);
    }
  };

  const fetchFeedbacksPorProfesor = async () => {
    setFeedbacksPorProfesor([]); // Limpia antes de traer nuevos
    try {
      const response = await axios.get(
        `${URL}/estadisticas/feedbacks-por-profesor`,
        {
          params: {
            mes: selectedMonth,
            anio: selectedYear
          }
        }
      );
      setFeedbacksPorProfesor(response.data);
    } catch (error) {
      console.error('Error al obtener feedbacks por profesor:', error);
      setFeedbacksPorProfesor([]); // Asegura que no se muestren datos antiguos
    }
  };
  
  // Función para retroceder al mes anterior
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prevYear) => prevYear - 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prevYear) => prevYear + 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth + 1);
    }
  };

  return (
    <>
      <NavbarStaff />

      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 h-contain pt-10 pb-10">
        <ParticlesBackground></ParticlesBackground>
        <h1 className="titulo text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          {selectedMonthName} {selectedYear}
        </h1>

        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-transparent text-white rounded border-2 border-white hover:bg-orange-600 transition duration-300"
            onClick={handlePreviousMonth}
          >
            Mes Anterior
          </button>
          <button
            className="px-4 py-2 bg-transparent text-white rounded border-2 border-white hover:bg-orange-600 transition duration-300"
            onClick={handleNextMonth}
          >
            Mes Siguiente
          </button>
        </div>

        {/* Título de "Total de Alumnos" */}
        <hr className="border-t border-white w-full my-4" />
        <h1 className="titulo text-5xl font-bold text-white mb-8 text-center mt-10 uppercase">
          Total de Alumnos por Profesor
        </h1>

        <div className="flex flex-wrap justify-center w-full gap-6">
          {alumnosPorProfesor.length === 0 ? (
            <p className="text-white text-xl">No hay datos disponibles.</p>
          ) : (
            alumnosPorProfesor.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Profesor: ${stat.profesor_nombre}`}
                contenido={stat.total_alumnos}
              />
            ))
          )}
        </div>

        <hr className="border-t border-white w-full my-4" />

        {/* Título de "Total de Rutinas" */}
        <h1 className="titulo text-5xl font-bold text-white mb-8 text-center mt-10 uppercase">
          Total de Rutinas por Profesor
        </h1>

        <div className="flex flex-wrap justify-center w-full gap-6">
          {rutinasPorProfesor.length === 0 ? (
            <p className="text-white text-xl">No hay datos disponibles.</p>
          ) : (
            rutinasPorProfesor.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Profesor: ${stat.profesor_nombre}`}
                contenido={stat.total_rutinas}
              />
            ))
          )}
        </div>

        <hr className="border-t border-white w-full my-4" />

        <h1 className="titulo text-5xl font-bold text-white mb-8 text-center mt-10 uppercase">
          Ayudas Resueltas por Profesor
        </h1>

        <div className="flex flex-wrap justify-center w-full gap-6">
          {ayudasResueltasPorProfesor.length === 0 ? (
            <p className="text-white text-xl">No hay datos disponibles.</p>
          ) : (
            ayudasResueltasPorProfesor.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Profesor: ${stat.profesor_nombre}`}
                contenido={stat.total_ayudas} // O el campo que te devuelva tu backend
              />
            ))
          )}
        </div>

        <hr className="border-t border-white w-full my-4" />

        <h1 className="titulo text-5xl font-bold text-white mb-8 text-center mt-10 uppercase">
          Feedbacks por Profesor
        </h1>

        <div className="flex flex-wrap justify-center w-full gap-6">
          {feedbacksPorProfesor.length === 0 ? (
            <p className="text-white text-xl">No hay datos disponibles.</p>
          ) : (
            feedbacksPorProfesor.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Profesor: ${stat.profesor_nombre}`}
                contenido={stat.total_feedbacks} // O el campo que te devuelva tu backend
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default EstadisticasIns;
