"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function ProgramarMantenimientoPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [availableFacilities, setAvailableFacilities] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    facilityId: "",
    maintenanceType: "preventivo",
    description: "",
    startDate: null,
    startTime: "",
    endDate: null,
    endTime: "",
    affectsAvailability: true
  })
  
  // Estado para controlar errores de validación de fechas
  const [dateTimeError, setDateTimeError] = useState(false)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Filtrar instalaciones disponibles para mantenimiento
      // (las que no tienen mantenimiento programado o en progreso)
      const facilities = facilitiesDB.filter(
        (f) => f.maintenanceStatus === 'none' || f.maintenanceStatus === 'required'
      )
      
      setAvailableFacilities(facilities)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Efecto para validar fechas y horas cuando cambian
  useEffect(() => {
    validateDates(formData, false)
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Función para validar fechas y horas
  const validateDates = (data, showToast = true) => {
    const startDateTime = new Date(data.startDate)
    const [startHours, startMinutes] = data.startTime.split(":").map(Number)
    startDateTime.setHours(startHours)
    startDateTime.setMinutes(startMinutes)
    startDateTime.setSeconds(0)
    startDateTime.setMilliseconds(0)

    const endDateTime = new Date(data.endDate)
    const [endHours, endMinutes] = data.endTime.split(":").map(Number)
    endDateTime.setHours(endHours)
    endDateTime.setMinutes(endMinutes)
    endDateTime.setSeconds(0)
    endDateTime.setMilliseconds(0)

    // Verificar si la fecha/hora de finalización es posterior a la de inicio
    if (endDateTime <= startDateTime) {
      setDateTimeError(true)
      if (showToast) {
        toast({
          title: "Error en fechas",
          description: "La fecha y hora de finalización debe ser posterior a la fecha y hora de inicio.",
          variant: "destructive",
        })
      }
      return false
    }
    
    setDateTimeError(false)
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación básica
    if (!formData.facilityId) {
      toast({
        title: "Error",
        description: "Por favor selecciona una instalación.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description) {
      toast({
        title: "Error",
        description: "Por favor ingresa una descripción del mantenimiento.",
        variant: "destructive",
      })
      return
    }

    // Validación de rango de fecha y hora
    if (!validateDates(formData, true)) {
      return
    }

    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)

      // Mostrar mensaje de éxito
      toast({
        title: "Mantenimiento programado",
        description: "El mantenimiento ha sido programado correctamente.",
      })

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push("/admin/instalaciones/mantenimiento")
      }, 2000)
    }, 1500)
  }

  const getSelectedFacility = () => {
    if (!formData.facilityId) return null
    return availableFacilities.find(f => f.id.toString() === formData.facilityId)
  }

  const selectedFacility = getSelectedFacility()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/instalaciones/mantenimiento">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Programar Mantenimiento</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalles del Mantenimiento</CardTitle>
            <CardDescription>Ingresa la información del mantenimiento a programar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de instalación */}
            <div className="space-y-2">
              <Label htmlFor="facilityId">Instalación</Label>
              <Select 
                value={formData.facilityId} 
                onValueChange={(value) => handleSelectChange("facilityId", value)}
              >
                <SelectTrigger id="facilityId">
                  <SelectValue placeholder="Selecciona una instalación" />
                </SelectTrigger>
                <SelectContent>
                  {availableFacilities.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay instalaciones disponibles para mantenimiento
                    </SelectItem>
                  ) : (
                    availableFacilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id.toString()}>
                        {facility.name} - {facility.location}
                        {facility.maintenanceStatus === "required" && " (Requiere mantenimiento)"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedFacility && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedFacility.name}</h3>
                    <p className="text-sm text-gray-500">{selectedFacility.location}</p>
                  </div>
                  <div>
                    {selectedFacility.maintenanceStatus === "required" && (
                      <Badge className="bg-red-100 text-red-800">Requiere mantenimiento</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Tipo de mantenimiento */}
            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Tipo de Mantenimiento</Label>
              <Select 
                value={formData.maintenanceType} 
                onValueChange={(value) => handleSelectChange("maintenanceType", value)}
              >
                <SelectTrigger id="maintenanceType">
                  <SelectValue placeholder="Selecciona el tipo de mantenimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el mantenimiento a realizar"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Alerta de error de fechas */}
            {dateTimeError && (
              <Alert variant="destructive" className="bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  La fecha y hora de finalización debe ser posterior a la fecha y hora de inicio.
                </AlertDescription>
              </Alert>
            )}

            {/* Fechas y horas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal w-full"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleDateChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de inicio</Label>
                    <Select
                      value={formData.startTime}
                      onValueChange={(value) => handleSelectChange("startTime", value)}
                    >
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Selecciona la hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha de finalización</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`justify-start text-left font-normal w-full ${dateTimeError ? "border-red-500" : ""}`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de finalización</Label>
                    <Select
                      value={formData.endTime}
                      onValueChange={(value) => handleSelectChange("endTime", value)}
                    >
                      <SelectTrigger id="endTime" className={dateTimeError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona la hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Afecta disponibilidad */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="affectsAvailability"
                checked={formData.affectsAvailability}
                onCheckedChange={(checked) => handleSelectChange("affectsAvailability", checked)}
              />
              <Label htmlFor="affectsAvailability" className="font-normal">
                Este mantenimiento afecta la disponibilidad de la instalación
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/instalaciones/mantenimiento">Cancelar</Link>
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-light"
              disabled={isSaving || isSuccess || dateTimeError}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Guardado
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}