"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X, AlertTriangle, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  asignarInstalacionesYHorarios,
  obtenerAsignacionesCoordinador,
  obtenerDetalleCoordinador,
  type CoordinadorAsignacionDTO,
  type HorarioCoordinadorRequestDTO
} from "@/lib/api-coordinadores"
import { API_BASE_URL } from "@/lib/config"



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

interface Schedule {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
}

interface FacilitySchedule {
  facilityId: number;
  schedules: Schedule[];
}

interface Coordinator {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  assignedFacilities: number[];
  facilitySchedules: Record<number, FacilitySchedule>;
}

export default function EditarCoordinadorPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null)
  const [instalacionesData, setInstalacionesData] = useState<any[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Estado para manejar los horarios por instalación
  const [facilitySchedules, setFacilitySchedules] = useState<Record<number, FacilitySchedule>>({})
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState("lunes")

  // Estado para manejar los horarios temporales que se están agregando
  const [tempSchedule, setTempSchedule] = useState({
    startTime: "08:00",
    endTime: "17:00"
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id || Array.isArray(id)) return

      try {
        setIsLoading(true)

        // Cargar detalles del coordinador
        const coordinadorData = await obtenerDetalleCoordinador(Number(id))

        // Cargar instalaciones disponibles
        const responseInstalaciones = await fetch(`${API_BASE_URL}/instalaciones`)
        if (responseInstalaciones.ok) {
          const instalaciones = await responseInstalaciones.json()
          setInstalacionesData(instalaciones)
        }

        // Cargar asignaciones del coordinador
        let asignaciones = []
        try {
          console.log("Cargando asignaciones para coordinador ID:", id)
          asignaciones = await obtenerAsignacionesCoordinador(Number(id))
          console.log("Asignaciones recibidas del backend:", asignaciones)
        } catch (error) {
          console.warn("No se pudieron cargar las asignaciones del coordinador:", error)
          // Continuar con asignaciones vacías
        }

        // Procesar los datos del coordinador
        const coordinator: Coordinator = {
          id: coordinadorData.id,
          nombre: coordinadorData.nombre,
          email: coordinadorData.email,
          telefono: coordinadorData.telefono,
          activo: coordinadorData.activo,
          assignedFacilities: Array.isArray(asignaciones)
            ? asignaciones
                .filter((a: any) => a && a.instalacion && a.instalacion.id)
                .map((a: any) => a.instalacion.id)
            : [],
          facilitySchedules: {}
        }

        // Procesar horarios por instalación
        const schedulesByFacility: Record<number, FacilitySchedule> = {}

        console.log("Procesando asignaciones:", asignaciones);

        // Validar que asignaciones existe y es un array
        if (Array.isArray(asignaciones)) {
          asignaciones.forEach((asignacion: any) => {
            console.log("Procesando asignación:", asignacion);

            // Validar que la asignación tiene instalación
            if (asignacion && asignacion.instalacion && asignacion.instalacion.id) {
              const facilityId = asignacion.instalacion.id

              console.log(`Procesando instalación ID: ${facilityId}`);
              console.log("Horarios de esta instalación:", asignacion.horarios);

              schedulesByFacility[facilityId] = {
                facilityId: facilityId,
                schedules: asignacion.horarios?.map((h: any, index: number) => {
                  console.log("Procesando horario:", h);
                  return {
                    id: index + 1,
                    day: h.diaSemana,
                    startTime: h.horaInicio.substring(0, 5), // HH:mm format
                    endTime: h.horaFin.substring(0, 5)
                  };
                }) || []
              }

              console.log(`Horarios procesados para instalación ${facilityId}:`, schedulesByFacility[facilityId]);
            }
          })
        }

        coordinator.facilitySchedules = schedulesByFacility
        setCoordinator(coordinator)
        setSelectedFacilities(coordinator.assignedFacilities)
        setFacilitySchedules(schedulesByFacility)

        // Debug: Verificar qué se está cargando
        console.log("Coordinador cargado:", coordinator)
        console.log("Instalaciones asignadas:", coordinator.assignedFacilities)
        console.log("Horarios por instalación:", schedulesByFacility)

        // Seleccionar la primera instalación por defecto si hay alguna
        if (coordinator.assignedFacilities.length > 0) {
          setSelectedFacility(coordinator.assignedFacilities[0])
        }

      } catch (error) {
        console.error("Error al cargar datos del coordinador:", error)
        toast({
          title: "Error",
          description: "Error al cargar los datos del coordinador",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, toast])

  const toggleFacility = (facilityId: number) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId],
    )
  }

  // Efecto para inicializar los horarios cuando se seleccionan instalaciones
  useEffect(() => {
    // Solo ejecutar si no estamos en el proceso de carga inicial
    if (isLoading) return

    const newFacilitySchedules: Record<number, FacilitySchedule> = {}

    selectedFacilities.forEach(facilityId => {
      if (!facilitySchedules[facilityId]) {
        newFacilitySchedules[facilityId] = {
          facilityId,
          schedules: []
        }
      }
    })

    // Solo agregar nuevas instalaciones, no sobrescribir las existentes
    if (Object.keys(newFacilitySchedules).length > 0) {
      setFacilitySchedules(prev => ({
        ...prev,
        ...newFacilitySchedules
      }))
    }

    // Limpiar horarios de instalaciones que ya no están seleccionadas
    setFacilitySchedules(prev => {
      const updatedSchedules: Record<number, FacilitySchedule> = {}
      Object.keys(prev).forEach(id => {
        if (selectedFacilities.includes(Number(id))) {
          updatedSchedules[Number(id)] = prev[Number(id)]
        }
      })
      return updatedSchedules
    })

    // Seleccionar la primera instalación por defecto si hay alguna
    if (selectedFacilities.length > 0 && !selectedFacility) {
      setSelectedFacility(selectedFacilities[0])
    } else if (selectedFacilities.length === 0) {
      setSelectedFacility(null)
    } else if (selectedFacility && !selectedFacilities.includes(selectedFacility)) {
      setSelectedFacility(selectedFacilities[0])
    }
  }, [selectedFacilities, isLoading])

  const handleFacilitySelect = (facilityId: number) => {
    setSelectedFacility(facilityId)
  }

  const handleDaySelect = (day: string) => {
    setSelectedDay(day)
  }

  const updateTempSchedule = (field: string, value: string) => {
    setTempSchedule(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para detectar conflictos de horarios
  const detectScheduleConflicts = () => {
    if (!selectedFacility || !selectedDay) return { hasConflict: false, conflicts: [] }

    const startHour = parseInt(tempSchedule.startTime.split(':')[0])
    const endHour = parseInt(tempSchedule.endTime.split(':')[0])

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (startHour >= endHour) {
      return {
        hasConflict: true,
        conflicts: [{
          type: 'invalid_time',
          message: 'La hora de inicio debe ser anterior a la hora de fin.'
        }]
      }
    }

    const conflicts: Array<{
      type: 'same_facility' | 'other_facility'
      facilityId: number
      facilityName: string
      day: string
      startTime: string
      endTime: string
      message: string
    }> = []

    // Verificar conflictos en la misma instalación
    const existingSchedules = facilitySchedules[selectedFacility]?.schedules || []
    const sameDaySchedules = existingSchedules.filter(s => s.day === selectedDay)

    sameDaySchedules.forEach(schedule => {
      const existingStart = parseInt(schedule.startTime.split(':')[0])
      const existingEnd = parseInt(schedule.endTime.split(':')[0])

      // Verificar solapamiento
      if (startHour < existingEnd && endHour > existingStart) {
        const facilityName = instalacionesData.find(f => f.id === selectedFacility)?.nombre || `ID: ${selectedFacility}`
        conflicts.push({
          type: 'same_facility',
          facilityId: selectedFacility,
          facilityName,
          day: selectedDay,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          message: `Conflicto en ${facilityName}: ${weekDays.find(d => d.id === selectedDay)?.name} de ${schedule.startTime} a ${schedule.endTime}`
        })
      }
    })

    // Verificar conflictos con otras instalaciones asignadas al mismo coordinador
    for (const facilityId of selectedFacilities) {
      // Saltamos la instalación actual que ya verificamos
      if (facilityId === selectedFacility) continue

      const otherFacilitySchedules = facilitySchedules[facilityId]?.schedules || []
      const otherSameDaySchedules = otherFacilitySchedules.filter(s => s.day === selectedDay)

      otherSameDaySchedules.forEach(schedule => {
        const existingStart = parseInt(schedule.startTime.split(':')[0])
        const existingEnd = parseInt(schedule.endTime.split(':')[0])

        // Verificar solapamiento
        if (startHour < existingEnd && endHour > existingStart) {
          const facilityName = instalacionesData.find(f => f.id === facilityId)?.nombre || `ID: ${facilityId}`
          conflicts.push({
            type: 'other_facility',
            facilityId,
            facilityName,
            day: selectedDay,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            message: `Conflicto con ${facilityName}: ${weekDays.find(d => d.id === selectedDay)?.name} de ${schedule.startTime} a ${schedule.endTime}`
          })
        }
      })
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  const addScheduleToFacility = () => {
    if (!selectedFacility || !selectedDay) return

    // Validar que la hora de inicio sea anterior a la hora de fin
    const startHour = parseInt(tempSchedule.startTime.split(':')[0])
    const endHour = parseInt(tempSchedule.endTime.split(':')[0])

    if (startHour >= endHour) {
      toast({
        title: "Error de horario",
        description: "La hora de inicio debe ser anterior a la hora de fin.",
        variant: "destructive",
      })
      return
    }

    // Verificar si hay solapamiento con otros horarios del mismo día en TODAS las instalaciones
    let hasOverlap = false
    let overlapFacilityName = ""

    // Primero verificamos solapamiento en la misma instalación
    const existingSchedules = facilitySchedules[selectedFacility]?.schedules || []
    const sameDaySchedules = existingSchedules.filter(s => s.day === selectedDay)

    hasOverlap = sameDaySchedules.some(schedule => {
      const existingStart = parseInt(schedule.startTime.split(':')[0])
      const existingEnd = parseInt(schedule.endTime.split(':')[0])

      // Verificar solapamiento
      return (startHour < existingEnd && endHour > existingStart)
    })

    if (hasOverlap) {
      toast({
        title: "Solapamiento de horarios",
        description: "El horario se solapa con otro ya asignado para este día y esta instalación.",
        variant: "destructive",
      })
      return
    }

    // Ahora verificamos solapamiento con otras instalaciones asignadas al mismo coordinador
    for (const facilityId of selectedFacilities) {
      // Saltamos la instalación actual que ya verificamos
      if (facilityId === selectedFacility) continue

      const otherFacilitySchedules = facilitySchedules[facilityId]?.schedules || []
      const otherSameDaySchedules = otherFacilitySchedules.filter(s => s.day === selectedDay)

      const overlap = otherSameDaySchedules.some(schedule => {
        const existingStart = parseInt(schedule.startTime.split(':')[0])
        const existingEnd = parseInt(schedule.endTime.split(':')[0])

        // Verificar solapamiento
        return (startHour < existingEnd && endHour > existingStart)
      })

      if (overlap) {
        hasOverlap = true
        overlapFacilityName = instalacionesData.find(f => f.id === facilityId)?.nombre || `ID: ${facilityId}`
        break
      }
    }

    if (hasOverlap) {
      // Encontrar el horario específico que está causando el conflicto
      let conflictDetails = ""

      if (overlapFacilityName) {
        // Buscar el horario específico que está en conflicto
        const conflictingFacilityId = instalacionesData.find(f => f.nombre === overlapFacilityName)?.id
        if (conflictingFacilityId) {
          const conflictingSchedules = facilitySchedules[conflictingFacilityId]?.schedules || []
          const conflictingSchedule = conflictingSchedules.find(s => {
            if (s.day !== selectedDay) return false
            const existingStart = parseInt(s.startTime.split(':')[0])
            const existingEnd = parseInt(s.endTime.split(':')[0])
            return (startHour < existingEnd && endHour > existingStart)
          })

          if (conflictingSchedule) {
            conflictDetails = `\n\nHorario en conflicto:\n• ${overlapFacilityName}: ${conflictingSchedule.day} de ${conflictingSchedule.startTime} a ${conflictingSchedule.endTime}\n• Nuevo horario: ${selectedDay} de ${tempSchedule.startTime} a ${tempSchedule.endTime}`
          }
        }
      } else {
        // Conflicto en la misma instalación
        const sameFacilityName = instalacionesData.find(f => f.id === selectedFacility)?.nombre || `ID: ${selectedFacility}`
        const conflictingSchedule = sameDaySchedules.find(schedule => {
          const existingStart = parseInt(schedule.startTime.split(':')[0])
          const existingEnd = parseInt(schedule.endTime.split(':')[0])
          return (startHour < existingEnd && endHour > existingStart)
        })

        if (conflictingSchedule) {
          conflictDetails = `\n\nHorario en conflicto:\n• ${sameFacilityName}: ${conflictingSchedule.day} de ${conflictingSchedule.startTime} a ${conflictingSchedule.endTime}\n• Nuevo horario: ${selectedDay} de ${tempSchedule.startTime} a ${tempSchedule.endTime}`
        }
      }

      toast({
        title: "Conflicto de horarios detectado",
        description: `No se puede asignar este horario porque se solapa con otro ya existente.${conflictDetails}\n\nPor favor, elige un horario diferente o modifica el horario existente.`,
        variant: "destructive",
      })
      return
    }

    // Agregar el nuevo horario
    const newSchedule = {
      id: Date.now(), // ID único para facilitar eliminación
      day: selectedDay,
      startTime: tempSchedule.startTime,
      endTime: tempSchedule.endTime
    }

    setFacilitySchedules(prev => ({
      ...prev,
      [selectedFacility]: {
        facilityId: selectedFacility,
        schedules: [...(prev[selectedFacility]?.schedules || []), newSchedule]
      }
    }))
  }

  const removeSchedule = (facilityId: number, scheduleId: number) => {
    setFacilitySchedules(prev => {
      const updatedFacility = {
        ...prev[facilityId],
        schedules: prev[facilityId].schedules.filter(s => s.id !== scheduleId)
      }

      return {
        ...prev,
        [facilityId]: updatedFacility
      }
    })
  }

  const filteredFacilities = instalacionesData.filter(
    (facility) =>
      facility.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coordinator) return

    if (selectedFacilities.length === 0) {
      toast({
        title: "Error",
        description: "Debes asignar al menos una instalación al coordinador.",
        variant: "destructive",
      })
      return
    }

    // Verificar que todas las instalaciones tengan al menos un horario asignado
    const facilitiesWithoutSchedules = selectedFacilities.filter(facilityId => {
      return !facilitySchedules[facilityId] || facilitySchedules[facilityId].schedules.length === 0
    })

    if (facilitiesWithoutSchedules.length > 0) {
      const facilityNames = facilitiesWithoutSchedules.map(id => {
        const facility = instalacionesData.find(f => f.id === id)
        return facility ? facility.nombre : `ID: ${id}`
      }).join(", ")

      toast({
        title: "Error",
        description: `Debes asignar al menos un horario a cada instalación. Faltan horarios en: ${facilityNames}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Preparar los horarios en el formato correcto
      const horarios: HorarioCoordinadorRequestDTO[] = []

      Object.keys(facilitySchedules).forEach(facilityIdStr => {
        const facilityId = Number(facilityIdStr)
        const facilitySchedule = facilitySchedules[facilityId]

        facilitySchedule.schedules.forEach(schedule => {
          horarios.push({
            instalacionId: facilityId,
            diaSemana: schedule.day,
            horaInicio: schedule.startTime,
            horaFin: schedule.endTime
          })
        })
      })

      const asignacionData: CoordinadorAsignacionDTO = {
        coordinadorId: coordinator.id,
        instalacionIds: selectedFacilities,
        horarios: horarios
      }

      await asignarInstalacionesYHorarios(asignacionData)

      toast({
        title: "Coordinador actualizado",
        description: "Las instalaciones y horarios han sido actualizados exitosamente.",
      })

      // Redireccionar a la lista de coordinadores
      router.push("/admin/coordinadores")
    } catch (error) {
      console.error("Error al actualizar coordinador:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el coordinador",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!coordinator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/coordinadores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Coordinador no encontrado</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Coordinador no encontrado</h3>
            <p className="text-gray-500 mt-2">El coordinador que estás buscando no existe.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/admin/coordinadores">Ver todos los coordinadores</Link>
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
          <Link href="/admin/coordinadores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Editar Coordinador</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Coordinador</CardTitle>
                <CardDescription>Información del coordinador seleccionado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label className="text-lg font-medium">{coordinator.nombre}</Label>
                    <Badge variant={coordinator.activo ? "default" : "secondary"}>
                      {coordinator.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{coordinator.email}</p>
                  {coordinator.telefono && (
                    <p className="text-sm text-gray-500">{coordinator.telefono}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios por Instalación</CardTitle>
                <CardDescription>Configura los horarios específicos para cada instalación seleccionada</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="config">
                  <TabsList className="mb-4">
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
                  </TabsList>

                  <TabsContent value="config">
                    {selectedFacilities.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedFacilities.map((facilityId) => {
                            const facility = instalacionesData.find((f) => f.id === facilityId)
                            const scheduleCount = facilitySchedules[facilityId]?.schedules.length || 0
                            return (
                              <Badge
                                key={facilityId}
                                variant={selectedFacility === facilityId ? "default" : "outline"}
                                className="cursor-pointer flex items-center gap-1 py-2"
                                onClick={() => handleFacilitySelect(facilityId)}
                              >
                                {facility?.nombre}
                                <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5">
                                  {scheduleCount}
                                </span>
                              </Badge>
                            )
                          })}
                        </div>

                        {selectedFacility && (
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-4">Configurar horarios para: {instalacionesData.find(f => f.id === selectedFacility)?.nombre}</h3>

                            <Tabs defaultValue={selectedDay} onValueChange={handleDaySelect}>
                              <TabsList className="mb-4 flex flex-wrap h-auto">
                                {weekDays.map((day) => (
                                  <TabsTrigger key={day.id} value={day.id} className="flex-1">
                                    {day.name}
                                  </TabsTrigger>
                                ))}
                              </TabsList>

                              {weekDays.map((day) => {
                                // Detectar conflictos para el día actual
                                const conflictInfo = selectedDay === day.id ? detectScheduleConflicts() : { hasConflict: false, conflicts: [] }

                                return (
                                  <TabsContent key={day.id} value={day.id} className="space-y-4">
                                    <div className="flex items-end gap-4">
                                      <div className="space-y-1 flex-1">
                                        <Label htmlFor={`start-${day.id}`} className="text-xs">
                                          Hora inicio
                                        </Label>
                                        <Select
                                          value={tempSchedule.startTime}
                                          onValueChange={(value) => updateTempSchedule("startTime", value)}
                                        >
                                          <SelectTrigger id={`start-${day.id}`}>
                                            <SelectValue placeholder="Hora inicio" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {timeSlots.map((time) => (
                                              <SelectItem key={`start-${day.id}-${time}`} value={time}>
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1 flex-1">
                                        <Label htmlFor={`end-${day.id}`} className="text-xs">
                                          Hora fin
                                        </Label>
                                        <Select
                                          value={tempSchedule.endTime}
                                          onValueChange={(value) => updateTempSchedule("endTime", value)}
                                        >
                                          <SelectTrigger id={`end-${day.id}`}>
                                            <SelectValue placeholder="Hora fin" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {timeSlots.map((time) => (
                                              <SelectItem key={`end-${day.id}-${time}`} value={time}>
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        type="button"
                                        onClick={addScheduleToFacility}
                                        className="mb-0.5"
                                        disabled={conflictInfo.hasConflict}
                                        variant={conflictInfo.hasConflict ? "secondary" : "default"}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar
                                      </Button>
                                    </div>

                                    {/* Mostrar información de conflictos */}
                                    {conflictInfo.hasConflict && (
                                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <div className="flex items-start">
                                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                          <div className="flex-1">
                                            <h4 className="text-sm font-medium text-red-800 mb-1">
                                              No se puede agregar este horario
                                            </h4>
                                            <div className="text-sm text-red-700 space-y-1">
                                              {conflictInfo.conflicts.map((conflict, index) => (
                                                <div key={index}>
                                                  {conflict.type === 'invalid_time' ? (
                                                    <p>{conflict.message}</p>
                                                  ) : (
                                                    <p>• {conflict.message}</p>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                            <p className="text-xs text-red-600 mt-2">
                                              Modifica el horario o elimina los horarios en conflicto para continuar.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Horarios asignados para {day.name}:</h4>
                                      {facilitySchedules[selectedFacility]?.schedules.filter(s => s.day === day.id).length > 0 ? (
                                        <div className="space-y-2">
                                          {facilitySchedules[selectedFacility].schedules
                                            .filter(s => s.day === day.id)
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map(schedule => (
                                              <div key={schedule.id} className="flex items-center justify-between p-2 border rounded-md">
                                                <div className="flex items-center">
                                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                                  <span>
                                                    {schedule.startTime} - {schedule.endTime}
                                                  </span>
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeSchedule(selectedFacility, schedule.id)}
                                                  className="text-red-500 h-8 w-8 p-0"
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ))
                                          }
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">No hay horarios asignados para este día</p>
                                      )}
                                    </div>
                                  </TabsContent>
                                )
                              })}
                            </Tabs>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 border rounded-md">
                        <p className="text-gray-500">Selecciona al menos una instalación para configurar horarios</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="calendar">
                    {Object.keys(facilitySchedules).length > 0 ? (
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Horario Semanal del Coordinador</h3>

                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 bg-gray-50 w-20">Hora</th>
                                {weekDays.map(day => (
                                  <th key={day.id} className="border p-2 bg-gray-50">{day.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {timeSlots.map((time, index) => {
                                // Saltamos la última hora porque solo la usamos como hora de fin
                                if (index === timeSlots.length - 1) return null;

                                const startHour = parseInt(time.split(':')[0]);
                                const endHour = parseInt(timeSlots[index + 1].split(':')[0]);

                                return (
                                  <tr key={time}>
                                    <td className="border p-2 text-center text-sm font-medium">
                                      {time} - {timeSlots[index + 1]}
                                    </td>

                                    {weekDays.map(day => {
                                      // Buscar todos los horarios que coinciden con este día y hora
                                      const schedulesInThisSlot: Array<{
                                        facilityId: number;
                                        facilityName: string;
                                        startTime: string;
                                        endTime: string;
                                      }> = [];

                                      Object.keys(facilitySchedules).forEach(facilityIdStr => {
                                        const facilityId = Number(facilityIdStr);
                                        const facilityScheduleList = facilitySchedules[facilityId]?.schedules || [];

                                        facilityScheduleList.forEach((schedule: Schedule) => {
                                          if (schedule.day === day.id) {
                                            const scheduleStart = parseInt(schedule.startTime.split(':')[0]);
                                            const scheduleEnd = parseInt(schedule.endTime.split(':')[0]);

                                            // Verificar si este horario cae en el slot actual
                                            if (scheduleStart <= startHour && scheduleEnd > startHour) {
                                              const facility = instalacionesData.find(f => f.id === facilityId);
                                              schedulesInThisSlot.push({
                                                facilityId: facilityId,
                                                facilityName: facility?.nombre || `ID: ${facilityId}`,
                                                startTime: schedule.startTime,
                                                endTime: schedule.endTime
                                              });
                                            }
                                          }
                                        });
                                      });

                                      return (
                                        <td key={`${day.id}-${time}`} className="border p-1 align-top">
                                          {schedulesInThisSlot.length > 0 ? (
                                            <div className="space-y-1">
                                              {schedulesInThisSlot.map((schedule, idx) => (
                                                <div
                                                  key={idx}
                                                  className={`text-xs p-1 rounded ${schedulesInThisSlot.length > 1 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                                                >
                                                  {schedule.facilityName}
                                                  {schedulesInThisSlot.length > 1 && (
                                                    <div className="text-xs font-bold text-red-600 mt-1">
                                                      ¡Conflicto de horario!
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span>Horario asignado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                            <span className="text-red-600 font-medium">Conflicto de horarios</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 border rounded-md">
                        <p className="text-gray-500">No hay horarios asignados para mostrar en el calendario</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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
                            {facility.nombre}
                            <span className="block text-xs text-gray-500">{facility.ubicacion}</span>
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
                        const facility = instalacionesData.find((f) => f.id === facilityId)
                        const scheduleCount = facilitySchedules[facilityId]?.schedules.length || 0
                        return (
                          <Badge
                            key={facilityId}
                            variant={selectedFacility === facilityId ? "default" : "secondary"}
                            className="flex items-center gap-1 py-1.5 cursor-pointer"
                            onClick={() => handleFacilitySelect(facilityId)}
                          >
                            {facility?.nombre}
                            <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5">
                              {scheduleCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFacility(facilityId);
                              }}
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

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/coordinadores">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

