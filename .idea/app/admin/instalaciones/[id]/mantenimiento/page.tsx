"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { addDays } from "date-fns"
import { MantenimientoForm } from "./components"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para las instalaciones
const facilitiesDB = [
  {
    id: 1,
    name: "Piscina Municipal",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
    status: "disponible",
    maintenanceStatus: "none",
    lastMaintenance: "15/03/2025",
    nextMaintenance: null,
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    type: "cancha-futbol-grass",
    location: "Parque Juan Pablo II",
    status: "disponible",
    maintenanceStatus: "scheduled",
    lastMaintenance: "10/03/2025",
    nextMaintenance: "10/04/2025",
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    type: "gimnasio",
    location: "Complejo Deportivo Municipal",
    status: "disponible",
    maintenanceStatus: "none",
    lastMaintenance: "05/03/2025",
    nextMaintenance: null,
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    type: "cancha-futbol-loza",
    location: "Parque Simón Bolívar",
    status: "mantenimiento",
    maintenanceStatus: "in-progress",
    lastMaintenance: "01/03/2025",
    nextMaintenance: "08/04/2025",
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    type: "pista-atletismo",
    location: "Complejo Deportivo Municipal",
    status: "disponible",
    maintenanceStatus: "required",
    lastMaintenance: "20/02/2025",
    nextMaintenance: null,
  },
]

// Datos de ejemplo para los mantenimientos (simulando base de datos)
const maintenanceDB = [
  {
    id: 1,
    facilityId: 1,
    type: "preventivo",
    description: "Limpieza y mantenimiento general de la piscina",
    startDate: new Date(2025, 3, 5), // 05/04/2025
    startTime: "08:00",
    endDate: new Date(2025, 3, 7), // 07/04/2025
    endTime: "17:00",
    status: "scheduled",
    affectsAvailability: true,
  },
  {
    id: 2,
    facilityId: 2,
    type: "correctivo",
    description: "Reparación del sistema de riego automático",
    startDate: new Date(2025, 3, 10), // 10/04/2025
    startTime: "09:00",
    endDate: new Date(2025, 3, 12), // 12/04/2025
    endTime: "18:00",
    status: "scheduled",
    affectsAvailability: false,
  },
  {
    id: 3,
    facilityId: 4,
    type: "correctivo",
    description: "Reparación de grietas en la superficie",
    startDate: new Date(2025, 3, 1), // 01/04/2025
    startTime: "07:00",
    endDate: new Date(2025, 3, 8), // 08/04/2025
    endTime: "16:00",
    status: "in-progress",
    affectsAvailability: true,
  },
  {
    id: 4,
    facilityId: 3,
    type: "mejora",
    description: "Instalación de nuevos equipos de cardio",
    startDate: new Date(2025, 3, 15), // 15/04/2025
    startTime: "10:00",
    endDate: new Date(2025, 3, 18), // 18/04/2025
    endTime: "19:00",
    status: "scheduled",
    affectsAvailability: false,
  },
  {
    id: 5,
    facilityId: 5,
    type: "preventivo",
    description: "Mantenimiento de la superficie sintética",
    startDate: new Date(2025, 3, 20), // 20/04/2025
    startTime: "08:00",
    endDate: new Date(2025, 3, 22), // 22/04/2025
    endTime: "17:00",
    status: "scheduled",
    affectsAvailability: true,
  }
]

