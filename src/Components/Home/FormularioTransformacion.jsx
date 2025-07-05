import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FormularioTransformacion = () => {
  const [form, setForm] = useState({ nombre: '', tel: '', mensaje: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const URL = 'https://vps-5097245-x.dattaweb.com/leads';
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // limpiar error al escribir
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.tel.trim()) newErrors.tel = 'El teléfono es obligatorio';
    else if (form.tel.trim().length < 6) newErrors.tel = 'Teléfono inválido';
    if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es obligatorio';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      setSubmitted(true);
    } catch (error) {
      alert('Hubo un error al enviar. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', tel: '', mensaje: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div
      id="mi-seccion-destino"
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <h1 className="titulo mb-12 text:4xl sm:text-5xl font-extrabold text-white uppercase font-montserrat drop-shadow-lg select-none">
        Transformá tu entrenamiento
      </h1>

      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl p-10 max-w-lg w-full shadow-lg shadow-blue-400/50">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center text-blue-700 font-semibold text-xl space-y-4 font-montserrat"
            >
              <p>
                ¡Gracias por contactarnos! <br /> Te responderemos pronto.
              </p>
              <button
                onClick={resetForm}
                className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              >
                Enviar otro mensaje
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
              noValidate
            >
              {['nombre', 'tel', 'mensaje'].map((field) => {
                const isTextarea = field === 'mensaje';
                const label =
                  field === 'nombre'
                    ? 'Tu nombre'
                    : field === 'tel'
                    ? 'Tu teléfono'
                    : 'Contanos qué querés lograr';

                return (
                  <div key={field} className="relative z-0">
                    {isTextarea ? (
                      <textarea
                        id={field}
                        name={field}
                        rows={4}
                        value={form[field]}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className={`peer block w-full rounded-md border-b-2 appearance-none bg-transparent px-0 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-0 font-semibold font-montserrat resize-y
                          ${
                            errors[field]
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-blue-600'
                          }`}
                      />
                    ) : (
                      <input
                        id={field}
                        type={field === 'tel' ? 'tel' : 'text'}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className={`peer block w-full rounded-md border-b-2 appearance-none bg-transparent px-0 pt-6 pb-2 text-gray-900 focus:outline-none focus:ring-0 font-semibold font-montserrat
                          ${
                            errors[field]
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-blue-600'
                          }`}
                      />
                    )}
                    <label
                      htmlFor={field}
                      className={`absolute top-2 left-0 text-sm font-montserrat
                        peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
                        peer-focus:top-2 peer-focus:text-sm transition-all cursor-text select-none
                        ${
                          errors[field]
                            ? 'text-red-500 peer-placeholder-shown:text-red-400 peer-focus:text-red-500'
                            : 'text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600'
                        }`}
                    >
                      {label}
                    </label>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                      className={`absolute bottom-0 left-0 h-[2px] pointer-events-none ${
                        errors[field] ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 mt-1 text-sm font-montserrat">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                );
              })}

              <motion.button
                type="submit"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(5, 5, 5, 0.7)'
                }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`mt-4 rounded-full px-6 py-3 text-white font-extrabold text-lg shadow-lg transition-shadow select-none
                  ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 shadow-blue-500 hover:bg-blue-700'
                  }`}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormularioTransformacion;
