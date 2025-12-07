/**
 * Página de tracking de conductores en tiempo real
 * Vista de administrador para monitorear todos los conductores
 */

import { useState, useEffect } from 'react';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js';
import DriverTrackingMap from './components/DriverTrackingMap';
import useDriverTracking from '../../shared/hooks/useDriverTracking';
import conductorService from '../conductores/api/conductorService';
import Avvvatars from 'avvvatars-react';
import { resolveAssetUrl } from '../../shared/utils/url';

// Estilos de la página
const styles = `
  .tracking-page {
    padding: 24px;
    max-width: 1600px;
    margin: 0 auto;
  }

  .tracking-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .tracking-page-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tracking-page-title md-icon {
    font-size: 32px;
    color: var(--primary);
  }

  .tracking-page-title h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .tracking-page-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .tracking-page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tracking-page-content {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
    min-height: 600px;
  }

  @media (max-width: 1024px) {
    .tracking-page-content {
      grid-template-columns: 1fr;
    }
  }

  .tracking-map-section {
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    min-height: 600px;
  }

  .tracking-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tracking-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tracking-stat-card {
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .tracking-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 4px;
  }

  .tracking-stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .tracking-drivers-list {
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tracking-drivers-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }

  .tracking-drivers-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .tracking-drivers-search {
    width: 100%;
  }

  .tracking-drivers-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .tracking-driver-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .tracking-driver-item:hover {
    background: var(--secondary);
  }

  .tracking-driver-item.selected {
    background: var(--secondary);
    border-color: var(--primary);
  }

  .tracking-driver-avatar {
    position: relative;
    width: 44px;
    height: 44px;
  }

  .tracking-driver-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .tracking-driver-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--fill);
  }

  .tracking-driver-status.online {
    background: var(--green);
  }

  .tracking-driver-status.offline {
    background: var(--text-secondary);
  }

  .tracking-driver-info {
    flex: 1;
    min-width: 0;
  }

  .tracking-driver-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tracking-driver-location {
    font-size: 12px;
    color: var(--text-secondary);
    font-family: 'SF Mono', 'Menlo', monospace;
  }

  .tracking-driver-speed {
    font-size: 12px;
    color: var(--primary);
    font-weight: 500;
  }

  .tracking-empty-list {
    text-align: center;
    padding: 32px;
    color: var(--text-secondary);
  }

  .tracking-empty-list md-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .tracking-connection-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 20px;
  }

  .tracking-connection-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .tracking-connection-dot.connected {
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
  }

  .tracking-connection-dot.disconnected {
    background: var(--red);
  }

  .tracking-connection-text {
    font-size: 13px;
    color: var(--text-secondary);
  }
`;

