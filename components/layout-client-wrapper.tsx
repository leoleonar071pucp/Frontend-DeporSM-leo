"use client"

import React from 'react';
import { usePathname } from 'next/navigation';

interface LayoutClientWrapperProps {
  children: React.ReactNode;
  chatbot: React.ReactNode; // Prop para recibir el Chatbot
  footer: React.ReactNode;  // Prop para recibir el Footer
}

export function LayoutClientWrapper({ children, chatbot, footer }: LayoutClientWrapperProps) {
  const pathname = usePathname();

  // Determinar si estamos en una ruta de administración/interna o autenticación
  const isInternalRoute = pathname.startsWith('/admin') || 
                         pathname.startsWith('/coordinador') || 
                         pathname.startsWith('/superadmin') ||
                         pathname === '/login' ||
                         pathname === '/registro' ||
                         pathname === '/recuperar-contrasena';

  return (
    <>
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