import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para verificar si el token es válido
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Decodificar el token JWT
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      return tokenPayload.exp > currentTime;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return false;
    }
  };

  // Función para limpiar datos de autenticación
  const clearAuthData = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken && isTokenValid(storedToken)) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Token inválido o expirado, limpiar datos
        clearAuthData();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Verificar token periódicamente (cada 60 segundos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!isTokenValid(token)) {
        console.log('Token expirado, cerrando sesión...');
        logout();
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    clearAuthData();
    // Forzar recarga para limpiar cualquier estado
    window.location.href = '/login';
  };

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!isTokenValid(token)) {
      logout();
      throw new Error('Token expirado');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Si el servidor responde con 401 o 403, el token es inválido
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Token inválido o expirado');
    }

    return response;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    authenticatedFetch,
    isTokenValid: () => isTokenValid(localStorage.getItem('token'))
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};