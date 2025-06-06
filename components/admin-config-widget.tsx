"use client"

import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AdminConfigWidgetProps {
  className?: string;
  configUrl?: string;
}

/**
 * Widget para mostrar información de configuración en dashboard de administración
 */
export function AdminConfigWidget({ 
  className,
  configUrl = "/superadmin/sistema/configuracion" 
}: AdminConfigWidgetProps) {
  const config = useConfiguracionSistema();
  
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Configuración del Sistema</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Modo mantenimiento</div>
            <Badge 
              variant="outline" 
              className={config.modoMantenimiento 
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                : "bg-gray-100"
              }
            >
              {config.modoMantenimiento ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Registro usuarios</div>
            <Badge 
              variant="outline" 
              className={!config.registroEstaHabilitado()
                ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                : "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
              }
            >
              {config.registroEstaHabilitado() ? "Habilitado" : "Deshabilitado"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Reservas</div>
            <Badge 
              variant="outline" 
              className={!config.reservasEstanHabilitadas()
                ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                : "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
              }
            >
              {config.reservasEstanHabilitadas() ? "Habilitadas" : "Deshabilitadas"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Máx. reservas por usuario</div>
            <div className="text-sm">{config.getMaxReservasPorUsuario()}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Tiempo cancelación</div>
            <div className="text-sm">{config.getLimiteCancelacionHoras()} horas</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={configUrl}>
            <ExternalLink className="h-4 w-4 mr-2" /> 
            Administrar configuración
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
