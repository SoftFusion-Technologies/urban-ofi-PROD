/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (LeadsGet.jsx) es el componente el cual renderiza los datos de los usuarios
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
import LeadsDetails from './GetIds/LeadsGetId';
import { useAuth } from '../../AuthContext';
import ParticlesBackground from '../../Components/ParticlesBackground';
import { formatearFecha } from '../../Helpers';

// Componente funcional que maneja la lógica relacionada con los Users
const UserGet = () => {
  // useState que controla el modal de nuevo usuario
  const [selectedLeads, setSelectedLeads] = useState(null); // Estado para el usuario seleccionado
  const [modalLeadsDetails, setModalLeadsDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const { userLevel } = useAuth();

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'https://vps-5097245-x.dattaweb.com/leads/';

  // Estado para almacenar la lista de users
  const [leads, setLeads] = useState([]);

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
    results = leads;
  } else {
    results = leads.filter((dato) => {
      const nameMatch = dato.nombre.toLowerCase().includes(search);
      const telMatch = dato.tel.toLowerCase().includes(search);
      return nameMatch || telMatch;
    });
  }

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerUsuarios los datos contenidos en la url
    axios.get(URL).then((res) => {
      setLeads(res.data);
      obtenerLeads();
    });
  }, []);

  // Función para obtener todos los usuarios desde la API
  const obtenerLeads = async () => {
    try {
      const response = await axios.get(URL);
      setLeads(response.data);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
    }
  };

  const handleEliminarLeads = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayLeads = leads.filter((lead) => lead.id !== id);

        setLeads(arrayLeads);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerLead = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedLeads(resultado);
      setModalLeadsDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el usuario:', error);
    }
  };

  // Función para ordenar los leads por fecha de creación (más reciente primero)
  const ordenarLeadsPorFecha = (leads) => {
    return [...leads].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  };

  // Llamada a la función para obtener los leads ordenados
  const sortedLeads = ordenarLeadsPorFecha(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedLeads.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedLeads.length / itemsPerPage);
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
              Listado de Leads: &nbsp;
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
              placeholder="Buscar Leads"
              className="input-filter text-white"
            />
          </form>
          {/* formulario de busqueda */}
          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10 text-white">
              El Lead NO Existe ||{' '}
              <span className="text-span text-white">
                {' '}
                Lead: {results.length}
              </span>
            </p>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-11/12 mx-auto text-sm shadow-md rounded-lg overflow-hidden min-w-[600px]">
                  <thead className="text-white titulo">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">NOMBRE</th>
                      <th className="py-3 px-4 text-left">TELEFONO</th>
                      <th className="py-3 px-4 text-left">COMENTARIO</th>
                      <th className="py-3 px-4 text-left">
                        FECHA REGISTRACIÓN
                      </th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-100 border-b transition duration-200"
                      >
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerLead(lead.id)}
                        >
                          {lead.id}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerLead(lead.id)}
                        >
                          {lead.nombre}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerLead(lead.id)}
                        >
                          {lead.tel}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerLead(lead.id)}
                        >
                          {lead.mensaje}
                        </td>
                        <td
                          className="py-2 px-4"
                          onClick={() => obtenerLead(lead.id)}
                        >
                          {formatearFecha(lead.created_at)}
                        </td>
                        {userLevel === 'admin' ? (
                          <td className="py-2 px-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEliminarLeads(lead.id)}
                                type="button"
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                Eliminar
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
        </div>
      </div>
      {selectedLeads && (
        <LeadsDetails
          user={selectedLeads}
          setSelectedLeads={setSelectedLeads}
          isOpen={modalLeadsDetails}
          onClose={() => setModalLeadsDetails(false)}
        />
      )}
    </>
  );
};

export default UserGet;
