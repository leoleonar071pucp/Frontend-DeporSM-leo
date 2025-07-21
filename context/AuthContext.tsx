"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { API_BASE_URL, FRONTEND_URL } from '@/lib/config';

// Define la forma de los datos del usuario (ajustar según necesidad)
interface User {
  id: string;
  nombre: string;
  apellidos?: string;
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
  hasRole: (role: 'vecino' | 'admin' | 'coordinador' | 'superadmin') => boolean;
  forceLogout: () => void;
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log("Verificando estado de autenticación...");

      // Verificar si hay un cierre de sesión reciente
      const logoutTimestamp = localStorage.getItem('logoutTimestamp');
      const currentTime = Date.now();

      // Limpiar cualquier rol almacenado en sessionStorage al inicio de la verificación
      const storedRole = sessionStorage.getItem('userRole');
      if (storedRole) {
        console.log("Rol almacenado encontrado:", storedRole);
      }

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

        // Verificar que el usuario tenga un rol válido
        if (!userData.rol || !userData.rol.nombre) {
          console.error("Usuario sin rol definido:", userData);
          setUser(null);
          return null;
        }

        // Guardar el rol en sessionStorage para acceso rápido y redundancia
        sessionStorage.setItem('userRole', userData.rol.nombre);
        // También guardar el ID del usuario para verificaciones adicionales
        sessionStorage.setItem('userId', userData.id.toString());

        setUser(userData);

        // Iniciar monitoreo de sesión si el usuario está autenticado
        setTimeout(() => {
          startSessionMonitoring();
        }, 5000); // Esperar 5 segundos antes de iniciar el monitoreo

        return userData;
      } else {
        console.log("No hay sesión activa:", response.status);

        // If it's a 401 and we had a user before, it might be due to deactivation
        if (response.status === 401 && user) {
          console.log("Usuario posiblemente desactivado, forzando logout");
          forceLogout();
          return null;
        }

        setUser(null);
        // Limpiar todos los datos almacenados
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userId');
        return null;
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      setUser(null);
      // Limpiar todos los datos almacenados
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      stopSessionMonitoring();
    };
  }, []);

  // Función para actualizar el estado al iniciar sesión
  const login = (userData: User) => {
    console.log("AuthContext: Usuario iniciando sesión", userData);
    setUser(userData);

    // Iniciar monitoreo de sesión después del login
    setTimeout(() => {
      startSessionMonitoring();
    }, 5000); // Esperar 5 segundos antes de iniciar el monitoreo
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      console.log("Cerrando sesión...");
      setIsLoggingOut(true); // Iniciar estado de carga

      // Detener monitoreo de sesión
      stopSessionMonitoring();

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

      // Limpiar todos los datos de sesión almacenados
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      localStorage.removeItem('redirectPath');

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

      // Limpiar todos los datos de sesión almacenados
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      localStorage.removeItem('redirectPath');

      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role: 'vecino' | 'admin' | 'coordinador' | 'superadmin'): boolean => {
    if (!user || !user.rol) {
      // Como fallback, verificar el rol almacenado en sessionStorage
      const storedRole = sessionStorage.getItem('userRole');
      return storedRole === role;
    }
    return user.rol.nombre === role;
  };

  // Función para verificar el estado de la sesión silenciosamente
  const checkSessionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session-status`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Si el usuario fue desactivado o está inactivo, forzar logout inmediatamente
        if (errorText.includes("CUENTA_INACTIVA") || errorText.includes("deactivated") || errorText.includes("desactivado") || errorText.includes("inactiva")) {
          console.log("🔒 Usuario inactivo/desactivado detectado, forzando logout");
          forceLogout();
          return false;
        }

        // Para otros errores 401, también forzar logout
        if (response.status === 401) {
          console.log("🔒 Sesión invalidada detectada, forzando logout");
          forceLogout();
          return false;
        }

        return false;
      }

      return true;
    } catch (error) {
      // Si hay error de red, no forzar logout (podría ser problema temporal)
      console.warn("Error al verificar estado de sesión:", error);
      return true; // Asumir que está bien para evitar logouts innecesarios
    }
  };

  // Función para iniciar la verificación periódica de sesión
  const startSessionMonitoring = () => {
    // Limpiar intervalo existente si hay uno
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }

    // Verificar cada 10 segundos para detección más rápida
    const interval = setInterval(async () => {
      if (user && !isLoggingOut) {
        await checkSessionStatus();
      }
    }, 10000); // 10 segundos

    setSessionCheckInterval(interval);
  };

  // Función para detener la verificación de sesión
  const stopSessionMonitoring = () => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      setSessionCheckInterval(null);
    }
  };

  // Función para forzar el logout (usado cuando el usuario es desactivado)
  const forceLogout = () => {
    console.log("Forzando cierre de sesión - usuario desactivado");

    // Detener monitoreo de sesión
    stopSessionMonitoring();

    setUser(null);

    // Limpiar todos los datos de sesión almacenados
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    localStorage.removeItem('redirectPath');
    localStorage.setItem('logoutTimestamp', Date.now().toString());

    // Limpiar cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Redirigir a login con mensaje
    window.location.href = '/login?message=account_deactivated';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isLoggingOut, // Exponer el estado de cierre
    login,
    logout,
    checkAuthStatus,
    hasRole, // Exponer la función de verificación de rol
    forceLogout // Exponer la función de logout forzado
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};