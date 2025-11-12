import { useCallback, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export const useRouteCalculation = (map, isLoaded) => {
  const routeCalculationCache = useRef(new Map());
  const abortControllerRef = useRef(null);
  const isUnmountedRef = useRef(false);
  const debounceTimerRef = useRef(null);

  const getCacheKey = useCallback(
    (origenLng, origenLat, destinoLng, destinoLat, paradas) => {
      const paradasKey = paradas.map(p => `${p.lng},${p.lat}`).join('|');
      return `${origenLng},${origenLat}-${destinoLng},${destinoLat}-${paradasKey}`;
    },
    []
  );

  const clearRoute = useCallback(() => {
    if (!map || !isLoaded || isUnmountedRef.current) return;

    try {
      if (map.getLayer('route')) {
        map.removeLayer('route');
      }
      if (map.getLayer('route-shadow')) {
        map.removeLayer('route-shadow');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }
    } catch (err) {
    }
  }, [map, isLoaded]);

  const calculateRoute = useCallback(
    async (
      origenLng,
      origenLat,
      destinoLng,
      destinoLat,
      paradas = [],
      onRouteCalculated = null
    ) => {
      if (!map || !isLoaded || isUnmountedRef.current) return null;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cacheKey = getCacheKey(
        origenLng,
        origenLat,
        destinoLng,
        destinoLat,
        paradas
      );

      if (routeCalculationCache.current.has(cacheKey)) {
        const cachedData = routeCalculationCache.current.get(cacheKey);

        if (isUnmountedRef.current) return null;

        clearRoute();

        try {
          map.addSource('route', {
            type: 'geojson',
            data: cachedData.geometry,
          });

          map.addLayer({
            id: 'route-shadow',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1e1b4b',
              'line-width': 10,
              'line-opacity': 0.2,
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': 'rgb(180, 199, 237)',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6,
                5,
                10,
                7,
                14,
                10,
              ],
              'line-opacity': 0.95,
            },
          });

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([origenLng, origenLat]);
          bounds.extend([destinoLng, destinoLat]);
          paradas.forEach(p => bounds.extend([p.lng, p.lat]));

          map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 800, 
            pitch: 0, 
            bearing: 0,
            maxZoom: 16,
          });

          if (onRouteCalculated && !isUnmountedRef.current) {
            onRouteCalculated(cachedData.info);
          }
        } catch (err) {
        }

        return cachedData.info;
      }

      try {
        abortControllerRef.current = new AbortController();

        let waypoints = `${origenLng},${origenLat}`;
        if (paradas.length > 0) {
          waypoints += ';' + paradas.map(p => `${p.lng},${p.lat}`).join(';');
        }
        waypoints += `;${destinoLng},${destinoLat}`;

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (isUnmountedRef.current) return null;

        const data = await response.json();

        if (data.code !== 'Ok') {
          throw new Error(data.message || 'No se pudo calcular la ruta');
        }

        const route = data.routes[0];
        const distance = route.distance / 1000;
        const duration = route.duration / 60;

        const routeInfo = {
          distance: distance.toFixed(2),
          duration: duration,
          durationFormatted: `${Math.floor(duration / 60)}:${Math.round(
            duration % 60
          )
            .toString()
            .padStart(2, '0')}`,
        };

        const geometryData = {
          type: 'Feature',
          geometry: route.geometry, 
        };

        routeCalculationCache.current.set(cacheKey, {
          geometry: geometryData,
          info: routeInfo,
        });

        if (isUnmountedRef.current) return null;

        clearRoute();

        try {
          map.addSource('route', {
            type: 'geojson',
            data: geometryData,
          });

          map.addLayer({
            id: 'route-shadow',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1e1b4b',
              'line-width': 10, 
              'line-opacity': 0.2,
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': 'rgb(180, 199, 237)',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6,
                5,
                10,
                7,
                14,
                10,
              ],
              'line-opacity': 0.95,
            },
          });

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([origenLng, origenLat]);
          bounds.extend([destinoLng, destinoLat]);
          paradas.forEach(p => bounds.extend([p.lng, p.lat]));

          map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 800, 
            pitch: 0,
            bearing: 0,
            maxZoom: 16,
          });

          if (onRouteCalculated && !isUnmountedRef.current) {
            onRouteCalculated(routeInfo);
          }
        } catch (err) {
        }

        return routeInfo;
      } catch (err) {
        if (err.name === 'AbortError') {
          return null;
        }
        return null;
      }
    },
    [map, isLoaded, getCacheKey, clearRoute]
  );

  useEffect(() => {
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearRoute();
      routeCalculationCache.current.clear();
    };
  }, [clearRoute]);

  return {
    calculateRoute,
    clearRoute,
  };
};
