import { createContext, useContext, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GoogleMapsContext = createContext(null);

const LIBRARIES = ['places', 'geometry'];

export const GoogleMapsLoader = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-primary text-primary p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Configuración Incompleta</h1>
          <p>La API Key de Google Maps no está configurada.</p>
          <p className="mt-2 text-sm text-secondary">
            Por favor, reinicia el servidor de desarrollo para cargar las
            variables de entorno.
          </p>
        </div>
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
    language: 'es',
    region: 'CO',
  });

  const value = useMemo(() => ({ isLoaded, loadError }), [isLoaded, loadError]);

  if (loadError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-primary text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error de Google Maps</h1>
          <p>No se pudo cargar la librería de mapas.</p>
          <p className="mt-2 text-sm text-red">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
  }

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsLoader');
  }
  return context;
};
