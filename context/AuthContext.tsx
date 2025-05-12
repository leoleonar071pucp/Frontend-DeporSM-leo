"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Verificar sesión al cargar
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log("Verificando estado de autenticación...");
      const response = await fetch("http://localhost:8080/api/auth/me", {
        method: "GET",
        credentials: "include", // Importante para enviar las cookies
        headers: {
          "Accept": "application/json"
        }
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
      // Hacer la petición al backend para cerrar sesión
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      // Actualizar estado en el frontend
      setUser(null);
      router.push('/');
      
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
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