import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapContext } from '../context/MapContext';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const STYLE_MAP = {
  'streets-v12': 'mapbox://styles/mapbox/streets-v12',
  'dark-v11': 'mapbox://styles/mapbox/dark-v11',
  'satellite-v9': 'mapbox://styles/mapbox/satellite-v9',
  'satellite-streets-v12': 'mapbox://styles/mapbox/satellite-streets-v12',
};

const stylePreloadCache = new Map();

export const useMapInstance = ({
  mapId,
  container,
  initialCenter = [-75.5658, 6.2476],
  initialZoom = 6,
  mapStyle = 'streets-v12',
  interactive = true,
}) => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const { registerMap, unregisterMap } = useMapContext();
  const hasInitialized = useRef(false);
  const isUnmountedRef = useRef(false);

  const initializeMap = useCallback(() => {
    if (!container.current || hasInitialized.current || isUnmountedRef.current)
      return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const selectedStyle = STYLE_MAP[mapStyle] || STYLE_MAP['streets-v12'];

      const map = new mapboxgl.Map({
        container: container.current,
        style: selectedStyle,
        center: initialCenter,
        zoom: initialZoom,
        pitch: 0, 
        bearing: 0,
        antialias: false,
        interactive: interactive,
        renderWorldCopies: false,
        maxPitch: 0,
        preserveDrawingBuffer: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
        fadeDuration: 100, 
        crossSourceCollisions: false,
      });

      map.on('load', () => {
        if (isUnmountedRef.current) return;
        setIsLoaded(true);
        setError(null);

        if (interactive) {
          map.addControl(
            new mapboxgl.NavigationControl({
              visualizePitch: false, 
            }),
            'top-right'
          );
        }
      });

      map.on('error', e => {
        if (isUnmountedRef.current) return;
        const errorMessage = e.error?.message || '';
        const errorString =
          typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';

        const isAuthError =
          errorString.includes('token') ||
          errorString.includes('unauthorized') ||
          errorString.includes('401');

        if (isAuthError) {
          setError('Token de Mapbox inválido');
        }
      });

      mapRef.current = map;
      hasInitialized.current = true;
      registerMap(mapId, map);
    } catch (err) {
      if (isUnmountedRef.current) return;
      setError('Error al inicializar el mapa');
    }
  }, [
    container,
    mapId,
    mapStyle,
    initialCenter,
    initialZoom,
    interactive,
    registerMap,
  ]);

  useEffect(() => {
    isUnmountedRef.current = false;
    initializeMap();

    return () => {
      isUnmountedRef.current = true;
      if (mapRef.current) {
        try {
          unregisterMap(mapId);
          if (
            mapRef.current.remove &&
            typeof mapRef.current.remove === 'function'
          ) {
            mapRef.current.remove();
          }
        } catch (err) {
        } finally {
          mapRef.current = null;
          hasInitialized.current = false;
        }
      }
    };
  }, [mapId, unregisterMap]);

  const flyTo = useCallback(
    (center, zoom = 14, options = {}) => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      mapRef.current.flyTo({
        center,
        zoom,
        duration: options.duration || 600, 
        essential: true,
        ...options,
      });
    },
    [isLoaded]
  );

  const fitBounds = useCallback(
    (bounds, options = {}) => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      mapRef.current.fitBounds(bounds, {
        padding: options.padding || {
          top: 80,
          bottom: 80,
          left: 80,
          right: 80,
        },
        duration: options.duration || 800,
        essential: true,
        maxZoom: options.maxZoom || 16,
        ...options,
      });
    },
    [isLoaded]
  );

  const addLayer = useCallback(
    layer => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      if (mapRef.current.getLayer(layer.id)) {
        mapRef.current.removeLayer(layer.id);
      }

      mapRef.current.addLayer(layer);
    },
    [isLoaded]
  );

  const addSource = useCallback(
    (id, source) => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      if (mapRef.current.getSource(id)) {
        mapRef.current.removeSource(id);
      }

      mapRef.current.addSource(id, source);
    },
    [isLoaded]
  );

  const removeLayer = useCallback(
    layerId => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId);
      }
    },
    [isLoaded]
  );

  const removeSource = useCallback(
    sourceId => {
      if (!mapRef.current || !isLoaded || isUnmountedRef.current) return;

      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeSource(sourceId);
      }
    },
    [isLoaded]
  );

  return {
    map: mapRef.current,
    isLoaded,
    error,
    flyTo,
    fitBounds,
    addLayer,
    addSource,
    removeLayer,
    removeSource,
  };
};
