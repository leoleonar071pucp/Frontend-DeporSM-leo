"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter

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
  login: (userData: User) => void; // Función para manejar el inicio de sesión exitoso
  logout: () => void; // Función para manejar el cierre de sesión
  checkAuthStatus: () => Promise<void>; // Función para verificar el estado al cargar
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
  const router = useRouter(); // Inicializar router dentro del Provider

  // Simulación de verificación de sesión al cargar (ej. leer cookie/localStorage)
  // En una app real, aquí llamarías a una API para validar un token existente
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/me", {
        credentials: "include", // 👈 MUY IMPORTANTE para enviar cookie
      });
  
      if (response.ok) {
        const user = await response.json();
        setUser(user);
        console.log("Usuario autenticado:", user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Función para actualizar el estado al iniciar sesión
  const login = (userData: User) => {
    console.log("AuthContext: Usuario iniciando sesión", userData);
    setUser(userData);
    // Aquí podrías guardar el token/sesión en localStorage/cookie
  };

  // Función para limpiar el estado al cerrar sesión
  const logout = () => {
    console.log("AuthContext: Usuario cerrando sesión");
    setUser(null);
    // Aquí limpiarías el token/sesión de localStorage/cookie
    router.push('/'); // Redirigir a la página de inicio
  };

  const value = {
    user,
    isAuthenticated: !!user, // Es true si user no es null
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