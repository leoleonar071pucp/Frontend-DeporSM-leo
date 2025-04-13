"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  { id: 1, name: "Cancha de Fútbol (Grass)", location: "Parque Juan Pablo II" },
  { id: 2, name: "Piscina Municipal", location: "Complejo Deportivo Municipal" },
  { id: 3, name: "Gimnasio Municipal", location: "Complejo Deportivo Municipal" },
  { id: 4, name: "Pista de Atletismo", location: "Complejo Deportivo Municipal" },
  { id: 5, name: "Cancha de Tenis", location: "Parque Juan Pablo II" },
  { id: 6, name: "Cancha de Básquetbol", location: "Parque Juan Pablo II" },
  { id: 7, name: "Cancha de Voleibol", location: "Complejo Deportivo Municipal" },
  { id: 8, name: "Sala de Artes Marciales", location: "Gimnasio Municipal" },
]

// Días de la semana
const weekDays = [
  { id: "lunes", name: "Lunes" },
  { id: "martes", name: "Martes" },
  { id: "miercoles", name: "Miércoles" },
  { id: "jueves", name: "Jueves" },
  { id: "viernes", name: "Viernes" },
  { id: "sabado", name: "Sábado" },
  { id: "domingo", name: "Domingo" },
]

// Horarios disponibles
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
]

export default function NuevoCoordinadorPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [schedule, setSchedule] = useState(
    weekDays.map((day) => ({
      day: day.id,
      active: false,
      startTime: "08:00",
      endTime: "17:00",
    })),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId],
    )
  }

  const toggleDayActive = (dayId) => {
    setSchedule((prev) => prev.map((item) => (item.day === dayId ? { ...item, active: !item.active } : item)))
  }

  const updateScheduleTime = (dayId, field, value) => {
    setSchedule((prev) => prev.map((item) => (item.day === dayId ? { ...item, [field]: value } : item)))
  }

  const filteredFacilities = facilitiesData.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación básica
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    if (selectedFacilities.length === 0) {
      toast({
        title: "Error",
        description: "Debes asignar al menos una instalación al coordinador.",
        variant: "destructive",
      })
      return
    }

    const activeScheduleDays = schedule.filter((day) => day.active)
    if (activeScheduleDays.length === 0) {
      toast({
        title: "Error",
        description: "Debes asignar al menos un día de trabajo al coordinador.",
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para guardar el coordinador
    console.log("Guardando coordinador:", {
      ...formData,
      facilities: selectedFacilities,
      schedule: schedule.filter((day) => day.active),
    })

    toast({
      title: "Coordinador creado",
      description: "El coordinador ha sido creado exitosamente.",
    })

    // Redireccionar a la lista de coordinadores
    router.push("/admin/coordinadores")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/coordinadores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Coordinador</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Ingresa los datos del nuevo coordinador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nombre completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nombre completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Correo electrónico <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="987-654-321"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Contraseña <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horario de Trabajo</CardTitle>
                <CardDescription>Configura los días y horarios de trabajo del coordinador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.map((day) => {
                    const dayName = weekDays.find((d) => d.id === day.day)?.name
                    return (
                      <div key={day.day} className="flex items-center space-x-4 p-2 rounded-md border">
                        <div className="flex items-center space-x-2 w-32">
                          <Checkbox
                            id={`day-${day.day}`}
                            checked={day.active}
                            onCheckedChange={() => toggleDayActive(day.day)}
                          />
                          <Label htmlFor={`day-${day.day}`} className="font-medium">
                            {dayName}
                          </Label>
                        </div>

                        {day.active && (
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`start-${day.day}`} className="text-xs">
                                Hora inicio
                              </Label>
                              <Select
                                value={day.startTime}
                                onValueChange={(value) => updateScheduleTime(day.day, "startTime", value)}
                              >
                                <SelectTrigger id={`start-${day.day}`}>
                                  <SelectValue placeholder="Hora inicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={`start-${day.day}-${time}`} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`end-${day.day}`} className="text-xs">
                                Hora fin
                              </Label>
                              <Select
                                value={day.endTime}
                                onValueChange={(value) => updateScheduleTime(day.day, "endTime", value)}
                              >
                                <SelectTrigger id={`end-${day.day}`}>
                                  <SelectValue placeholder="Hora fin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={`end-${day.day}-${time}`} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instalaciones Asignadas</CardTitle>
                <CardDescription>Selecciona las instalaciones que supervisará este coordinador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar instalación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                  {filteredFacilities.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFacilities.map((facility) => (
                        <div key={facility.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`facility-${facility.id}`}
                            checked={selectedFacilities.includes(facility.id)}
                            onCheckedChange={() => toggleFacility(facility.id)}
                          />
                          <Label htmlFor={`facility-${facility.id}`} className="flex-1 cursor-pointer text-sm">
                            {facility.name}
                            <span className="block text-xs text-gray-500">{facility.location}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No se encontraron instalaciones</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Instalaciones seleccionadas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacilities.length > 0 ? (
                      selectedFacilities.map((facilityId) => {
                        const facility = facilitiesData.find((f) => f.id === facilityId)
                        return (
                          <Badge key={facilityId} variant="secondary" className="flex items-center gap-1">
                            {facility?.name}
                            <button
                              type="button"
                              onClick={() => toggleFacility(facilityId)}
                              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Eliminar</span>
                            </button>
                          </Badge>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500">Ninguna instalación seleccionada</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/coordinadores">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-light">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Coordinador
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

