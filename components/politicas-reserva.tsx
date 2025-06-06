"use client"

import { useConfiguracion } from "@/context/ConfiguracionContext"
import { AlertCircle, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingComponent } from "./loading-component"

export function PoliticasReserva() {
  const { config } = useConfiguracion()
  
  if (config.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Políticas de Reserva</CardTitle>
          <CardDescription>Información importante sobre las reservas</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingComponent text="Cargando políticas de reserva..." />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Políticas de Reserva</CardTitle>
        <CardDescription>Información importante sobre las reservas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Tiempo límite para cancelaciones</h3>
            <p className="text-sm text-muted-foreground">
              Las reservas pueden cancelarse hasta {config.limiteTiempoCancelacion} horas antes del inicio.
              Pasado este tiempo, no se podrá realizar la cancelación.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Users className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Límite de reservas</h3>
            <p className="text-sm text-muted-foreground">
              Cada usuario puede tener un máximo de {config.maxReservasPorUsuario} reservas activas simultáneamente.
            </p>
          </div>
        </div>
        
        {!config.reservasHabilitadas && (
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Reservas temporalmente deshabilitadas</h3>
              <p className="text-sm text-yellow-700">
                En este momento, el sistema de reservas se encuentra deshabilitado. 
                Por favor, inténtelo más tarde.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
