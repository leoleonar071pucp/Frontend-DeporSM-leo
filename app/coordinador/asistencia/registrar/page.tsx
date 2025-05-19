"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Clock, Calendar, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { ScheduledVisit } from "../types"
import { getCoordinatorSchedules, getScheduledVisit, recordAttendance, validateLocation } from "../services"
import { CoordinatorSchedule } from "../models"

// Mock para desarrollo cuando no hay contexto de autenticación
const useMockAuth = () => {
  return {
    user: { id: "4", nombre: "Coordinador Test", email: "coordinador@test.com", rol: { nombre: "coordinador" }},
    isAuthenticated: true,
    isLoading: false,
    isLoggingOut: false,
    login: () => {},
    logout: () => {},
    checkAuthStatus: async () => {},
    hasRole: () => true
  }
}

// Interfaces
interface Visit {
  id: number
  facilityId: number
  scheduleId?: number
  facilityName: string
  location: string
  date: string
  scheduledTime: string
  scheduledEndTime: string
  image?: string
}

interface FormData {
  status: "a-tiempo" | "tarde" | "no-asistio"
  arrivalTime: string
}

interface UserLocation {
  lat: number
  lng: number
}

// Función para validar si la visita corresponde al día de la semana asignado
const validateScheduledVisit = (visit: Visit, schedules: CoordinatorSchedule[]): boolean => {
  if (!visit || !schedules || schedules.length === 0) {
    return false;
  }
  
  const visitDate = new Date(visit.date);
  // Obtenemos el nombre del día en español
  const dayOfWeek = visitDate.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  
  return schedules.some(schedule => 
    schedule.instalacionId === visit.facilityId &&
    schedule.diaSemana.toLowerCase() === dayOfWeek &&
    schedule.horaInicio === visit.scheduledTime &&
    schedule.horaFin === visit.scheduledEndTime
  );
}

