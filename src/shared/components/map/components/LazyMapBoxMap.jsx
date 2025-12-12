import { lazy, Suspense, useEffect, useState } from 'react';
import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';

let mapboxCSSLoaded = false;
const loadMapboxCSS = () => {
  if (!mapboxCSSLoaded && typeof window !== 'undefined') {
    import('mapbox-gl/dist/mapbox-gl.css');
    mapboxCSSLoaded = true;
  }
};

const MapBoxMap = lazy(() => {
  loadMapboxCSS();
  return import('./MapBoxMap');
});

const LazyMapBoxMap = props => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMapboxCSS();
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-fill rounded-xl">
        <div
          className="flex flex-col items-center justify-center"
          style={{ width: '340px' }}
        >
          <md-linear-progress
            indeterminate
            style={{ width: '100%', marginBottom: '24px' }}
          ></md-linear-progress>
          <span
            className="text-secondary text-lg"
            style={{ textAlign: 'center' }}
          >
            Preparando mapa...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-fill rounded-xl">
          <div
            className="flex flex-col items-center justify-center"
            style={{ width: '340px' }}
          >
            <md-linear-progress
              indeterminate
              style={{ width: '100%', marginBottom: '24px' }}
            ></md-linear-progress>
            <span
              className="text-secondary text-lg"
              style={{ textAlign: 'center' }}
            >
              Cargando mapa...
            </span>
          </div>
        </div>
      }
    >
      <MapBoxMap {...props} />
    </Suspense>
  );
};

export default LazyMapBoxMap;
