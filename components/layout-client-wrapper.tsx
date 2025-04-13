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

  // Determinar si estamos en una ruta de administración/interna
  const isInternalRoute = pathname.startsWith('/admin') || pathname.startsWith('/coordinador') || pathname.startsWith('/superadmin');

  return (
    <>
      {children}
      {/* Renderizar Chatbot y Footer solo si NO es una ruta interna */}
      {!isInternalRoute && (
        <>
          {chatbot}
          {footer}
        </>
      )}
    </>
  );
}