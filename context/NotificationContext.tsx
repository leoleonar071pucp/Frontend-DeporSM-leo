"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Interfaces
interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: "success" | "info" | "warning" | "reserva" | "mantenimiento" | "pago" | "reporte"; // Actualizar tipos
    category?: string; // Propiedad opcional para categorizar notificaciones
    feedback?: string; // Propiedad opcional para retroalimentación
}

type NewNotificationData = Omit<Notification, 'id' | 'read' | 'date'>;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notificationData: NewNotificationData) => void;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  markAllAsRead: () => void;
  deleteAllRead: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Datos de ejemplo específicos para cada rol
const vecinoNotifications: Notification[] = [
  { id: 1, title: "Reserva confirmada", message: "Tu reserva para Cancha de Fútbol (Grass) ha sido confirmada.", date: "Hoy, 14:30", read: false, type: "reserva" },
  { id: 2, title: "Recordatorio", message: "Tu reserva para Piscina Municipal es mañana a las 10:00.", date: "Hoy, 11:15", read: false, type: "reserva" },
  { id: 3, title: "Mantenimiento programado", message: "El Gimnasio Municipal estará cerrado por mantenimiento el próximo lunes.", date: "Ayer, 16:45", read: true, type: "warning" },
  { id: 4, title: "Reserva cancelada", message: "Tu reserva para Pista de Atletismo ha sido cancelada exitosamente.", date: "12/04/2025", read: true, type: "success" },
];

const adminNotifications: Notification[] = [
  { 
    id: 1, 
    title: "Nueva reserva", 
    message: "Se ha realizado una nueva reserva para Cancha de Fútbol (Grass)", 
    date: "Hace 10 minutos", 
    read: false, 
    type: "reserva" 
  },
  { 
    id: 2, 
    title: "Mantenimiento programado", 
    message: "Recordatorio: Mantenimiento de Piscina Municipal mañana", 
    date: "Hace 2 horas", 
    read: false, 
    type: "mantenimiento" 
  },
  { 
    id: 3, 
    title: "Pago confirmado", 
    message: "Se ha confirmado el pago de la reserva #12345", 
    date: "Hace 5 horas", 
    read: true, 
    type: "pago" 
  },
  { 
    id: 4, 
    title: "Solicitud de mantenimiento", 
    message: "El coordinador ha solicitado mantenimiento para la Pista de Atletismo", 
    date: "Hace 1 día", 
    read: false, 
    type: "mantenimiento" 
  },
  { 
    id: 5, 
    title: "Reserva cancelada", 
    message: "La reserva #12346 ha sido cancelada por el usuario", 
    date: "Hace 1 día", 
    read: true, 
    type: "reserva" 
  },
  { 
    id: 6, 
    title: "Reporte generado", 
    message: "El reporte mensual de ingresos está disponible para su descarga", 
    date: "Hace 2 días", 
    read: true, 
    type: "reporte" 
  },
  { 
    id: 7, 
    title: "Nueva solicitud de reserva", 
    message: "Hay una nueva solicitud de reserva pendiente de aprobación", 
    date: "Hace 3 días", 
    read: true, 
    type: "reserva" 
  },
];

const coordinadorNotifications: Notification[] = [
  {
    id: 1,
    title: "Nueva instalación asignada",
    message: "Se te ha asignado la Cancha de Fútbol (Grass)",
    date: "05/04/2025, 10:15",
    read: false,
    type: "info",
    category: "asignacion"
  },
  {
    id: 2,
    title: "Observación aprobada",
    message: "Tu observación sobre la Piscina Municipal ha sido aprobada",
    date: "04/04/2025, 14:30",
    read: false,
    type: "success",
    category: "observacion"
  },
  {
    id: 3,
    title: "Recordatorio de inspección",
    message: "Tienes una inspección programada para la Pista de Atletismo mañana",
    date: "03/04/2025, 09:45",
    read: false,
    type: "warning",
    category: "recordatorio"
  },
  {
    id: 4,
    title: "Observación rechazada",
    message: "Tu observación sobre el Gimnasio Municipal ha sido rechazada",
    date: "02/04/2025, 16:20",
    read: true,
    type: "warning",
    category: "observacion",
    feedback: "Ya se ha reportado anteriormente y está en proceso de reparación."
  },
  {
    id: 5,
    title: "Mantenimiento programado",
    message: "Se ha programado mantenimiento para la Piscina Municipal",
    date: "01/04/2025, 11:10",
    read: true,
    type: "info",
    category: "mantenimiento"
  }
];

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Seleccionar las notificaciones iniciales según el rol del usuario
  const getInitialNotifications = () => {
    switch (user?.role) {
      case 'admin':
        return adminNotifications;
      case 'coordinador':
        return coordinadorNotifications;
      case 'vecino':
        return vecinoNotifications;
      default:
        return [];
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>(getInitialNotifications());

  // Actualizar notificaciones cuando cambia el rol del usuario
  useEffect(() => {
    setNotifications(getInitialNotifications());
  }, [user?.role]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteAllRead = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
  }, []);

  const addNotification = useCallback((notificationData: NewNotificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(),
      read: false,
      date: new Date().toLocaleString("es-PE", {
          day: 'numeric', month: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      })
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};