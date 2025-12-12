import { useRef, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const markerElementCache = new Map();

const getMarkerElement = (type, color) => {
  const cacheKey = `${type}-${color}`;

  if (markerElementCache.has(cacheKey)) {
    return markerElementCache.get(cacheKey).cloneNode(true);
  }

  const el = createMarkerElement(type, color);
  markerElementCache.set(cacheKey, el);
  return el.cloneNode(true);
};

const createMarkerElement = (type, color) => {
  const el = document.createElement('div');
  el.className = `mapbox-marker-${type}`;

  const sizes = {
    origen: { width: 28, height: 28, pulse: 35 },
    destino: { width: 28, height: 28, pulse: 35 },
    parada: { width: 24, height: 24, pulse: 30 },
    click: { width: 28, height: 28, pulse: 35 },
  };

  const size = sizes[type] || sizes.origen;

  el.innerHTML = `
        <style>
            .mapbox-marker-${type} {
                position: relative;
                width: ${size.width}px;
                height: ${size.height}px;
            }
            .marker-pulse-${type} {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${size.pulse}px;
                height: ${size.pulse}px;
                border-radius: 50%;
                background: ${color};
                opacity: 0.3;
                animation: pulse-${type} 2s ease-out infinite;
            }
            @keyframes pulse-${type} {
                0% {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0.5;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.8);
                    opacity: 0;
                }
            }
            .marker-icon-${type} {
                position: relative;
                z-index: 2;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }
        </style>
        <div class="marker-pulse-${type}"></div>
        <div class="marker-icon-${type}">
            <svg width="${size.width}" height="${size.height}" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
        </div>
    `;

  return el;
};

export const useMarkers = (map, isLoaded) => {
  const markersRef = useRef({
    origen: null,
    destino: null,
    paradas: [],
    click: null,
  });
  const isUnmountedRef = useRef(false);

  const clearMarkers = useCallback(() => {
    try {
      if (markersRef.current.origen) {
        markersRef.current.origen.remove();
        markersRef.current.origen = null;
      }
      if (markersRef.current.destino) {
        markersRef.current.destino.remove();
        markersRef.current.destino = null;
      }
      markersRef.current.paradas.forEach(marker => marker.remove());
      markersRef.current.paradas = [];
      if (markersRef.current.click) {
        markersRef.current.click.remove();
        markersRef.current.click = null;
      }
    } catch (err) {}
  }, []);

  const addOrigenMarker = useCallback(
    (lng, lat, color = '#B4C7ED') => {
      if (!map || !isLoaded || isUnmountedRef.current) return;

      try {
        if (markersRef.current.origen) {
          markersRef.current.origen.remove();
        }

        const el = getMarkerElement('origen', color);
        markersRef.current.origen = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map);
      } catch (err) {}
    },
    [map, isLoaded]
  );

  const addDestinoMarker = useCallback(
    (lng, lat, color = '#1E304F') => {
      if (!map || !isLoaded || isUnmountedRef.current) return;

      try {
        if (markersRef.current.destino) {
          markersRef.current.destino.remove();
        }

        const el = getMarkerElement('destino', color);
        markersRef.current.destino = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map);
      } catch (err) {}
    },
    [map, isLoaded]
  );

  const addParadaMarkers = useCallback(
    (paradas, color = '#FFC107') => {
      if (!map || !isLoaded || isUnmountedRef.current) return;

      try {
        markersRef.current.paradas.forEach(marker => marker.remove());
        markersRef.current.paradas = [];

        paradas.forEach((parada, index) => {
          const el = getMarkerElement('parada', color);
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center',
          })
            .setLngLat([parada.lng, parada.lat])
            .addTo(map);

          markersRef.current.paradas.push(marker);
        });
      } catch (err) {}
    },
    [map, isLoaded]
  );

  const addClickMarker = useCallback(
    (lng, lat, color = '#B4C7ED') => {
      if (!map || !isLoaded || isUnmountedRef.current) return;

      try {
        if (markersRef.current.click) {
          markersRef.current.click.remove();
        }

        const el = getMarkerElement('click', color);
        markersRef.current.click = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map);
      } catch (err) {}
    },
    [map, isLoaded]
  );

  useEffect(() => {
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      clearMarkers();
    };
  }, [clearMarkers]);

  return {
    addOrigenMarker,
    addDestinoMarker,
    addParadaMarkers,
    addClickMarker,
    clearMarkers,
  };
};
