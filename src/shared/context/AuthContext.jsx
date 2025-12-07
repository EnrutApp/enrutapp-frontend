import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

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
    setIsLoading(true);
    try {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          try {
            const profileData = await authService.getMe();
            if (profileData.success && profileData.data) {
              const updatedUser = profileData.data;
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.warn('Token verification failed:', error);
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        // Guardar usuario inicial del login
        setUser(response.data.user);
        
        // Luego actualizar con perfil completo desde el servidor
        try {
          const profileData = await authService.getMe();
          if (profileData.success && profileData.data) {
            setUser(profileData.data);
            localStorage.setItem('user', JSON.stringify(profileData.data));
          }
        } catch (profileError) {
          console.warn('Error getting full profile, using login user:', profileError);
          // Mantener el usuario del login si no podemos obtener el perfil completo
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
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

  const changePassword = async (passwordData) => {
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
      console.error('Error updating profile:', error);
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
    refreshAuth: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