export default function MantenimientoPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const facilityId = params.id
  const maintenanceId = searchParams.get("id")
  
  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState(null)
  const [maintenance, setMaintenance] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const foundFacility = facilitiesDB.find((f) => f.id === Number(facilityId))
      
      // Si estamos editando un mantenimiento existente
      if (maintenanceId) {
        const foundMaintenance = maintenanceDB.find((m) => m.id === Number(maintenanceId) && m.facilityId === Number(facilityId))
        
        if (foundMaintenance) {
          setMaintenance(foundMaintenance)
          setIsEditing(true)
          setFacility(foundFacility || null)
        } else {
          toast({
            title: "Mantenimiento no encontrado",
            description: "El mantenimiento que intentas editar no existe o no pertenece a esta instalación.",
            variant: "destructive",
          })
          setFacility(null)
        }
      } 
      // Si estamos creando un nuevo mantenimiento
      else {
        // Validar si la instalación puede recibir mantenimiento
        if (foundFacility && (foundFacility.maintenanceStatus === 'scheduled' || foundFacility.maintenanceStatus === 'in-progress')) {
          toast({
            title: "No disponible para mantenimiento",
            description: "Esta instalación ya tiene un mantenimiento programado o en progreso.",
            variant: "destructive",
          })
          setFacility(null)
        } else {
          setFacility(foundFacility || null)
        }
      }
      
      setIsLoading(false)
    }

    loadData()

    // Actualizar estado de mantenimiento cada minuto (en un caso real esto se haría en el backend)
    const updateMaintenanceStatus = () => {
      if (facility && facility.maintenanceStatus !== 'none' && facility.maintenanceStatus !== 'required') {
        // Lógica para actualizar el estado del mantenimiento basado en la fecha actual
        // Esta lógica ahora está en el componente MantenimientoForm
      }
    }

    const statusInterval = setInterval(updateMaintenanceStatus, 60000) // Actualizar cada minuto

    return () => clearInterval(statusInterval)
  }, [facilityId, toast, facility, maintenanceId])

  // Función para manejar el envío del formulario desde el componente MantenimientoForm
  const handleFormSubmit = (formData) => {
    setIsSaving(true)

    // Determinar el estado inicial basado en las fechas
    const now = new Date();
    const startDateTime = new Date(formData.startDate);
    const [startHours, startMinutes] = formData.startTime.split(":").map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(formData.endDate);
    const [endHours, endMinutes] = formData.endTime.split(":").map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    let maintenanceStatus;
    
    if (now < startDateTime) {
      maintenanceStatus = 'scheduled';
    } else if (now >= startDateTime && now <= endDateTime) {
      maintenanceStatus = 'in-progress';
    } else {
      maintenanceStatus = 'completed';
    }

    // Simulación de guardado
    setTimeout(() => {
      if (isEditing) {
        // En un caso real, aquí se haría la llamada a la API para actualizar el mantenimiento
        console.log("Actualizando mantenimiento:", { 
          id: maintenance.id,
          ...formData, 
          facilityId: facility.id,
          status: maintenanceStatus
        })

        toast({
          title: "Mantenimiento actualizado",
          description: "El mantenimiento ha sido actualizado exitosamente.",
        })
      } else {
        // En un caso real, aquí se haría la llamada a la API para programar el mantenimiento
        console.log("Programando mantenimiento:", { 
          ...formData, 
          facilityId: facility.id,
          status: maintenanceStatus
        })

        toast({
          title: "Mantenimiento programado",
          description: "El mantenimiento ha sido programado exitosamente.",
        })
      }

      setIsSaving(false)
      setIsSuccess(true)

      // Redireccionar a la página de mantenimientos después de mostrar el mensaje de éxito
      setTimeout(() => {
        router.push('/admin/instalaciones/mantenimiento')
      }, 2000)
    }, 1500)
  }

  // La lógica de manejo del formulario y visualización de badges se ha movido al componente MantenimientoForm

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Instalación no encontrada</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Instalación no encontrada</h3>
            <p className="text-gray-500 mt-2">La instalación que estás buscando no existe o ha sido eliminada.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/admin/instalaciones">Ver todas las instalaciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/instalaciones/mantenimiento">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Editar Mantenimiento" : "Programar Mantenimiento"}</h1>
        </div>
        {isSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">{isEditing ? "Mantenimiento actualizado correctamente" : "Mantenimiento programado correctamente"}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MantenimientoForm 
            facility={facility}
            maintenance={maintenance}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
            isSuccess={isSuccess}
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Instalación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Tipo de instalación</h3>
                <p className="text-sm capitalize">{facility.type.replace(/-/g, " ")}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Ubicación</h3>
                <p className="text-sm">{facility.location}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Estado actual</h3>
                <div>
                  {facility.status === "disponible" ? (
                    <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                  ) : facility.status === "mantenimiento" ? (
                    <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">No disponible</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Último mantenimiento</h3>
                <p className="text-sm">{facility.lastMaintenance}</p>
              </div>
              {facility.nextMaintenance && (
                <div className="space-y-2">
                  <h3 className="font-medium">Próximo mantenimiento</h3>
                  <p className="text-sm">{facility.nextMaintenance}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

