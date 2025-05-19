"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
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
import { Calendar } from "lucide-react"

interface Facility {
  id: number
  name: string
  type: string
  location: string
  status: string
  maintenanceStatus: string
  lastMaintenance: string
  nextMaintenance: string | null
}

interface Maintenance {
  id: number
  facilityId: number
  type: string
  description: string
  startDate: Date
  startTime: string
  endDate: Date
  endTime: string
  status: string
  affectsAvailability: boolean
}

interface FormData {
  maintenanceType: string
  description: string
  startDate: Date
  startTime: string
  endDate: Date
  endTime: string
  affectsAvailability: boolean
}

interface MantenimientoFormProps {
  facility: Facility
  maintenance: Maintenance | null
  isEditing: boolean
  onSubmit: (formData: FormData) => void
  isSaving: boolean
  isSuccess: boolean
}

export default function MantenimientoForm({
  facility,
  maintenance,
  isEditing,
  onSubmit,
  isSaving,
  isSuccess
}: MantenimientoFormProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    maintenanceType: maintenance?.type || "preventivo",
    description: maintenance?.description || "",
    startDate: maintenance?.startDate || null,
    startTime: maintenance?.startTime || "",
    endDate: maintenance?.endDate || null,
    endTime: maintenance?.endTime || "",
    affectsAvailability: maintenance?.affectsAvailability ?? true
  })

  // Estado para controlar errores de validación de fechas
  const [dateTimeError, setDateTimeError] = useState(false)

  useEffect(() => {
    // Si estamos editando, cargar los datos del mantenimiento
    if (maintenance) {
      setFormData({
        maintenanceType: maintenance.type,
        description: maintenance.description,
        startDate: maintenance.startDate,
        startTime: maintenance.startTime,
        endDate: maintenance.endDate,
        endTime: maintenance.endTime,
        affectsAvailability: maintenance.affectsAvailability
      })
    }
  }, [maintenance])

  // Efecto para validar fechas y horas cuando cambian
  useEffect(() => {
    validateDates(formData, false)
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: Date | undefined) => {
    if (value) {
      // Verificar que la fecha no sea anterior a la fecha actual
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

      if (value < today && !isEditing) {
        toast({
          title: "Fecha inválida",
          description: "No puedes seleccionar una fecha anterior a la actual.",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, affectsAvailability: checked }))
  }

  // Función para validar fechas y horas
  const validateDates = (data: FormData, showToast = true) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Si no estamos en modo edición, validar si la instalación puede recibir mantenimiento
    if (!isEditing && facility.maintenanceStatus !== 'required' && facility.maintenanceStatus !== 'none') {
      toast({
        title: "No disponible para mantenimiento",
        description: "Solo se puede programar mantenimiento en instalaciones que lo requieran o no tengan mantenimiento programado.",
        variant: "destructive",
      })
      return
    }

    // Validación básica
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

    onSubmit(formData)
  }

  const getMaintenanceStatusBadge = (status: string) => {
    switch (status) {
      case "none":
        return null
      case "required":
        return <Badge className="bg-red-100 text-red-800">Requiere mantenimiento</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Detalles del Mantenimiento</CardTitle>
          <CardDescription>
            {isEditing ? `Editar mantenimiento para ${facility.name}` : `Completa la información del nuevo mantenimiento`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{facility.name}</h3>
              <p className="text-gray-500">{facility.location}</p>
            </div>
            <div>{getMaintenanceStatusBadge(facility.maintenanceStatus)}</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="maintenanceType">Tipo de mantenimiento</Label>
            <Select
              value={formData.maintenanceType}
              onValueChange={(value) => handleSelectChange("maintenanceType", value)}
            >
              <SelectTrigger id="maintenanceType">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
                <SelectItem value="mejora">Mejora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el mantenimiento a realizar"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                      locale={es}
                      disabled={(date) => {
                        // Deshabilitar fechas anteriores a hoy
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today && !isEditing;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange(e as any)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha de finalización</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                      locale={es}
                      disabled={(date) => {
                        // Deshabilitar fechas anteriores a hoy
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today && !isEditing;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange(e as any)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="affectsAvailability"
              checked={formData.affectsAvailability}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="affectsAvailability" className="font-normal">
              Este mantenimiento afecta la disponibilidad (cancelará automáticamente las reservas existentes)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div></div>
          <Button type="submit" disabled={isSaving || dateTimeError}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}