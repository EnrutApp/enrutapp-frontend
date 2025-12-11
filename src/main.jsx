import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './shared/styles/index.css';
import Routes from './routes/Routes';
import { AuthProvider } from './shared/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { LoadingProvider } from './shared/context/LoadingContext';
import { GoogleMapsLoader } from './shared/context/GoogleMapsLoader';
import { MapProvider } from './shared/components/map/context/MapContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LoadingProvider>
        <AuthProvider>
          <GoogleMapsLoader>
            <MapProvider>
              <RouterProvider router={Routes} />
            </MapProvider>
          </GoogleMapsLoader>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  </StrictMode>
);
