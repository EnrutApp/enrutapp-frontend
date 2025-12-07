/**
 * Componente de mapa para tracking de conductores en tiempo real
 * Usa Mapbox GL para mostrar la ubicación de conductores
 */

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/progress/circular-progress.js';

const MAPBOX_TOKEN =
    import.meta.env.VITE_MAPBOX_TOKEN ||
    'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

mapboxgl.accessToken = MAPBOX_TOKEN;

// Estilos CSS del componente
const styles = `
  .tracking-map-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 400px;
    border-radius: 12px;
    overflow: hidden;
  }

  .tracking-map {
    width: 100%;
    height: 100%;
  }

  .tracking-status-panel {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    background: var(--fill);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  .tracking-status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tracking-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .tracking-status-dot.online {
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
  }

  .tracking-status-dot.offline {
    background: var(--red);
  }

  .tracking-status-text {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .tracking-coords {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--background);
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .tracking-speed {
    font-size: 13px;
    font-weight: 600;
    color: var(--primary);
  }

  .tracking-controls {
    position: absolute;
    right: 12px;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }

  .tracking-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--fill);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tracking-btn:hover {
    background: var(--secondary);
    transform: scale(1.05);
  }

  .tracking-btn md-icon {
    color: var(--text-primary);
    font-size: 20px;
  }

  .tracking-btn.active md-icon {
    color: var(--primary);
  }

  .tracking-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: var(--fill);
    padding: 24px 32px;
    border-radius: 12px;
    border: 1px solid var(--border);
    z-index: 20;
  }

  .tracking-loading-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .tracking-no-data {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 24px;
    background: var(--fill);
    border-radius: 12px;
    border: 1px solid var(--border);
    z-index: 10;
  }

  .tracking-no-data md-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .tracking-no-data-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .tracking-no-data-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .driver-marker {
    width: 40px;
    height: 40px;
    background: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .driver-marker:hover {
    transform: scale(1.1);
  }

  .driver-marker md-icon {
    color: white;
    font-size: 20px;
  }

  .driver-marker.offline {
    background: var(--text-secondary);
    opacity: 0.7;
  }

  .driver-popup {
    padding: 4px;
  }

  .driver-popup-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .driver-popup-info {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .driver-popup-status {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .driver-popup-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .mapboxgl-popup-content {
    background: var(--fill) !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    padding: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }

  .mapboxgl-popup-tip {
    border-top-color: var(--fill) !important;
  }
`;

