"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { MantenimientoForm } from "./components"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"
import { useNotification } from "@/context/NotificationContext"

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
  const { addNotification } = useNotification()
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
    // Cargar datos reales de la instalación y mantenimiento
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Cargar datos de la instalación
        const facilityResponse = await fetch(`${API_BASE_URL}/instalaciones/${facilityId}`, {
          credentials: 'include'
        });

        if (!facilityResponse.ok) {
          throw new Error(`Error al cargar la instalación: ${facilityResponse.status}`);
        }

        const facilityData = await facilityResponse.json();

        // Determinar el estado de mantenimiento
        let maintenanceStatus = "none";

        // Cargar información de mantenimiento
        const maintenanceResponse = await fetch(`${API_BASE_URL}/mantenimientos/instalacion/${facilityId}`, {
          credentials: 'include'
        });
        let tieneMantenimientoActivo = false;
        let enMantenimiento = false;
        let maintenanceData = null;

        if (maintenanceResponse.ok) {
          maintenanceData = await maintenanceResponse.json();

          // Verificar si está en mantenimiento actualmente
          if (maintenanceData.enMantenimiento) {
            enMantenimiento = true;
            maintenanceStatus = "in-progress";
          }

          // Verificar si tiene mantenimiento programado
          if (maintenanceData.tieneMantenimientoProgramado) {
            maintenanceStatus = "scheduled";
          }

          // Verificar si tiene algún mantenimiento activo
          if (maintenanceData.tieneMantenimientoActivo) {
            tieneMantenimientoActivo = true;
          }
        }

        // Si estamos editando un mantenimiento existente
        if (maintenanceId) {
          const maintenanceDetailResponse = await fetch(`${API_BASE_URL}/mantenimientos/${maintenanceId}`, {
            credentials: 'include'
          });

          if (maintenanceDetailResponse.ok) {
            const maintenanceDetail = await maintenanceDetailResponse.json();

            // Convertir fechas de string a objetos Date
            const startDate = new Date(maintenanceDetail.fechaInicio);
            const endDate = new Date(maintenanceDetail.fechaFin);

            // Formatear horas
            const startTime = startDate.getHours().toString().padStart(2, '0') + ':00';
            const endTime = endDate.getHours().toString().padStart(2, '0') + ':00';

            const formattedMaintenance = {
              id: maintenanceDetail.id,
              facilityId: facilityData.id,
              type: maintenanceDetail.tipo || 'preventivo',
              description: maintenanceDetail.descripcion,
              startDate: startDate,
              startTime: startTime,
              endDate: endDate,
              endTime: endTime,
              status: maintenanceDetail.estado,
              affectsAvailability: maintenanceDetail.afectaDisponibilidad
            };

            setMaintenance(formattedMaintenance);
            setIsEditing(true);
          } else {
            toast({
              title: "Mantenimiento no encontrado",
              description: "El mantenimiento que intentas editar no existe o no pertenece a esta instalación.",
              variant: "destructive",
            });
          }
        }

        // Obtener información sobre el último mantenimiento completado
        let lastMaintenance = "No disponible";
        if (maintenanceData && maintenanceData.tieneMantenimientoCompletado && maintenanceData.ultimoMantenimiento) {
          try {
            // Formatear la fecha del último mantenimiento
            const lastMaintenanceDate = new Date(maintenanceData.ultimoMantenimiento);

            // Verificar si la fecha es válida
            if (!isNaN(lastMaintenanceDate.getTime())) {
              lastMaintenance = lastMaintenanceDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            } else {
              console.error("Fecha de último mantenimiento inválida:", maintenanceData.ultimoMantenimiento);
              lastMaintenance = "No disponible";
            }
          } catch (error) {
            console.error("Error al procesar la fecha del último mantenimiento:", error);
            lastMaintenance = "No disponible";
          }
        }

        // Formatear los datos de la instalación para la interfaz
        const formattedFacility = {
          id: facilityData.id,
          name: facilityData.nombre,
          type: facilityData.tipo || 'otro',
          location: facilityData.ubicacion,
          status: enMantenimiento ? "mantenimiento" : "disponible",
          maintenanceStatus: maintenanceStatus,
          lastMaintenance: lastMaintenance,
          nextMaintenance: null
        };

        // Si la instalación tiene mantenimiento activo y no estamos en modo edición, mostrar mensaje
        if (tieneMantenimientoActivo && !maintenanceId) {
          toast({
            title: "No disponible para mantenimiento",
            description: "Esta instalación ya tiene un mantenimiento programado o en progreso.",
            variant: "destructive",
          });
          setFacility(null);
        } else {
          setFacility(formattedFacility);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de la instalación.",
          variant: "destructive",
        });
        setFacility(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [facilityId, maintenanceId, toast])

  // Variable para controlar si ya se ha enviado el formulario
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Función para manejar el envío del formulario desde el componente MantenimientoForm
  const handleFormSubmit = async (formData) => {
    // Evitar envíos múltiples
    if (isFormSubmitted || isSaving) {
      console.log("Formulario ya enviado o en proceso de guardado. Ignorando envío adicional.");
      return;
    }

    // Marcar el formulario como enviado
    setIsFormSubmitted(true);
    setIsSaving(true);

    try {
      // Crear fechas con la zona horaria local correcta
      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(formData.endDate);
      const [endHours, endMinutes] = formData.endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Obtener el offset de la zona horaria local en minutos
      const offsetInicio = startDateTime.getTimezoneOffset();
      const offsetFin = endDateTime.getTimezoneOffset();

      // Crear fechas ISO con ajuste de zona horaria
      // Esto asegura que la fecha y hora que se envía al backend sea exactamente la que el usuario seleccionó
      // sin ajustes de zona horaria
      const fechaInicioISO = new Date(startDateTime.getTime() - offsetInicio * 60000).toISOString();
      const fechaFinISO = new Date(endDateTime.getTime() - offsetFin * 60000).toISOString();

      // Imprimir información detallada para depuración
      console.log("=== INFORMACIÓN DE FECHAS Y HORAS ===");
      console.log("Fecha inicio seleccionada:", formData.startDate);
      console.log("Hora inicio seleccionada:", formData.startTime);
      console.log("Fecha inicio objeto Date:", startDateTime);
      console.log("Offset zona horaria (minutos):", offsetInicio);
      console.log("Fecha inicio ISO ajustada:", fechaInicioISO);
      console.log("Fecha fin seleccionada:", formData.endDate);
      console.log("Hora fin seleccionada:", formData.endTime);
      console.log("Fecha fin objeto Date:", endDateTime);
      console.log("Fecha fin ISO ajustada:", fechaFinISO);
      console.log("===================================");

      const requestData = {
        instalacionId: parseInt(facilityId),
        motivo: formData.description,
        tipo: formData.maintenanceType,
        descripcion: formData.description,
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO,
        afectaDisponibilidad: formData.affectsAvailability,
        registradoPorId: 1 // ID del usuario administrador
      };

      let response;

      if (isEditing && maintenance) {
        // Actualizar mantenimiento existente
        response = await fetch(`${API_BASE_URL}/mantenimientos/${maintenance.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
      } else {
        // Crear nuevo mantenimiento
        response = await fetch(`${API_BASE_URL}/mantenimientos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}: No se pudo ${isEditing ? 'actualizar' : 'guardar'} el mantenimiento`);
      }

      // Crear notificación en el sistema
      const notificationTitle = isEditing ? "Mantenimiento actualizado" : "Mantenimiento programado";
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      addNotification({
        title: notificationTitle,
        message: `Se ha ${isEditing ? 'actualizado' : 'programado'} un mantenimiento ${formData.maintenanceType} para ${facility.name} del ${format(startDate, "PPP", { locale: es })} al ${format(endDate, "PPP", { locale: es })}.`,
        type: "mantenimiento",
        category: "mantenimiento"
      });

      // Mostrar mensaje de éxito
      toast({
        title: isEditing ? "Mantenimiento actualizado" : "Mantenimiento guardado",
        description: isEditing
          ? "El mantenimiento ha sido actualizado exitosamente."
          : formData.affectsAvailability
            ? "El mantenimiento ha sido guardado exitosamente. Las reservas afectadas han sido canceladas."
            : "El mantenimiento ha sido guardado exitosamente sin afectar las reservas existentes.",
      });

      setIsSuccess(true);

      // Redireccionar a la página de mantenimientos después de mostrar el mensaje de éxito
      setTimeout(() => {
        router.push('/admin/instalaciones/mantenimiento');
      }, 2000);
    } catch (error) {
      console.error("Error al guardar mantenimiento:", error);
      toast({
        title: "Error",
        description: error.message || `No se pudo ${isEditing ? 'actualizar' : 'guardar'} el mantenimiento.`,
        variant: "destructive",
      });

      // Restablecer el estado para permitir un nuevo intento
      setIsFormSubmitted(false);
    } finally {
      setIsSaving(false);
    }
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
            <span className="text-sm">{isEditing ? "Mantenimiento actualizado correctamente" : "Mantenimiento guardado correctamente"}</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <MantenimientoForm
          facility={facility}
          maintenance={maintenance}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
          isSuccess={isSuccess}
        />
      </div>
    </div>
  )
}

