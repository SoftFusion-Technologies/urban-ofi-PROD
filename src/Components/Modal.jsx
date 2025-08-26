import React, { useState, useEffect, useRef } from 'react';
import messageSVG from '../Images/SVG/message.svg';
import { useLocation } from 'react-router-dom';

const Modal = ({
  isOpen,
  title,
  children,
  onCancel,
  onConfirm,
  colorIcon = 'blue',
  svgIcon = messageSVG
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop con animación */}
      <div
        className={`fixed inset-0 bg-gray-500/75 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Panel del modal con animaciones */}
          <div
            className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all duration-300
              ${
                isAnimating
                  ? 'opacity-100 translate-y-0 sm:scale-100'
                  : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              }`}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex items-center mb-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-${colorIcon}-100 sm:h-10 sm:w-10`}
                >
                  <img src={svgIcon} alt="Icono" className="size-6" />
                </div>
                <h3
                  className="ml-4 text-lg font-semibold text-gray-900"
                  id="modal-title"
                >
                  {title}
                </h3>
                {/* Botón X */}
                <button
                  className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
                  onClick={onCancel}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full">{children}</div>
            </div>
            <>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 sm:ml-3 sm:w-auto"
                  onClick={onConfirm}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={onCancel}
                >
                  Cerrar
                </button>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
