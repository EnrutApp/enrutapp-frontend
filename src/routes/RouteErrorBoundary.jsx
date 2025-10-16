import { Component } from 'react';

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
            errorInfo
        });

        console.error('Error en ruta:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            {this.props.title || 'Error en la página'}
                        </h2>

                        <p className="text-gray-600 mb-4">
                            {this.props.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
                        </p>

                        <div className="space-y-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Recargar página
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Volver atrás
                            </button>
                        </div>

                        {/* Mostrar detalles del error en desarrollo */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Ver detalles del error (desarrollo)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC para envolver rutas con error boundary
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