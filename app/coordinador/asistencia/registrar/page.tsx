"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Save, Loader2, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo para las visitas programadas
const scheduledVisits = [
  {
    id: 101,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-06",
    scheduledTime: "14:00",
    image: "/placeholder.svg?height=400&width=800",
  },
  {
    id: 102,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-06",
    scheduledTime: "16:30",
    image: "/placeholder.svg?height=400&width=800",
  },
  {
    id: 103,
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-07",
    scheduledTime: "09:00",
    image: "/placeholder.svg?height=400&width=800",
  },
]

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    image: "/placeholder.svg?height=400&width=800",
    scheduledTime: "14:00",
  },
  {
    id: 2,
    name: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    image: "/placeholder.svg?height=400&width=800",
    scheduledTime: "16:30",
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    location: "Complejo Deportivo Municipal",
    image: "/placeholder.svg?height=400&width=800",
    scheduledTime: "09:00",
  },
  {
    id: 4,
    name: "Pista de Atletismo",
    location: "Complejo Deportivo Municipal",
    image: "/placeholder.svg?height=400&width=800",
    scheduledTime: "11:30",
  },
  {
    id: 5,
    name: "Cancha de Tenis",
    location: "Parque Juan Pablo II",
    image: "/placeholder.svg?height=400&width=800",
    scheduledTime: "15:00",
  },
]

export default function RegistrarAsistenciaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitId = searchParams.get("id")
  const facilityId = searchParams.get("facilityId")

  const [isLoading, setIsLoading] = useState(true)
  const [visit, setVisit] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLocationValid, setIsLocationValid] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    status: "a-tiempo",
    arrivalTime: "",
    notes: "",
  })

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Si tenemos un ID de visita, buscamos en las visitas programadas
      if (visitId) {
        const foundVisit = scheduledVisits.find((v) => v.id === Number(visitId))
        if (foundVisit) {
          setVisit(foundVisit)
        }
      }
      // Si tenemos un ID de instalación, creamos una visita simulada
      else if (facilityId) {
        const facility = facilitiesData.find((f) => f.id === Number(facilityId))
        if (facility) {
          const simulatedVisit = {
            id: 1000 + Number(facilityId),
            facilityId: Number(facilityId),
            facilityName: facility.name,
            location: facility.location,
            date: format(new Date(), "yyyy-MM-dd"),
            scheduledTime: facility.scheduledTime,
            image: facility.image,
          }
          setVisit(simulatedVisit)
        }
      }

      // Establecer la hora actual como hora de llegada por defecto
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setFormData((prev) => ({
        ...prev,
        arrivalTime: `${hours}:${minutes}`,
      }))

      setIsLoading(false)
    }

    loadData()
  }, [visitId, facilityId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userCoords)

        // Simulación de validación de ubicación
        // En un caso real, se calcularía la distancia entre las coordenadas
        const isValid = Math.random() > 0.3 // 70% de probabilidad de éxito para la demo

        setIsLocationValid(isValid)
        setIsCheckingLocation(false)

        // Actualizar automáticamente la hora de llegada
        const now = new Date()
        const hours = now.getHours().toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        const currentTime = `${hours}:${minutes}`

        // Determinar automáticamente el estado de la asistencia
        let status = "a-tiempo"
        if (visit && visit.scheduledTime) {
          if (isLate(visit.scheduledTime, currentTime)) {
            status = "tarde"
          }
        }

        setFormData((prev) => ({
          ...prev,
          arrivalTime: currentTime,
          status: status,
        }))

        if (isValid) {
          toast({
            title: "Ubicación validada",
            description: "Tu ubicación ha sido validada correctamente.",
          })
        } else {
          toast({
            title: "Ubicación no válida",
            description: "Debes estar físicamente en la instalación para registrar tu asistencia.",
            variant: "destructive",
          })
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!isLocationValid && formData.status !== "no-asistio") {
      toast({
        title: "Ubicación no validada",
        description: "Debes validar tu ubicación antes de registrar la asistencia.",
        variant: "destructive",
      })
      return
    }

    // Validación básica
    if (!formData.arrivalTime && formData.status !== "no-asistio") {
      toast({
        title: "Error",
        description: "Por favor ingresa la hora de llegada.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      // En un caso real, aquí se haría la llamada a la API para registrar la asistencia
      console.log("Registrando asistencia:", { ...formData, visitId: visit.id })

      toast({
        title: "Asistencia registrada",
        description: "La asistencia ha sido registrada exitosamente.",
      })

      setIsSaving(false)

      // Redireccionar a la lista de asistencias
      router.push("/coordinador/asistencia")
    }, 1500)
  }

  // Determinar si la llegada es a tiempo o tarde
  const isLate = (scheduledTime, arrivalTime) => {
    if (!scheduledTime || !arrivalTime) return false

    const [schedHours, schedMinutes] = scheduledTime.split(":").map(Number)
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number)

    // Convertir a minutos para comparar fácilmente
    const schedTotalMinutes = schedHours * 60 + schedMinutes
    const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes

    // Si la diferencia es mayor a 20 minutos, se considera tarde
    return arrivalTotalMinutes - schedTotalMinutes > 20
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
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Fecha programada</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(visit.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Hora programada</p>
                      <p className="text-sm text-gray-600">{visit.scheduledTime}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="status">Estado de asistencia</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a-tiempo">A tiempo</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="no-asistio">No asistí</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status !== "no-asistio" && (
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">
                      Hora de llegada <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="arrivalTime"
                      name="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      required={formData.status !== "no-asistio"}
                    />
                    {formData.arrivalTime &&
                      formData.status === "a-tiempo" &&
                      isLate(visit.scheduledTime, formData.arrivalTime) && (
                        <p className="text-yellow-600 text-sm">
                          La hora registrada indica un retraso mayor a 20 minutos. Considera cambiar el estado a
                          "Tarde".
                        </p>
                      )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Añade notas o comentarios sobre la visita"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
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
                        Para registrar tu asistencia, debes estar físicamente en la instalación. El sistema validará tu
                        ubicación mediante geolocalización.
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
                      Has seleccionado que no asististe a esta visita. No es necesario validar tu ubicación. Por favor,
                      proporciona una nota explicando el motivo de la inasistencia.
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
        </div>
      </form>
    </div>
  )
}

