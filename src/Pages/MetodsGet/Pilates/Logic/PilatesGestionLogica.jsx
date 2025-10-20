import { useState, useEffect, useCallback, useMemo } from "react";
import useConsultaDB from "../ConsultaDb/Consulta";
import useInsertClientePilates from "../ConsultaDb/Insertar_ModificarCliente";
import useDeleteClientePilates from "../ConsultaDb/Eliminar";
import useInsertDataListaEspera from "../ConsultaDb/InsertarListaEspera";
import useUpdateDataListaEspera from "../ConsultaDb/ModificarListaEspera";
import useDeleteListaEspera from "../ConsultaDb/EliminarListaEspera";
import useInsertar from "../ConsultaDb/Insertar";
import sweetalert2 from "sweetalert2";
import useModify from "../ConsultaDb/Modificar";
import ObtenerFechaInternet from "../utils/ObtenerFechaInternet";
import { useAuth } from "../../../../AuthContext";
import { format } from "date-fns";
import { DAYS, HOURS, MAX_STUDENTS_PER_SLOT } from "../Constants/constanst";

const PilatesGestionLogica = () => {
  const [fechaHoy, setFechaHoy] = useState(null);
  const [section, setSection] = useState("GESTION");
  const [schedule, setSchedule] = useState({});
  const [waitingList, setWaitingList] = useState([]);
  const [isModalProfesorOpen, setIsModalProfesorOpen] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetalleAusentes, setIsModalDetalleAusentes] = useState(false);
  const [contactarAlumno, setcontactarAlumno] = useState(false);
  const [visiblePanels, setVisiblePanels] = useState({
    freeSlots: true,
    expiredStudents: true,
    absentStudents: true,
    waitingListMatches: true,
  });

  const { fecha } = ObtenerFechaInternet();

  const { userId } = useAuth();

  const { data: horariosData, refetch } = useConsultaDB(
    `/clientes-pilates/horarios`
  );

  // Usar fechaHoy (obtenida por la API de internet) o la fecha local del equipo
  const fechaParaConsulta = fechaHoy || format(new Date(), "yyyy-MM-dd");
  const { data: ausentesData, refetch: refetchAusentes } = useConsultaDB(
    `/asistencias-pilates/ausencias-mensuales?fecha=${fechaParaConsulta}`
  );

  console.log(
    `/asistencias-pilates/ausencias-mensuales?fecha=${fechaParaConsulta}`
  );

  const [ausentesAlumnos, setAusentesAlumnos] = useState([]);
  const { data: listaEsperaData, refetch: refetchListaEspera } = useConsultaDB(
    `/lista-espera-pilates`
  );

  const { data: instructoresData } = useConsultaDB(`/usuarios-pilates/nombres`);

  const { insertCliente } = useInsertClientePilates();
  const { deleteCliente } = useDeleteClientePilates();
  const { insert: insertarContactoListaEspera } = useInsertDataListaEspera(
    "/contactos-lista-espera"
  );
  const { insert: insertarListaEspera } = useInsertDataListaEspera(
    "/lista-espera-pilates"
  );
  const { update } = useUpdateDataListaEspera("/lista-espera-pilates");
  const { update: modificarContactoListaEspera } = useModify("/contactos-lista-espera");
  const { remove } = useDeleteListaEspera("/lista-espera-pilates");
  const { insert: insertarHorario } = useInsertar(
    "/horarios-pilates/cambiar-instructor"
  );

  const { update: modificarAlumnoContactado } = useModify(
    "/clientes-pilates/contactar"
  );

  const rol = "GESTION";

  useEffect(() => {
    if (horariosData && Object.keys(horariosData).length > 0) {
      const normalizedData = {};
      Object.keys(horariosData).forEach((key) => {
        const normalizedKey = key
          .replace("MIERCOLES", "MIÉRCOLES")
          .replace("SABADO", "SÁBADO");
        normalizedData[normalizedKey] = {
          id_horario: horariosData[key].id_horario || null,
          coach: horariosData[key].coach || "",
          coachId: horariosData[key].coachId || null,
          alumnos: Array.isArray(horariosData[key].alumnos)
            ? horariosData[key].alumnos
            : [],
        };
      });
      setSchedule(normalizedData);
    }
  }, [horariosData]);

  useEffect(() => {
    if (
      listaEsperaData &&
      Array.isArray(listaEsperaData) &&
      listaEsperaData.length > 0
    ) {
      const listaEsperaNormalizada = listaEsperaData.map((item) => ({
        id: item.id,
        name: item.nombre,
        type: item.tipo.toLowerCase().includes("cambio") ? "cambio" : "espera",
        contact: item.contacto,
  plan: (item.plan_interes || "").toUpperCase(),
        hours: item.horarios_preferidos
          ? item.horarios_preferidos.split(",").map((h) => h.trim())
          : [],
        obs: item.observaciones,
        date: item.fecha_carga ? item.fecha_carga.split("T")[0] : "",
        hour: item.fecha_carga
          ? item.fecha_carga.split("T")[1].split(".")[0]
          : "",
        contacto_cliente: item.contacto_cliente
          ? {
              id_contacto: item.contacto_cliente[0].id,
              id_lista_espera: item.contacto_cliente[0].id_lista_espera,
              id_usuario_contacto: item.contacto_cliente[0].id_usuario_contacto,
              fecha_contacto: item.contacto_cliente[0].fecha_contacto,
              estado_contacto: item.contacto_cliente[0].estado_contacto,
              notas: item.contacto_cliente[0].notas,
              usuario_contacto_nombre:
                item.contacto_cliente[0].nombre_usuario_contacto,
            }
          : null,
      }));
      setWaitingList(listaEsperaNormalizada);
    } else {
      setWaitingList([]);
    }
  }, [listaEsperaData]);

  // Cupo fijo por turno, no depende de sede

  useEffect(() => {
    if (ausentesData && ausentesData.length > 0) {
      // Formatear los datos para el estado ausentesAlumnos
      const formatear = ausentesData
        .filter((alumno) => alumno.cantidad_ausentes >= 7)
        .map((alumno) => ({
          id: alumno.id,
          name: alumno.nombre,
          cantidad: alumno.cantidad_ausentes,
          contacto: alumno.telefono,
          contactado: alumno.contactado ? "SI" : "NO",
          fecha_ultimo_contacto: alumno.fecha_contacto || "N/A",
          contacto_nombre: alumno.contacto_usuario_nombre || "N/A",
        }));
      setAusentesAlumnos(formatear);
    }
  }, [ausentesData]);

  //Se asegura que cuando se cierra el modal de detalle de ausentes, se cierre también el de contactar alumno para que no quede abierto con datos null
  useEffect(() => {
    if (!isModalDetalleAusentes) {
      setcontactarAlumno(false);
    }
  }, [isModalDetalleAusentes]);

  useEffect(() => {
    console.log("Valor de 'fecha':", fecha); // ← Esto te dirá si es null, string, etc.
    if (fecha) {
      console.log("Fecha válida:", fecha);
      setFechaHoy(fecha);
    }
  }, [fecha]);


  const puedeEditarSede = true;


    //Logica para marcar estados en la lista de espera de alumnos, en pendiente, confirmado o rechazado
  const marcarEstadosAlumnoListaEspera = async (id, tipo) => {
    try {
      if (tipo === "pendiente") {
        const confirm = await sweetalert2.fire({
          title: "¿Está seguro que quiere marcar como pendiente?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, marcar como pendiente",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;
        const datosParaEnviar = {
          id_lista_espera: id,
          estado_contacto: "Pendiente",
          notas: "Pendiente de contacto",
          id_usuario_contacto: userId,
        };
        try {
          await insertarContactoListaEspera(datosParaEnviar);
          await sweetalert2.fire({
            icon: "success",
            title: "Marcado como pendiente",
            text: "El estado se marcó correctamente.",
            timer: 1800,
            showConfirmButton: false,
          });
        } catch (error) {
          await sweetalert2.fire({
            icon: "error",
            title: "Error",
            text: "Se ha producido un error.",
            timer: 1800,
            showConfirmButton: false,
          });
          console.error(error);
        } finally {
          refetchListaEspera();
        }
      } else if (tipo === "confirmado") {
        const confirm = await sweetalert2.fire({
          title: "¿Está seguro que quiere marcar como confirmado?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, marcar como confirmado",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;
        try {
          const datosParaEnviar = {
            estado_contacto: "Confirmado",
            id_usuario_contacto: userId,
            notas: "Contacto confirmado",
          };
          await modificarContactoListaEspera(id, datosParaEnviar);
          await sweetalert2.fire({
            icon: "success",
            title: "Marcado como confirmado",
            text: "El estado se marcó correctamente.",
            timer: 1800,
            showConfirmButton: false,
          });
        } catch (error) {
          await sweetalert2.fire({
            icon: "error",
            title: "Error",
            text: "Se ha producido un error.",
            timer: 1800,
            showConfirmButton: false,
          });
          console.error(error);
        } finally {
          refetchListaEspera();
        }
      } else if (tipo === "rechazado") {
        const confirm = await sweetalert2.fire({
          title: "¿Está seguro que quiere marcar como rechazado/sin respuesta?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, marcar como rechazado/sin respuesta",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;
        try {
          const datosParaEnviar = {
            estado_contacto: "Rechazado/Sin Respuesta",
            id_usuario_contacto: userId,
            notas: "Contacto rechazado o sin respuesta",
          };
          await modificarContactoListaEspera(id, datosParaEnviar);
          await sweetalert2.fire({
            icon: "success",
            title: "Marcado como rechazado/sin respuesta",
            text: "El estado se marcó correctamente.",
            timer: 1800,
            showConfirmButton: false,
          });
        } catch (error) {
          await sweetalert2.fire({
            icon: "error",
            title: "Error",
            text: "Se ha producido un error.",
            timer: 1800,
            showConfirmButton: false,
          });
          console.error(error);
        } finally {
          refetchListaEspera();
        }
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: "Se ha producido un error.",
        timer: 1800,
        showConfirmButton: false,
      });
      console.error(error);
    }
  };

  const handleSectionChange = (newSection) => {
    setSection(newSection);
  };

  const handlePanelToggle = (panelName) => {
    setVisiblePanels((prevPanels) => ({
      ...prevPanels,
      [panelName]: !prevPanels[panelName],
    }));
  };

  // Se busca contar cuántas clases de prueba hay en otros días del mismo grupo horario
  // Se busca abrir el modal para asignar o cambiar el instructor de un horario
  const handleOpenModalProfesor = (day, hour) => {
    const key = `${day}-${hour}`;
    const cellData = schedule[key] || {};
    const id_horario = cellData.id_horario || null;
    const coachName = cellData.coach || "";
    const instructorObj = instructoresData?.find(
      (i) => i.nombre_completo === coachName
    );
    setHorarioSeleccionado({
      id_horario,
      day,
      hour,
      instructorId: instructorObj ? instructorObj.id : "",
      instructorName: coachName,
    });
    setIsModalProfesorOpen(true);
  };

  // Se busca abrir el modal que muestra el detalle de alumnos ausentes
  const handleOpenModalDetalleAusentes = () => {
    setIsModalDetalleAusentes(true);
  };

  // Se busca guardar el instructor asignado a un horario específico
  const handleSaveInstructor = async (nuevoHorario) => {
    const datosParaGuardar = {
      id_horario: nuevoHorario.id_horario,
      dia_semana: nuevoHorario.day,
      hora_inicio: nuevoHorario.hour,
      id_instructor: nuevoHorario.instructorId,
    };

    console.log(datosParaGuardar)
    try {
      await insertarHorario(datosParaGuardar);
      await sweetalert2.fire({
        icon: "success",
        title: "Instructor asignado",
        text: `El instructor fue asignado correctamente al horario ${nuevoHorario.day} ${nuevoHorario.hour}.`,
        timer: 1800,
        showConfirmButton: false,
      });
      setIsModalProfesorOpen(false);
      refetch();
    } catch (error) {
      console.error("Error al guardar el instructor:", error);
    }
  };

  // Se busca agregar, modificar o eliminar una persona en la lista de espera
  const handleUpdateWaitingList = async (id, personData) => {
    try {
      if (personData === null) {
        const confirm = await sweetalert2.fire({
          title: "¿Seguro que deseas eliminar a esta persona?",
          text: "Se eliminará toda la información asociada a esta persona de la lista de espera.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;

        await remove(id);
        await sweetalert2.fire({
          icon: "success",
          title: "Eliminado",
          text: "La persona fue eliminada correctamente de la lista de espera.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        const objetoParaBackend = {
          nombre: personData.name,
          contacto: personData.contact,
          tipo: personData.type === "cambio" ? "Cambio de turno" : "Espera",
          plan_interes: personData.plan,
          horarios_preferidos: personData.hours.join(","),
          observaciones: personData.obs,
        };

        if (id) {
          const confirm = await sweetalert2.fire({
            title: `¿Modificar datos de ${personData.name}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, modificar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
          });
          if (!confirm.isConfirmed) return;

          await update(id, objetoParaBackend);
          await sweetalert2.fire({
            icon: "success",
            title: "Modificado",
            text: "La persona fue modificada correctamente en la lista de espera.",
            timer: 1800,
            showConfirmButton: false,
          });
        } else {
          await insertarListaEspera(objetoParaBackend);
          await sweetalert2.fire({
            icon: "success",
            title: "Agregado",
            text: "La persona fue agregada correctamente a la lista de espera.",
            timer: 1800,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar la lista de espera.",
      });
      console.error("Error en handleUpdateWaitingList:", error);
    } finally {
      refetchListaEspera();
    }
  };

  // Se busca abrir el modal para agregar o editar un alumno en un horario específico
  const handleCellClick = (day, time, studentToEdit = null) => {
    const key = `${day}-${time}`;
    const studentsInSlot = schedule[key] || [];
    if (!studentToEdit && studentsInSlot.length >= MAX_STUDENTS_PER_SLOT) {
      alert(`Este turno ya está completo (${MAX_STUDENTS_PER_SLOT}/${MAX_STUDENTS_PER_SLOT}).`);
      return;
    }

    setCurrentCell({ key, day, time, student: studentToEdit });
    setIsModalOpen(true);
  };

  // Se busca validar si el nombre del alumno ya existe en otro horario para evitar duplicados
  const validateNameDuplicates = async (studentData, accion) => {
    const removeAccents = (str) =>
      (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

    const allStudents = Object.values(schedule)
      .map((cell) => cell.alumnos || [])
      .flat();
    const nombreIngresado = removeAccents(studentData.name);
    const yaExiste = allStudents.some(
      (s) =>
        removeAccents(s.name) === nombreIngresado &&
        (accion === "agregar" ||
          (accion === "modificar" && s.id !== studentData.id))
    );

    if (yaExiste) {
      await sweetalert2.fire({
        icon: "warning",
        title: "Nombre duplicado",
        text:
          accion === "agregar"
            ? `¡Alerta! El alumno ${studentData.name} ya existe en otro horario. No se puede crear un duplicado.`
            : `¡Alerta! Ya existe otro alumno con el nombre ${studentData.name}. No se puede modificar a un nombre duplicado.`,
        confirmButtonText: "Aceptar",
      });
      return true;
    }
    return false;
  };

  // Se busca agregar, modificar o eliminar un alumno en la base de datos
  const handleSaveStudent = async (key, studentData, accion) => {
    if (await validateNameDuplicates(studentData, accion)) return;
    try {
      if (accion === "eliminar") {
        const confirm = await sweetalert2.fire({
          title: `¿Seguro que deseas eliminar a ${studentData.student.name}?`,
          text: "Se eliminará toda la información asociada a este cliente.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;

        await deleteCliente(studentData.student.id);
        await sweetalert2.fire({
          icon: "success",
          title: "Eliminado",
          text: "El alumno fue eliminado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
        refetch();
        return;
      }

      if (accion === "modificar") {
        const confirm = await sweetalert2.fire({
          title: `¿Modificar datos de ${studentData.name}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, modificar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;
      }

      let fechaInicioStr =
        studentData.planDetails?.startDate ||
        studentData.trialDetails?.date ||
        studentData.scheduledDetails?.date ||
        "";
      let fechaFinStr = "";
      if (fechaInicioStr) {
        const fechaInicio = new Date(fechaInicioStr);
        if (!isNaN(fechaInicio.getTime())) {
          const fechaFin = new Date(fechaInicio);
          fechaFin.setDate(fechaFin.getDate() + 30);
          const año = fechaFin.getFullYear();
          const mes = String(fechaFin.getMonth() + 1).padStart(2, "0");
          const dia = String(fechaFin.getDate()).padStart(2, "0");
          fechaFinStr = `${año}-${mes}-${dia}`;
        }
      }
      const inscripcionData = {
        id_horario: 17,
        dia: key.split("-")[0],
        horario: key.split("-")[1],
        fecha_inscripcion: new Date().toISOString().split("T")[0],
      };

      let fechaFinStr_prueba = "";
      // Si el alumno está en clase de prueba, la fecha fin será la fecha inicio + 1 día
      if (
        studentData.status === "Clase de prueba" ||
        studentData.status === "prueba"
      ) {
        if (fechaInicioStr) {
          const inicio = new Date(fechaInicioStr + "T00:00:00");
          if (!isNaN(inicio.getTime())) {
            inicio.setDate(inicio.getDate() + 1);
            const añoP = inicio.getFullYear();
            const mesP = String(inicio.getMonth() + 1).padStart(2, "0");
            const diaP = String(inicio.getDate()).padStart(2, "0");
            fechaFinStr_prueba = `${añoP}-${mesP}-${diaP}`;
          }
        }
      }

      console.log(fechaFinStr_prueba)

      const formDataForDB = {
        id: studentData.id || null,
        nombre: studentData.name || "",
        telefono: studentData.contact || "",
        estado:
          studentData.status === "plan"
            ? "Plan"
            : studentData.status === "prueba"
            ? "Clase de prueba"
            : "Renovacion programada",
        fecha_inicio: fechaInicioStr,
        fecha_fin: studentData.status === "prueba" ? fechaFinStr_prueba : studentData.planDetails.endDate || "",
        id_horario: 1,
        observaciones: studentData.planDetails?.observation || "SIN OBSERVACIONES",
      };
      console.log(formDataForDB);
      if (accion === "agregar") {
        await insertCliente(formDataForDB, inscripcionData);
        await sweetalert2.fire({
          icon: "success",
          title: "Agregado",
          text: "El alumno fue agregado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else if (accion === "modificar") {
        await insertCliente(formDataForDB, inscripcionData, true);
        await sweetalert2.fire({
          icon: "success",
          title: "Modificado",
          text: "El alumno fue modificado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      }
      refetch();
    } catch (error) {
      console.log(error)
      await sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el cliente en la base de datos.",
      });
      return;
    }
  };

  // Se busca obtener el contenido y el estilo visual de la celda según el estado del alumno
  const getCellContentAndStyle = useCallback((student) => {
    if (!student) return { content: null, style: "bg-white hover:bg-gray-100" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let content = <span className="font-semibold">{student.name}</span>;
    let style = "bg-gray-100";
    let isExpired = false;
    switch (student.status) {
      case "plan":
        const startDate = new Date(student.planDetails.startDate + "T00:00:00");
        const expiryDate = new Date(
          startDate.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        isExpired = expiryDate < today;
        style = "bg-gray-200";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              {isExpired ? "Venció" : "Vence"} el{" "}
              {expiryDate.toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      case "prueba":
        const trialDate = new Date(student.trialDetails.date + "T00:00:00");
        isExpired = trialDate < today;
        style = "bg-cyan-200";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              Clase de prueba{" "}
              {new Date(
                student.trialDetails.date + "T00:00:00"
              ).toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      case "programado":
        const scheduledDate = new Date(
          student.scheduledDetails.date + "T00:00:00"
        );
        isExpired = scheduledDate < today;
        style = "bg-yellow-200";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              Renueva el{" "}
              {new Date(
                student.scheduledDetails.date + "T00:00:00"
              ).toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      default:
        break;
    }
    if (isExpired) style = "bg-red-500 text-white";
    return { content, style };
  }, []);

  // Se busca calcular los cupos libres, alumnos con plan vencido y coincidencias en la lista de espera
  const { freeSlots, expiredStudents, waitingListMatches, waitingListMatchesCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calculatedFreeSlots = {};
    DAYS.forEach((day) => {
      calculatedFreeSlots[day] = [];
    });

    HOURS.forEach((hour) => {
      DAYS.forEach((day) => {
        const studentsCount = (schedule[`${day}-${hour}`]?.alumnos || []).length;
        const available = Math.max(0, MAX_STUDENTS_PER_SLOT - studentsCount);
        if (available > 0) {
          calculatedFreeSlots[day].push({ hour, count: available });
        }
      });
    });

    const allStudents = Object.values(schedule)
      .map((cell) => cell.alumnos || [])
      .flat();
    const processedIds = new Set();
    const calculatedExpiredStudents = [];
    allStudents.forEach((student) => {
      if (!student || processedIds.has(student.id)) return;
      let expiryDate;
      let type = "";
      switch (student.status) {
        case "plan":
          const startDate = new Date(
            student.planDetails.startDate + "T00:00:00"
          );
          expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          type = "Plan vencido";
          break;
        case "prueba":
          expiryDate = new Date(student.trialDetails.date + "T00:00:00");
          type = "Clase de prueba caducada";
          break;
        case "programado":
          expiryDate = new Date(student.scheduledDetails.date + "T00:00:00");
          type = "Renovación pendiente";
          break;
        default:
          return;
      }
      if (expiryDate < today) {
        calculatedExpiredStudents.push({
          name: student.name,
          type: type,
          date: expiryDate.toLocaleDateString("es-ES"),
        });
        processedIds.add(student.id);
      }
    });

    const calculatedMatches = {};
    DAYS.forEach((day) => {
      calculatedMatches[day] = [];
    });

    let matchesCount = 0;
    waitingList.forEach((person) => {
      if (!person) return;
      const desiredPlan = (person.plan || "").toUpperCase();
      const desiredDays =
        desiredPlan === "CUALQUIER DIA"
          ? DAYS
          : DAYS.includes(desiredPlan)
          ? [desiredPlan]
          : [];

      desiredDays.forEach((day) => {
        const matchingHours = person.hours.filter((hour) =>
          calculatedFreeSlots[day]?.some((slot) => slot.hour === hour)
        );

        if (matchingHours.length > 0) {
          calculatedMatches[day].push({
            ...person,
            matchedHours: matchingHours,
          });
          matchesCount += 1;
        }
      });
    });

    return {
      freeSlots: calculatedFreeSlots,
      expiredStudents: calculatedExpiredStudents,
      waitingListMatches: calculatedMatches,
      waitingListMatchesCount: matchesCount,
    };
  }, [schedule, waitingList]);

  // Se busca registrar el contacto realizado con un alumno ausente
  const handleContactAlumno = async (id, name, contacto) => {
    console.log("Contactar a:", { id, name, contacto });
    const now = new Date();
    now.setHours(now.getHours() - 3); // Restar 3 horas a la hora actual porque sino hay desfase
    const fecha_contacto = now.toISOString().slice(0, 19).replace("T", " ");

    const datosParaEnviar = {
      id: id,
      nombre: name,
      contacto: contacto,
      fecha_contacto: fecha_contacto,
      id_usuario_contacto: userId,
    };

    console.log("Los datos a enviar son:", datosParaEnviar);
    try {
      const res = await modificarAlumnoContactado(id, datosParaEnviar);
      if (res) {
        await sweetalert2.fire({
          icon: "success",
          title: "Alumno contactado",
          text: `Se registró el contacto con ${name} exitosamente.`,
          timer: 1800,
          showConfirmButton: false,
        });
        refetchAusentes();
        setcontactarAlumno(false);
      } else {
        throw new Error("No se pudo modificar el alumno");
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: `Ocurrió un error al registrar el contacto con ${name}.`,
      });
    }
  };

  return {
    states: {
      puedeEditarSede,
      section,
      schedule,
      waitingList,
      isModalProfesorOpen,
      horarioSeleccionado,
      currentCell,
      searchTerm,
      isModalOpen,
      visiblePanels,
      instructoresData,
      rol,
      freeSlots,
      expiredStudents,
      waitingListMatches,
  waitingListMatchesCount,
      fechaHoy,
      ausentesAlumnos,
      isModalDetalleAusentes,
      contactarAlumno,
    },
    setters: {
      setSection,
      setIsModalProfesorOpen,
      setSearchTerm,
      setIsModalOpen,
      setIsModalDetalleAusentes,
      setcontactarAlumno,
    },
    functions: {
      handleSectionChange,
      handlePanelToggle,
      handleOpenModalProfesor,
      handleSaveInstructor,
      handleUpdateWaitingList,
      handleCellClick,
      handleSaveStudent,
      getCellContentAndStyle,
      handleOpenModalDetalleAusentes,
      handleContactAlumno,
      marcarEstadosAlumnoListaEspera,
    },
  };
};

export default PilatesGestionLogica;
