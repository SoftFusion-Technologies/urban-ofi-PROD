/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AlumnosGet.jsx) es el componente el cual renderiza los datos de los usuarios
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
import FormAltaAlumno from '../../Components/Forms/FormAltaAlumno';
import { useAuth } from '../../AuthContext';
import ParticlesBackground from '../../Components/ParticlesBackground';
import { formatearFecha } from '../../Helpers';
import { useNavigate } from 'react-router-dom';
import NotificationsHelps from './NotificationsHelps';

// Componente funcional que maneja la lógica relacionada con los alumnos
const AlumnosGet = () => {
  // useState que controla el modal de nuevo usuario
  const [modalNewAlumno, setModalNewAlumno] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null); // Estado para el usuario seleccionado
  const [modalAlumnoDetails, setModalAlumnoDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const { userId, userLevel } = useAuth();
  const navigate = useNavigate();

  console.log(userId);
  const abrirModal = () => {
    setModalNewAlumno(true);
  };
  const cerarModal = () => {
    setModalNewAlumno(false);
    obtenerAlumnos();
  };

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'https://vps-5097245-x.dattaweb.com/students/';

  // Estado para almacenar la lista de alumnos
  const [alumnos, setAlumnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [filtroRutina, setFiltroRutina] = useState('');

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  // helpers para evitar toLowerCase() sobre undefined o números
  const safe = (v) => String(v ?? '').toLowerCase();

  let results = alumnos.filter((dato) => {
    const s = safe(search);

    const nameMatch = safe(dato.nomyape).includes(s);
    const dniMatch = safe(dato.dni).includes(s);
    const telMatch = safe(dato.telefono).includes(s);
    const searchMatch = nameMatch || dniMatch || telMatch;

    // si hay profesor seleccionado en el filtro, respetarlo
    const profesorMatch = selectedProfesor
      ? String(dato.user_id) === String(selectedProfesor)
      : true;

    // regla de rutina
    let rutinaMatch = true;
    if (filtroRutina) {
      rutinaMatch = dato.rutina_tipo === filtroRutina;

      // ⚠️ clave: si filtro = 'personalizado' y soy instructor,
      // SOLO mis personalizados (no los de otros)
      if (
        rutinaMatch &&
        filtroRutina === 'personalizado' &&
        userLevel === 'instructor'
      ) {
        rutinaMatch = String(dato.user_id) === String(userId);
      }
    }

    return searchMatch && profesorMatch && rutinaMatch;
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

  const obtenerAlumnos = async () => {
    try {
      let endpoint = URL;

      if (userLevel === 'admin') {
        endpoint = URL; // trae todos
      } else if (userLevel === 'instructor') {
        endpoint = `${URL}?mode=instructor&viewer_id=${userId}`;
      } else {
        setAlumnos([]);
        return;
      }

      const { data } = await axios.get(endpoint);
      // Importante: reemplazar, no concatenar con los anteriores
      setAlumnos(data);
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

  const handleProfesorChange = (e) => {
    setSelectedProfesor(e.target.value);
  };

  function handleVerPerfil(id) {
    navigate(`/dashboard/student/${id}`);
  }

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

            {/* Filtro por profesor */}
            {userLevel === 'admin' && (
              <select
                value={selectedProfesor}
                onChange={handleProfesorChange}
                className="input-filter text-black"
              >
                <option value="">Todos los Profesores</option>
                {usuarios.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={filtroRutina}
              onChange={(e) => setFiltroRutina(e.target.value)}
              className="input-filter text-black"
            >
              <option value="">Todos los tipos</option>
              <option value="personalizado">Personalizado</option>
              <option value="general">General</option>
            </select>
          </form>
          {/* formulario de busqueda */}

          <div className="flex justify-center pb-10">
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nuevo Alumno
              </button>
            </Link>
          </div>

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
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((alumno) => (
                      <tr
                        key={alumno.id}
                        className={
                          'transition-all duration-200 border-b group ' +
                          (alumno.rutina_tipo === 'personalizado'
                            ? 'bg-white border-l-[6px] border-[#fc4b08] hover:bg-orange-50'
                            : 'bg-blue-50 border-l-[6px] border-blue-400 hover:bg-blue-100')
                        }
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
                          className="py-2 px-4 cursor-pointer"
                          style={{ verticalAlign: 'middle' }}
                          onClick={() => obtenerAlumno(alumno.id)}
                        >
                          <div className="flex items-center gap-2 w-full min-w-0 overflow-hidden">
                            <span className="truncate max-w-[90px] md:max-w-[180px] block font-medium">
                              {alumno.nomyape}
                            </span>
                            <span
                              className={
                                'flex-shrink-0 px-2 py-1 text-xs rounded-full font-bold border shadow-sm animate-fadeIn ' +
                                (alumno.rutina_tipo === 'personalizado'
                                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                                  : 'bg-blue-100 text-blue-700 border-blue-300')
                              }
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              {alumno.rutina_tipo === 'personalizado'
                                ? 'Personalizado'
                                : 'General'}
                            </span>
                          </div>
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
                          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                            {userLevel === 'admin' ||
                            userLevel === 'instructor' ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleEliminarAlumno(alumno.id)
                                  }
                                  type="button"
                                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition w-full md:w-auto"
                                >
                                  Eliminar
                                </button>
                                <button
                                  onClick={() => handleEditarAlumno(alumno)}
                                  type="button"
                                  className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition w-full md:w-auto"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleVerPerfil(alumno.id)}
                                  type="button"
                                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-full md:w-auto"
                                >
                                  Ver Perfil
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditarAlumno(alumno)}
                                  type="button"
                                  className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition w-full md:w-auto"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleVerPerfil(alumno.id)}
                                  type="button"
                                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-full md:w-auto"
                                >
                                  Ver Perfil
                                </button>
                              </>
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
          <FormAltaAlumno
            isOpen={modalNewAlumno}
            onClose={cerarModal}
            user={selectedAlumno}
            setSelectedUser={setSelectedAlumno}
          />
        </div>
      </div>
      <NotificationsHelps instructorId={userId}></NotificationsHelps>
    </>
  );
};

export default AlumnosGet;
