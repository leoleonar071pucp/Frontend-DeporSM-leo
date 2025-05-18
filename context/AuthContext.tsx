"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, FRONTEND_URL } from '@/lib/config';

// Define la forma de los datos del usuario (ajustar según necesidad)
interface User {
  id: string;
  nombre: string;
  email: string;
  avatarUrl?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
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
  isLoggingOut: boolean;
  login: (userData: User) => void;
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
  const router = useRouter();
  // Verificar sesión al cargar
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log("Verificando estado de autenticación...");

      // Verificar si hay un cierre de sesión reciente
      const logoutTimestamp = localStorage.getItem('logoutTimestamp');
      const currentTime = Date.now();

      // Si se cerró sesión hace menos de 10 segundos, no verificar la autenticación
      // Extendemos el tiempo para evitar reconexiones inmediatas después de logout
      if (logoutTimestamp && (currentTime - parseInt(logoutTimestamp)) < 10000) {
        console.log("Cierre de sesión reciente detectado, omitiendo verificación de autenticación");
        setUser(null);
        setIsLoading(false);
        return null;
      }
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // Siempre incluir credenciales para enviar cookies
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Origin": FRONTEND_URL // Añadir origen explícitamente para CORS
        },
        cache: "no-store"
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Usuario autenticado:", userData);
        setUser(userData);
        return userData;
      } else {
        console.log("No hay sesión activa:", response.status);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Función para actualizar el estado al iniciar sesión
  const login = (userData: User) => {
    console.log("AuthContext: Usuario iniciando sesión", userData);
    setUser(userData);
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
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Origin": FRONTEND_URL
          },
          signal: AbortSignal.timeout(3000)
        });

        console.log("Respuesta del servidor al cerrar sesión:", response.status);
      } catch (error) {
        // Si hay un error CORS o de red, lo manejamos silenciosamente
        console.warn("No se pudo completar la petición al servidor:", error);
      }

      // Sin importar la respuesta del servidor, siempre limpiamos el estado local
      setUser(null);

      // Guardar timestamp del logout para evitar reconexiones inmediatas
      localStorage.setItem('logoutTimestamp', Date.now().toString());

      // Limpiar todas las cookies del navegador (enfoque radical pero efectivo)
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirigir a página principal con una recarga completa
      window.location.href = '/';

    } catch (error) {
      console.error("Error general al cerrar sesión:", error);
      // Aún así, limpiar estado local y redirigir
      setUser(null);
      localStorage.setItem('logoutTimestamp', Date.now().toString());
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
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