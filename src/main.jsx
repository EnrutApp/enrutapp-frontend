import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './shared/styles/index.css';
import Routes from './routes/Routes';
import { AuthProvider } from './shared/context/AuthContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { MapProvider } from './shared/components/map';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MapProvider>
          <RouterProvider router={Routes} />
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
