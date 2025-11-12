import { Suspense } from 'react';
import '@material/web/progress/linear-progress.js';

const LazyLoadingFallback = ({ message = 'Cargando...' }) => {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ height: 'calc(100vh - 40px)' }}
    >
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
          {message}
        </span>
      </div>
    </div>
  );
};

export const withLazyLoading = (LazyComponent, fallbackMessage) => {
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={<LazyLoadingFallback message={fallbackMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

const RouteLoading = ({ route }) => {
  const messages = {
    '/admin/clientes': 'Cargando gestión de clientes...',
    '/admin/usuarios': 'Cargando gestión de usuarios...',
    '/admin/conductores': 'Cargando gestión de conductores...',
    '/admin/vehiculos': 'Cargando gestión de vehículos...',
    '/conductor/rutas': 'Cargando rutas del conductor...',
    '/usuario/reservas': 'Cargando reservas...',
  };

  return (
    <LazyLoadingFallback message={messages[route] || 'Cargando página...'} />
  );
};

export { LazyLoadingFallback, RouteLoading };
export default LazyLoadingFallback;
