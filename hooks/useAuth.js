"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { API_BASE_URL } from '@/config/api';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el usuario al iniciar
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Si no hay sesión, el usuario no está autenticado
          setUser(null);
        }
      } catch (err) {
        console.error("Error al cargar la sesión:", err);
        setError("Error al verificar la autenticación");
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al iniciar sesión");
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      return { success: false, error: "Error de conexión al servidor" };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setLoading(true);
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
