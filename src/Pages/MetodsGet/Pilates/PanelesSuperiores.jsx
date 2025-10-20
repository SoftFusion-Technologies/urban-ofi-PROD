import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import { useState, useMemo } from "react";
import { DAYS } from "./Constants/constanst";

const PanelesSuperiores = ({
  freeSlots,
  expiredStudents,
  waitingListMatches,
  waitingListMatchesCount,
  visiblePanels,
  onToggle,
  alumnosAusentes = [],
  onOpenModalDetalleAusentes,
}) => {
  // Estado para controlar la expansión de todos los paneles
  const [allExpanded, setAllExpanded] = useState(false);

  const handleExpandAllToggle = () => {
    setAllExpanded(!allExpanded);
  };

  const mesActual = new Date().toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const activePanelsCount = Object.values(visiblePanels).filter(Boolean).length;
  const gridClasses = ` grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-${
    activePanelsCount > 0 ? activePanelsCount : "1"
  } gap-6 mb-8`;

  const { dailyFreeSlotDays, freeSlotsTotal } = useMemo(() => {
    const daysWithSlots = DAYS.filter(
      (day) => Array.isArray(freeSlots?.[day]) && freeSlots[day].length > 0
    );

    const total = daysWithSlots.reduce((acc, day) => {
      const dayCount = freeSlots[day].reduce((sum, slot) => sum + slot.count, 0);
      return acc + dayCount;
    }, 0);

    return {
      dailyFreeSlotDays: daysWithSlots,
      freeSlotsTotal: total,
    };
  }, [freeSlots]);

  const waitingListMatchDays = useMemo(
    () =>
      DAYS.filter(
        (day) =>
          Array.isArray(waitingListMatches?.[day]) &&
          waitingListMatches[day].length > 0
      ),
    [waitingListMatches]
  );

  const formatPlanLabel = (plan = "") => {
    if (!plan) return "";
    if (plan === "CUALQUIER DIA") return "Cualquier día";
    return plan.charAt(0) + plan.slice(1).toLowerCase();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        {/* Botón de expandir/contraer todo */}
        <button
          onClick={handleExpandAllToggle}
          className="w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
          aria-label={
            allExpanded
              ? "Contraer todos los paneles"
              : "Expandir todos los paneles"
          }
        >
          {allExpanded ? (
            <>
              <FaCompressAlt className="mr-2" />
              Contraer Todo
            </>
          ) : (
            <>
              <FaExpandAlt className="mr-2" />
              Expandir Todo
            </>
          )}
        </button>

        {/* Botones de visibilidad de paneles */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {[
            { name: "Libres", key: "freeSlots" },
            { name: "Vencidos", key: "expiredStudents" },
            { name: "Ausentes", key: "absentStudents" },
            { name: "Coincidencias", key: "waitingListMatches" },
          ].map((button) => {
            const visibleCount =
              Object.values(visiblePanels).filter(Boolean).length;
            const isActive = visiblePanels[button.key];
            const isDisabled = isActive && visibleCount <= 1;

            return (
              <button
                key={button.key}
                onClick={() => {
                  if (!isDisabled) {
                    onToggle(button.key);
                  }
                }}
                disabled={isDisabled}
                className={`w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors
            ${
              isActive
                ? isDisabled
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-800 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
                title={
                  isDisabled ? "Debe mantener al menos un panel visible" : ""
                }
              >
                {button.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className={gridClasses}>
        {visiblePanels.freeSlots && (
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300">
            <h3 className="font-bold text-lg text-gray-700 mb-2 border-b pb-2">
              Turnos Libres ({freeSlotsTotal})
            </h3>
            <div
              className={`${
                allExpanded ? "h-80" : "h-40"
              } overflow-y-auto transition-all duration-300 text-sm`}
            >
              {dailyFreeSlotDays.length > 0 ? (
                <div>
                  {dailyFreeSlotDays.map((day) => (
                    <div className="mb-2" key={`free-${day}`}>
                      <p className="font-semibold text-gray-600 text-lg">
                        {day}:
                      </p>
                      <ul>
                        {freeSlots[day].map((slot) => (
                          <li
                            key={`${day}-${slot.hour}`}
                            className="text-gray-600 py-1 pl-2 flex justify-between items-center hover:bg-gray-50 rounded transition-colors"
                          >
                            <span className="text-lg">{slot.hour}</span>
                            <span className="font-bold text-gray-800 bg-gray-200 rounded-full px-2 text-lg mr-2">
                              {slot.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No hay turnos libres.
                </p>
              )}
            </div>
          </div>
        )}
        {visiblePanels.expiredStudents && (
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300">
            <h3 className="font-bold text-lg text-red-600 mb-2 border-b pb-2">
              Planes Vencidos ({expiredStudents.length})
            </h3>
            <div
              className={`${
                allExpanded ? "h-80" : "h-40"
              } overflow-y-auto transition-all duration-300 text-sm`}
            >
              {expiredStudents.length > 0 ? (
                <ul>
                  {expiredStudents.map((student) => (
                    <li
                      key={student.name}
                      className="text-gray-800 py-1 hover:bg-red-50 rounded transition-colors px-2"
                    >
                      <span className="font-semibold">{student.name}</span> -{" "}
                      {student.type} - {student.date}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No hay alumnos con planes vencidos.
                </p>
              )}
            </div>
          </div>
        )}
        {visiblePanels.absentStudents && (
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 sm:p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm sm:text-lg text-gray-700 mb-2 pb-2">
                Alumnos Ausentes ({alumnosAusentes.length})
              </h3>
              <button
                onClick={onOpenModalDetalleAusentes}
                className="w-full sm:w-auto font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
              >
                Detalle
              </button>
            </div>
            <div
              className={`overflow-y-auto transition-all duration-300 text-sm ${
                allExpanded ? "h-80" : "h-40"
              }`}
            >
              {alumnosAusentes.length > 0 ? (
                <ul>
                  {alumnosAusentes.map((alumno) => (
                    <li
                      key={alumno.id}
                      className="text-gray-800 py-1 px-2 hover:bg-yellow-50 rounded transition-colors flex justify-between items-center sm:py-0.5 sm:px-1"
                    >
                      <span className="font-semibold sm:text-sm truncate">
                        {alumno.name}
                      </span>
                      <span className="bg-yellow-200 text-yellow-900 font-bold rounded-full px-3 py-1 text-sm sm:px-2 sm:py-0.5">
                        {alumno.cantidad}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic sm:text-sm">
                  No hay alumnos ausentes este mes.
                </p>
              )}
            </div>
          </div>
        )}
        {visiblePanels.waitingListMatches && (
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300">
            <h3 className="font-bold text-lg text-green-600 mb-2 border-b pb-2">
              ¡Tenés Turnos Para...! ({waitingListMatchesCount})
            </h3>
            <div
              className={`${
                allExpanded ? "h-80" : "h-40"
              } overflow-y-auto transition-all duration-300 text-sm`}
            >
              {waitingListMatchDays.length > 0 ? (
                <div>
                  {waitingListMatchDays.map((day) => (
                    <div className="mb-2" key={`waiting-${day}`}>
                      <p className="font-semibold text-gray-600 text-lg">
                        {day}:
                      </p>
                      <ul>
                        {waitingListMatches[day].map((person) => (
                          <li
                            key={`${day}-${person.id}`}
                            className="text-gray-800 py-1 hover:bg-green-50 rounded transition-colors px-2"
                          >
                            <span className="font-semibold text-lg block">
                              {person.name}
                            </span>
                            <span className="text-sm text-gray-500 block">
                              Horas compatibles: {person.matchedHours.join(", ")}
                            </span>
                            {person.plan &&
                              person.plan !== day &&
                              person.plan !== "CUALQUIER DIA" && (
                                <span className="text-xs text-gray-400 block">
                                  Solicitó originalmente: {formatPlanLabel(person.plan)}
                                </span>
                              )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hay coincidencias.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelesSuperiores;
