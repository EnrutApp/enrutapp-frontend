import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import '@material/web/icon/icon.js';
import { useGoogleMaps } from '../../../context/GoogleMapsLoader';

const defaultCenter = {
  lat: 6.2476,
  lng: -75.5658,
};

const MARKER_COLORS = {
  ORIGIN: '#34c759',
  DESTINATION: '#ff3b30',
  STOP: '#0071e3',
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const GoogleMapComponent = ({
  origen = null,
  destino = null,
  paradas = [],
  height = '400px',
  className = '',
  onMapClick = null,
  allowClickSelection = false,
  showDefaultMap = false,
  initialCenter = null,
  initialZoom = 14,
  onRouteCalculated = null,
  interactive = true,
}) => {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const directionsService = useRef(null);
  const geocoder = useRef(null);

  const center = useMemo(() => {
    if (initialCenter && Array.isArray(initialCenter)) {
      return { lat: initialCenter[1], lng: initialCenter[0] };
    }
    if (origen?.latitud && origen?.longitud) {
      return {
        lat: parseFloat(origen.latitud),
        lng: parseFloat(origen.longitud),
      };
    }
    return defaultCenter;
  }, [origen, initialCenter]);

  useEffect(() => {
    if (isLoaded && window.google && !directionsService.current) {
      directionsService.current = new window.google.maps.DirectionsService();
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const onLoad = useCallback(map => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    e => {
      if (!allowClickSelection || !onMapClick || !geocoder.current) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      geocoder.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            onMapClick({
              lat,
              lng,
              address: results[0].formatted_address,
            });
          } else {
            onMapClick({ lat, lng, address: '' });
          }
        }
      );
    },
    [allowClickSelection, onMapClick]
  );

  useEffect(() => {
    if (!directionsService.current || !origen || !destino) {
      if (!origen && !destino && directions) {
        setDirections(null);
      }
      return;
    }

    if (
      origen.latitud === destino.latitud &&
      origen.longitud === destino.longitud
    )
      return;

    const waypoints = paradas
      .filter(p => p.latitud && p.longitud)
      .map(p => ({
        location: { lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) },
        stopover: true,
      }));

    directionsService.current.route(
      {
        origin: {
          lat: parseFloat(origen.latitud),
          lng: parseFloat(origen.longitud),
        },
        destination: {
          lat: parseFloat(destino.latitud),
          lng: parseFloat(destino.longitud),
        },
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          if (onRouteCalculated) {
            const route = result.routes[0];
            let distance = 0;
            let duration = 0;
            route.legs.forEach(leg => {
              distance += leg.distance.value;
              duration += leg.duration.value;
            });

            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const durationFormatted = `${hours}:${minutes.toString().padStart(2, '0')}`;

            onRouteCalculated({
              distance,
              duration,
              durationFormatted,
              geometry: route.overview_polyline,
            });
          }
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  }, [origen, destino, paradas, onRouteCalculated, isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div className="w-full h-full bg-fill animate-pulse flex items-center justify-center">
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
        onClick={handleMapClick}
        options={{
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: interactive,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {origen && origen.latitud && (
          <Marker
            position={{
              lat: parseFloat(origen.latitud),
              lng: parseFloat(origen.longitud),
            }}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: MARKER_COLORS.ORIGIN,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 1.8,
              anchor: new window.google.maps.Point(12, 22),
              labelOrigin: new window.google.maps.Point(12, 9),
            }}
            label={{
              text: 'A',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
            title="Origen"
          />
        )}

        {paradas &&
          paradas.map(
            (parada, index) =>
              parada.latitud && (
                <Marker
                  key={`parada-${index}`}
                  position={{
                    lat: parseFloat(parada.latitud),
                    lng: parseFloat(parada.longitud),
                  }}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: MARKER_COLORS.STOP,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#ffffff',
                    scale: 1.4,
                    anchor: new window.google.maps.Point(12, 22),
                    labelOrigin: new window.google.maps.Point(12, 9),
                  }}
                  label={{
                    text: `${index + 1}`,
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                  }}
                  title={`Parada ${index + 1}`}
                />
              )
          )}

        {destino && destino.latitud && (
          <Marker
            position={{
              lat: parseFloat(destino.latitud),
              lng: parseFloat(destino.longitud),
            }}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: MARKER_COLORS.DESTINATION,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 1.8,
              anchor: new window.google.maps.Point(12, 22),
              labelOrigin: new window.google.maps.Point(12, 9),
            }}
            label={{
              text: 'B',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
            title="Destino"
          />
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
