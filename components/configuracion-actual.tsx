"use client"

import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Info, Settings, AlertCircle } from "lucide-react"

interface ConfiguracionActualProps {
  showBadgesOnly?: boolean
  className?: string
}

/**
 * Componente para mostrar un resumen de la configuración actual del sistema
 * Útil para páginas de administración y dashboard
 */
export function ConfiguracionActual({
  showBadgesOnly = false,
  className = ""
}: ConfiguracionActualProps) {
  const config = useConfiguracionSistema()
  const [lastUpdated, setLastUpdated] = useState<string>("")
  
  // Al montar el componente, obtener la hora actual
  useEffect(() => {
    const now = new Date()
    const formattedTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
    setLastUpdated(formattedTime)
  }, [])
  
  // Si solo se muestran badges
  if (showBadgesOnly) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {config.modoMantenimiento && (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
            <Settings className="h-3 w-3 mr-1" /> Mantenimiento
          </Badge>
        )}
        
        {!config.reservasEstanHabilitadas() && (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Reservas deshabilitadas
          </Badge>
        )}
        
        {!config.registroEstaHabilitado() && (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-3 w-3 mr-1" /> Registro cerrado
          </Badge>
        )}
      </div>
    )
  }
  
  // Vista completa
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Configuración Actual</h3>
        <div className="text-sm text-muted-foreground">
          Última actualización: {lastUpdated}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Nombre del sitio:</span>
          <span className="font-medium">{config.getNombreSitio()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Modo mantenimiento:</span>
          <Badge variant={config.modoMantenimiento ? "destructive" : "outline"}>
            {config.modoMantenimiento ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Reservas:</span>
          <Badge variant={config.reservasEstanHabilitadas() ? "outline" : "destructive"}>
            {config.reservasEstanHabilitadas() ? "Habilitadas" : "Deshabilitadas"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Registro de usuarios:</span>
          <Badge variant={config.registroEstaHabilitado() ? "outline" : "destructive"}>
            {config.registroEstaHabilitado() ? "Habilitado" : "Deshabilitado"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Límite de reservas por usuario:</span>
          <span className="font-medium">{config.getMaxReservasPorUsuario()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Tiempo para cancelación:</span>
          <span className="font-medium">{config.getLimiteCancelacionHoras()} horas</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4 w-full"
        onClick={() => window.location.reload()}
      >
        <ArrowDownUp className="h-3.5 w-3.5 mr-1" /> Refrescar configuración
      </Button>
    </Card>
  )
}
