"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Calendar } from "lucide-react"
import { API_BASE_URL } from "@/lib/config";


interface Maintenance {
  id: number
  facilityName: string
  facilityLocation: string
  type: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  createdBy: string
  createdAt: string
  affectsAvailability: boolean
  status: string
}

export default function MantenimientoDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/mantenimientos/${id}`)
        if (!res.ok) throw new Error("No se encontró el mantenimiento")
        const data = await res.json()

        const inicio = new Date(data.fechaInicio)
        const fin = new Date(data.fechaFin)

        // Calcular el estado basado en las fechas
        const now = new Date();
        let status = "unknown";
        if (now < inicio) status = "scheduled";
        if (now >= inicio && now <= fin) status = "in-progress";
        if (now > fin) status = "completed";

        // Obtener el nombre y ubicación de la instalación
        const facilityName = data.instalacion ? data.instalacion.nombre : "Desconocida";
        const facilityLocation = data.instalacion ? data.instalacion.ubicacion : "";

        const parsed: Maintenance = {
          id: data.id,
          facilityName: facilityName,
          facilityLocation: facilityLocation,
          type: data.motivo || "preventivo",
          description: data.descripcion || "",
          startDate: format(inicio, "dd/MM/yyyy", { locale: es }),
          startTime: format(inicio, "HH:mm"),
          endDate: format(fin, "dd/MM/yyyy", { locale: es }),
          endTime: format(fin, "HH:mm"),
          createdBy: data.registradoPor?.nombre || "Administrador",
          createdAt: format(new Date(data.createdAt || new Date()), "dd/MM/yyyy HH:mm", { locale: es }),
          affectsAvailability: true, // Por defecto, el mantenimiento afecta la disponibilidad
          status: status
        }

        setMaintenance(parsed)
      } catch (err) {
        setError("No se pudo cargar el mantenimiento.")
      }
    }

    if (id) fetchData()
  }, [id])

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

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!maintenance) return <p className="p-4">Cargando...</p>

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Detalles del Mantenimiento</CardTitle>
        <CardDescription>Información del mantenimiento para {maintenance.facilityName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <Label>Instalación</Label>
          <p className="text-sm">{maintenance.facilityName}</p>
          <p className="text-sm text-gray-500">{maintenance.facilityLocation}</p>
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea
            value={maintenance.description}
            className="resize-none bg-gray-50"
            disabled
          />
        </div>

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

        <div className="space-y-2">
          <Label>Información adicional</Label>
          <div className="text-sm space-y-1">
            <p>Creado por: {maintenance.createdBy}</p>
            <p>Fecha de creación: {maintenance.createdAt}</p>
          </div>
        </div>

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
