"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface Maintenance {
  id: number
  facilityId: number
  facilityName: string
  facilityLocation: string
  type: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  status: string
  affectsAvailability: boolean
  createdBy: string
  createdAt: string
}

interface MantenimientoDetailsProps {
  maintenance: Maintenance
}

export default function MantenimientoDetails({ maintenance }: MantenimientoDetailsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "preventivo":
        return <Badge className="bg-green-100 text-green-800">Preventivo</Badge>
      case "correctivo":
        return <Badge className="bg-red-100 text-red-800">Correctivo</Badge>
      case "mejora":
        return <Badge className="bg-blue-100 text-blue-800">Mejora</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Mantenimiento</CardTitle>
        <CardDescription>Información del mantenimiento para {maintenance.facilityName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado y Tipo */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Label>Estado</Label>
            <div>{getStatusBadge(maintenance.status)}</div>
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <div>{getTypeBadge(maintenance.type)}</div>
          </div>
        </div>

        <Separator />

        {/* Instalación */}
        <div className="space-y-2">
          <Label>Instalación</Label>
          <p className="text-sm">{maintenance.facilityName}</p>
          <p className="text-sm text-gray-500">{maintenance.facilityLocation}</p>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea
            value={maintenance.description}
            className="resize-none bg-gray-50"
            disabled
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {maintenance.startDate} {maintenance.startTime}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha de finalización</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {maintenance.endDate} {maintenance.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-2">
          <Label>Información adicional</Label>
          <div className="text-sm space-y-1">
            <p>Creado por: {maintenance.createdBy}</p>
            <p>Fecha de creación: {maintenance.createdAt}</p>
          </div>
        </div>

        {/* Alerta de disponibilidad */}
        {maintenance.affectsAvailability && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este mantenimiento afecta la disponibilidad de la instalación
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}