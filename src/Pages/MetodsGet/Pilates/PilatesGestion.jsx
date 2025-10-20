import React from "react";
import NavbarStaff from "../../staff/NavbarStaff"
import { FaSearch } from "react-icons/fa";
import { VscDebugRestart } from "react-icons/vsc";
import GrillaHorarios from "./GrillaHorarios";
import StudentModal from "./Modal/ModalEstudiantes";
import ModalProfesor from "./Modal/ModalProfesor";
import ListaEspera from "./ListaEspera";
import PanelesSuperiores from "./PanelesSuperiores";
import { Link } from "react-router-dom";
import { DAYS, HOURS, MAX_STUDENTS_PER_SLOT } from "./Constants/constanst";
import PilatesGestionLogica from "./Logic/PilatesGestionLogica";
import ModalDetalleAusentes from "./Modal/ModalDetalleAusentes";
import ParticlesBackground from "../../../Components/ParticlesBackground";

const EyeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const PilatesGestion = () => {
  const { states, setters, functions } = PilatesGestionLogica();

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground />
      <div className="dashboardbg min-h-screen pt-10 pb-10 p-1 sm:p-6 lg:p-8 !bg-gradient-to-b !from-blue-950 !via-blue-900 !to-blue-800">
        <div className="mx-auto px-2 sm:px-10 bg-gray-500/50 p-2 rounded-xl ">
          {states.rol === "GESTION" && (
            <div className="flex flex-col sm:flex-row sm:justify-start sm:space-x-5 space-y-3 sm:space-y-0 my-5 w-full">
              <div className="mb-0 sm:mb-4 w-full sm:w-auto">
                <Link to="/dashboard" className="w-full">
                  <button className="w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white h-12 text-base sm:text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Volver
                  </button>
                </Link>
              </div>
              <button
                onClick={() => functions.handleSectionChange("GESTION")}
                className={`w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors inline-flex items-center justify-center ${
                  states.section === "GESTION"
                    ? "bg-blue-800 hover:bg-blue-900 text-white"
                    : "bg-blue-500 hover:bg-blue-700 text-white"
                } text-base sm:text-sm`}
                aria-pressed={states.section === "GESTION"}
              >
                {states.section === "GESTION" && (
                  <EyeIcon className="h-5 w-5 mr-2" />
                )}{" "}
                Gestión
              </button>
              <button
                onClick={() => functions.handleSectionChange("LISTA_ESPERA")}
                className={`w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors inline-flex items-center justify-center ${
                  states.section === "LISTA_ESPERA"
                    ? "bg-blue-800 hover:bg-blue-900 text-white"
                    : "bg-blue-500 hover:bg-blue-700 text-white"
                } text-base sm:text-sm`}
                aria-pressed={states.section === "LISTA_ESPERA"}
              >
                {states.section === "LISTA_ESPERA" && (
                  <EyeIcon className="h-5 w-5 mr-2" />
                )}{" "}
                Lista de espera
              </button>
            </div>
          )}

          {states.rol === "GESTION" && states.section === "LISTA_ESPERA" ? (
            <ListaEspera
              waitingList={states.waitingList}
              onUpdateWaitingList={functions.handleUpdateWaitingList}
              allHours={HOURS}
              marcarEstadosAlumnoListaEspera={functions.marcarEstadosAlumnoListaEspera}
              puedeEditar={states.puedeEditarSede}
              isModalOpenListaEspera={states.isModalOpenListaEspera}
            />
          ) : (
            <>
              {states.rol === "GESTION" && (
                <PanelesSuperiores
                  freeSlots={states.freeSlots}
                  expiredStudents={states.expiredStudents}
                  waitingListMatches={states.waitingListMatches}
                  waitingListMatchesCount={states.waitingListMatchesCount}
                  visiblePanels={states.visiblePanels}
                  onToggle={functions.handlePanelToggle}
                  alumnosAusentes={states.ausentesAlumnos}
                  onOpenModalDetalleAusentes={functions.handleOpenModalDetalleAusentes}
                />
              )}

              <header className="mb-6">
                <h1 className="text-4xl font-bold text-gray-50 mb-2">
                  {states.section === "GESTION"
                    ? "Gestión de Clases de Pilates"
                    : "Lista de Espera - Pilates"}
                </h1>
                <div className="flex justify-center sm:justify-start">
                  <div className="relative w-full max-w-lg">
                    <input
                      type="text"
                      placeholder="Buscar alumno por nombre..."
                      value={states.searchTerm}
                      autoFocus
                      onChange={(e) => setters.setSearchTerm(e.target.value)}
                      className="bg-white w-full p-3 pl-10 pr-24 border border-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <button
                      onClick={() => setters.setSearchTerm("")}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md"
                    >
                      <VscDebugRestart />
                      <span>Resetear</span>
                    </button>
                  </div>
                </div>
              </header>
              <GrillaHorarios
                schedule={states.schedule}
                searchTerm={states.searchTerm}
                handleCellClick={functions.handleCellClick}
                DAYS={DAYS}
                HOURS={HOURS}
                MAX_STUDENTS_PER_SLOT={MAX_STUDENTS_PER_SLOT}
                getCellContentAndStyle={functions.getCellContentAndStyle}
                rol={states.rol}
                onInstructorClick={functions.handleOpenModalProfesor}
                puedeEditarSede={states.puedeEditarSede}
              />

              {states.isModalOpen && states.currentCell && (
                <StudentModal
                  isOpen={states.isModalOpen}
                  onClose={() => setters.setIsModalOpen(false)}
                  onSave={functions.handleSaveStudent}
                  cellData={states.currentCell}
                  fechaHoy={states.fechaHoy}
                />
              )}

              {states.isModalProfesorOpen && (
                <ModalProfesor
                  isOpen={states.isModalProfesorOpen}
                  onClose={() => setters.setIsModalProfesorOpen(false)}
                  horarioData={states.horarioSeleccionado}
                  onSave={functions.handleSaveInstructor}
                  instructores={states.instructoresData}
                />
              )}

              {states.isModalDetalleAusentes && (
                <ModalDetalleAusentes
                  isOpen={states.isModalDetalleAusentes}
                  onClose={() => setters.setIsModalDetalleAusentes(false)}
                  alumnos={states.ausentesAlumnos}
                  onContact={functions.handleContactAlumno}
                  contactarAlumno={states.contactarAlumno}
                  setcontactarAlumno={setters.setcontactarAlumno}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PilatesGestion;