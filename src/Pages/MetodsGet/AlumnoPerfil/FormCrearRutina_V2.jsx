import { useState } from 'react';
import axios from 'axios';

const FormCrearRutina = () => {
  const [nombre, setNombre] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bloques, setBloques] = useState([
    {
      nombre: 'Bloque 1',
      orden: 1,
      notas: '',
      ejercicios: []
    }
  ]);

  const agregarBloque = () => {
    setBloques([
      ...bloques,
      {
        nombre: `Bloque ${bloques.length + 1}`,
        orden: bloques.length + 1,
        ejercicios: []
      }
    ]);
  };

  const agregarEjercicio = (indexBloque) => {
    const nuevosBloques = [...bloques];
    nuevosBloques[indexBloque].ejercicios.push({
      nombre: '',
      orden: nuevosBloques[indexBloque].ejercicios.length + 1,
      series: [],
      cantidadSeries: 0
    });
    setBloques(nuevosBloques);
  };

  const actualizarEjercicio = (bloqueIdx, ejIdx, campo, valor) => {
    const nuevos = [...bloques];
    nuevos[bloqueIdx].ejercicios[ejIdx][campo] = valor;
    setBloques(nuevos);
  };

  const setCantidadSeries = (bloqueIdx, ejIdx, cantidad) => {
    const nuevos = [...bloques];
    const series = Array.from({ length: Number(cantidad) }, (_, i) => ({
      numero_serie: i + 1,
      repeticiones: '',
      descanso: '',
      tiempo: '',
      kg: ''
    }));
    nuevos[bloqueIdx].ejercicios[ejIdx].series = series;
    nuevos[bloqueIdx].ejercicios[ejIdx].cantidadSeries = cantidad;
    setBloques(nuevos);
  };

  const actualizarSerie = (bloqueIdx, ejIdx, serieIdx, campo, valor) => {
    const nuevos = [...bloques];
    nuevos[bloqueIdx].ejercicios[ejIdx].series[serieIdx][campo] = valor;
    setBloques(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rutina = {
      student_id: Number(studentId),
      nombre,
      descripcion: '',
      bloques
    };

    try {
      const res = await axios.post(
        'https://vps-5097245-x.dattaweb.com/rutinas-completas',
        rutina
      );
      alert('Rutina creada correctamente');
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert('Error al crear rutina');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear Rutina</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="ID del Alumno"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Nombre de la rutina"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        {bloques.map((bloque, bloqueIdx) => (
          <div key={bloqueIdx} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{bloque.nombre}</h3>

            {bloque.ejercicios.map((ejercicio, ejIdx) => (
              <div key={ejIdx} className="mb-4 border rounded p-3 bg-gray-50">
                <input
                  type="text"
                  placeholder="Nombre del ejercicio"
                  value={ejercicio.nombre}
                  onChange={(e) =>
                    actualizarEjercicio(
                      bloqueIdx,
                      ejIdx,
                      'nombre',
                      e.target.value
                    )
                  }
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="number"
                  placeholder="Cantidad de series"
                  value={ejercicio.cantidadSeries}
                  onChange={(e) =>
                    setCantidadSeries(bloqueIdx, ejIdx, e.target.value)
                  }
                  className="border p-2 rounded w-full mb-2"
                />

                {ejercicio.series.map((serie, serieIdx) => (
                  <div
                    key={serieIdx}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2"
                  >
                    <input
                      type="number"
                      placeholder={`Reps S${serie.numero_serie}`}
                      value={serie.repeticiones}
                      onChange={(e) =>
                        actualizarSerie(
                          bloqueIdx,
                          ejIdx,
                          serieIdx,
                          'repeticiones',
                          e.target.value
                        )
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Descanso"
                      value={serie.descanso}
                      onChange={(e) =>
                        actualizarSerie(
                          bloqueIdx,
                          ejIdx,
                          serieIdx,
                          'descanso',
                          e.target.value
                        )
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Tiempo"
                      value={serie.tiempo}
                      onChange={(e) =>
                        actualizarSerie(
                          bloqueIdx,
                          ejIdx,
                          serieIdx,
                          'tiempo',
                          e.target.value
                        )
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Kg"
                      value={serie.kg}
                      onChange={(e) =>
                        actualizarSerie(
                          bloqueIdx,
                          ejIdx,
                          serieIdx,
                          'kg',
                          e.target.value
                        )
                      }
                      className="border p-1 rounded"
                    />
                  </div>
                ))}
              </div>
            ))}

            <button
              type="button"
              onClick={() => agregarEjercicio(bloqueIdx)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              + Agregar Ejercicio
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={agregarBloque}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Agregar Bloque
        </button>

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded font-bold"
        >
          Crear Rutina
        </button>
      </form>
    </div>
  );
};

export default FormCrearRutina;
