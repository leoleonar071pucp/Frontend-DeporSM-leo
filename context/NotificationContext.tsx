"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/lib/config';
import { toast } from 'sonner';

// Interfaces
interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: "success" | "info" | "warning" | "reserva" | "mantenimiento" | "pago" | "reporte"; // Tipos de notificaciones
    category?: string; // Propiedad opcional para categorizar notificaciones
    feedback?: string; // Propiedad opcional para retroalimentación
}

// Interfaz para la respuesta de la API
interface ApiNotification {
    id: number;
    titulo: string;
    mensaje: string;
    fechaEnvio: string;
    leida: boolean;
    tipo: string;
    categoria?: string;
    feedback?: string;
}

type NewNotificationData = Omit<Notification, 'id' | 'read' | 'date'>;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notificationData: NewNotificationData) => Promise<void>;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  markAllAsRead: () => void;
  deleteAllRead: () => void;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir notificación de la API al formato del frontend
  const mapApiToNotification = (apiNotification: ApiNotification): Notification => {
    return {
      id: apiNotification.id,
      title: apiNotification.titulo,
      message: apiNotification.mensaje,
      date: apiNotification.fechaEnvio,
      read: apiNotification.leida,
      type: apiNotification.tipo as any, // Convertir el tipo
      category: apiNotification.categoria,
      feedback: apiNotification.feedback
    };
  };

  // Cargar notificaciones desde la API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando notificaciones para el usuario:', user?.email);

      const response = await fetch(`${API_BASE_URL}/notificaciones`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al cargar notificaciones: ${response.status} ${errorText}`);
      }

      const data: ApiNotification[] = await response.json();
      console.log('Notificaciones recibidas:', data.length);

      const mappedNotifications = data.map(mapApiToNotification);
      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar notificaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Calcular el número de notificaciones no leídas
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Marcar una notificación como leída
  const markAsRead = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}/leer`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      toast.error('No se pudo marcar la notificación como leída');
    }
  }, [isAuthenticated]);

  // Eliminar una notificación
  const deleteNotification = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      toast.error('No se pudo eliminar la notificación');
    }
  }, [isAuthenticated]);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/marcar-todas-leidas`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar todas las notificaciones como leídas');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err);
      toast.error('No se pudieron marcar todas las notificaciones como leídas');
    }
  }, [isAuthenticated]);

  // Eliminar todas las notificaciones leídas
  const deleteAllRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/eliminar-leidas`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificaciones leídas');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      console.error('Error al eliminar notificaciones leídas:', err);
      toast.error('No se pudieron eliminar las notificaciones leídas');
    }
  }, [isAuthenticated]);

  // Añadir una nueva notificación y guardarla en el backend
  const addNotification = useCallback(async (notificationData: NewNotificationData) => {
    if (!isAuthenticated) {
      console.warn('No se puede crear notificación: usuario no autenticado');
      return;
    }

    try {
      // Crear notificación en el backend
      const response = await fetch(`${API_BASE_URL}/notificaciones/crear`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          titulo: notificationData.title,
          mensaje: notificationData.message,
          tipo: notificationData.type,
          categoria: notificationData.category || null,
          feedback: notificationData.feedback || null
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear notificación en el backend');
      }

      // Obtener la notificación creada desde la respuesta
      const createdNotification = await response.json();

      // Crear objeto de notificación para el frontend
      const newNotification: Notification = {
        id: createdNotification.id,
        title: createdNotification.titulo,
        message: createdNotification.mensaje,
        date: createdNotification.fechaEnvio,
        read: false,
        type: createdNotification.tipo as any,
        category: createdNotification.categoria,
        feedback: createdNotification.feedback
      };

      // Actualizar el estado local
      setNotifications(prev => [newNotification, ...prev]);

      console.log('Notificación creada exitosamente:', newNotification);
    } catch (error) {
      console.error('Error al crear notificación:', error);

      // Crear notificación local temporal (fallback)
      const tempNotification: Notification = {
        ...notificationData,
        id: Date.now(),
        read: false,
        date: new Date().toLocaleString("es-PE", {
          day: 'numeric', month: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      };

      // Actualizar el estado local con la notificación temporal
      setNotifications(prev => [tempNotification, ...prev]);
    }
  }, [isAuthenticated]);

  // Función para actualizar manualmente las notificaciones
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
    isLoading,
    error,
    refreshNotifications
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};