const TrackingPage = () => {
    const [conductores, setConductores] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingConductores, setLoadingConductores] = useState(true);

    // Hook de tracking para todos los conductores
    const {
        allLocations,
        isConnected,
        isLoading,
        error,
        getDriverLocation,
        isDriverOnline,
    } = useDriverTracking(null); // null = escuchar todos

    // Cargar lista de conductores
    useEffect(() => {
        const loadConductores = async () => {
            try {
                setLoadingConductores(true);
                const response = await conductorService.getConductores();
                setConductores(response.data || []);
            } catch (error) {
                console.error('Error al cargar conductores:', error);
            } finally {
                setLoadingConductores(false);
            }
        };

        loadConductores();
    }, []);

    // Filtrar conductores por búsqueda
    const filteredConductores = conductores.filter(conductor => {
        const nombre = `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        return nombre.includes(query);
    });

    // Obtener conductores con ubicación
    const conductoresConUbicacion = filteredConductores.map(conductor => {
        const location = getDriverLocation(conductor.idConductor);
        return {
            ...conductor,
            location,
            isOnline: isDriverOnline(conductor.idConductor),
        };
    });

    // Ordenar: online primero
    const sortedConductores = [...conductoresConUbicacion].sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return 0;
    });

    const onlineCount = conductoresConUbicacion.filter(c => c.isOnline).length;
    const offlineCount = conductoresConUbicacion.length - onlineCount;

    const handleDriverSelect = (driverId) => {
        setSelectedDriverId(driverId === selectedDriverId ? null : driverId);
    };

    return (
        <>
            <style>{styles}</style>
            <div className="tracking-page">
                {/* Header */}
                <div className="tracking-page-header">
                    <div className="tracking-page-title">
                        <md-icon>location_on</md-icon>
                        <div>
                            <h1>Tracking en Tiempo Real</h1>
                            <div className="tracking-page-subtitle">
                                Monitorea la ubicación de los conductores
                            </div>
                        </div>
                    </div>

                    <div className="tracking-page-actions">
                        <div className="tracking-connection-status">
                            <div className={`tracking-connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                            <span className="tracking-connection-text">
                                {isConnected ? 'Conectado al servidor' : 'Desconectado'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="tracking-page-content">
                    {/* Mapa */}
                    <div className="tracking-map-section">
                        <DriverTrackingMap
                            locations={allLocations}
                            selectedDriverId={selectedDriverId}
                            isConnected={isConnected}
                            isLoading={isLoading}
                            error={error}
                            onDriverSelect={handleDriverSelect}
                            height="100%"
                            showStatusPanel={true}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="tracking-sidebar">
                        {/* Stats */}
                        <div className="tracking-stats-grid">
                            <div className="tracking-stat-card">
                                <div className="tracking-stat-value">{onlineCount}</div>
                                <div className="tracking-stat-label">En línea</div>
                            </div>
                            <div className="tracking-stat-card">
                                <div className="tracking-stat-value">{offlineCount}</div>
                                <div className="tracking-stat-label">Desconectados</div>
                            </div>
                        </div>

                        {/* Lista de conductores */}
                        <div className="tracking-drivers-list">
                            <div className="tracking-drivers-header">
                                <div className="tracking-drivers-title">Conductores</div>
                                <md-outlined-text-field
                                    className="tracking-drivers-search"
                                    label="Buscar conductor"
                                    value={searchQuery}
                                    onInput={(e) => setSearchQuery(e.target.value)}
                                >
                                    <md-icon slot="leading-icon">search</md-icon>
                                </md-outlined-text-field>
                            </div>

                            <div className="tracking-drivers-content">
                                {loadingConductores ? (
                                    <div className="tracking-empty-list">
                                        <md-circular-progress indeterminate />
                                    </div>
                                ) : sortedConductores.length === 0 ? (
                                    <div className="tracking-empty-list">
                                        <md-icon>person_off</md-icon>
                                        <div>No se encontraron conductores</div>
                                    </div>
                                ) : (
                                    sortedConductores.map(conductor => {
                                        const nombre = `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.trim()
                                            || `Conductor #${conductor.idConductor}`;
                                        const fotoUrl = conductor.usuario?.fotoUrl
                                            ? resolveAssetUrl(conductor.usuario.fotoUrl)
                                            : null;

                                        return (
                                            <div
                                                key={conductor.idConductor}
                                                className={`tracking-driver-item ${selectedDriverId === conductor.idConductor ? 'selected' : ''}`}
                                                onClick={() => handleDriverSelect(conductor.idConductor)}
                                            >
                                                <div className="tracking-driver-avatar">
                                                    {fotoUrl ? (
                                                        <img src={fotoUrl} alt={nombre} />
                                                    ) : (
                                                        <Avvvatars value={nombre} style="shape" size={44} />
                                                    )}
                                                    <div className={`tracking-driver-status ${conductor.isOnline ? 'online' : 'offline'}`} />
                                                </div>

                                                <div className="tracking-driver-info">
                                                    <div className="tracking-driver-name">{nombre}</div>
                                                    {conductor.location ? (
                                                        <>
                                                            <div className="tracking-driver-location">
                                                                {conductor.location.latitude.toFixed(4)}, {conductor.location.longitude.toFixed(4)}
                                                            </div>
                                                            {conductor.location.speed > 0 && (
                                                                <div className="tracking-driver-speed">
                                                                    🚗 {(conductor.location.speed * 3.6).toFixed(1)} km/h
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="tracking-driver-location">Sin ubicación</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrackingPage;
