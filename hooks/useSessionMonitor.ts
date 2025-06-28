import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para monitorear respuestas HTTP y detectar cuando el usuario ha sido desactivado
 */
export const useSessionMonitor = () => {
  const { forceLogout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Interceptar fetch global para detectar respuestas 401
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Si recibimos un 401 y el usuario está autenticado, verificar si fue desactivado
      if (response.status === 401 && isAuthenticated) {
        try {
          const responseText = await response.clone().text();
          
          // Si la respuesta indica que el usuario fue desactivado
          if (responseText.includes('desactivado') || responseText.includes('deactivated')) {
            console.log('🔒 Usuario desactivado detectado en respuesta HTTP, forzando logout');
            forceLogout();
          }
        } catch (error) {
          // Si no podemos leer la respuesta, ignorar
          console.warn('No se pudo leer la respuesta para verificar desactivación:', error);
        }
      }
      
      return response;
    };

    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated, forceLogout]);
};
