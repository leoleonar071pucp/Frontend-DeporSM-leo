"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';

// Reutilizar o definir la interfaz Notification si no está globalmente disponible
interface Notification {
    id: number;
    title: string;
    message: string;
    date: string; // Podría ser Date si se necesita manipulación compleja
    read: boolean;
    type: "success" | "info" | "warning";
}

// Datos iniciales de ejemplo (podrían venir de una API en el futuro)
const initialNotifications: Notification[] = [
  { id: 1, title: "Reserva confirmada", message: "Tu reserva para Cancha de Fútbol (Grass) ha sido confirmada.", date: "Hoy, 14:30", read: false, type: "success" },
  { id: 2, title: "Recordatorio", message: "Tu reserva para Piscina Municipal es mañana a las 10:00.", date: "Hoy, 11:15", read: false, type: "info" },
  { id: 3, title: "Mantenimiento programado", message: "El Gimnasio Municipal estará cerrado por mantenimiento el próximo lunes.", date: "Ayer, 16:45", read: true, type: "warning" },
  { id: 4, title: "Reserva cancelada", message: "Tu reserva para Pista de Atletismo ha sido cancelada exitosamente.", date: "12/04/2025", read: true, type: "success" },
];


// Define la forma de los datos para una nueva notificación (omitimos id, read, date)
type NewNotificationData = Omit<Notification, 'id' | 'read' | 'date'>;

// Define la forma del contexto
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notificationData: NewNotificationData) => void; // Añadir función
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  markAllAsRead: () => void;
  deleteAllRead: () => void;
  // Podríamos añadir una función para cargar notificaciones de una API
  // fetchNotifications: () => Promise<void>;
}

// Crea el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props para el proveedor
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Calcular unreadCount eficientemente
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    console.log(`NotificationContext: Marcada como leída ID ${id}`);
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log(`NotificationContext: Eliminada notificación ID ${id}`);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    console.log(`NotificationContext: Marcadas todas como leídas`);
  }, []);

  const deleteAllRead = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
     console.log(`NotificationContext: Eliminadas todas las leídas`);
  }, []);

  // Función para añadir una nueva notificación
  const addNotification = useCallback((notificationData: NewNotificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(), // Usar timestamp como ID simple y único
      read: false,
      date: new Date().toLocaleString("es-PE", { // Formato de fecha/hora local
          day: 'numeric', month: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      })
    };
    setNotifications(prev => [newNotification, ...prev]); // Añadir al principio de la lista
    console.log(`NotificationContext: Añadida nueva notificación`, newNotification);
  }, []);

  // Aquí podríamos tener un useEffect para cargar notificaciones iniciales de una API

  const value = {
    notifications,
    unreadCount,
    addNotification, // Exponer la nueva función
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