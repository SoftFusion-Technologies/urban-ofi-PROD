import React, { useState, useEffect, useRef } from 'react';
import chatDobleSVG from '../../Images/SVG/chatDouble.svg';
import instagramSVG from '../../Images/SVG/instagram.svg';
import whatsappSVG from '../../Images/SVG/whatsapp.svg';
import locationSVG from '../../Images/SVG/location.svg';
import Modal from '../../Components/Modal';
import imgLogo from '../../Images/staff/imgLogo.jpg';
const FormAltaAlumnoPendiente = ({ open, setIsOpen }) => {
  const [isModalContactOpen, setIsModalContactOpen] = useState(open);
  const inputName = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setIsModalContactOpen(open);
    if (open) {
      setTimeout(() => {
        inputName.current.focus();
      }, 100);
    }
  }, [open]);

  const handleCancel = () => {
    clearForm();
    setIsModalContactOpen(false);
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    const { nomyape, telefono, dni, objetivo } = formData;

    if (!nomyape || !telefono) {
      alert('Por favor completá al menos nombre y teléfono');
      return;
    }

    try {
      const response = await fetch(
        'https://vps-5097245-x.dattaweb.com/students-pendientes/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomyape,
            telefono,
            dni: dni || null,
            objetivo: objetivo || null,
            estado: 'pendiente',
            user_id: null
          })
        }
      );

      if (response.ok) {
        setShowSuccessModal(true);
        // Mostrar modal 3 segundos
        setTimeout(() => {
          setShowSuccessModal(false);
          clearForm();
          setIsModalContactOpen(false);
          setIsOpen(false);
        }, 3000);
      } else {
        alert('Ocurrió un error al enviar el formulario');
      }
    } catch (error) {
      console.error(error);
      alert('Error en el servidor');
    }
  };

  const [formData, setFormData] = useState({
    nomyape: '',
    telefono: '',
    dni: '',
    objetivo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const clearForm = () => {
    setFormData({
      nomyape: '',
      telefono: '',
      dni: '',
      objetivo: ''
    });
  };

  const contactInfo = [
    {
      icon: whatsappSVG,
      text: '(381) 364-3118',
      link: 'https://api.whatsapp.com/send/?phone=543863564651&text=Hola%21+vengo+desde+el+sitio+oficial%21%21&type=phone_number&app_absent=0'
    },
    {
      icon: instagramSVG,
      text: '@urbanfitnesstucuman',
      link: 'https://www.instagram.com/urbanfitnesstucuman/'
    }
  ];

  const formFields = [
    {
      label: 'Nombre y Apellido:',
      type: 'text',
      name: 'nomyape',
      placeholder: 'Ej: Juan Pérez'
    },
    {
      label: 'Teléfono:',
      type: 'tel',
      name: 'telefono',
      placeholder: 'Ej: 3814567890'
    },
    {
      label: 'DNI:',
      type: 'text',
      name: 'dni',
      placeholder: 'Ej: 38123456'
    },
    {
      label: 'Objetivo:',
      type: 'textarea',
      name: 'objetivo',
      placeholder: 'Contanos tu objetivo o qué esperás lograr'
    }
  ];

  return (
    <div>
      <Modal
        isOpen={isModalContactOpen}
        title="SOCIO-RUTINA: Tu rutina personalizada, seguimiento real y acompañamiento experto desde nuestra app 💪📲"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        svgIcon={chatDobleSVG}
        colorIcon="blue"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-0">
          {/* Columna izquierda - Información de contacto */}
          <div className="w-full md:w-1/3 bg-black text-white p-6 md:p-8 rounded-2xl shadow-2xl border-2 border-dark hover:border-blue-400 transition-all duration-300">
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="titulo text-xl md:text-3xl mb-4 md:mb-6 transform hover:scale-105 transition-transform duration-300">
                  Información de Contacto
                </h2>
              </div>

              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4">
                  <img
                    src={info.icon}
                    alt="Icono"
                    className="size-6 md:size-8"
                  />
                  <a
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors duration-300 text-base md:text-lg"
                  >
                    {info.text}
                  </a>
                </div>
              ))}

              <div className="space-y-6 md:space-y-8">
                <div>
                  <h2 className=" text-2xl md:text-3xl mb-4 md:mb-6 transform hover:scale-105 transition-transform duration-300">
                    Ubicación
                  </h2>
                </div>

                {/* Dirección */}
                <div className="flex items-center gap-3 md:gap-4">
                  <img
                    src={locationSVG}
                    alt="Icono"
                    className="size-6 md:size-8"
                  />
                  <a
                    href="https://maps.app.goo.gl/Tu1Wr5XMeXHQnP1GA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors duration-300 text-base md:text-lg"
                  >
                    Monteagudo 778 Barrio Norte, San Miguel, Tucumán
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="w-full md:w-2/3 mt-6 md:mt-0">
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8">
              ¿Ya sos parte de{' '}
              <span className="text-blue-700 titulo">URBAN</span>? Completá el
              formulario y te contactamos a la brevedad.
            </p>
            <div className="space-y-6 md:space-y-8">
              {formFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-gray-700 font-semibold mb-2 md:mb-3 text-base md:text-lg">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 h-32 md:h-40"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      ref={field.name === 'nomyape' ? inputName : null} // 🔁 actualizado aquí
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <img
              src={imgLogo}
              alt="Logo del gym"
              className="mx-auto w-24 h-24 mb-4"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ¡Formulario enviado!
            </h2>
            <p className="text-gray-600">
              Gracias por confiar en nosotros. Pronto nos pondremos en contacto
              contigo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormAltaAlumnoPendiente;
