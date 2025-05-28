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
        console.log("Cargando mantenimiento con ID:", id);

        // Incluir credenciales para asegurar que se envíen las cookies de autenticación
        const res = await fetch(`${API_BASE_URL}/mantenimientos/${id}`, {
          credentials: 'include'
        })

        console.log("Respuesta del servidor:", res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error del servidor:", errorText);
          throw new Error(`Error ${res.status}: ${errorText || "No se encontró el mantenimiento"}`);
        }

        const data = await res.json()
        console.log("Datos del mantenimiento recibidos:", data);

        // Validar que tenemos los datos necesarios
        if (!data.fechaInicio || !data.fechaFin) {
          console.error("Faltan fechas en los datos:", data);
          throw new Error("Los datos del mantenimiento están incompletos");
        }

        // Crear fechas locales simples sin conversiones de zona horaria
        const inicio = new Date(data.fechaInicio)
        const fin = new Date(data.fechaFin)

        console.log("Fechas procesadas:", {
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          inicioDate: inicio,
          finDate: fin
        });

        // Calcular el estado basado en las fechas
        const now = new Date();
        let calculatedStatus = "unknown";
        if (now < inicio) calculatedStatus = "scheduled";
        else if (now >= inicio && now <= fin) calculatedStatus = "in-progress";
        else if (now > fin) calculatedStatus = "completed";

        // Usar el estado del backend si está disponible, o el calculado
        let status = data.estado || calculatedStatus;

        // Convertir el estado del backend al formato que usa el frontend
        if (status === "programado") status = "scheduled";
        else if (status === "en-progreso") status = "in-progress";
        else if (status === "completado") status = "completed";
        else if (status === "cancelado") status = "cancelled";

        // Obtener información de la instalación
        let facilityName = "Desconocida";
        let facilityLocation = "";

        // Verificar si tenemos el objeto instalacion completo
        if (data.instalacion && data.instalacion.nombre) {
          facilityName = data.instalacion.nombre;
          facilityLocation = data.instalacion.ubicacion || "";
        }
        // Si tenemos el nombre de la instalación directamente
        else if (data.instalacionNombre) {
          facilityName = data.instalacionNombre;
          facilityLocation = data.instalacionUbicacion || "";
        }
        // Si no, verificar si tenemos el ID de la instalación para hacer una consulta adicional
        else if (data.instalacionId) {
          try {
            console.log("Obteniendo instalación por ID:", data.instalacionId);
            const facilityRes = await fetch(`${API_BASE_URL}/instalaciones/${data.instalacionId}`, {
              credentials: 'include'
            });
            if (facilityRes.ok) {
              const facilityData = await facilityRes.json();
              console.log("Datos de la instalación obtenidos:", facilityData);
              facilityName = facilityData.nombre || "Desconocida";
              facilityLocation = facilityData.ubicacion || "";
            } else {
              console.error("Error al obtener la instalación:", facilityRes.status);
            }
          } catch (error) {
            console.error("Error al obtener datos de la instalación:", error);
          }
        }

        const parsed: Maintenance = {
          id: data.id,
          facilityName: facilityName,
          facilityLocation: facilityLocation,
          type: data.tipo || data.motivo || "Desconocido", // Usar tipo o motivo
          description: data.descripcion || "",
          startDate: format(inicio, "dd/MM/yyyy", { locale: es }),
          startTime: format(inicio, "HH:mm"),
          endDate: format(fin, "dd/MM/yyyy", { locale: es }),
          endTime: format(fin, "HH:mm"),
          createdBy: data.registradoPor?.nombre || "Administrador",
          createdAt: format(new Date(data.createdAt || new Date()), "dd/MM/yyyy HH:mm", { locale: es }),
          affectsAvailability: data.afectaDisponibilidad !== undefined ? data.afectaDisponibilidad : true,
          status: status
        }

        setMaintenance(parsed)
      } catch (err) {
        console.error("Error completo al cargar mantenimiento:", err);
        console.error("Stack trace:", err instanceof Error ? err.stack : "No stack available");
        setError(`No se pudo cargar el mantenimiento: ${err instanceof Error ? err.message : String(err)}`)
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
    if (!type) return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;

    switch (type.toLowerCase()) {
      case "preventivo":
        return <Badge className="bg-green-100 text-green-800">Preventivo</Badge>
      case "correctivo":
        return <Badge className="bg-red-100 text-red-800">Correctivo</Badge>
      case "mejora":
        return <Badge className="bg-blue-100 text-blue-800">Mejora</Badge>
      default:
        // Si no coincide con ninguno de los tipos conocidos, mostrar el tipo tal cual
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
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
        <div className="space-y-4">
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

        {maintenance.affectsAvailability ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este mantenimiento afecta la disponibilidad de la instalación
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Este mantenimiento NO afecta la disponibilidad de la instalación
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
