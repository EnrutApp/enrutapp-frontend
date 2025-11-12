import { Component } from 'react';
import '@material/web/icon/icon.js';

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-[100vh] list-enter">
          <div className="max-w-md w-full content-box-outline-4-small rounded-xl p-8 text-center animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="relative p-4">
                  <md-icon className="text-red text-5xl">error</md-icon>
                </div>
              </div>
            </div>

            <h2 className="h3 font-medium text-primary mb-3">
              {this.props.title || 'Error en la página'}
            </h2>

            <p className="subtitle1 text-secondary mb-6">
              {this.props.message ||
                'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <md-icon className="text-base">refresh</md-icon>
                Recargar página
              </button>

              <button
                onClick={() => window.history.back()}
                className="btn btn-secondary w-full py-3 flex items-center justify-center"
              >
                Volver atrás
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer subtitle2 text-secondary hover:text-primary transition-colors flex items-center gap-2">
                  <md-icon className="text-sm">code</md-icon>
                  Ver detalles del error
                </summary>
                <pre className="mt-3 text-xs bg-fill p-3 rounded-lg overflow-auto max-h-32 text-primary border border-border">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes fade-in {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.4s ease-out;
                }
            `,
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = (Component, errorProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <RouteErrorBoundary {...errorProps}>
        <Component {...props} />
      </RouteErrorBoundary>
    );
  };
};

export default RouteErrorBoundary;
