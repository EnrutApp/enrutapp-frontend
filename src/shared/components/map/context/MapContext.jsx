import { createContext, useContext, useRef, useCallback } from 'react';

const MapContext = createContext(null);

export const MapProvider = ({ children }) => {
  const mapsCache = useRef(new Map());
  const markersCache = useRef(new Map());

  const registerMap = useCallback((id, mapInstance) => {
    mapsCache.current.set(id, mapInstance);
  }, []);

  const unregisterMap = useCallback(id => {
    const map = mapsCache.current.get(id);
    if (map) {
      map.remove();
      mapsCache.current.delete(id);
    }
  }, []);

  const getMap = useCallback(id => {
    return mapsCache.current.get(id);
  }, []);

  const clearAllMaps = useCallback(() => {
    mapsCache.current.forEach(map => map.remove());
    mapsCache.current.clear();
    markersCache.current.clear();
  }, []);

  return (
    <MapContext.Provider
      value={{
        registerMap,
        unregisterMap,
        getMap,
        clearAllMaps,
        markersCache,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    return {
      registerMap: () => {},
      unregisterMap: () => {},
      getMap: () => null,
      clearAllMaps: () => {},
      markersCache: { current: new Map() },
    };
  }
  return context;
};
