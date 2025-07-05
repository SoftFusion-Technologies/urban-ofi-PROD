/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AlumnosPendientesGet.jsx) es el componente el cual renderiza los datos de los usuarios
 * Estos datos llegan cuando se da de alta un nuevo usuario
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import NavbarStaff from '../staff/NavbarStaff';
import { Link } from 'react-router-dom';
import '../../Styles/MetodsGet/Tabla.css';
import '../../Styles/staff/background.css';
import { useAuth } from '../../AuthContext';
import ParticlesBackground from '../../Components/ParticlesBackground';
import { formatearFecha } from '../../Helpers';

// Componente funcional que maneja la lógica relacionada con los alumnos
const AlumnosPendientesGet = () => {
  // useState que controla el modal de nuevo usuario
  const [modalAlumnoDetails, setModalAlumnoDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const [modalOpen, setModalOpen] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [profesorAsignado, setProfesorAsignado] = useState('');

  const { userLevel } = useAuth();

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'https://vps-5097245-x.dattaweb.com/students-pendientes/';

  // Estado para almacenar la lista de alumnos
  const [alumnos, setAlumnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedProfesor, setSelectedProfesor] = useState('');

  const abrirModalAutorizar = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setProfesorAsignado(''); // Reiniciar selección
    setModalOpen(true);
  };

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = alumnos.filter((dato) => {
    const nameMatch = dato.nomyape.toLowerCase().includes(search.toLowerCase());
    const dniMatch = dato.dni.toLowerCase().includes(search.toLowerCase());
    const telefonoMatch = dato.telefono
      .toLowerCase()
      .includes(search.toLowerCase());

    const searchMatch = nameMatch || dniMatch || telefonoMatch;

    const profesorMatch = selectedProfesor
      ? dato.user_id == selectedProfesor
      : true;

    return searchMatch && profesorMatch;
  });

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerUsuarios los datos contenidos en la url
    axios.get(URL).then((res) => {
      setAlumnos(res.data);
      obtenerAlumnos();
      obtenerUsuarios();
    });
  }, []);

  // Función para obtener todos los usuarios desde la API
  const obtenerAlumnos = async () => {
    try {
      const response = await axios.get(URL);
      setAlumnos(response.data);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get('https://vps-5097245-x.dattaweb.com/users');
      const instructores = res.data.filter(
        (user) => user.level === 'instructor'
      );
      setUsuarios(instructores);
    } catch (error) {
      console.log('Error al obtener profesores:', error);
    }
  };

  const obtenerNombreProfesor = (userId) => {
    const profesor = usuarios.find((u) => u.id === userId);
    return profesor ? profesor.name : 'Sin asignar';
  };

  const handleEliminarAlumno = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayalumnos = alumnos.filter((user) => user.id !== id);

        setAlumnos(arrayalumnos);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerAlumno = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedAlumno(resultado);
      setModalAlumnoDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el alumno:', error);
    }
  };

  // Función para ordenar los integrantes de forma alfabética basado en el nombre
  const ordenarIntegranteAlfabeticamente = (user) => {
    return [...user].sort((a, b) => {
      const sedeA = a.sede || ''; // Reemplaza null o undefined por una cadena vacía
      const sedeB = b.sede || '';
      return sedeA.localeCompare(sedeB);
    });
  };

  // Llamada a la función para obtener los usuarios ordenados de forma creciente
  const sortedalumnos = ordenarIntegranteAlfabeticamente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedalumnos.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedalumnos.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  function prevPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleEditarAlumno = (user) => {
    // (NUEVO)
    setSelectedAlumno(user);
    setModalNewAlumno(true);
  };

  const handleConfirmarAutorizar = async () => {
    try {
      await axios.post(`${URL}migrar/${alumnoSeleccionado.id}`, {
        user_id: profesorAsignado
      });
      alert('Alumno autorizado correctamente');
      setModalOpen(false);
      obtenerAlumnos();
    } catch (error) {
      console.error('Error al autorizar alumno:', error);
      alert('Error al autorizar alumno');
    }
  };

  return (
    <>
      <NavbarStaff />
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 h-contain pt-10 pb-10">
        <ParticlesBackground></ParticlesBackground>
        <div className="rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#1D4ED8] rounded-lg text-sm text-white hover:bg-blue-800">
                Volver
              </button>
            </Link>
          </div>

          <div className="flex justify-center text-white">
            <h1 className="pb-5">
              Listado de Alumnos: &nbsp;
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
              placeholder="Buscar Alumnos"
              className="input-filter text-white"
            />
          </form>
          {/* formulario de busqueda */}

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10 text-white">
              El Alumno NO Existe ||{' '}
              <span className="text-span"> Alumno: {results.length}</span>
            </p>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-11/12 mx-auto text-sm shadow-md rounded-lg overflow-hidden min-w-[600px]">
                  <thead className="text-white titulo">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">Profesor</th>
                      <th className="py-3 px-4 text-left">Nombre y Apellido</th>
                      <th className="py-3 px-4 text-left">DNI</th>
                      <th className="py-3 px-4 text-left">Teléfono</th>
                      <th className="py-3 px-4 text-left">Objetivo</th>
                      <th className="py-3 px-4 text-left">Fecha Creación</th>
                      <th className="py-3 px-4 text-left">Estado</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((alumno) => (
                      <tr
                        key={alumno.id}
                        className="hover:bg-gray-100 border-b transition duration-200"
                      >
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {alumno.id}
                        </td>
                        <td className="py-2 px-4">
                          {obtenerNombreProfesor(alumno.user_id)}
                        </td>
                        <td
                          className="py-2 px-4 "
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {alumno.nomyape}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {alumno.dni}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {alumno.telefono}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {alumno.objetivo}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          {formatearFecha(alumno.created_at)}
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`uppercase font-semibold ${
                              alumno.estado === 'pendiente'
                                ? 'text-red-600'
                                : alumno.estado === 'en revision'
                                ? 'text-yellow-600'
                                : alumno.estado === 'autorizado'
                                ? 'text-green-600'
                                : 'text-black'
                            }`}
                          >
                            {alumno.estado}
                          </span>
                        </td>

                        <td className="py-2 px-4">
                          <div className="flex justify-center gap-2">
                            {userLevel === 'admin' && (
                              <button
                                onClick={() => handleEliminarAlumno(alumno.id)}
                                type="button"
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                Eliminar
                              </button>
                            )}
                            {(userLevel === 'admin' ||
                              userLevel === 'instructor') && (
                              <button
                                onClick={() => abrirModalAutorizar(alumno)}
                                type="button"
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              >
                                Autorizar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <nav className="flex justify-center items-center my-10">
                <ul className="pagination">
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={prevPage}>
                      Prev
                    </a>
                  </li>
                  {numbers.map((number, index) => (
                    <li
                      className={`page-item ${
                        currentPage === number ? 'active' : ''
                      }`}
                      key={index}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={() => changeCPage(number)}
                      >
                        {number}
                      </a>
                    </li>
                  ))}
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md">
                <h2 className="titulo uppercase text-center text-xl font-bold mb-4">
                  Asignar Profesor
                </h2>

                <label className="block mb-2 font-medium">
                  Selecciona un profesor:
                </label>
                <select
                  value={profesorAsignado}
                  onChange={(e) => setProfesorAsignado(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-4"
                >
                  <option value="">-- Seleccionar --</option>
                  {usuarios.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarAutorizar}
                    disabled={!profesorAsignado}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlumnosPendientesGet;
