import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './shared/styles/index.css';
import Routes from './routes/Routes';
import { AuthProvider } from './shared/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { LoadingProvider } from './shared/context/LoadingContext';
import { MapProvider } from './shared/components/map';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LoadingProvider>
        <AuthProvider>
          <MapProvider>
            <RouterProvider router={Routes} />
          </MapProvider>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  </StrictMode>
);
