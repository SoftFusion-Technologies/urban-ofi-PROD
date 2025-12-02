/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 06 / 2025
 * Versión: 2.1 (UI turbo-modernizada)
 *
 * Descripción:
 * Listado y gestión de alumnos con filtros avanzados, tabla moderna y modal de alta/edición.
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import NavbarStaff from '../staff/NavbarStaff';
import '../../Styles/MetodsGet/Tabla.css';
import '../../Styles/staff/background.css';

import FormAltaAlumno from '../../Components/Forms/FormAltaAlumno';
import ParticlesBackground from '../../Components/ParticlesBackground';
import NotificationsHelps from './NotificationsHelps';

import { useAuth } from '../../AuthContext';
import { formatearFecha } from '../../Helpers';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserGraduate,
  FaSearch,
  FaChalkboardTeacher,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const URL = 'https://vps-5097245-x.dattaweb.com/students/';

const AlumnosGet = () => {
  const [modalNewAlumno, setModalNewAlumno] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  const [alumnos, setAlumnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [filtroRutina, setFiltroRutina] = useState('');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { userId, userLevel } = useAuth();
  const navigate = useNavigate();

  const safe = (v) => String(v ?? '').toLowerCase();

  const abrirModal = () => {
    setSelectedAlumno(null);
    setModalNewAlumno(true);
  };

  const cerarModal = () => {
    setModalNewAlumno(false);
    obtenerAlumnos();
  };

  const obtenerAlumnos = async () => {
    try {
      let endpoint = URL;

      if (userLevel === 'admin') {
        endpoint = URL; // todos
      } else if (userLevel === 'instructor') {
        endpoint = `${URL}?mode=instructor&viewer_id=${userId}`;
      } else {
        setAlumnos([]);
        return;
      }

      const { data } = await axios.get(endpoint);
      setAlumnos(data);
    } catch (error) {
      console.log('Error al obtener los alumnos:', error);
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

  useEffect(() => {
    if (!userLevel) return;
    obtenerAlumnos();
    obtenerUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLevel, userId]);

  const searcher = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const obtenerNombreProfesor = (uId) => {
    const profesor = usuarios.find((u) => u.id === uId);
    return profesor ? profesor.name : 'Sin asignar';
  };

  const handleEliminarAlumno = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (!confirmacion) return;

    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url, { method: 'DELETE' });
      await respuesta.json();
      const arrayalumnos = alumnos.filter((user) => user.id !== id);
      setAlumnos(arrayalumnos);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditarAlumno = (user) => {
    setSelectedAlumno(user);
    setModalNewAlumno(true);
  };

  const handleProfesorChange = (e) => {
    setSelectedProfesor(e.target.value);
    setCurrentPage(1);
  };

  const handleVerPerfil = (id) => {
    navigate(`/dashboard/student/${id}`);
  };

  // --------- Filtros ----------
  let results = alumnos.filter((dato) => {
    const s = safe(search);

    const nameMatch = safe(dato.nomyape).includes(s);
    const dniMatch = safe(dato.dni).includes(s);
    const telMatch = safe(dato.telefono).includes(s);
    const searchMatch = nameMatch || dniMatch || telMatch;

    const profesorMatch = selectedProfesor
      ? String(dato.user_id) === String(selectedProfesor)
      : true;

    let rutinaMatch = true;
    if (filtroRutina) {
      rutinaMatch = dato.rutina_tipo === filtroRutina;

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

  const ordenarIntegranteAlfabeticamente = (arr) => {
    return [...arr].sort((a, b) => {
      const sedeA = a.sede || '';
      const sedeB = b.sede || '';
      return sedeA.localeCompare(sedeB);
    });
  };

  const sortedAlumnos = ordenarIntegranteAlfabeticamente(results);

  // --------- Paginación ----------
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedAlumnos.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedAlumnos.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const nextPage = () => {
    if (currentPage < nPage) setCurrentPage((p) => p + 1);
  };

  const changeCPage = (id) => {
    setCurrentPage(id);
  };

  const totalRegistros = alumnos.length;
  const filtrados = results.length;
  const filtrosActivos =
    (search ? 1 : 0) + (selectedProfesor ? 1 : 0) + (filtroRutina ? 1 : 0);

  return (
    <>
      <NavbarStaff />

      <div className="relative min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 pt-16 pb-12">
        <div className="absolute inset-0 pointer-events-none">
          <ParticlesBackground />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                <FaUserGraduate className="text-xs" />
                <span>Gestión de alumnos</span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">
                Alumnos del gimnasio
              </h1>
              <p className="text-sm text-blue-100/85 mt-1 max-w-xl">
                Visualizá, filtrá y administrá tus alumnos. Accedé rápido a su
                perfil, objetivos y rutinas.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Link to="/dashboard">
                <button className="inline-flex items-center justify-center rounded-full bg-blue-600/90 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-blue-500/40 hover:bg-blue-700 transition">
                  Volver al dashboard
                </button>
              </Link>
              <button
                onClick={abrirModal}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 transition"
              >
                <span className="text-lg leading-none">＋</span>
                <span>Nuevo alumno</span>
              </button>
            </div>
          </div>

          {/* KPIs / Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-md">
              <p className="text-xs font-medium text-slate-500">
                Total en sistema
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalRegistros}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Alumnos registrados en la base.
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-md">
              <p className="text-xs font-medium text-slate-500">
                Coincidencias actuales
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">
                {filtrados}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Según los filtros aplicados.
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Filtros activos
                </p>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  {filtrosActivos}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Buscador, profesor y/o tipo de rutina.
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="mb-7 rounded-3xl border border-emerald-400/40 bg-black/40 backdrop-blur-xl px-4 py-4 sm:px-6 sm:py-5 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
            <div className="flex items-center gap-2 mb-3 text-emerald-100 text-xs font-semibold uppercase tracking-[0.18em]">
              <FaFilter className="text-xs" />
              <span>Panel de filtros</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-emerald-100 mb-1">
                  Buscar alumno (nombre, DNI o teléfono)
                </label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={searcher}
                    type="text"
                    placeholder="Ej: Luciano, 40123456, 3815..."
                    className="input-filter w-full rounded-full border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                  />
                </div>
              </div>

              {/* Profesor (solo admin) */}
              {userLevel === 'admin' && (
                <div className="w-full lg:w-60">
                  <label className="block text-[11px] font-semibold text-emerald-100 mb-1">
                    Profesor asignado
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProfesor}
                      onChange={handleProfesorChange}
                      className="input-filter w-full appearance-none rounded-full border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-8 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                    >
                      <option value="">Todos los profesores</option>
                      {usuarios.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                      ▼
                    </span>
                  </div>
                </div>
              )}

              {/* Tipo de rutina */}
              <div className="w-full lg:w-52">
                <label className="block text-[11px] font-semibold text-emerald-100 mb-1">
                  Tipo de rutina
                </label>
                <div className="relative">
                  <select
                    value={filtroRutina}
                    onChange={(e) => {
                      setFiltroRutina(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input-filter w-full appearance-none rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 pr-8 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/80"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="personalizado">Personalizado</option>
                    <option value="general">General</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                    ▼
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA */}
          {results.length === 0 ? (
            <p className="text-center pb-10 text-blue-50">
              No se encontraron alumnos con los filtros actuales.{' '}
              <span className="font-semibold text-emerald-200">
                Registros: {results.length}
              </span>
            </p>
          ) : (
            <>
              <div className="w-full overflow-x-auto rounded-3xl bg-white/95 border border-slate-200 shadow-2xl">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="bg-blue-600 text-[11px] uppercase tracking-[0.16em] text-white">
                      <th className="py-3.5 px-4 text-left">ID</th>
                      <th className="py-3.5 px-4 text-left">Profesor</th>
                      <th className="py-3.5 px-4 text-left">
                        Nombre y Apellido
                      </th>
                      <th className="py-3.5 px-4 text-left">DNI</th>
                      <th className="py-3.5 px-4 text-left">Teléfono</th>
                      <th className="py-3.5 px-4 text-left">Objetivo</th>
                      <th className="py-3.5 px-4 text-left">Fecha creación</th>
                      <th className="py-3.5 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((alumno, idx) => (
                      <tr
                        key={alumno.id}
                        className={`border-t border-slate-100 transition-colors duration-150 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                        } hover:bg-emerald-50/70`}
                      >
                        <td
                          className="py-2.5 px-4 text-slate-800 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          #{alumno.id}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          {obtenerNombreProfesor(alumno.user_id)}
                        </td>

                        <td
                          className="py-2.5 px-4 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[11px] font-semibold flex items-center justify-center text-white shadow-md">
                              {alumno.nomyape
                                ?.split(' ')
                                .map((p) => p[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase() || 'AL'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900 max-w-[160px] md:max-w-[240px]">
                                {alumno.nomyape}
                              </p>
                              <span
                                className={`inline-flex mt-0.5 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                  alumno.rutina_tipo === 'personalizado'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                }`}
                              >
                                {alumno.rutina_tipo === 'personalizado'
                                  ? 'Personalizado'
                                  : 'General'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td
                          className="py-2.5 px-4 text-slate-800 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          {alumno.dni}
                        </td>
                        <td
                          className="py-2.5 px-4 text-slate-800 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          {alumno.telefono}
                        </td>
                        <td
                          className="py-2.5 px-4 text-slate-700 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          <span className="line-clamp-2 max-w-[240px] md:max-w-[280px]">
                            {alumno.objetivo || '—'}
                          </span>
                        </td>
                        <td
                          className="py-2.5 px-4 text-slate-700 cursor-pointer"
                          onClick={() => handleVerPerfil(alumno.id)}
                        >
                          {formatearFecha(alumno.created_at)}
                        </td>

                        <td className="py-2.5 px-4">
                          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                            {(userLevel === 'admin' ||
                              userLevel === 'instructor') && (
                              <button
                                onClick={() => handleEliminarAlumno(alumno.id)}
                                type="button"
                                className="w-full md:w-auto rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600 transition"
                              >
                                Eliminar
                              </button>
                            )}

                            <button
                              onClick={() => handleEditarAlumno(alumno)}
                              type="button"
                              className="w-full md:w-auto rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow hover:bg-amber-500 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleVerPerfil(alumno.id)}
                              type="button"
                              className="w-full md:w-auto rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600 transition"
                            >
                              Ver perfil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {nPage > 1 && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <nav className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2 py-1 shadow-md">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <FaChevronLeft />
                    </button>
                    {numbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => changeCPage(number)}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold ${
                          currentPage === number
                            ? 'bg-emerald-500 text-white shadow shadow-emerald-500/60'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === nPage}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <FaChevronRight />
                    </button>
                  </nav>
                  <p className="text-[11px] text-slate-100/80">
                    Mostrando{' '}
                    <span className="font-semibold">
                      {records.length} de {filtrados}
                    </span>{' '}
                    alumnos filtrados.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Modal alta/edición alumno */}
          <AnimatePresence>
            {modalNewAlumno && (
              <FormAltaAlumno
                isOpen={modalNewAlumno}
                onClose={cerarModal}
                user={selectedAlumno}
                setSelectedUser={setSelectedAlumno}
              />
            )}
          </AnimatePresence>

          {/* Footer brand */}
          <div className="mt-10 flex justify-end">
            <div className="text-[11px] text-blue-100/80 bg-black/30 border border-blue-400/30 rounded-full px-3 py-1 backdrop-blur-sm">
              Sistema desarrollado por{' '}
              <span className="font-semibold text-emerald-200">SoftFusion</span>
              . Instagram:{' '}
              <a
                href="https://www.instagram.com/softfusiontechnologies/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                @softfusiontechnologies
              </a>
            </div>
          </div>
        </div>
      </div>

      <NotificationsHelps instructorId={userId} />
    </>
  );
};

export default AlumnosGet;
