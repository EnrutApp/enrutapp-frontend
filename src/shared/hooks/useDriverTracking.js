/**
 * Hook para manejar el tracking de conductores en tiempo real
 * Frontend Web - React
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

/**
 * Hook para tracking en tiempo real de conductores
 * @param {number|null} driverId - ID del conductor a seguir (null para todos)
 * @returns {Object} Estado y funciones del tracking
 */
export function useDriverTracking(driverId = null) {
  const [location, setLocation] = useState(null);
  const [allLocations, setAllLocations] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cleanupRef = useRef(null);
  const isSubscribed = useRef(false);

  /**
   * Conectar al servidor de tracking
   */
  const connect = useCallback(() => {
    try {
      socketService.connect();
    } catch (err) {
      setError('Error al conectar con el servidor de tracking');
      console.error('Error de conexión:', err);
    }
  }, []);

  /**
   * Desconectar del servidor
   */
  const disconnect = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    socketService.disconnect();
    setIsConnected(false);
    setLocation(null);
    setAllLocations(new Map());
  }, []);

  /**
   * Actualizar ubicación de un conductor específico
   */
  const handleLocationUpdate = useCallback(
    locationData => {
      if (driverId && locationData.driverId === driverId) {
        setLocation(locationData);
      }

      setAllLocations(prev => {
        const updated = new Map(prev);
        updated.set(locationData.driverId, locationData);
        return updated;
      });
    },
    [driverId]
  );

  /**
   * Manejar conductor online
   */
  const handleDriverOnline = useCallback(data => {
    console.log('🟢 Conductor online:', data.driverId);
    setAllLocations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(data.driverId);
      if (existing) {
        updated.set(data.driverId, { ...existing, isOnline: true });
      }
      return updated;
    });
  }, []);

  /**
   * Manejar conductor offline
   */
  const handleDriverOffline = useCallback(
    data => {
      console.log('🔴 Conductor offline:', data.driverId);
      setAllLocations(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.driverId);
        if (existing) {
          updated.set(data.driverId, { ...existing, isOnline: false });
        }
        return updated;
      });

      if (driverId === data.driverId) {
        setLocation(prev => (prev ? { ...prev, isOnline: false } : null));
      }
    },
    [driverId]
  );

  /**
   * Obtener ubicación actual de un conductor
   */
  const fetchDriverLocation = useCallback(async id => {
    try {
      const result = await socketService.getDriverLocation(id);
      if (result.location) {
        setLocation(result.location);
        setAllLocations(prev => {
          const updated = new Map(prev);
          updated.set(id, result.location);
          return updated;
        });
      }
      return result;
    } catch (err) {
      console.error('Error al obtener ubicación:', err);
      return { location: null, isOnline: false };
    }
  }, []);

  /**
   * Obtener todos los conductores online
   */
  const fetchOnlineDrivers = useCallback(async () => {
    try {
      const result = await socketService.getOnlineDrivers();
      if (result.drivers && result.drivers.length > 0) {
        setAllLocations(prev => {
          const updated = new Map(prev);
          result.drivers.forEach(driver => {
            updated.set(driver.driverId, driver);
          });
          return updated;
        });
      }
      return result.drivers || [];
    } catch (err) {
      console.error('Error al obtener conductores online:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    let timeoutId = null;

    const handleConnectionChange = connected => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      setIsConnected(connected);
      setIsLoading(false);

      if (connected && !isSubscribed.current) {
        isSubscribed.current = true;

        if (driverId) {
          cleanupRef.current = socketService.subscribeToDriver(
            driverId,
            handleLocationUpdate
          );

          fetchDriverLocation(driverId);
        } else {
          cleanupRef.current =
            socketService.onLocationUpdate(handleLocationUpdate);

          fetchOnlineDrivers();
        }

        const offOnline = socketService.onDriverOnline(handleDriverOnline);
        const offOffline = socketService.onDriverOffline(handleDriverOffline);

        const originalCleanup = cleanupRef.current;
        cleanupRef.current = () => {
          originalCleanup?.();
          offOnline();
          offOffline();
        };
      }
    };

    socketService.addListener('connectionChange', handleConnectionChange);

    connect();

    if (socketService.isConnected()) {
      handleConnectionChange(true);
    } else {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        if (!socketService.isConnected()) {
          setError(
            'No se pudo conectar al servidor de tracking. Verifica tu conexión.'
          );
        }
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      socketService.removeListener('connectionChange', handleConnectionChange);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      isSubscribed.current = false;
    };
  }, [
    driverId,
    connect,
    handleLocationUpdate,
    handleDriverOnline,
    handleDriverOffline,
    fetchDriverLocation,
    fetchOnlineDrivers,
  ]);

  return {
    location,
    allLocations: Array.from(allLocations.values()),
    isConnected,
    isLoading,
    error,

    connect,
    disconnect,
    fetchDriverLocation,
    fetchOnlineDrivers,

    getDriverLocation: id => allLocations.get(id) || null,
    isDriverOnline: id => allLocations.get(id)?.isOnline ?? false,
  };
}

export default useDriverTracking;
