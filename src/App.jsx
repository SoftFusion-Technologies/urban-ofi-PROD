/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (App.jsx) es el componente principal de la aplicación.
 *  Contiene la configuración de enrutamiento, carga de componentes asíncrona,
 *  y la lógica para mostrar un componente de carga durante la carga inicial.
 *  Además, incluye la estructura principal de la aplicación, como la barra de navegación,
 *  el pie de página y las diferentes rutas para las páginas de la aplicación.
 *
 * Tema: Configuración de la Aplicación Principal
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import './App.css';
import {
  BrowserRouter as Router,
  Routes as Rutas,
  Route as Ruta
} from 'react-router-dom'; // IMPORTAMOS useLocation PARA OCULTAR COMPONENTES

import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import useLayoutVisibility from './Hooks/useLayoutVisibility';

import Home from './Components/Home/Home';
import NavBar from './Components/Header/NavBar/NavBar';
import Footer from './Components/Footer';

// PAGINAS
import Contacto from './Pages/Contacto';
import NotFound from './Pages/NotFound';
import QuienesSomos from './Pages/QuienesSomos';

// LOGIN
import LoginForm from './Components/login/LoginForm';
import AdminPage from './Pages/staff/AdminPage';
import UsersGet from './Pages/MetodsGet/UserGet';
import InstructoresGet from './Pages/MetodsGet/InstructoresGet';
import AlumnosGet from './Pages/MetodsGet/AlumnosGet';
import EstadisticasIns from './Pages/MetodsGet/EstadisticasIns';
import AlumnosPendientesGet from './Pages/MetodsGet/AlumnosPendientesGet';
import LeadsGet from './Pages/MetodsGet/LeadsGet';
import PerfilAlumno from './Pages/MetodsGet/AlumnoPerfil/PerfilAlumno';
import FeedbackPage from './Pages/MetodsGet/AlumnoPerfil/Feedbacks/FeedbackPage';
import RMListWrapper from './Pages/MetodsGet/RM/RMListWrapper';
import RoutinesGet from './Pages/MetodsGet/RoutinesGet';
import ColoresRutinaCrud from './Pages/MetodsGet/ColoresRutinaCrud';
import EjerciciosProfesorCrud from './Pages/MetodsGet/EjerciciosProfesorCrud';
import { useAuth } from './AuthContext';
import BloquesEjercicio from './Pages/MetodsGet/BloquesEjercicio';
import EjerciciosCatalogo from './Pages/Components/EjerciciosCatalogo';
import LogsGlobalAlumno from './Pages/MetodsGet/AlumnoPerfil/LogsGlobalAlumno';
import RutinasExplorer from './Pages/MetodsGet/RutinasExplorer';
import PSEDashboard from './Pages/MetodsGet/PSEDashboard';
import SocioRutina from './Pages/SocioRutina';

// COMPONENTE CONTENEDOR PARA CONTROLAR LO QUE SE MUESTRA SEGÚN LA RUTA
function AppContent() {
  const { hideLayoutFooter, hideLayoutNav } = useLayoutVisibility();
  const { userId } = useAuth();

  return (
    <>
      {!hideLayoutNav && <NavBar />}
      <Rutas>
        <Ruta path="/" element={<Home />} />
        <Ruta path="/contacto" element={<Contacto />} />
        <Ruta path="/quienes-somos" element={<QuienesSomos />} />
        {/* componentes del staff y login INICIO */}
        <Ruta path="/login" element={<LoginForm />} />
        <Ruta path="/soyalumno" element={<LoginForm />} />
        <Ruta
          path="/dashboard"
          element={
            <ProtectedRoute>
              {' '}
              <AdminPage />{' '}
            </ProtectedRoute>
          }
        />
        <Ruta
          path="/dashboard/users"
          element={
            <ProtectedRoute>
              {' '}
              <UsersGet />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/administracion-colores"
          element={
            <ProtectedRoute>
              {' '}
              <ColoresRutinaCrud />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/configurar-ejercicios"
          element={
            <ProtectedRoute>
              {' '}
              <EjerciciosProfesorCrud profesorId={userId} />
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/configurar-ejercicios/:id"
          element={
            <ProtectedRoute>
              <BloquesEjercicio />
            </ProtectedRoute>
          }
        />
        <Ruta
          path="/dashboard/routines"
          element={
            <ProtectedRoute>
              {' '}
              <RutinasExplorer />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/instructores"
          element={
            <ProtectedRoute>
              {' '}
              <InstructoresGet />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/ejercicios"
          element={
            <ProtectedRoute>
              {' '}
              <EjerciciosCatalogo />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/logs-global"
          element={
            <ProtectedRoute>
              {' '}
              <LogsGlobalAlumno />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/students"
          element={
            <ProtectedRoute>
              {' '}
              <AlumnosGet />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/estadisticas"
          element={
            <ProtectedRoute>
              {' '}
              <EstadisticasIns />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/students-pendientes"
          element={
            <ProtectedRoute>
              {' '}
              <AlumnosPendientesGet />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/leads"
          element={
            <ProtectedRoute>
              {' '}
              <LeadsGet />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/student/:id"
          element={
            <ProtectedRoute>
              {' '}
              <PerfilAlumno />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/miperfil/student/:id"
          element={
            <ProtectedRoute>
              {' '}
              <PerfilAlumno />{' '}
            </ProtectedRoute>
          }
        />{' '}
        <Ruta
          path="/dashboard/pse"
          element={
            <ProtectedRoute>
              <PSEDashboard />
            </ProtectedRoute>
          }
        />
        <Ruta
          path="/dashboard/rm"
          element={
            <ProtectedRoute>
              <RMListWrapper />
            </ProtectedRoute>
          }
        />
        <Ruta path="/soysocio-rutina" element={<SocioRutina />} />
        {/* componentes del staff y login FINAL */}
        <Ruta path="/*" element={<NotFound />} />
      </Rutas>
      {!hideLayoutFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
