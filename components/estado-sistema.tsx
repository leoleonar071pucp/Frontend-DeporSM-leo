"use client"

import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingComponent } from "@/components/loading-component"
import { Settings, Calendar, Users, Clock, Mail, Phone, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EstadoSistemaProps {
  className?: string
}

export function EstadoSistema({ className }: EstadoSistemaProps) {
  const config = useConfiguracionSistema()
  const [activeTab, setActiveTab] = useState("general")
  
  if (config.estaCargando) {
    return <LoadingComponent text="Cargando información del sistema..." />
  }

  if (config.tieneError) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-medium text-lg">Error al cargar configuración</h3>
            <p className="text-sm text-muted-foreground">
              No se pudo cargar la información del sistema. Por favor, intente más tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Estado del Sistema</CardTitle>
        <CardDescription>
          Información sobre la configuración y estado actual del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="contacto">Contacto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-medium">Nombre del sistema</span>
                </div>
                <span>{config.getNombreSitio()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">Registro de usuarios</span>
                </div>
                <Badge 
                  variant={config.registroEstaHabilitado() ? "outline" : "secondary"}
                  className={config.registroEstaHabilitado() 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }
                >
                  {config.registroEstaHabilitado() ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="font-medium">Modo mantenimiento</span>
                </div>
                <Badge 
                  variant={!config.modoMantenimiento ? "outline" : "secondary"}
                  className={!config.modoMantenimiento 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                >
                  {config.modoMantenimiento ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{config.getDescripcion()}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reservas" className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Estado de reservas</span>
                </div>
                <Badge 
                  variant={config.reservasEstanHabilitadas() ? "outline" : "secondary"}
                  className={config.reservasEstanHabilitadas() 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {config.reservasEstanHabilitadas() ? "Habilitadas" : "Deshabilitadas"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">Máximo de reservas por usuario</span>
                </div>
                <span className="font-medium">{config.getMaxReservasPorUsuario()} reservas</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tiempo límite para cancelaciones</span>
                </div>
                <span>{config.getLimiteCancelacionHoras()} horas antes</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contacto" className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium">Correo electrónico</span>
                </div>
                <span className="text-right">{config.getEmailContacto()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">Teléfono</span>
                </div>
                <span>{config.getTelefonoContacto()}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700">
                Para consultas sobre reservas o uso del sistema, puedes contactarnos
                directamente a través de estos canales.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
