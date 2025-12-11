/**
 * Modal para ver la ubicación de un conductor en tiempo real
 * Se integra con el perfil del conductor existente
 */

import { useState, useEffect } from 'react';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/progress/circular-progress.js';
import Modal from '../../../shared/components/modal/Modal';
import DriverTrackingMap from './DriverTrackingMap';
import useDriverTracking from '../../../shared/hooks/useDriverTracking';

const DriverTrackingModal = ({ isOpen, onClose, conductor, driverId }) => {
  const {
    location,
    isConnected,
    isLoading,
    error,
    disconnect,
    isDriverOnline,
  } = useDriverTracking(driverId || conductor?.idConductor);

  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (location?.timestamp) {
      setLastUpdate(new Date(location.timestamp));
    }
  }, [location?.timestamp]);

  useEffect(() => {
    if (!isOpen) {
      setLastUpdate(null);
    }
  }, [isOpen]);

  const driverName = conductor
    ? `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.trim() ||
      `Conductor #${conductor.idConductor}`
    : `Conductor #${driverId}`;

  const isOnline = isDriverOnline(driverId || conductor?.idConductor);

  const formatTime = date => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="h4 font-medium text-primary">
                Ubicación en tiempo real
              </h3>
              <p className="text-sm text-secondary">{driverName}</p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${
              isOnline
                ? 'bg-green border-green text-green'
                : 'bg-red border-red text-red'
            }`}
          >
            <span className="text-xs font-medium">
              {isOnline ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>

        {isOnline && location ? (
          <div className="flex flex-col gap-4">
            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border">
              <DriverTrackingMap
                locations={location ? [location] : []}
                selectedDriverId={driverId || conductor?.idConductor}
                isConnected={isConnected}
                isLoading={isLoading}
                height="100%"
                showStatusPanel={false}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-fill border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <md-icon>my_location</md-icon>
                </div>
                <div>
                  <p className="text-xs text-secondary">Latitud</p>
                  <p className="text-sm font-semibold text-primary font-mono">
                    {location?.latitude?.toFixed(6) || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-fill border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <md-icon>explore</md-icon>
                </div>
                <div>
                  <p className="text-xs text-secondary">Longitud</p>
                  <p className="text-sm font-semibold text-primary font-mono">
                    {location?.longitude?.toFixed(6) || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-fill border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <md-icon>speed</md-icon>
                </div>
                <div>
                  <p className="text-xs text-secondary">Velocidad</p>
                  <p className="text-sm font-semibold text-primary font-mono">
                    {location?.speed
                      ? `${(location.speed * 3.6).toFixed(1)} km/h`
                      : '0 km/h'}
                  </p>
                </div>
              </div>

              <div className="bg-fill border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <md-icon>schedule</md-icon>
                </div>
                <div>
                  <p className="text-xs text-secondary">Actualización</p>
                  <p className="text-sm font-semibold text-primary font-mono">
                    {formatTime(lastUpdate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-fill rounded-xl border border-border text-center">
            <md-icon className="text-2xl text-secondary opacity-50 mb-4">
              location_off
            </md-icon>
            <h3 className="text-lg font-semibold text-primary mb-2">
              {isLoading ? 'Conectando...' : 'Conductor sin conexión'}
            </h3>
            <p className="text-sm text-secondary max-w-xs mx-auto">
              {isLoading
                ? 'Estableciendo conexión con el servidor de tracking...'
                : 'Este conductor no está compartiendo su ubicación en este momento. La ubicación se mostrará automáticamente cuando se conecte.'}
            </p>
            {isLoading && (
              <div className="mt-4">
                <md-circular-progress indeterminate />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn px-5 text-secondary hover:text-primary transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DriverTrackingModal;
