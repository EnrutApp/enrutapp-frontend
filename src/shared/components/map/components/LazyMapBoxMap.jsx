import { lazy, Suspense, useEffect, useState } from 'react';
import '@material/web/icon/icon.js';

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
        <div className="flex flex-col items-center gap-3">
          <md-icon className="text-primary text-3xl animate-spin">sync</md-icon>
          <p className="text-secondary text-sm font-medium">
            Preparando mapa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-fill rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <md-icon className="text-primary text-3xl animate-spin">
              sync
            </md-icon>
            <p className="text-secondary text-sm font-medium">
              Cargando mapa...
            </p>
          </div>
        </div>
      }
    >
      <MapBoxMap {...props} />
    </Suspense>
  );
};

export default LazyMapBoxMap;
