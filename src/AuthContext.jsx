/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 05 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (AuthContext.jsx) es el componente el cual valida el login del usuario con un token.
 * Se agregó verificación de expiración de token y limpieza automática del localStorage al cerrar o recargar la pestaña.
 *
 * Tema: Renderización
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [userLevel, setUserLevel] = useState('');
  const [nomyape, setNomyape] = useState('');
  const [alumnoId, setAlumnoId] = useState(null);

  const logout = () => {
    setAuthToken(null);
    setUserName('');
    setUserId(null);
    setUserLevel('');
    setNomyape('');
    setAlumnoId(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    // localStorage.removeItem('userLevel');
    localStorage.removeItem('nomyape');
    localStorage.removeItem('alumnoId');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('userName');
    const idStored = localStorage.getItem('userId');
    const level = localStorage.getItem('userLevel');
    const alumnoNomyape = localStorage.getItem('nomyape');
    const alumnoIdStored = localStorage.getItem('alumnoId');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() >= payload.exp * 1000;
        if (isExpired) {
          logout();
        } else {
          setAuthToken(token);
        }
      } catch (e) {
        console.error('Token inválido:', e);
        logout();
      }
    }

    if (username) setUserName(username);
    if (idStored) setUserId(idStored);
    if (level) setUserLevel(level);
    if (alumnoNomyape) setNomyape(alumnoNomyape);
    if (alumnoIdStored) setAlumnoId(alumnoIdStored);

    // 🔁 Limpiar localStorage sensible al cerrar o recargar
    const handleBeforeUnload = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userLevel');
      localStorage.removeItem('nomyape');
      localStorage.removeItem('alumnoId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = (token, username, level, id) => {
    setAuthToken(token);
    setUserName(username);
    setUserLevel(level);
    setUserId(id);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', username);
    localStorage.setItem('userLevel', level);
    localStorage.setItem('userId', id);
  };

  const loginAlumno = (token, alumnoNombreApellido, id) => {
    setAuthToken(token);
    setNomyape(alumnoNombreApellido);
    setAlumnoId(id);
    localStorage.setItem('authToken', token);
    localStorage.setItem('nomyape', alumnoNombreApellido);
    localStorage.setItem('alumnoId', id);
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userName,
        userId,
        userLevel,
        nomyape,
        alumnoId,
        login,
        loginAlumno,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
