"use client"

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Info, Settings, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBannerProps {
  message: string;
  type?: 'warning' | 'info' | 'error' | 'success';
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  position?: 'top' | 'bottom';
  persistent?: boolean;
  className?: string;
}

export function NotificationBanner({
  message,
  type = 'warning',
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
  position = 'top',
  persistent = false,
  className = ''
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const animationTimer = setTimeout(() => setIsAnimating(false), 300);

    // Auto-hide solo si no es persistente
    let hideTimer: NodeJS.Timeout;
    if (autoHide && autoHideDelay > 0 && !persistent) {
      hideTimer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
    }

    return () => {
      clearTimeout(animationTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [autoHide, autoHideDelay, persistent]);

  const handleDismiss = () => {
    if (!dismissible && persistent) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  if (!isVisible) {
    return null;
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          icon: Info
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          icon: CheckCircle
        };
      case 'warning':
      default:
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-500',
          icon: Settings
        };
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;

  const positionClasses = position === 'top' 
    ? 'top-0' 
    : 'bottom-0';

  return (
    <div className={cn(
      'fixed left-0 right-0 w-full border-b z-50',
      typeConfig.bgColor,
      typeConfig.borderColor,
      positionClasses,
      className
    )}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn('w-5 h-5 flex-shrink-0', typeConfig.iconColor)} />
            <p className={cn('text-sm font-medium', typeConfig.textColor)}>
              {message}
            </p>
          </div>

          {dismissible && !persistent && (
            <button
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors duration-200',
                typeConfig.iconColor
              )}
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook para gestionar notificaciones globales
export function useNotificationBanner() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'warning' | 'info' | 'error' | 'success';
    dismissible?: boolean;
    autoHide?: boolean;
    autoHideDelay?: number;
    persistent?: boolean;
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}
