import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "@material/web/icon/icon.js";

const SeatsModal = memo(({ isOpen, onClose, viaje }) => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = React.useState([]);

  if (!isOpen || !viaje) return null;

  // Generar asientos dinámicamente basados en el vehículo
  const generateSeats = useMemo(() => {
    const cantidadAsientos = viaje.vehiculo?.asientos || viaje.asientos || 4;
    const asientos = [];
    let seatId = 1;

    // El asiento 1 es siempre el conductor (deshabilitado)
    asientos.push({
      id: seatId,
      row: 1,
      position: "A",
      occupied: false,
      isDriver: true,
    });
    seatId++;

    // Agregar asientos pasajeros
    for (let i = 1; i < cantidadAsientos; i++) {
      const row = Math.ceil((i) / 2) + 1;
      const position = i % 2 === 1 ? "A" : "B";
      
      asientos.push({
        id: seatId,
        row,
        position,
        occupied: viaje.asientosOcupados?.includes(seatId) || false,
        isDriver: false,
      });
      seatId++;
    }

    return asientos;
  }, [viaje]);

  const toggleSeat = (seatId) => {
    const seat = generateSeats.find((s) => s.id === seatId);
    if (seat.occupied || seat.isDriver) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * (viaje.precio || 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold">Selecciona tus sillas</h2>
            <p className="text-blue-100 text-sm mt-1">
              {viaje.horaSalida} - {viaje.origenTerminal} a {viaje.destinoTerminal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <md-icon className="text-2xl">close</md-icon>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
              Autobús de un piso
            </h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Escala de layout de asientos autobús 1:50
            </p>

            {/* Contenedor de sillas - Simulando un auto */}
            <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl p-8 max-w-sm mx-auto border-2 border-gray-300">
              {/* Parabrisas */}
              <div className="h-8 bg-blue-200 rounded-t-full mx-auto mb-6 flex items-center justify-center border-2 border-gray-400">
                <div className="w-4 h-4 bg-blue-400 rounded-full mx-1"></div>
              </div>

              {/* Sillas del auto */}
              <div className="space-y-8 px-4">
                {/* Fila delantera */}
                <div className="flex justify-center gap-8">
                  {generateSeats
                    .filter((s) => s.row === 1)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id)}
                        disabled={seat.occupied || seat.isDriver}
                        className={`w-16 h-16 rounded-lg font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center border-2 ${
                          seat.occupied
                            ? "bg-red-300 border-red-500 text-gray-700 cursor-not-allowed"
                            : seat.isDriver
                            ? "bg-gray-400 border-gray-600 text-gray-600 cursor-not-allowed"
                            : selectedSeats.includes(seat.id)
                            ? "bg-green-500 border-green-700 text-white shadow-lg scale-105"
                            : "bg-blue-200 border-blue-400 text-gray-800 hover:border-blue-600"
                        }`}
                        title={seat.isDriver ? "Conductor" : seat.occupied ? "Ocupado" : `Asiento ${seat.id}`}
                      >
                        {seat.isDriver ? (
                          <md-icon className="text-2xl">directions_car</md-icon>
                        ) : (
                          <span className="text-lg">{seat.id}</span>
                        )}
                      </button>
                    ))}
                </div>

                {/* Fila trasera */}
                <div className="flex justify-center gap-8 flex-wrap">
                  {generateSeats
                    .filter((s) => s.row > 1)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id)}
                        disabled={seat.occupied || seat.isDriver}
                        className={`w-16 h-16 rounded-lg font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center border-2 ${
                          seat.occupied
                            ? "bg-red-300 border-red-500 text-gray-700 cursor-not-allowed"
                            : seat.isDriver
                            ? "bg-gray-400 border-gray-600 text-gray-600 cursor-not-allowed"
                            : selectedSeats.includes(seat.id)
                            ? "bg-green-500 border-green-700 text-white shadow-lg scale-105"
                            : "bg-blue-200 border-blue-400 text-gray-800 hover:border-blue-600"
                        }`}
                        title={seat.isDriver ? "Conductor" : seat.occupied ? "Ocupado" : `Asiento ${seat.id}`}
                      >
                        {seat.isDriver ? (
                          <md-icon className="text-2xl">directions_car</md-icon>
                        ) : (
                          <span className="text-lg">{seat.id}</span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Maletero */}
              <div className="h-8 bg-gray-400 rounded-b-full mx-auto mt-6 flex items-center justify-center border-2 border-gray-500">
                <div className="w-2 h-2 bg-gray-500 rounded-full mx-1"></div>
              </div>

              {/* Leyenda */}
              <div className="mt-8 space-y-2 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-200 border-2 border-blue-400 rounded"></div>
                  <span className="text-sm text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 border-2 border-green-700 rounded"></div>
                  <span className="text-sm text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-300 border-2 border-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-400 border-2 border-gray-600 rounded flex items-center justify-center">
                    <md-icon className="text-xs">directions_car</md-icon>
                  </div>
                  <span className="text-sm text-gray-600">Conductor</span>
                </div>
              </div>
            </div>

            {/* Información de sillas */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {generateSeats.filter((s) => !s.occupied && !s.isDriver).length}
                  </p>
                  <p className="text-xs text-gray-600">Disponibles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedSeats.length}
                  </p>
                  <p className="text-xs text-gray-600">Seleccionados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {generateSeats.filter((s) => s.occupied).length}
                  </p>
                  <p className="text-xs text-gray-600">Ocupados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de precio */}
          {selectedSeats.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700 font-semibold">
                  {selectedSeats.length} {selectedSeats.length === 1 ? "Silla" : "Sillas"}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(totalPrice)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Elige al menos 1 silla
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/login')}
              className={`flex-1 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                selectedSeats.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <md-icon>check</md-icon>
              Reservar Viaje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SeatsModal.displayName = "SeatsModal";

export default SeatsModal;
