import { memo } from 'react';
import '@material/web/icon/icon.js';

const MapThumbnail = memo(({ ubicacion, onClick, className = '' }) => {
  if (!ubicacion || !ubicacion.latitud || !ubicacion.longitud) {
    return (
      <div
        className={`w-full h-full bg-fill rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-secondary opacity-50">
          <md-icon className="text-2xl">location_off</md-icon>
          <p className="text-xs">Sin ubicación</p>
        </div>
      </div>
    );
  }

  const lat = parseFloat(ubicacion.latitud);
  const lng = parseFloat(ubicacion.longitud);
  const zoom = 13;
  const width = 400;
  const height = 300;

  const mapboxToken =
    import.meta.env.VITE_MAPBOX_TOKEN ||
    'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom},0/${width}x${height}?access_token=${mapboxToken}`;

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <img
        src={staticMapUrl}
        alt="Ubicación en el mapa"
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary rounded-full p-3 shadow-lg">
          <md-icon className="text-xl">visibility</md-icon>
        </div>
      </div>
    </div>
  );
});

MapThumbnail.displayName = 'MapThumbnail';

export default MapThumbnail;
