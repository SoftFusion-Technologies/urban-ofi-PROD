/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (InstructoresGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
 * Estos datos llegan cuando se completa el formulario de FormAltaConve
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { formatearFecha } from '../../Helpers';
import { Link } from 'react-router-dom';
import NavbarStaff from '../staff/NavbarStaff';
import '../../Styles/MetodsGet/Tabla.css';
import '../../Styles/staff/background.css';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../../Components/ParticlesBackground';

const InstructoresGet = () => {
  // Estado para almacenar la lista de personas
  const [instructor, setInstructor] = useState([]);

  const { userLevel } = useAuth();

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');
  const [filterSede, setFilterSede] = useState(''); // Estado para el filtro de sede

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'https://vps-5097245-x.dattaweb.com/instructores/';

  const navigate = useNavigate();

  useEffect(() => {
    // utilizamos get para obtenerPersonas los datos contenidos en la url
    axios.get(URL).then((res) => {
      setInstructor(res.data);
      obtenerInstructor();
    });
  }, []);

  // Función para obtener todos los instructores desde la API
  const obtenerInstructor = async () => {
    try {
      const response = await axios.get(URL);
      setInstructor(response.data);
    } catch (error) {
      console.log('Error al obtener las personas :', error);
    }
  };

  useEffect(() => {
    const obtenerInstructores = async () => {
      try {
        const response = await axios.get('https://vps-5097245-x.dattaweb.com/instructores/');
        setInstructor(response.data);
      } catch (error) {
        console.error('Error al obtener los instructores:', error);
      }
    };

    obtenerInstructores();
  }, []);

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = instructor;
  } else if (search) {
    results = instructor.filter((dato) => {
      const nameMatch = dato.name.toLowerCase().includes(search.toLowerCase());

      return nameMatch;
    });
  }

  // Función para ordenar los conve de forma decreciente basado en el id
  const ordenarInstructorDecreciente = (instructor) => {
    return [...instructor].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los conves ordenados de forma decreciente
  const sortedInstructor = ordenarInstructorDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedInstructor.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedInstructor.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (event) => {
    setFilterSede(event.target.value);
  };

  const applySedeFilter = (instructor) => {
    if (!filterSede) {
      return true; // Si no hay filtro de sede seleccionado, mostrar todo
    }
    const sede = instructor.sede || ''; // Asignar una cadena vacía si `instructor.sede` es `null` o `undefined`
    return sede.toLowerCase().includes(filterSede.toLowerCase());
  };

  const handleEnviarEmail = (instructor) => {
    navigate(
      `/dashboard/instructores/${
        instructor.id
      }/planilla/?email=${encodeURIComponent(instructor.email)}`
    );
  };

  return (
    <>
      <NavbarStaff />
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 h-contain pt-10 pb-10">
        <ParticlesBackground></ParticlesBackground>
        <div className=" rounded-lg w-11/12 mx-auto pb-2">
          <div className=" mb-5">
            <div className="pl-5 pt-5">
              <Link to="/dashboard">
                <button className="py-2 px-5 bg-[#1D4ED8] rounded-lg text-sm text-white hover:bg-blue-800">
                  Volver
                </button>
              </Link>
            </div>
            <div className="flex justify-center text-white">
              <h1 className="pb-5">
                Listado de Instructores: &nbsp;
                <span className="text-center">
                  Cantidad de registros: {results.length}
                </span>
              </h1>
            </div>

            {/* formulario de busqueda */}
            <form className="flex flex-wrap justify-center gap-3 pb-5">
              <input
                value={search}
                onChange={searcher}
                type="text"
                placeholder="Buscar usuarios"
                className="input-filter text-white"
              />
              {/* <select
                value={filterSede}
                onChange={handleFilterSedeChange}
                className="border rounded-sm ml-3"
              >
                <option value="">Todas las sedes</option>
                <option value="SMT">SMT</option>
                <option value="Monteros">Monteros</option>
                <option value="Concepción">Concepción</option>
              </select> */}
            </form>
            {/* formulario de busqueda */}
          </div>
          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10 text-white uppercase ">
              El Instructor NO Existe ||{' '}
              <span className="text-span"> Instructor: {results.length}</span>
            </p>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-10 mx-auto pb-10 lg:grid-cols-3 max-sm:grid-cols-1 md:grid-cols-2">
                {results.filter(applySedeFilter).map((instructor) => (
                  <div key={instructor.id} className="bg-white p-6 rounded-md">
                    <h2 className="btnstaff">
                      {/* Instructor:{' '} */}
                      <span className="titulo bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl">
                        {instructor.name}
                      </span>
                    </h2>

                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <p className="btnstaff mt-2">
                        SEDE:{' '}
                        <span className="font-semibold uppercase">
                          {instructor.sede}
                        </span>
                      </p>
                    )}

                    {(userLevel === 'admin' ||
                      userLevel === 'gerente' ||
                      userLevel === 'administrador') && (
                      <button
                        style={{ ...styles.button, backgroundColor: '#1D4ED8' }}
                        onClick={() => handleEnviarEmail(instructor)}
                      >
                        Ver Alumnos
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '10px'
  },
  conveBox: {
    border: '1px solid #ccc',
    padding: '16px',
    borderRadius: '8px',
    boxSizing: 'border-box',
    flex: '1 1 calc(33% - 20px)', // Ajusta el ancho para permitir más espacio entre cuadros
    margin: '10px',
    minWidth: '250px' // Ajusta el tamaño mínimo para que los cuadros no sean demasiado pequeños
  },
  button: {
    margin: '10px 10px 0px 0px',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    fontSize: '14px'
  },
  // Media queries
  '@media (max-width: 1200px)': {
    conveBox: {
      flex: '1 1 calc(50% - 20px)' // Dos columnas para pantallas medianas
    }
  },
  '@media (max-width: 768px)': {
    conveBox: {
      flex: '1 1 calc(100% - 20px)' // Una columna para pantallas pequeñas
    }
  }
};

export default InstructoresGet;
