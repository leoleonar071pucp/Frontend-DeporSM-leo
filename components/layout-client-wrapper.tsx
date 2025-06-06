"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { SystemStatus } from './system-status';
import { useConfiguracionSistema } from '@/hooks/use-configuracion-sistema';

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
  
  // En página principal y rutas de vecinos mostrar alertas importantes
  const showUserAlerts = !isInternalRoute || pathname.startsWith('/(vecino)');

  return (
    <>
      {/* Alerta de mantenimiento global para todos los usuarios */}
      {!configSistema.estaCargando && configSistema.modoMantenimiento && (
        <div className="bg-amber-50 border-b border-amber-200 p-2 text-center">
          <SystemStatus 
            compact={true} 
            showMantenimientoStatus={true}
            showReservasStatus={false}
            showRegistroStatus={false}
            className="justify-center"
          />
        </div>
      )}
      
      {/* En administración, mostrar panel de estado completo */}
      {showFullStatus && (
        <div className="container mx-auto px-4 mt-4 mb-4">
          <SystemStatus />
        </div>
      )}
      
      {/* Alerta para usuarios en páginas principales cuando las reservas están deshabilitadas */}
      {showUserAlerts && !configSistema.reservasEstanHabilitadas() && !pathname.includes('/instalaciones') && (
        <div className="container mx-auto px-4 mt-4">
          <SystemStatus 
            showMantenimientoStatus={false}
            showReservasStatus={true}
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
    </>
  );
}