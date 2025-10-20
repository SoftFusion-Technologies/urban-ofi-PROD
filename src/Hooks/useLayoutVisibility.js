// src/Hooks/useLayoutVisibility.js
import { useLocation } from 'react-router-dom';

const useLayoutVisibility = () => {
  const location = useLocation();

  const path = location.pathname;

  // Hide footer and nav for login-like routes. Add '/pilates' so the Pilates
  // instructor login page doesn't show the site's NavBar/footer.
  const hideLayoutFooter = path === '/login' || path.startsWith('/pilates');

  const hideLayoutNav =
    path === '/login' ||
    path === '/soyalumno' ||
    path.startsWith('/pilates') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/miperfil');

  return { hideLayoutFooter, hideLayoutNav };
};

export default useLayoutVisibility;
