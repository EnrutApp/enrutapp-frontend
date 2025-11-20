import { Suspense } from 'react';
import '@material/web/progress/linear-progress.js';

const LazyLoadingFallback = ({ message = 'Cargando...' }) => {
  return <div style={{ display: 'none' }}></div>;
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
