import { useRef, useCallback } from 'react';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const geocodingCache = new Map();

const MAX_CACHE_SIZE = 100;

export const useGeocodingOptimized = () => {
  const abortControllerRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());

  const reverseGeocode = useCallback(async (lng, lat) => {
    const cacheKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;

    if (geocodingCache.has(cacheKey)) {
      return geocodingCache.get(cacheKey);
    }

    if (pendingRequestsRef.current.has(cacheKey)) {
      return pendingRequestsRef.current.get(cacheKey);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
            `access_token=${MAPBOX_TOKEN}&language=es&limit=1`,
          { signal: abortControllerRef.current.signal }
        );

        const data = await response.json();
        const address = data.features?.[0]?.place_name || '';

        if (geocodingCache.size >= MAX_CACHE_SIZE) {
          const firstKey = geocodingCache.keys().next().value;
          geocodingCache.delete(firstKey);
        }
        geocodingCache.set(cacheKey, address);

        pendingRequestsRef.current.delete(cacheKey);

        return address;
      } catch (error) {
        pendingRequestsRef.current.delete(cacheKey);
        return '';
      }
    })();

    pendingRequestsRef.current.set(cacheKey, requestPromise);

    return requestPromise;
  }, []);

  const clearCache = useCallback(() => {
    geocodingCache.clear();
    pendingRequestsRef.current.clear();
  }, []);

  return { reverseGeocode, clearCache };
};