export default function RegistrarAsistenciaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitId = searchParams.get("id")
  const facilityId = searchParams.get("facilityId")
  
  // Usar contexto de autenticación si está disponible, o el mock si no lo está
  const authContext = useAuth() || useMockAuth()
  const { user } = authContext

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [visit, setVisit] = useState<Visit | null>(null)
  const [schedules, setSchedules] = useState<CoordinatorSchedule[]>([])
  const [formData, setFormData] = useState<FormData>({
    status: "" as any, // Inicialmente no tendrá estado hasta validar ubicación
    arrivalTime: "",
  })
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocationValid, setIsLocationValid] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Validar que tengamos tanto el ID de visita como el ID de instalación
        if (!visitId || !facilityId) {
          toast({
            title: "Error",
            description: "Parámetros de visita inválidos.",
            variant: "destructive",
          })
          router.push("/coordinador/asistencia/programadas")
          return
        }

        // Validar que tengamos un usuario autenticado
        if (!user || !user.id) {
          toast({
            title: "Error de autenticación",
            description: "Debes iniciar sesión para registrar asistencia.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const numVisitId = Number(visitId)
        const numFacilityId = Number(facilityId)
        
        // 1. Cargar los horarios del coordinador para la instalación específica
        const coordinatorSchedules = await getCoordinatorSchedules(user.id, numFacilityId)
        setSchedules(coordinatorSchedules)
        
        if (coordinatorSchedules.length === 0) {
          toast({
            title: "Advertencia",
            description: "No tienes horarios asignados para esta instalación.",
            variant: "default",
          })
        }
        
        // 2. Cargar los datos de la visita específica
        const foundVisit = await getScheduledVisit(numVisitId, numFacilityId)
        
        if (foundVisit) {
          setVisit(foundVisit as Visit)
          
          // Validar la correspondencia entre visita y horarios
          if (coordinatorSchedules.length > 0) {
            const isValidVisit = validateScheduledVisit(foundVisit as Visit, coordinatorSchedules)
            
            if (!isValidVisit) {
              toast({
                title: "Advertencia",
                description: "Esta visita podría no corresponder a un horario asignado válido.",
                variant: "default",
              })
            }
          }
        } else {
          toast({
            title: "Error",
            description: "No se encontró la visita especificada.",
            variant: "destructive",
          })
          router.push("/coordinador/asistencia/programadas")
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "Se produjo un error al cargar los datos necesarios.",
          variant: "destructive",
        })
        router.push("/coordinador/asistencia/programadas")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [visitId, facilityId, user, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkLocation = () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada por tu navegador.")
      setIsCheckingLocation(false)
      return
    }

    if (!visit) {
      setLocationError("No hay información de visita para validar.")
      setIsCheckingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userCoords: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userCoords)

        try {
          // Usar el servicio para validar la ubicación
          const isValid = await validateLocation(userCoords, visit.facilityId)
          
          setIsLocationValid(isValid)
          
          if (isValid) {
            // Actualizar automáticamente la hora de llegada
            const now = new Date()
            const hours = now.getHours().toString().padStart(2, "0")
            const minutes = now.getMinutes().toString().padStart(2, "0")
            const currentTime = `${hours}:${minutes}`
            
            // Calcular el estado de asistencia basado en horario
            const attendanceStatus = determineAttendanceStatus(
              visit.scheduledTime, 
              visit.scheduledEndTime, 
              currentTime
            )
            
            setFormData((prev) => ({
              ...prev,
              arrivalTime: currentTime,
              status: attendanceStatus
            }))
            
            // Mostrar mensaje según el estado calculado
            const statusMessages = {
              "a-tiempo": "Llegada registrada a tiempo.",
              "tarde": "Llegada registrada con retraso.",
              "no-asistio": "Llegada registrada después del horario programado."
            }
            
            toast({
              title: "Ubicación validada",
              description: statusMessages[attendanceStatus] || "Ubicación verificada correctamente.",
            })
          } else {
            toast({
              title: "Ubicación inválida",
              description: "Debes estar físicamente en la instalación para registrar tu asistencia.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error en la validación de ubicación:", error)
          toast({
            title: "Error de validación",
            description: "No se pudo validar tu ubicación. Por favor, intenta nuevamente.",
            variant: "destructive",
          })
          setIsLocationValid(false)
        } finally {
          setIsCheckingLocation(false)
        }
      },
      (error) => {
        let errorMessage = "Error desconocido al obtener la ubicación."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de geolocalización denegado."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "La información de ubicación no está disponible."
            break
          case error.TIMEOUT:
            errorMessage = "La solicitud de ubicación ha expirado."
            break
        }

        setLocationError(errorMessage)
        setIsCheckingLocation(false)

        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación de ubicación para modos de asistencia presencial
    if (!isLocationValid && formData.status !== "no-asistio") {
      toast({
        title: "Ubicación no validada",
        description: "Debes validar tu ubicación antes de registrar la asistencia.",
        variant: "destructive",
      })
      return
    }

    // Validación básica del formulario
    if (!formData.status) {
      toast({
        title: "Error",
        description: "Por favor selecciona un estado de asistencia.",
        variant: "destructive",
      })
      return
    }

    // Validación de hora de llegada para estados de asistencia presencial
    if (!formData.arrivalTime && formData.status !== "no-asistio") {
      toast({
        title: "Error",
        description: "Por favor ingresa la hora de llegada.",
        variant: "destructive",
      })
      return
    }

    if (!visit) {
      toast({
        title: "Error",
        description: "No hay visita válida para registrar asistencia.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    
    try {      // Construir el objeto de registro de asistencia
      const attendanceRecord = {
        id: 0, // El backend asignará el ID real
        visitId: visit.id, // ID de la visita programada (importante para tracking)
        facilityId: visit.facilityId,
        scheduleId: visit.scheduleId,
        facilityName: visit.facilityName,
        location: visit.location,
        date: visit.date,
        scheduledTime: visit.scheduledTime,
        scheduledEndTime: visit.scheduledEndTime,
        arrivalTime: formData.status === "no-asistio" ? null : formData.arrivalTime,
        status: formData.status,
        notes: "",
        departureTime: null,
      }      // Usar el servicio para registrar la asistencia
      await recordAttendance(attendanceRecord)
        // También guardar directamente el ID de la visita para asegurar su almacenamiento
      try {
        const registeredVisitsJson = localStorage.getItem('registeredVisits') || '[]';
        let registeredVisits = [];
        
        try {
          // Intentar parsear el contenido actual
          registeredVisits = JSON.parse(registeredVisitsJson);
          
          // Convertir formato antiguo (array de IDs) al nuevo formato (array de objetos)
          if (Array.isArray(registeredVisits) && (registeredVisits.length === 0 || typeof registeredVisits[0] === 'number')) {
            registeredVisits = registeredVisits.map(id => ({
              id,
              registeredDate: new Date().toISOString()
            }));
          }
        } catch (e) {
          console.error("Error parseando JSON de localStorage:", e);
          registeredVisits = [];
        }
        
        // Filtrar visitas expiradas (más de 2 días)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        registeredVisits = registeredVisits.filter(visit => {
          if (!visit.registeredDate) return false;
          const registeredDate = new Date(visit.registeredDate);
          return registeredDate > twoDaysAgo;
        });
        
        // Verificar si ya existe esta visita
        const existingVisitIndex = registeredVisits.findIndex(v => v.id === visit.id);
        
        // Añadir la nueva visita registrada o actualizar la existente
        if (visit.id && existingVisitIndex === -1) {
          registeredVisits.push({
            id: visit.id,
            registeredDate: new Date().toISOString()
          });
          console.log(`Guardando visita ID=${visit.id} como registrada (desde componente)`);
        } else if (visit.id) {
          // Actualizar la fecha de la visita existente
          registeredVisits[existingVisitIndex].registeredDate = new Date().toISOString();
          console.log(`Actualizando fecha de registro para visita ID=${visit.id}`);
        }
        
        // Guardar en localStorage
        localStorage.setItem('registeredVisits', JSON.stringify(registeredVisits));
      } catch (err) {
        console.error("Error al guardar en localStorage (componente):", err);
      }

      toast({
        title: "Asistencia registrada",
        description: "La asistencia ha sido registrada exitosamente.",
      })

      // Redireccionar a la lista de asistencias programadas
      router.push("/coordinador/asistencia/programadas")
    } catch (error) {
      console.error("Error al guardar asistencia:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al registrar la asistencia.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Determinar si la llegada es tarde (10 minutos o más después de la hora programada)
  const isLate = (scheduledTime: string, arrivalTime: string): boolean => {
    if (!scheduledTime || !arrivalTime) return false

    const [schedHours, schedMinutes] = scheduledTime.split(":").map(Number)
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number)

    // Convertir a minutos para comparar fácilmente
    const schedTotalMinutes = schedHours * 60 + schedMinutes
    const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes

    // Si la diferencia es de 10 minutos o más, se considera tarde
    return arrivalTotalMinutes - schedTotalMinutes >= 10
  }

  // Determinar si la llegada es posterior a la hora de finalización
  const isPastEndTime = (scheduledEndTime: string, arrivalTime: string): boolean => {
    if (!scheduledEndTime || !arrivalTime) return false

    const [endHours, endMinutes] = scheduledEndTime.split(":").map(Number)
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number)

    // Convertir a minutos para comparar fácilmente
    const endTotalMinutes = endHours * 60 + endMinutes
    const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes

    // Si la hora de llegada es igual o posterior a la hora de finalización, se considera no asistió
    return arrivalTotalMinutes >= endTotalMinutes
  }

  // Determinar automáticamente el estado de la asistencia
  const determineAttendanceStatus = (scheduledTime: string, scheduledEndTime: string, arrivalTime: string): FormData["status"] => {
    // Si es posterior a la hora de finalización, se considera no asistió
    if (isPastEndTime(scheduledEndTime, arrivalTime)) {
      return "no-asistio"
    }
    // Si es 10 minutos o más después de la hora de inicio, se considera tarde
    else if (isLate(scheduledTime, arrivalTime)) {
      return "tarde"
    }
    // En otro caso, se considera a tiempo
    else {
      return "a-tiempo"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/asistencia">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Visita no encontrada</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Visita no encontrada</h3>
            <p className="text-gray-500 mt-2">La visita que estás buscando no existe o ya ha sido registrada.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/coordinador/asistencia">Ver todas las asistencias</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/coordinador/asistencia">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Registrar Asistencia</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Visita</CardTitle>
                <CardDescription>Registra tu asistencia a la instalación asignada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{visit.facilityName}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {visit.location}
                    </p>
                  </div>
                  <img
                    src={visit.image || "/placeholder.svg"}
                    alt={visit.facilityName}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Horario programado</p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          // Crear fecha en zona horaria de Perú (GMT-5)
                          const dateObj = new Date(visit.date + 'T12:00:00Z');
                          dateObj.setHours(dateObj.getHours() - 5); // Ajustar a GMT-5 (Perú)
                          return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
                        })()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {visit.scheduledTime} - {visit.scheduledEndTime}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Estado de la visita</Label>
                  <div className="flex items-center gap-2">
                    {!formData.status ? (
                      <div className="flex items-center gap-2">
                        <Badge className="px-3 py-1 bg-gray-100 text-gray-800">Pendiente</Badge>
                        <span className="text-sm text-gray-500">
                          Valida tu ubicación para determinar el estado de la visita
                        </span>
                      </div>
                    ) : (
                      <>
                        <Badge className={`px-3 py-1 ${
                          formData.status === "a-tiempo" ? "bg-green-100 text-green-800" :
                          formData.status === "tarde" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {formData.status === "a-tiempo" ? "A tiempo" :
                          formData.status === "tarde" ? "Tarde" :
                          "No asistió"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formData.status === "a-tiempo" ? "Llegada dentro de los 9 minutos de tolerancia" :
                          formData.status === "tarde" ? "Llegada 10 minutos o más tarde de lo programado" :
                          "Llegada después de la hora de finalización"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {formData.status !== "no-asistio" && (
                  <div className="space-y-2">
                    {/* Comentado por ser redundante
                    <Label htmlFor="arrivalTime">
                      Hora de llegada <span className="text-red-500">*</span>
                    </Label>
                    */}

                    {/* Comentado: Ocultar input de tiempo
                    <Input
                      id="arrivalTime"
                      name="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Solo actualizamos automáticamente el estado si ya validamos la ubicación
                        if (visit && e.target.value && isLocationValid && formData.status) {
                          const newStatus = determineAttendanceStatus(visit.scheduledTime, visit.scheduledEndTime, e.target.value);
                          setFormData(prev => ({ ...prev, status: newStatus }));
                        }
                      }}
                      required
                    />
                    */}

                    {/* Comentado: Mensaje relacionado con el input de tiempo
                    {!isLocationValid && formData.arrivalTime && (
                      <p className="text-amber-600 text-sm">
                        Valida tu ubicación para determinar el estado de la visita
                      </p>
                    )}
                    */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Validación de Ubicación</CardTitle>
                <CardDescription>
                  {formData.status === "no-asistio"
                    ? "No es necesario validar la ubicación si no asististe"
                    : "Debes validar tu ubicación para confirmar que estás físicamente en la instalación"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.status !== "no-asistio" && (
                  <>
                    <div className="bg-primary-pale p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Importante</h3>
                      <p className="text-sm text-gray-700">
                        El sistema validará tu ubicación mediante geolocalización.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        className="bg-primary hover:bg-primary-light"
                        onClick={checkLocation}
                        disabled={isCheckingLocation}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {isCheckingLocation ? "Validando..." : "Validar Ubicación"}
                      </Button>
                    </div>

                    {locationError && (
                      <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
                        <p className="font-medium">Error:</p>
                        <p>{locationError}</p>
                      </div>
                    )}

                    {isLocationValid && (
                      <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
                        <p className="font-medium">Ubicación validada</p>
                        <p>Tu ubicación ha sido verificada correctamente.</p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Estado de la validación:</h3>
                      {isLocationValid ? (
                        <Badge className="bg-green-100 text-green-800">Ubicación validada</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente de validación</Badge>
                      )}
                    </div>
                  </>
                )}

                {formData.status === "no-asistio" && (
                  <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
                    <p className="font-medium">No es necesario validar la ubicación</p>
                    <p className="text-sm mt-1">
                      Se detectó que no asististe a esta visita.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light"
                  disabled={isSaving || (formData.status !== "no-asistio" && !isLocationValid)}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Asistencia
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>      </form>
    </div>
  )
}