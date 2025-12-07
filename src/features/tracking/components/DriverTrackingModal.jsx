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

// Estilos del modal
const styles = `
  .tracking-modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 800px;
  }

  .tracking-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .tracking-modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tracking-modal-title md-icon {
    font-size: 24px;
    color: var(--primary);
  }

  .tracking-modal-title h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .tracking-modal-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .tracking-modal-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 20px;
    background: var(--fill);
    border: 1px solid var(--border);
  }

  .tracking-modal-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .tracking-modal-status-dot.online {
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: pulse 2s infinite;
  }

  .tracking-modal-status-dot.offline {
    background: var(--red);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .tracking-modal-status-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .tracking-modal-map {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .tracking-modal-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .tracking-info-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .tracking-info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tracking-info-icon md-icon {
    font-size: 20px;
    color: var(--primary);
  }

  .tracking-info-content {
    flex: 1;
  }

  .tracking-info-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 2px;
  }

  .tracking-info-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'SF Mono', 'Menlo', monospace;
  }

  .tracking-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .tracking-offline-message {
    text-align: center;
    padding: 48px 24px;
    background: var(--fill);
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .tracking-offline-message md-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .tracking-offline-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .tracking-offline-text {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 300px;
    margin: 0 auto;
  }
`;

const DriverTrackingModal = ({
    isOpen,
    onClose,
    conductor,
    driverId,
}) => {
    // Usar el hook de tracking
    const {
        location,
        isConnected,
        isLoading,
        error,
        disconnect,
        isDriverOnline,
    } = useDriverTracking(driverId || conductor?.idConductor);

    const [lastUpdate, setLastUpdate] = useState(null);

    // Actualizar timestamp cuando llegue nueva ubicación
    useEffect(() => {
        if (location?.timestamp) {
            setLastUpdate(new Date(location.timestamp));
        }
    }, [location?.timestamp]);

    // Limpiar al cerrar
    useEffect(() => {
        if (!isOpen) {
            setLastUpdate(null);
        }
    }, [isOpen]);

    const driverName = conductor
        ? `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.trim() || `Conductor #${conductor.idConductor}`
        : `Conductor #${driverId}`;

    const isOnline = isDriverOnline(driverId || conductor?.idConductor);

    const formatTime = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{styles}</style>
            <Modal isOpen={isOpen} onClose={onClose} size="large">
                <div className="tracking-modal-content">
                    {/* Header */}
                    <div className="tracking-modal-header">
                        <div className="tracking-modal-title">
                            <md-icon>location_on</md-icon>
                            <div>
                                <h3>Ubicación en tiempo real</h3>
                                <div className="tracking-modal-subtitle">{driverName}</div>
                            </div>
                        </div>

                        <div className="tracking-modal-status">
                            <div className={`tracking-modal-status-dot ${isOnline ? 'online' : 'offline'}`} />
                            <span className="tracking-modal-status-text">
                                {isOnline ? 'En línea' : 'Desconectado'}
                            </span>
                        </div>
                    </div>

                    {/* Mapa o mensaje offline */}
                    {isOnline && location ? (
                        <>
                            <div className="tracking-modal-map">
                                <DriverTrackingMap
                                    locations={location ? [location] : []}
                                    selectedDriverId={driverId || conductor?.idConductor}
                                    isConnected={isConnected}
                                    isLoading={isLoading}
                                    height="400px"
                                    showStatusPanel={false}
                                />
                            </div>

                            {/* Info cards */}
                            <div className="tracking-modal-info">
                                <div className="tracking-info-card">
                                    <div className="tracking-info-icon">
                                        <md-icon>my_location</md-icon>
                                    </div>
                                    <div className="tracking-info-content">
                                        <div className="tracking-info-label">Latitud</div>
                                        <div className="tracking-info-value">
                                            {location?.latitude?.toFixed(6) || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="tracking-info-card">
                                    <div className="tracking-info-icon">
                                        <md-icon>explore</md-icon>
                                    </div>
                                    <div className="tracking-info-content">
                                        <div className="tracking-info-label">Longitud</div>
                                        <div className="tracking-info-value">
                                            {location?.longitude?.toFixed(6) || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="tracking-info-card">
                                    <div className="tracking-info-icon">
                                        <md-icon>speed</md-icon>
                                    </div>
                                    <div className="tracking-info-content">
                                        <div className="tracking-info-label">Velocidad</div>
                                        <div className="tracking-info-value">
                                            {location?.speed
                                                ? `${(location.speed * 3.6).toFixed(1)} km/h`
                                                : '0 km/h'
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="tracking-info-card">
                                    <div className="tracking-info-icon">
                                        <md-icon>schedule</md-icon>
                                    </div>
                                    <div className="tracking-info-content">
                                        <div className="tracking-info-label">Última actualización</div>
                                        <div className="tracking-info-value">
                                            {formatTime(lastUpdate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="tracking-offline-message">
                            <md-icon>location_off</md-icon>
                            <div className="tracking-offline-title">
                                {isLoading ? 'Conectando...' : 'Conductor sin conexión'}
                            </div>
                            <div className="tracking-offline-text">
                                {isLoading
                                    ? 'Estableciendo conexión con el servidor de tracking...'
                                    : 'Este conductor no está compartiendo su ubicación en este momento. La ubicación se mostrará automáticamente cuando se conecte.'
                                }
                            </div>
                            {isLoading && (
                                <md-circular-progress
                                    indeterminate
                                    style={{ marginTop: '16px' }}
                                />
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="tracking-modal-footer">
                        <md-text-button onClick={onClose}>
                            Cerrar
                        </md-text-button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DriverTrackingModal;
