import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setLoadingCallbacks } from '../services/apiService';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(new Set());

  const startLoading = useCallback((requestId) => {
    setActiveRequests((prev) => {
      const next = new Set(prev);
      next.add(requestId);
      return next;
    });
  }, []);

  const stopLoading = useCallback((requestId) => {
    setActiveRequests((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
  }, []);

  // Registrar los callbacks en apiService cuando el componente se monta
  useEffect(() => {
    setLoadingCallbacks(startLoading, stopLoading);

    // Cleanup: desregistrar los callbacks cuando el componente se desmonte
    return () => {
      setLoadingCallbacks(null, null);
    };
  }, [startLoading, stopLoading]);

  const isLoading = activeRequests.size > 0;

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        activeRequestsCount: activeRequests.size,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
