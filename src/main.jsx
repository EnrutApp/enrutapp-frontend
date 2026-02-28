import { createRoot } from 'react-dom/client';
import './shared/styles/index.css';
import Routes from './routes/Routes';

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
