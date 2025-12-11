import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useCallback, useEffect, useState, useMemo, useRef, memo } from 'react';
import '@material/web/icon/icon.js';
import { useGoogleMaps } from '../../../shared/context/GoogleMapsLoader';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
};

const DriverTrackingMap = memo(
  ({
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
    initialCenter = { lat: 6.2476, lng: -75.5658 },
    initialZoom = 12,
  }) => {
    const { isLoaded } = useGoogleMaps();
    const [map, setMap] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [center, setCenter] = useState(initialCenter);
    const [isFollowing, setIsFollowing] = useState(true);

    const onLoad = useCallback(map => {
      setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
      setMap(null);
    }, []);

    useEffect(() => {
      if (selectedDriverId && locations.length > 0 && isFollowing) {
        const driverLocation = locations.find(
          l => l.driverId === selectedDriverId
        );
        if (driverLocation) {
          setCenter({
            lat: driverLocation.latitude,
            lng: driverLocation.longitude,
          });
          setSelectedMarker(driverLocation);
        }
      }
    }, [selectedDriverId, locations, isFollowing]);

    useEffect(() => {
      if (map && locations.length > 1 && !selectedDriverId && !isFollowing) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach(loc => {
          bounds.extend({ lat: loc.latitude, lng: loc.longitude });
        });
        map.fitBounds(bounds);
      }

      if (locations.length === 1 && !selectedDriverId) {
        setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
      }
    }, [map, locations, selectedDriverId, isFollowing]);

    const handleMarkerClick = location => {
      setSelectedMarker(location);
      if (onDriverSelect) {
        onDriverSelect(location.driverId);
      }
      setIsFollowing(true);
      setCenter({ lat: location.latitude, lng: location.longitude });
    };

    const handleCenterOnDriver = () => {
      if (selectedMarker) {
        setCenter({
          lat: selectedMarker.latitude,
          lng: selectedMarker.longitude,
        });
        setIsFollowing(true);
        if (map) map.setZoom(15);
      }
    };

    const handleFitAll = () => {
      if (map && locations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach(loc => {
          bounds.extend({ lat: loc.latitude, lng: loc.longitude });
        });
        map.fitBounds(bounds);
        setIsFollowing(false);
      }
    };

    if (!isLoaded) {
      return (
        <div className={`relative ${className}`} style={{ height }}>
          <div className="w-full h-full bg-fill animate-pulse flex items-center justify-center rounded-xl border border-border">
            <p className="text-secondary">Cargando mapa...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`} style={{ height }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={initialZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: !showControls,
            zoomControl: showControls,
            streetViewControl: false,
            mapTypeControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {locations.map(location => (
            <Marker
              key={location.driverId}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => handleMarkerClick(location)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: location.isOnline ? '#22c55e' : '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{
                lat: selectedMarker.latitude,
                lng: selectedMarker.longitude,
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[200px]">
                <div className="font-semibold text-gray-900 mb-1">
                  Conductor #{selectedMarker.driverId}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {selectedMarker.latitude.toFixed(6)},{' '}
                  {selectedMarker.longitude.toFixed(6)}
                </div>
                {selectedMarker.speed > 0 && (
                  <div className="text-xs font-medium text-blue-600 mb-2">
                    {(selectedMarker.speed * 3.6).toFixed(1)} km/h
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedMarker.isOnline ? 'bg-green' : 'bg-red'}`}
                  ></div>
                  <span className="text-xs text-gray-700">
                    {selectedMarker.isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {showStatusPanel && (
          <div className="absolute top-3 left-3 right-3 bg-fill border border-border rounded-xl p-3 flex items-center justify-between gap-4 z-10 shadow-lg">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red'}`}
              />
              <span className="text-sm text-secondary">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <md-icon style={{ fontSize: '16px', color: 'var(--primary)' }}>
                local_taxi
              </md-icon>
              <span className="text-sm text-secondary">
                {locations.filter(l => l.isOnline).length} en línea
              </span>
            </div>
          </div>
        )}

        {showControls && (
          <div className="absolute right-3 bottom-6 flex flex-col gap-2 z-10">
            {selectedMarker && (
              <button
                className={`w-11 h-11 rounded-full bg-fill border border-border flex items-center justify-center cursor-pointer shadow-lg hover:bg-secondary/10 transition-colors ${isFollowing ? 'text-primary' : 'text-secondary'}`}
                onClick={handleCenterOnDriver}
                title="Centrar en conductor"
              >
                <md-icon>my_location</md-icon>
              </button>
            )}
            {locations.length > 1 && (
              <button
                className="w-11 h-11 rounded-full bg-fill border border-border flex items-center justify-center cursor-pointer shadow-lg hover:bg-secondary/10 transition-colors text-secondary"
                onClick={handleFitAll}
                title="Ver todos los conductores"
              >
                <md-icon>zoom_out_map</md-icon>
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 bg-fill p-6 rounded-xl border border-border z-20 shadow-xl">
            <md-circular-progress indeterminate></md-circular-progress>
            <span className="text-sm text-secondary">
              Conectando al servidor...
            </span>
          </div>
        )}

        {!isLoading && !error && locations.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-6 bg-fill rounded-xl border border-border z-10 shadow-xl">
            <md-icon className="text-2xl text-secondary mb-3">
              location_off
            </md-icon>
            <div className="font-semibold text-primary mb-1">
              Sin conductores activos
            </div>
            <div className="text-sm text-secondary">
              No hay conductores compartiendo ubicación
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default DriverTrackingMap;
