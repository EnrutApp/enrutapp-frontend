import { useRef, useEffect, useMemo, memo } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@material/web/icon/icon.js';
import { useMapInstance } from '../hooks/useMapInstance';
import { useMarkers } from '../hooks/useMarkers';
import { useRouteCalculation } from '../hooks/useRouteCalculation';
import { useGeocodingOptimized } from '../hooks/useGeocodingOptimized';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const MapBoxMap = memo(
  ({
    origen = null,
    destino = null,
    paradas = [],
    onRouteCalculated = null,
    height = '400px',
    className = '',
    interactive = true,
    onMapClick = null,
    allowClickSelection = false,
    showDefaultMap = false,
    initialCenter = null,
    initialZoom = null,
    mapStyle = 'streets-v12',
  }) => {
    const mapContainer = useRef(null);
    const mapId = useRef(
      `map-${Math.random().toString(36).substr(2, 9)}`
    ).current;
    const clickHandlerRef = useRef(null);
    const isUnmountedRef = useRef(false);

    useEffect(() => {
      isUnmountedRef.current = false;
      return () => {
        isUnmountedRef.current = true;
      };
    }, []);

    const { map, isLoaded, error, flyTo } = useMapInstance({
      mapId,
      container: mapContainer,
      initialCenter: initialCenter || [-75.5658, 6.2476],
      initialZoom: initialZoom || 6,
      mapStyle,
      interactive,
    });

    const {
      addOrigenMarker,
      addDestinoMarker,
      addParadaMarkers,
      addClickMarker,
      clearMarkers,
    } = useMarkers(map, isLoaded);

    const { calculateRoute } = useRouteCalculation(map, isLoaded);

    const { reverseGeocode } = useGeocodingOptimized();

    const coordinates = useMemo(() => {
      if (!origen) return null;

      const origenLat = parseFloat(origen.latitud);
      const origenLng = parseFloat(origen.longitud);

      if (isNaN(origenLat) || isNaN(origenLng)) return null;

      if (!destino || origen === destino) {
        return {
          type: 'single',
          origen: { lat: origenLat, lng: origenLng },
        };
      }

      const destinoLat = parseFloat(destino.latitud);
      const destinoLng = parseFloat(destino.longitud);

      if (isNaN(destinoLat) || isNaN(destinoLng)) return null;

      const paradasCoords = paradas
        .filter(p => p && p.latitud && p.longitud)
        .map(p => ({
          lat: parseFloat(p.latitud),
          lng: parseFloat(p.longitud),
        }))
        .filter(p => !isNaN(p.lat) && !isNaN(p.lng));

      return {
        type: 'route',
        origen: { lat: origenLat, lng: origenLng },
        destino: { lat: destinoLat, lng: destinoLng },
        paradas: paradasCoords,
      };
    }, [
      origen?.latitud,
      origen?.longitud,
      destino?.latitud,
      destino?.longitud,
      JSON.stringify(
        paradas?.map(p => ({ lat: p?.latitud, lng: p?.longitud }))
      ),
    ]);

    useEffect(() => {
      if (
        isUnmountedRef.current ||
        !map ||
        !isLoaded ||
        !allowClickSelection ||
        !onMapClick
      ) {
        if (clickHandlerRef.current && map && !isUnmountedRef.current) {
          try {
            map.off('click', clickHandlerRef.current);
          } catch (e) {
          }
          clickHandlerRef.current = null;
        }
        if (map && !isUnmountedRef.current) {
          try {
            const canvas = map.getCanvas && map.getCanvas();
            if (canvas) {
              canvas.style.cursor = '';
            }
          } catch (e) {
          }
        }
        return;
      }

      const handleMapClick = async e => {
        if (isUnmountedRef.current) return;

        const { lng, lat } = e.lngLat;

        const primaryColor =
          getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim() || '#B4C7ED';

        addClickMarker(lng, lat, primaryColor);

        try {
          const address = await reverseGeocode(lng, lat);

          if (!isUnmountedRef.current) {
            onMapClick({ lat, lng, address });
          }
        } catch (error) {
          if (!isUnmountedRef.current) {
            onMapClick({ lat, lng, address: '' });
          }
        }
      };

      clickHandlerRef.current = handleMapClick;
      map.on('click', handleMapClick);

      try {
        const canvas = map.getCanvas && map.getCanvas();
        if (canvas) {
          canvas.style.cursor = 'crosshair';
        }
      } catch (e) {
      }

      return () => {
        if (map && clickHandlerRef.current && !isUnmountedRef.current) {
          try {
            map.off('click', clickHandlerRef.current);
          } catch (e) {
          }
          clickHandlerRef.current = null;
        }
        if (map && !isUnmountedRef.current) {
          try {
            const canvas = map.getCanvas && map.getCanvas();
            if (canvas) {
              canvas.style.cursor = '';
            }
          } catch (e) {
          }
        }
      };
    }, [
      map,
      isLoaded,
      allowClickSelection,
      onMapClick,
      addClickMarker,
      reverseGeocode,
    ]);

    useEffect(() => {
      if (!map || !isLoaded || !initialCenter || !initialZoom) return;

      flyTo(initialCenter, initialZoom);
    }, [map, isLoaded, initialCenter, initialZoom, flyTo]);

    useEffect(() => {
      if (!map || !isLoaded) return;

      if (showDefaultMap && !origen) {
        clearMarkers();
        flyTo([-75.5658, 6.2476], 5.5);
        return;
      }

      if (!coordinates) {
        clearMarkers();
        return;
      }

      if (allowClickSelection) {
        return;
      }

      const primaryColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim() || '#B4C7ED';
      const secondaryColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--secondary')
          .trim() || '#1E304F';
      const yellowColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--yellow-2')
          .trim() || '#FFC107';

      if (coordinates.type === 'single') {
        clearMarkers();
        addOrigenMarker(
          coordinates.origen.lng,
          coordinates.origen.lat,
          primaryColor
        );
        flyTo([coordinates.origen.lng, coordinates.origen.lat], 14);
      } else if (coordinates.type === 'route') {
        clearMarkers();
        addOrigenMarker(
          coordinates.origen.lng,
          coordinates.origen.lat,
          primaryColor
        );
        addDestinoMarker(
          coordinates.destino.lng,
          coordinates.destino.lat,
          secondaryColor
        );

        if (coordinates.paradas.length > 0) {
          addParadaMarkers(coordinates.paradas, yellowColor);
        }

        calculateRoute(
          coordinates.origen.lng,
          coordinates.origen.lat,
          coordinates.destino.lng,
          coordinates.destino.lat,
          coordinates.paradas,
          onRouteCalculated
        );
      }
    }, [
      map,
      isLoaded,
      coordinates,
      showDefaultMap,
      allowClickSelection,
      clearMarkers,
      addOrigenMarker,
      addDestinoMarker,
      addParadaMarkers,
      calculateRoute,
      flyTo,
      onRouteCalculated,
    ]);

    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div
          ref={mapContainer}
          className="w-full h-full overflow-hidden shadow-2xl"
          style={{ minHeight: '300px' }}
        />

        {!isLoaded && (
          <div className="absolute top-4 right-4 z-30">
            <div className="content-box-outline-4-small rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
              <md-icon className="text-primary text-lg animate-spin">
                sync
              </md-icon>
              <p className="text-secondary text-xs font-medium">
                Cargando mapa...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red/10 border border-red/30 rounded-lg p-3 text-red text-sm z-40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    const origenIgual =
      prevProps.origen?.latitud === nextProps.origen?.latitud &&
      prevProps.origen?.longitud === nextProps.origen?.longitud;
    const destinoIgual =
      prevProps.destino?.latitud === nextProps.destino?.latitud &&
      prevProps.destino?.longitud === nextProps.destino?.longitud;
    const paradasIgual =
      JSON.stringify(prevProps.paradas) === JSON.stringify(nextProps.paradas);
    const propsIguales =
      prevProps.height === nextProps.height &&
      prevProps.allowClickSelection === nextProps.allowClickSelection &&
      prevProps.showDefaultMap === nextProps.showDefaultMap &&
      prevProps.mapStyle === nextProps.mapStyle;

    return origenIgual && destinoIgual && paradasIgual && propsIguales;
  }
);

MapBoxMap.displayName = 'MapBoxMap';

export default MapBoxMap;
