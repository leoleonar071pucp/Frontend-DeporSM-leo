"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import { useNotification } from "@/context/NotificationContext"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Calendar, Save, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Instalacion {
  id: number
  nombre: string
  ubicacion: string
  requiereMantenimiento?: boolean
}

interface FormData {
  facilityId: string
  maintenanceType: string
  description: string
  startDate: Date | null
  startTime: string
  endDate: Date | null
  endTime: string
  affectsAvailability: boolean
}

const dateToCalendarValue = (date: Date | null): Date | undefined => {
  return date || undefined;
}

export default function ProgramarMantenimientoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotification()
  const [installations, setInstallations] = useState<Instalacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formError, setFormError] = useState("")
  const [dateTimeError, setDateTimeError] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    facilityId: "",
    maintenanceType: "correctivo",
    description: "",
    startDate: null,
    startTime: "",
    endDate: null,
    endTime: "",
    affectsAvailability: true
  })

  useEffect(() => {
    console.log("Cargando instalaciones disponibles para mantenimiento");
    setIsLoading(true);
    setFormError("");

    // Función para cargar instalaciones disponibles para mantenimiento
    const cargarInstalacionesDisponibles = async () => {
      try {
        console.log("Intentando cargar instalaciones disponibles para mantenimiento");

        // Primero intentamos cargar las instalaciones disponibles
        let response;
        try {
          response = await fetch(`${API_BASE_URL}/mantenimientos/instalaciones-disponibles`, {
            credentials: 'include'
          });

          console.log("Respuesta de instalaciones disponibles:", response.status);

          // Si hay un error, pasamos directamente a cargar todas las instalaciones
          if (!response.ok) {
            console.warn("No se pudieron cargar las instalaciones disponibles. Cargando todas las instalaciones...");
            await cargarTodasInstalaciones();
            return;
          }

          const data = await response.json();
          console.log("Datos recibidos:", data);

          if (Array.isArray(data)) {
            console.log("Instalaciones disponibles cargadas correctamente. Total:", data.length);
            setInstallations(data);

            if (data.length === 0) {
              setFormError("No hay instalaciones disponibles para mantenimiento. Todas las instalaciones ya tienen mantenimientos programados o en progreso.");
            }
          } else {
            throw new Error("La respuesta no es un array");
          }
        } catch (error) {
          console.error("Error al procesar instalaciones disponibles:", error);
          // Si hay cualquier error, intentamos con el endpoint general
          await cargarTodasInstalaciones();
        }
      } catch (error) {
        console.error("Error general al cargar instalaciones:", error);
        setFormError("Error al cargar instalaciones. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    // Función para cargar todas las instalaciones como respaldo
    const cargarTodasInstalaciones = async () => {
      try {
        console.log("Intentando cargar todas las instalaciones como alternativa");
        const response = await fetch(`${API_BASE_URL}/instalaciones`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error al cargar todas las instalaciones: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          console.log("Todas las instalaciones cargadas. Total:", data.length);

          // Obtener información de mantenimiento para cada instalación
          const installationsWithMaintenance = await Promise.all(
            data.map(async (facility) => {
              try {
                // Verificar si la instalación requiere mantenimiento
                const requiresMaintenanceResponse = await fetch(`${API_BASE_URL}/observaciones/instalacion/${facility.id}/requiere-mantenimiento`);
                if (requiresMaintenanceResponse.ok) {
                  const requiresMaintenanceData = await requiresMaintenanceResponse.json();
                  return {
                    ...facility,
                    requiereMantenimiento: requiresMaintenanceData.requiereMantenimiento === true
                  };
                }
                return facility;
              } catch (error) {
                console.error(`Error al verificar mantenimiento para instalación ${facility.id}:`, error);
                return facility;
              }
            })
          );

          setInstallations(installationsWithMaintenance);
          setFormError("No se pudieron filtrar las instalaciones disponibles. Se muestran todas las instalaciones.");
        } else {
          console.error("La respuesta de todas las instalaciones no es un array:", data);
          setInstallations([]);
          setFormError("No se pudieron cargar las instalaciones. Por favor, intenta de nuevo más tarde.");
        }
      } catch (error) {
        console.error("Error al cargar todas las instalaciones:", error);
        setInstallations([]);
        setFormError("No se pudieron cargar las instalaciones. Por favor, intenta de nuevo más tarde.");
      }
    };

    // Iniciar la carga de instalaciones
    cargarInstalacionesDisponibles();
  }, [])

  useEffect(() => {
    validateDates(formData, false)
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Si es un campo de hora, validar el formato
    if (name === "startTime" || name === "endTime") {
      console.log(`Hora ${name} cambiada a: ${value}`);
    }
  }

  const handleSelectChange = (name: keyof FormData, value: string | boolean) => {
    console.log(`Cambiando ${name} a:`, value);
    setFormData(prev => ({ ...prev, [name]: value }))

    // Si es el ID de la instalación, imprimir información adicional
    if (name === "facilityId") {
      console.log("Instalación seleccionada ID:", value);
      const selectedInstallation = installations.find(inst => inst.id.toString() === value);
      console.log("Datos de la instalación:", selectedInstallation);
    }
  }

  const handleDateChange = (name: "startDate" | "endDate", value: Date | undefined) => {
    if (value) {
      // Verificar que la fecha no sea anterior a la fecha actual
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

      if (value < today) {
        toast({
          title: "Fecha inválida",
          description: "No puedes seleccionar una fecha anterior a la actual.",
          variant: "destructive",
        });
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value || null }))
  }

  const validateDates = (data: FormData, show = true) => {
    if (!data.startDate || !data.endDate || !data.startTime || !data.endTime) return false

    const start = new Date(data.startDate)
    const [sh, sm] = data.startTime.split(":").map(Number)
    start.setHours(sh, sm, 0, 0)

    const end = new Date(data.endDate)
    const [eh, em] = data.endTime.split(":").map(Number)
    end.setHours(eh, em, 0, 0)

    if (end <= start) {
      setDateTimeError(true)
      if (show) setFormError("La fecha/hora de fin debe ser posterior a la de inicio.")
      return false
    }

    setDateTimeError(false)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Validación más detallada
    if (!formData.facilityId) {
      setFormError("Selecciona una instalación.")
      return
    }

    if (!formData.description) {
      setFormError("Ingresa una descripción para el mantenimiento.")
      return
    }

    if (!validateDates(formData, true)) {
      // El mensaje de error ya se establece en validateDates
      return
    }

    // Validar que el ID de la instalación sea un número válido
    const facilityId = parseInt(formData.facilityId);
    if (isNaN(facilityId) || facilityId <= 0) {
      setFormError("ID de instalación inválido.")
      return
    }

    setIsSaving(true)

    // Crear fechas locales simples (Peru/Lima timezone)
    const startYear = formData.startDate!.getFullYear()
    const startMonth = formData.startDate!.getMonth()
    const startDay = formData.startDate!.getDate()
    const [sh, sm] = formData.startTime.split(":").map(Number)

    const endYear = formData.endDate!.getFullYear()
    const endMonth = formData.endDate!.getMonth()
    const endDay = formData.endDate!.getDate()
    const [eh, em] = formData.endTime.split(":").map(Number)

    // Crear fechas locales sin conversiones de zona horaria
    const fechaInicio = new Date(startYear, startMonth, startDay, sh, sm, 0, 0)
    const fechaFin = new Date(endYear, endMonth, endDay, eh, em, 0, 0)

    // Formatear como string local para enviar al backend
    const fechaInicioStr = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`
    const fechaFinStr = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`

    // Imprimir información para depuración
    console.log("=== INFORMACIÓN DE FECHAS Y HORAS ===");
    console.log("Fecha inicio seleccionada:", formData.startDate);
    console.log("Hora inicio seleccionada:", formData.startTime);
    console.log("Fecha inicio local:", fechaInicio);
    console.log("Fecha inicio string:", fechaInicioStr);
    console.log("Fecha fin seleccionada:", formData.endDate);
    console.log("Hora fin seleccionada:", formData.endTime);
    console.log("Fecha fin local:", fechaFin);
    console.log("Fecha fin string:", fechaFinStr);
    console.log("===================================");

    try {
      // Imprimir los datos que se van a enviar para depuración
      const requestData = {
        instalacionId: parseInt(formData.facilityId),
        motivo: formData.description,
        tipo: formData.maintenanceType,
        descripcion: formData.description,
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        afectaDisponibilidad: formData.affectsAvailability,
        registradoPorId: 1 // Usamos un ID fijo para pruebas
      };

      console.log("Enviando datos:", JSON.stringify(requestData, null, 2));

      const res = await fetch(`${API_BASE_URL}/mantenimientos`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestData)
      })

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);

        // Intentar parsear como JSON si es posible
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorText || "Error al guardar el mantenimiento");
        } catch (parseError) {
          // Si no es JSON, usar el texto tal cual
          throw new Error(errorText || "Error al guardar el mantenimiento");
        }
      }

      setIsSuccess(true)
      setFormError("")

      // Obtener el nombre de la instalación seleccionada
      const selectedInstallation = installations.find(inst => inst.id.toString() === formData.facilityId);
      const installationName = selectedInstallation ? selectedInstallation.nombre : "instalación";

      // Crear notificación en el sistema
      addNotification({
        title: "Mantenimiento programado",
        message: `Se ha programado un mantenimiento ${formData.maintenanceType} para ${installationName} del ${format(formData.startDate!, "PPP", { locale: es })} al ${format(formData.endDate!, "PPP", { locale: es })}.`,
        type: "mantenimiento",
        category: "mantenimiento"
      });

      // Mostrar mensaje de éxito con información sobre reservas canceladas
      toast({
        title: "Mantenimiento programado correctamente",
        description: formData.affectsAvailability
          ? "Las reservas afectadas han sido canceladas automáticamente y se ha notificado a los usuarios."
          : "El mantenimiento ha sido programado sin afectar las reservas existentes.",
        variant: "default",
      })

      setTimeout(() => router.push("/admin/instalaciones/mantenimiento"), 2000)
    } catch (err: any) {
      setFormError(err.message || "Error al guardar el mantenimiento.")
    } finally {
      setIsSaving(false)
    }
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
        <h1 className="text-2xl font-bold">Programar Mantenimiento</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalles del Mantenimiento</CardTitle>
            <CardDescription>Completa la información del nuevo mantenimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Instalación</Label>
              <Select value={formData.facilityId} onValueChange={(value) => handleSelectChange("facilityId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una instalación" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(installations) && installations.length > 0 ? (
                    installations.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.nombre} - {inst.ubicacion}
                        {inst.requiereMantenimiento ? " (Requiere Mantenimiento)" : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-disponible" disabled>
                      No hay instalaciones disponibles para mantenimiento
                    </SelectItem>
                  )}

                  {Array.isArray(installations) && installations.length === 0 && (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Todas las instalaciones ya tienen mantenimientos programados o en progreso.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de mantenimiento</Label>
              <Select value={formData.maintenanceType} onValueChange={(value) => handleSelectChange("maintenanceType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
            </div>

            {formError && (
              <Alert variant={formError.includes("No hay instalaciones disponibles") ? "warning" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Mantenimiento programado correctamente.
                  {formData.affectsAvailability
                    ? " Las reservas afectadas han sido canceladas automáticamente."
                    : " No se han afectado las reservas existentes."}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={dateToCalendarValue(formData.startDate)}
                      onSelect={(date) => handleDateChange("startDate", date)}
                      disabled={(date) => {
                        // Deshabilitar fechas anteriores a hoy
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <Label className="mt-2 block">Hora de inicio</Label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Fecha de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={dateToCalendarValue(formData.endDate)}
                      onSelect={(date) => handleDateChange("endDate", date)}
                      disabled={(date) => {
                        // Deshabilitar fechas anteriores a hoy
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <Label className="mt-2 block">Hora de fin</Label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.affectsAvailability} onCheckedChange={(checked) => handleSelectChange("affectsAvailability", !!checked)} />
              <Label>Este mantenimiento afecta la disponibilidad (cancelará automáticamente las reservas existentes)</Label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSaving || isSuccess || dateTimeError}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
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
