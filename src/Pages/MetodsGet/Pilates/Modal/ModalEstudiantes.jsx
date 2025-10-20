// --- Componente Modal para Agregar/Editar/Eliminar alumno  ---
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { set } from "date-fns";

const StudentModal = ({ isOpen, onClose, onSave, cellData, fechaHoy }) => {
  // Usar fechaHoy si está disponible, si no, usar la local (sin desfase)
  const getLocalDateString = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = fechaHoy || getLocalDateString();
  console.log(today);

  // Convierte 'YYYY-MM-DD' a Date local sin desfase
  const toLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  // Helper function to get the next valid weekday for initial state
  const getNextWeekday = (dateString) => {
    let date = toLocalDate(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek === 0) {
      // If Sunday, set to Monday
      date.setDate(date.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // If Saturday, set to Monday
      date.setDate(date.getDate() + 2);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to handle date changes with weekend validation and alerts
  const handleDateChange = (e, setDateState) => {
    const selectedDate = new Date(e.target.value + "T00:00:00"); // Add T00:00:00 to avoid timezone issues
    const dayOfWeek = selectedDate.getDay();
    let newDate = e.target.value;
    let alertMessage = "";

    if (dayOfWeek === 0) {
      // Sunday
      alertMessage =
        "No se pueden seleccionar domingos. La fecha se ha ajustado al lunes siguiente.";
      selectedDate.setDate(selectedDate.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // Saturday
      alertMessage =
        "No se pueden seleccionar sábados. La fecha se ha ajustado al viernes anterior.";
      selectedDate.setDate(selectedDate.getDate() - 1);
    }

    if (alertMessage) {
      alert(alertMessage);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      newDate = `${year}-${month}-${day}`;
    }
    setDateState(newDate);
  };

  // Función para bloquear sábados y domingos
  const isWeekday = (date) => {
  const day = date.getDay();
  // Permitir lunes (1) a sábado (6), bloquear solo domingo (0)
  return day !== 0;
  };

  // 2. ESTADOS DEL COMPONENTE
  // Se inicializan con la fecha correcta calculada arriba.
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("plan");
  const [planStartDate, setPlanStartDate] = useState(getNextWeekday(today));
  const [planDuration, setPlanDuration] = useState("30"); // 30 días por defecto
  const [trialDate, setTrialDate] = useState(getNextWeekday(today));
  const [scheduledDate, setScheduledDate] = useState(getNextWeekday(today));
  const [planEndDate, setPlanEndDate] = useState(""); // Fecha de fin del plan calculada
  const [observation, setObservation] = useState(""); // Observación del alumno
  const [statusAux, setStatusAux] = useState("");
  const [clienteRenovacion, setClienteRenovacion] = useState(false);
  const [habilitarRenovacionProgramanda, setHabilitarRenovacionProgramada] =
    useState(false);
  const [habilitarClasePrueba, setHabilitarClasePrueba] = useState(true);

  // Estados para react-datepicker
  const [planStartDateObj, setPlanStartDateObj] = useState(null);
  const [trialDateObj, setTrialDateObj] = useState(null);
  const [scheduledDateObj, setScheduledDateObj] = useState(null);

  useEffect(() => {
    setPlanStartDateObj(planStartDate ? toLocalDate(planStartDate) : null);
  }, [planStartDate]);
  useEffect(() => {
    setTrialDateObj(trialDate ? toLocalDate(trialDate) : null);
  }, [trialDate]);
  useEffect(() => {
    setScheduledDateObj(scheduledDate ? toLocalDate(scheduledDate) : null);
  }, [scheduledDate]);

  useEffect(() => {
    if (cellData && cellData.student) { //Pregunto si existen 
      console.log("Los datos del estudiante son ", cellData);
      console.log("Modal opened for cell:", cellData.student.status);
      setStatusAux(cellData.student.status);
      if(cellData.student.status === "plan"){
        setHabilitarRenovacionProgramada(true);
        setHabilitarClasePrueba(false);
      }else if(cellData.student.status === "prueba"){
        setHabilitarRenovacionProgramada(true);
        setHabilitarClasePrueba(true);
      }
    }
  }, [cellData]);

  useEffect(() => {
    if (status && status === "programado" && statusAux === "plan") {
      console.log("Es un cliente de plan que paso a programado");
      setClienteRenovacion(true);
    }
  }, [status]);

  // 3. EFECTO PARA EDITAR / AGREGAR
  useEffect(() => {
    if (!cellData) return;
    const student = cellData.student;
    if (student) {
      // Lógica para editar
      setName(student.name);
      setContact(student.contact || "");
      setStatus(student.status);
      if (student.status === "plan" && student.planDetails) {
        setPlanStartDate(student.planDetails.startDate);
        // Si viene la duración del backend, úsala, si no, por defecto 30
        setPlanDuration(
          student.planDetails.duration
            ? String(student.planDetails.duration)
            : "30"
        );
        setObservation(student.observation || "");
      } else if (student.status === "prueba" && student.trialDetails)
        setTrialDate(student.trialDetails.date);
      else if (student.status === "programado" && student.scheduledDetails)
        setScheduledDate(student.scheduledDetails.date);
    } else {
      // Lógica para agregar
      setName("");
      setContact("");
      setStatus("plan");
      setPlanStartDate(getNextWeekday(today));
      setPlanDuration("30");
      setTrialDate(getNextWeekday(today));
      setScheduledDate(getNextWeekday(today));
      setObservation("");
    }
  }, [isOpen, cellData?.student]);

  useEffect(() => {
    // Solo calculamos si tenemos una fecha de inicio y una duración
    if (planStartDate && planDuration) {
      // 1. Convertimos el string de la fecha de inicio a un objeto Date
      const parts = planStartDate.split("-");
      const startDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );

      // 2. Le sumamos los días de duración del plan
      startDate.setDate(startDate.getDate() + Number(planDuration));

      // 3. Lo convertimos de nuevo a un string 'YYYY-MM-DD' y actualizamos el estado
      const endDateString = startDate.toISOString().slice(0, 10);
      setPlanEndDate(endDateString);
    }
  }, [planStartDate, planDuration]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!cellData) {
      alert("Error: No se pudo obtener información de la celda.");
      return;
    }
    if (!name) {
      alert("El nombre y apellido no pueden estar vacíos.");
      return;
    }
    if (name.length < 5) {
      alert("El nombre y apellido deben tener al menos 5 caracteres.");
      return;
    }
    if (!contact) {
      alert("El contacto no puede estar vacío.");
      return;
    }
    if (contact.length < 3) {
      alert("El contacto debe tener al menos 3 caracteres.");
      return;
    }
    let studentData = {
      id: cellData.student?.id || null,
      name: name.toUpperCase(),
      contact: contact.toUpperCase(),
      status,
    };
    const isModification = !!studentData.id;
    let accion = isModification ? "modificar" : "agregar";
    const [day] = cellData.key.split("-");
    switch (status) {
      case "plan":
        const planType = ["LUNES", "MIÉRCOLES", "VIERNES"].includes(day)
          ? "L-M-V"
          : "M-J";
        studentData.planDetails = {
          type: planType,
          startDate: planStartDate,
          endDate: planEndDate,
          duration: Number(planDuration),
          observation: observation,
        };
        break;
      case "prueba":
        studentData.trialDetails = { date: trialDate };
        break;
      case "programado":
        studentData.scheduledDetails = { date: scheduledDate };
        break;
      default:
        break;
    }
    onSave(cellData.key, studentData, accion);
    onClose();
  };

  const handleDelete = () => {
    if (!cellData) {
      alert("Error: No se pudo obtener información de la celda.");
      return;
    }
    onSave(null, cellData, "eliminar");
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {cellData?.student ? "Editar Alumno" : "Agregar Alumno"}
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          {cellData?.day} a las {cellData?.time}
        </p>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Apellido y Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: PÉREZ, JUAN"
            maxLength={100}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Contacto
          </label>
          <input
            id="name"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value.toUpperCase())}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Teléfono, Email, Instagram, etc."
            maxLength={50}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Estado / Plan
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="plan">Plan Contratado</option>
            {habilitarClasePrueba && (
              <option value="prueba">Clase de Prueba</option>
            )}
          </select>
        </div>
        {status === "plan" && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Fecha de Contratación
              </label>
              <DatePicker
                selected={planStartDateObj}
                onChange={(date) => {
                  if (!date) {
                    setPlanStartDate("");
                    setPlanStartDateObj(null);
                    return;
                  }
                  if (!isWeekday(date)) return;
                  const iso = date.toISOString().slice(0, 10);
                  setPlanStartDate(iso);
                  setPlanStartDateObj(date);
                }}
                filterDate={isWeekday}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccioná una fecha"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                locale={es}
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="planDuration"
              >
                Duración del Plan
              </label>
              <div className="mb-6 grid grid-cols-2 items-center gap-10">
                <div className="col-span-1">
                  <select
                    id="planDuration"
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">Mensual</option>
{/*                     <option value="90">Trimestral</option>
                    <option value="180">Semestral</option> */}
                  </select>
                </div>
                <p className="text-sm text-gray-500 font-bold mt-2">
                  Vence:{" "}
                  {planEndDate &&
                    new Date(planEndDate + "T00:00:00").toLocaleDateString(
                      "es-ES"
                    )}
                </p>
              </div>
            </div>
          </>
        )}
        {status === "prueba" && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fecha de la Clase
            </label>
            <DatePicker
              selected={trialDateObj}
              onChange={(date) => {
                if (!date) {
                  setTrialDate("");
                  setTrialDateObj(null);
                  return;
                }
                if (!isWeekday(date)) return;
                const iso = date.toISOString().slice(0, 10);
                setTrialDate(iso);
                setTrialDateObj(date);
              }}
              filterDate={isWeekday}
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccioná una fecha"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              locale={es}
            />
          </div>
        )}
        {status === "programado" && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Fecha de Pago/Inicio
              </label>
              <DatePicker
                selected={scheduledDateObj}
                onChange={(date) => {
                  if (!date) {
                    setScheduledDate("");
                    setScheduledDateObj(null);
                    return;
                  }
                  if (!isWeekday(date)) return;
                  const iso = date.toISOString().slice(0, 10);
                  setScheduledDate(iso);
                  setScheduledDateObj(date);
                }}
                filterDate={isWeekday}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccioná una fecha"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                locale={es}
              />
            </div>
            {clienteRenovacion && (
              <div className="mt-2">
                <p>
                  El cliente finaliza o finalizó su plan el día{" "}
                  <strong>
                    {new Date(
                      cellData.student.planDetails.endDate
                    ).toLocaleDateString("es-AR")}
                  </strong>
                  . Al colocarlo en <strong>“Renovación programada”</strong>, se
                  respetará su última fecha de vencimiento y se conservará su
                  lugar en la clase hasta que confirme el pago.
                </p>
              </div>
            )}
          </>
        )}
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Observación (Opcional)
          </label>
          <textarea
            id="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value.toUpperCase())}
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Añade una observación...EJ: alergias, lesiones, preferencias, etc."
            maxLength={255}
          ></textarea>
        </div>
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar
          </button>
          {cellData?.student && (
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Dar de baja
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
