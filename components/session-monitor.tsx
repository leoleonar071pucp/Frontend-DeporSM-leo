"use client"

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Componente para monitorear la sesión del usuario y detectar desactivaciones
 */
export function SessionMonitor() {
  const { forceLogout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Interceptar fetch global para detectar respuestas 401
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Si recibimos un 401 y el usuario está autenticado, verificar si fue desactivado
      if (response.status === 401 && isAuthenticated) {
        try {
          const responseText = await response.clone().text();
          
          // Si la respuesta indica que el usuario fue desactivado o está inactivo
          if (responseText.includes('CUENTA_INACTIVA') || responseText.includes('desactivado') || responseText.includes('deactivated') || responseText.includes('Usuario desactivado') || responseText.includes('inactiva')) {
            console.log('🔒 Usuario inactivo/desactivado detectado en respuesta HTTP, forzando logout');
            forceLogout();
          }
        } catch (error) {
          // Si no podemos leer la respuesta, ignorar
          console.warn('No se pudo leer la respuesta para verificar desactivación:', error);
        }
      }
      
      return response;
    };

    // Limpiar el interceptor cuando el componente se desmonte o el usuario cambie
    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated, user, forceLogout]);

  // Este componente no renderiza nada
  return null;
}
