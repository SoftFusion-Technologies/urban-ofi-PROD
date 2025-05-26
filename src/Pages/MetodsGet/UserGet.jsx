/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (UserGet.jsx) es el componente el cual renderiza los datos de los usuarios
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
import FormAltaUser from '../../Components/Forms/FormAltaUser';
import UserDetails from './UserGetId';
import { useAuth } from '../../AuthContext';
import ParticlesBackground from '../../Components/ParticlesBackground';

// Componente funcional que maneja la lógica relacionada con los Users
const UserGet = () => {
  // useState que controla el modal de nuevo usuario
  const [modalNewUser, setModalNewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const [filterSede, setFilterSede] = useState(''); // Estado para el filtro de sede
  const [filterLevel, setFilterLevel] = useState(''); // Estado para el filtro de level (ROL)
  const { userLevel } = useAuth();

  const abrirModal = () => {
    setModalNewUser(true);
  };
  const cerarModal = () => {
    setModalNewUser(false);
    obtenerUsers();
  };

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/users/';

  // Estado para almacenar la lista de users
  const [users, setUsers] = useState([]);

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = users;
  } else {
    results = users.filter((dato) => {
      const nameMatch = dato.name.toLowerCase().includes(search);
      const emailMatch = dato.email.toLowerCase().includes(search);
      const levelMatch = dato.level.toLowerCase().includes(search);
      const idMatch = dato.id.toString().toLowerCase().includes(search); // Convertimos el ID a cadena y luego a minúsculas antes de la comparación
      return nameMatch || emailMatch || levelMatch || idMatch;
    });
  }

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerUsuarios los datos contenidos en la url
    axios.get(URL).then((res) => {
      setUsers(res.data);
      obtenerUsers();
    });
  }, []);

  // Función para obtener todos los usuarios desde la API
  const obtenerUsers = async () => {
    try {
      const response = await axios.get(URL);
      setUsers(response.data);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
    }
  };

  const handleEliminarUser = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayUsers = users.filter((user) => user.id !== id);

        setUsers(arrayUsers);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerUser = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el usuario:', error);
    }
  };

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (event) => {
    setFilterSede(event.target.value);
  };

  const applySedeFilter = (user) => {
    if (!filterSede) {
      return true; // Si no hay filtro de sede seleccionado, mostrar todos los usuarios
    }
    const sede = user.sede || ''; // Asignar una cadena vacía si `user.sede` es `null` o `undefined`
    return sede.toLowerCase().includes(filterSede.toLowerCase());
  };

  // Función para manejar el cambio en el filtro de level (ROL)
  const handleFilterLevelChange = (event) => {
    setFilterLevel(event.target.value);
  };

  // Función para aplicar el filtro por level (ROL)
  const applyLevelFilter = (user) => {
    if (!filterLevel) {
      return true; // Si no hay filtro de level (ROL) seleccionado, mostrar todos los usuarios
    }
    return user.level.toLowerCase().includes(filterLevel.toLowerCase());
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
  const sortedUsers = ordenarIntegranteAlfabeticamente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedUsers.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedUsers.length / itemsPerPage);
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

  const handleEditarUser = (user) => {
    // (NUEVO)
    setSelectedUser(user);
    setModalNewUser(true);
  };
  return (
    <>
      <NavbarStaff />
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 h-contain pt-10 pb-10">
        <ParticlesBackground></ParticlesBackground>
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#1D4ED8] rounded-lg text-sm text-white hover:bg-blue-800">
                Volver
              </button>
            </Link>
          </div>
          <div className="flex justify-center">
            <h1 className="pb-5">
              Listado de Usuarios: &nbsp;
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
              className="input-filter"
            />
            <select
              value={filterLevel}
              onChange={handleFilterLevelChange}
              className="input-filter"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="instructor">Instructor</option>
            </select>
          </form>

          {/* formulario de busqueda */}

          <div className="flex justify-center pb-10">
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nuevo Usuario
              </button>
            </Link>
          </div>

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Usuario NO Existe ||{' '}
              <span className="text-span"> Usuario: {results.length}</span>
            </p>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-11/12 mx-auto text-sm shadow-md rounded-lg overflow-hidden min-w-[600px]">
                  <thead className="text-white titulo">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">Usuario</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Rol</th>
                      <th className="py-3 px-4 text-left">Sede</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter(applySedeFilter)
                      .filter(applyLevelFilter)
                      .map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-100 border-b transition duration-200"
                        >
                          <td
                            className="py-2 px-4"
                            onClick={() => obtenerUser(user.id)}
                          >
                            {user.id}
                          </td>
                          <td
                            className="py-2 px-4"
                            onClick={() => obtenerUser(user.id)}
                          >
                            {user.name}
                          </td>
                          <td
                            className="py-2 px-4"
                            onClick={() => obtenerUser(user.id)}
                          >
                            {user.email}
                          </td>
                          <td
                            className="py-2 px-4"
                            onClick={() => obtenerUser(user.id)}
                          >
                            {user.level}
                          </td>
                          <td
                            className="py-2 px-4"
                            onClick={() => obtenerUser(user.id)}
                          >
                            {user.sede}
                          </td>
                          {userLevel === 'admin' ? (
                            <td className="py-2 px-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEliminarUser(user.id)}
                                  type="button"
                                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                  Eliminar
                                </button>
                                <button
                                  onClick={() => handleEditarUser(user)}
                                  type="button"
                                  className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
                                >
                                  Editar
                                </button>
                              </div>
                            </td>
                          ) : (
                            <td className="py-2 px-4"></td>
                          )}
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
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaUser
            isOpen={modalNewUser}
            onClose={cerarModal}
            user={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      </div>
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          setSelectedUser={setSelectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
        />
      )}
    </>
  );
};

export default UserGet;
