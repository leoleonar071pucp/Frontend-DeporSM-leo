"use client"

import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, Settings } from "lucide-react"
import { LoadingComponent } from "./loading-component"

interface SystemStatusProps {
  showReservasStatus?: boolean;
  showRegistroStatus?: boolean;
  showMantenimientoStatus?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Componente para mostrar el estado actual del sistema
 * Muestra información sobre el modo de mantenimiento, estado de reservas y registro
 */
export function SystemStatus({
  showReservasStatus = true,
  showRegistroStatus = true,
  showMantenimientoStatus = true,
  compact = false,
  className = "",
}: SystemStatusProps) {
  const config = useConfiguracionSistema();

  if (config.estaCargando) {
    return <LoadingComponent text="Cargando estado del sistema..." />;
  }

  if (config.tieneError) {
    return null; // No mostrar nada en caso de error
  }

  // Si no hay nada que mostrar o todo está normal, no mostrar el componente
  if (
    (!showReservasStatus || config.reservasEstanHabilitadas()) &&
    (!showRegistroStatus || config.registroEstaHabilitado()) &&
    (!showMantenimientoStatus || !config.modoMantenimiento)
  ) {
    return null;
  }

  // Si es compacto, mostrar solo badges
  if (compact) {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {showMantenimientoStatus && config.modoMantenimiento && (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200">
            <Settings className="h-3 w-3 mr-1" /> Mantenimiento
          </Badge>
        )}
        {showReservasStatus && !config.reservasEstanHabilitadas() && (
          <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-100 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Reservas deshabilitadas
          </Badge>
        )}
        {showRegistroStatus && !config.registroEstaHabilitado() && (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200">
            <Info className="h-3 w-3 mr-1" /> Registro cerrado
          </Badge>
        )}
      </div>
    );
  }

  // Versión completa
  return (
    <Card className={`border-amber-200 ${className}`}>
      <CardContent className="pt-6 pb-4 px-4 space-y-3">
        {showMantenimientoStatus && config.modoMantenimiento && (
          <div className="flex gap-3 items-start">
            <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Sistema en mantenimiento</h3>
              <p className="text-sm text-amber-700">
                El sistema se encuentra en modo mantenimiento. Algunas funciones
                podrían no estar disponibles.
              </p>
            </div>
          </div>
        )}

        {showReservasStatus && !config.reservasEstanHabilitadas() && (
          <div className="flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Reservas deshabilitadas</h3>
              <p className="text-sm text-red-700">
                Las reservas están temporalmente suspendidas. No es posible realizar
                nuevas reservas en este momento.
              </p>
            </div>
          </div>
        )}

        {showRegistroStatus && !config.registroEstaHabilitado() && (
          <div className="flex gap-3 items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Registro cerrado</h3>
              <p className="text-sm text-blue-700">
                El registro de nuevos usuarios está temporalmente cerrado.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