const DriverTrackingMap = memo(({
    locations = [],
    selectedDriverId = null,
    driverInfo = null,
    isConnected = false,
    isLoading = false,
    error = null,
    onDriverSelect = null,
    height = '500px',
    className = '',
    showControls = true,
    showStatusPanel = true,
    initialCenter = [-75.5658, 6.2476], // Colombia
    initialZoom = 12,
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef(new Map());
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isFollowing, setIsFollowing] = useState(true);

    // Obtener la ubicación del conductor seleccionado
    const selectedLocation = locations.find(l => l.driverId === selectedDriverId);

    // Inicializar el mapa
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: initialCenter,
            zoom: initialZoom,
        });

        map.current.on('load', () => {
            setIsMapLoaded(true);
        });

        // Añadir controles de navegación
        map.current.addControl(
            new mapboxgl.NavigationControl({ showCompass: true }),
            'bottom-right'
        );

        return () => {
            // Limpiar markers
            markers.current.forEach(marker => marker.remove());
            markers.current.clear();

            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Actualizar markers cuando cambien las ubicaciones
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        // Crear/actualizar markers para cada conductor
        locations.forEach(location => {
            const existingMarker = markers.current.get(location.driverId);

            if (existingMarker) {
                // Actualizar posición existente con animación
                existingMarker.setLngLat([location.longitude, location.latitude]);

                // Actualizar rotación si hay heading
                if (location.heading !== undefined) {
                    const el = existingMarker.getElement();
                    el.style.transform = `rotate(${location.heading}deg)`;
                }

                // Actualizar clase de online/offline
                const el = existingMarker.getElement();
                el.classList.toggle('offline', !location.isOnline);
            } else {
                // Crear nuevo marker
                const el = document.createElement('div');
                el.className = `driver-marker ${!location.isOnline ? 'offline' : ''}`;
                el.innerHTML = '<md-icon>directions_car</md-icon>';

                if (location.heading !== undefined) {
                    el.style.transform = `rotate(${location.heading}deg)`;
                }

                const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([location.longitude, location.latitude])
                    .addTo(map.current);

                // Añadir popup
                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
                    .setHTML(`
            <div class="driver-popup">
              <div class="driver-popup-name">Conductor #${location.driverId}</div>
              <div class="driver-popup-info">
                ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
              </div>
              ${location.speed ? `<div class="driver-popup-info">🚗 ${(location.speed * 3.6).toFixed(1)} km/h</div>` : ''}
              <div class="driver-popup-status">
                <div class="driver-popup-status-dot" style="background: ${location.isOnline ? 'var(--green)' : 'var(--red)'}"></div>
                <span class="driver-popup-info">${location.isOnline ? 'En línea' : 'Desconectado'}</span>
              </div>
            </div>
          `);

                marker.setPopup(popup);

                // Click handler
                el.addEventListener('click', () => {
                    if (onDriverSelect) {
                        onDriverSelect(location.driverId);
                    }
                });

                markers.current.set(location.driverId, marker);
            }
        });

        // Remover markers de conductores que ya no están en la lista
        markers.current.forEach((marker, driverId) => {
            if (!locations.find(l => l.driverId === driverId)) {
                marker.remove();
                markers.current.delete(driverId);
            }
        });
    }, [locations, isMapLoaded, onDriverSelect]);

    // Centrar en el conductor seleccionado
    useEffect(() => {
        if (!map.current || !isMapLoaded || !selectedLocation || !isFollowing) return;

        map.current.flyTo({
            center: [selectedLocation.longitude, selectedLocation.latitude],
            zoom: 15,
            duration: 1000,
        });
    }, [selectedLocation?.latitude, selectedLocation?.longitude, isMapLoaded, isFollowing]);

    // Centrar en el primer conductor disponible al cargar
    useEffect(() => {
        if (!map.current || !isMapLoaded || locations.length === 0) return;

        const firstLocation = selectedLocation || locations[0];
        if (firstLocation) {
            map.current.flyTo({
                center: [firstLocation.longitude, firstLocation.latitude],
                zoom: 14,
                duration: 1500,
            });
        }
    }, [isMapLoaded, locations.length > 0]);

    const handleCenterOnDriver = useCallback(() => {
        if (!map.current || !selectedLocation) return;

        map.current.flyTo({
            center: [selectedLocation.longitude, selectedLocation.latitude],
            zoom: 15,
            duration: 1000,
        });
        setIsFollowing(true);
    }, [selectedLocation]);

    const handleFitAllDrivers = useCallback(() => {
        if (!map.current || locations.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
            bounds.extend([location.longitude, location.latitude]);
        });

        map.current.fitBounds(bounds, {
            padding: 100,
            duration: 1000,
        });
        setIsFollowing(false);
    }, [locations]);

    return (
        <>
            <style>{styles}</style>
            <div
                className={`tracking-map-container ${className}`}
                style={{ height }}
            >
                <div ref={mapContainer} className="tracking-map" />

                {/* Panel de estado */}
                {showStatusPanel && (
                    <div className="tracking-status-panel">
                        <div className="tracking-status-item">
                            <div className={`tracking-status-dot ${isConnected ? 'online' : 'offline'}`} />
                            <span className="tracking-status-text">
                                {isConnected ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>

                        <div className="tracking-status-item">
                            <md-icon style={{ fontSize: '16px', color: 'var(--primary)' }}>
                                local_taxi
                            </md-icon>
                            <span className="tracking-status-text">
                                {locations.filter(l => l.isOnline).length} en línea
                            </span>
                        </div>

                        {selectedLocation && (
                            <>
                                <span className="tracking-coords">
                                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                                </span>
                                {selectedLocation.speed !== undefined && selectedLocation.speed > 0 && (
                                    <span className="tracking-speed">
                                        🚗 {(selectedLocation.speed * 3.6).toFixed(1)} km/h
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Controles */}
                {showControls && (
                    <div className="tracking-controls">
                        {selectedLocation && (
                            <button
                                className={`tracking-btn ${isFollowing ? 'active' : ''}`}
                                onClick={handleCenterOnDriver}
                                title="Centrar en conductor"
                            >
                                <md-icon>{isFollowing ? 'my_location' : 'location_searching'}</md-icon>
                            </button>
                        )}
                        {locations.length > 1 && (
                            <button
                                className="tracking-btn"
                                onClick={handleFitAllDrivers}
                                title="Ver todos los conductores"
                            >
                                <md-icon>zoom_out_map</md-icon>
                            </button>
                        )}
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="tracking-loading">
                        <md-circular-progress indeterminate></md-circular-progress>
                        <span className="tracking-loading-text">Conectando al servidor de tracking...</span>
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="tracking-no-data">
                        <md-icon style={{ color: 'var(--red)' }}>error</md-icon>
                        <div className="tracking-no-data-title">Error de conexión</div>
                        <div className="tracking-no-data-text">{error}</div>
                    </div>
                )}

                {/* Sin datos */}
                {!isLoading && !error && isMapLoaded && locations.length === 0 && (
                    <div className="tracking-no-data">
                        <md-icon>location_off</md-icon>
                        <div className="tracking-no-data-title">Sin conductores activos</div>
                        <div className="tracking-no-data-text">
                            No hay conductores compartiendo su ubicación en este momento
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});

DriverTrackingMap.displayName = 'DriverTrackingMap';

export default DriverTrackingMap;
