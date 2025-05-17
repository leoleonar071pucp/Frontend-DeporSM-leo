"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, AUTH_CONFIG } from '@/lib/config';
import { 
  clearAuthCookies, 
  setLogoutTimestamp, 
  hasRecentLogout,
  TokenResponse,
  storeAuthToken,
  clearAuthToken,
  isTokenExpired,
  getStoredUser,
  getAccessToken
} from '@/lib/auth-utils';

// Define la forma de los datos del usuario (ajustar según necesidad)
interface User {
  id: string;
  nombre: string;
  username: string; // Added username property
  email: string;
  avatarUrl?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  roles?: string[]; // Changed to roles array
  rol?: {
    nombre: 'vecino' | 'admin' | 'coordinador' | 'superadmin';
    descripcion?: string;
  };
}

// Define la forma del contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for compatibility with AuthDebug component
  isLoggingOut: boolean;
  login: (userData: User | any, accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Crea el contexto con un valor inicial undefined para evitar errores SSR
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el proveedor
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para control de logout
  const router = useRouter();  // Verificar sesión al cargar
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log("Verificando estado de autenticación...");
      // Verificar si hay un cierre de sesión reciente usando la función de utilidad
      if (hasRecentLogout()) {
        console.log("Cierre de sesión reciente detectado, omitiendo verificación de autenticación");
        setUser(null);
        setIsLoading(false);
        return null;
      }
        // First try to get session from server
      let response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // Always include credentials 
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        cache: "no-store"
      });
  
      if (response.ok) {
        const userData = await response.json();
        console.log("Usuario autenticado por sesión:", userData);
        setUser(userData);
        return userData;
      } else {
        console.log("No hay sesión activa en servidor:", response.status);
        
        // If server session failed, check local storage token
        const storedToken = getAccessToken();
        const refreshToken = getRefreshToken();
        const storedUser = getStoredUser();
        
        if (storedToken && refreshToken && storedUser && !isTokenExpired()) {
          console.log("Encontrado token local válido, intentando verificar con servidor");
          
          // Try to refresh the token
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${storedToken}`
              },
              body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
              const refreshData: TokenResponse = await refreshResponse.json();
              console.log("Token refrescado con éxito");
              storeAuthToken(refreshData);
              setUser(refreshData.user);
              return refreshData.user;
            } else {
              console.log("No se pudo refrescar el token:", refreshResponse.status);
              clearAuthToken(); 
              setUser(null);
              return null;
            }
          } catch (refreshError) {
            console.error("Error al refrescar token:", refreshError);
            // Fall back to stored user temporarily
            console.log("Usando datos de usuario almacenados temporalmente");
            setUser(storedUser);
            return storedUser;
          }
        } else {
          console.log("No hay token local válido o está expirado");
          clearAuthToken();
          setUser(null);
          return null;
        }
      }} catch (error) {
      console.error("Error al verificar sesión:", error);
      // Proporcionar información más detallada sobre el error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error("Error de red: No se pudo conectar con el servidor. Verifique su conexión o si el servidor está en ejecución.");
      } else if (error instanceof Error) {
        console.error(`Error específico: ${error.name} - ${error.message}`);
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar sesión al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);  // Función para actualizar el estado al iniciar sesión
  const login = (userData: User | any, accessToken?: string, refreshToken?: string) => {
    console.log("AuthContext: Usuario iniciando sesión", userData);
    
    // If tokens are provided directly
    if (accessToken && refreshToken) {
      console.log("Storing tokens and user data separately");
      storeTokens(accessToken, refreshToken, userData);
      setUser(userData);
    }
    // If it's a token response object with accessToken
    else if (userData && 'accessToken' in userData && userData.accessToken) {
      console.log("Storing token response object");
      storeAuthToken(userData as TokenResponse);
      setUser(userData.user);
    } 
    // Just set the user for backward compatibility
    else {
      console.log("Only user data provided, no tokens");
      setUser(userData as User);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      console.log("Cerrando sesión...");
      setIsLoggingOut(true); // Iniciar estado de carga
        // Intentar hacer la petición al backend para cerrar sesión
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          // Establecer un timeout para evitar bloqueos prolongados
          signal: AbortSignal.timeout(3000)
        });
        
        console.log("Respuesta del servidor al cerrar sesión:", response.status);
      } catch (error) {
        // Si hay un error CORS o de red, lo manejamos silenciosamente
        console.warn("No se pudo completar la petición al servidor:", error);
      }
        // Sin importar la respuesta del servidor, siempre limpiamos el estado local
      setUser(null);      // Usar nuestras funciones de utilidad para el manejo de sesión
      setLogoutTimestamp(3000);  // Bloqueo de 3 segundos
        
      // Limpiar las cookies de autenticación de manera más exhaustiva
      clearAuthCookies();
      
      // Clear the auth token from localStorage
      clearAuthToken();
      
      // Redirigir a página principal con una recarga completa
      window.location.href = '/';
      
    } catch (error) {
      console.error("Error general al cerrar sesión:", error);      // Aún así, limpiar estado local y redirigir
      setUser(null);
      setLogoutTimestamp(3000);
      clearAuthCookies();
      clearAuthToken();
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading, // Alias for compatibility
    isLoggingOut, // Exponer el estado de cierre
    login,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};