"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react'; // Para mostrar carga

export default function VecinoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) { // Esperar a que termine la carga inicial de Auth
      if (!isAuthenticated) {
        // Si no está autenticado, las páginas internas ya deberían redirigir a login.
        // Podríamos añadir una redirección aquí también por seguridad extra,
        // pero podría causar un doble redirect si la página hija ya lo hace.
        // Por ahora, confiamos en la protección de cada página hija.
      } else if (user?.rol?.nombre && user?.rol?.nombre !== 'vecino') {
        // Si está autenticado pero NO es vecino (es admin, coordinador, etc.)
        console.warn(`Acceso denegado a ruta de vecino para rol: ${user?.rol?.nombre}. Redirigiendo...`);
        // Redirigir a su dashboard correspondiente o a la página principal
        switch (user?.rol?.nombre) {
            case 'admin':
                router.push('/admin');
                break;
            case 'coordinador':
                router.push('/coordinador');
                break;
            case 'superadmin':
                 router.push('/superadmin');
                 break;
            default:
                router.push('/'); // Fallback a la página principal
        }
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  // Mostrar loader mientras carga Auth o si el rol no es 'vecino' (antes de redirigir)
  if (isAuthLoading || (isAuthenticated && user?.rol?.nombre && user?.rol?.nombre !== 'vecino')) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si está autenticado y es vecino (o la carga inicial no ha terminado pero isAuthenticated es false),
  // renderizar el contenido de la página específica del vecino.
  // La protección específica de cada página hija manejará el caso !isAuthenticated.
  return <>{children}</>;
}