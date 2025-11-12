import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../features/auth/api/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificación rápida primero
      if (!authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      const storedUser = authService.getCurrentUser();
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      // Establecer el usuario inmediatamente desde el storage
      setUser(storedUser);
      setIsLoading(false);

      // Luego verificar con el servidor en segundo plano
      try {
        const profileData = await authService.getMe();
        if (profileData.success && profileData.data) {
          const updatedUser = profileData.data;
          setUser(updatedUser);
          const token = authService.getToken();
          const storage = localStorage.getItem('access_token')
            ? localStorage
            : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        const isAuthError =
          error.response?.status === 401 ||
          error.statusCode === 401 ||
          (error.message && error.message.includes('401'));

        if (isAuthError) {
          logout();
        }
      }
    } catch (error) {
      const isAuthError =
        error.response?.status === 401 ||
        error.statusCode === 401 ||
        (error.message && error.message.includes('401'));

      if (isAuthError) {
        logout();
      } else {
        setError(error.message);
      }
      setIsLoading(false);
    }
  };

  const login = async credentials => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        await updateProfile();
        return response;
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async userData => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      setError(error.message || 'Error al registrarse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async passwordData => {
    setError(null);

    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      setError(error.message || 'Error al cambiar contraseña');
      throw error;
    }
  };

  const updateProfile = async () => {
    try {
      const profileData = await authService.getMe();
      if (profileData.success && profileData.data) {
        const updatedUser = profileData.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {

      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    authService.logout();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    clearError,
    isAuthenticated: !!user && authService.isAuthenticated(),
    refreshAuth: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
