import { useState, useEffect } from "react";

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      if (response.success) {
        setData(response.data);
        return response;
      } else {
        throw new Error(response.message || "Error en la operación");
      }
    } catch (err) {
      setError(err.message || "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (dependencies.length === 0) {
      execute();
    }
  };

  useEffect(() => {
    if (
      dependencies.length > 0 &&
      dependencies.every((dep) => dep !== undefined && dep !== null)
    ) {
      execute(...dependencies);
    } else if (dependencies.length === 0) {
      execute();
    }
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch,
    setData,
    clearError: () => setError(null),
  };
};

export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFunction) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err.message || "Error en la operación");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    execute,
    clearError: () => setError(null),
  };
};

export default useApi;
