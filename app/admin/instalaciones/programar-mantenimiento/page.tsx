"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
    fetch("https://deporsm-apiwith-1035693188565.us-central1.run.app/api/instalaciones")
      .then(res => res.json())
      .then(data => {
        setInstallations(data)
        setIsLoading(false)
      })
      .catch(() => setFormError("No se pudieron cargar las instalaciones."))
  }, [])

  useEffect(() => {
    validateDates(formData, false)
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: "startDate" | "endDate", value: Date | undefined) => {
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

    if (!formData.facilityId || !formData.description || !validateDates(formData, true)) {
      setFormError("Completa todos los campos requeridos.")
      return
    }

    setIsSaving(true)

    const fechaInicio = new Date(formData.startDate!)
    const [sh, sm] = formData.startTime.split(":").map(Number)
    fechaInicio.setHours(sh, sm, 0, 0)

    const fechaFin = new Date(formData.endDate!)
    const [eh, em] = formData.endTime.split(":").map(Number)
    fechaFin.setHours(eh, em, 0, 0)

    try {
      const res = await fetch("https://deporsm-apiwith-1035693188565.us-central1.run.app/api/mantenimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instalacion: { id: parseInt(formData.facilityId) },
          motivo: formData.maintenanceType,
          descripcion: formData.description,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
          registradoPor: { id: 1 } // Cambiar según tu sistema de autenticación
        })
      })

      if (!res.ok) throw new Error("Error al guardar el mantenimiento")

      setIsSuccess(true)
      setTimeout(() => router.push("/admin/instalaciones/mantenimiento"), 1500)
    } catch (err) {
      setFormError("Error al guardar el mantenimiento.")
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
                  {installations.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>
                      {inst.nombre} - {inst.ubicacion}
                    </SelectItem>
                  ))}
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
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
                    <CalendarComponent mode="single" selected={dateToCalendarValue(formData.startDate)} onSelect={(date) => handleDateChange("startDate", date)} />
                  </PopoverContent>
                </Popover>
                <Label className="mt-2 block">Hora de inicio</Label>
                <Input name="startTime" value={formData.startTime} onChange={handleInputChange} placeholder="HH:mm" />
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
                    <CalendarComponent mode="single" selected={dateToCalendarValue(formData.endDate)} onSelect={(date) => handleDateChange("endDate", date)} />
                  </PopoverContent>
                </Popover>
                <Label className="mt-2 block">Hora de fin</Label>
                <Input name="endTime" value={formData.endTime} onChange={handleInputChange} placeholder="HH:mm" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.affectsAvailability} onCheckedChange={(checked) => handleSelectChange("affectsAvailability", !!checked)} />
              <Label>Este mantenimiento afecta la disponibilidad</Label>
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
  