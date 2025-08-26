import React, { useState, useEffect } from 'react';
import FormAltaAlumnoPendiente from '../Components/Forms/FormAltaAlumnoPendiente';
import ParticlesBackground from '../Components/ParticlesBackground';

const SocioRutina = () => {
  // Estado para controlar la apertura del formulario
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Se abre automáticamente al cargar el componente
  useEffect(() => {
    setIsContactOpen(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900">
      <ParticlesBackground />

      {/* Contenedor del formulario */}
      <div className="flex-grow flex items-center justify-center p-6">
        <FormAltaAlumnoPendiente
          open={isContactOpen}
          setIsOpen={setIsContactOpen}
        />
      </div>

      {/* Footer heredado */}
      <footer className="bg-black/30 text-center py-4 text-gray-200 text-sm backdrop-blur-sm border-t border-white/10">
        © {new Date().getFullYear()} SoftFusion. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default SocioRutina;
