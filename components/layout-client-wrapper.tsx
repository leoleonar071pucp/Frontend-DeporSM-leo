"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { SystemStatus } from './system-status';
import { NotificationBanner } from './notification-banner';
import { useConfiguracionSistema } from '@/hooks/use-configuracion-sistema';
import { Toaster } from '@/components/ui/toaster';
interface LayoutClientWrapperProps {
  children: React.ReactNode;
  chatbot: React.ReactNode; // Prop para recibir el Chatbot
  footer: React.ReactNode;  // Prop para recibir el Footer
}

export function LayoutClientWrapper({ children, chatbot, footer }: LayoutClientWrapperProps) {
  const pathname = usePathname();
  const configSistema = useConfiguracionSistema();

  // Determinar si estamos en una ruta de administración/interna o autenticación
  const isInternalRoute = pathname.startsWith('/admin') || 
                         pathname.startsWith('/coordinador') || 
                         pathname.startsWith('/superadmin') ||
                         pathname === '/login' ||
                         pathname === '/registro' ||
                         pathname === '/recuperar-contrasena';

  // En rutas de superadmin mostrar todos los estados
  const showFullStatus = pathname.startsWith('/superadmin');

  return (
    <>
      {/* Banner de mantenimiento mejorado */}
      {!configSistema.estaCargando && configSistema.modoMantenimiento && (
        <NotificationBanner
          message="El sistema está en modo mantenimiento. Algunas funciones podrían no estar disponibles."
          type="warning"
          dismissible={false}
          persistent={true}
          position="top"
          className={isInternalRoute ? 'lg:ml-64' : ''}
        />
      )}

      {/* Banner para reservas deshabilitadas en rutas de usuarios */}
      {!configSistema.estaCargando &&
       !isInternalRoute &&
       !configSistema.reservasEstanHabilitadas() &&
       !pathname.includes('/instalaciones') && (
        <NotificationBanner
          message="Las reservas están temporalmente suspendidas. No es posible realizar nuevas reservas en este momento."
          type="error"
          dismissible={true}
          autoHide={false}
          position="top"
        />
      )}

      {/* Espaciador dinámico para los banners */}
      {!configSistema.estaCargando && (
        configSistema.modoMantenimiento ||
        (!isInternalRoute && !configSistema.reservasEstanHabilitadas() && !pathname.includes('/instalaciones'))
      ) && (
        <div className="h-16"></div>
      )}

      {/* En administración, mostrar panel de estado completo */}
      {showFullStatus && (
        <div className="container mx-auto px-4 mt-4 mb-4">
          <SystemStatus
            showRegistroStatus={false}
          />
        </div>
      )}
      
      {children}
      
      {/* Renderizar Chatbot y Footer solo si NO es una ruta interna o de autenticación */}
      {!isInternalRoute && (
        <>
          {chatbot}
          {footer}
        </>
      )}
      {/* Toaster debe estar siempre disponible en toda la aplicación */}
      <Toaster />
    </>
  );
}