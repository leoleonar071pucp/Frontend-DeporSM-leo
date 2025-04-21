"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isMonday, isTuesday, isWednesday, isThursday, isFriday } from "date-fns"
import { es } from "date-fns/locale"
import { ScheduledVisit } from "../types"

// Estructura de horarios asignados (igual que en admin/coordinadores)
const assignedSchedules = {
  "1": {
    facilityId: 1,
    schedules: [
      { id: 101, day: "lunes", startTime: "08:00", endTime: "12:00" },
      { id: 102, day: "miercoles", startTime: "08:00", endTime: "12:00" },
      { id: 103, day: "viernes", startTime: "08:00", endTime: "12:00" }
    ]
  },
  "2": {
    facilityId: 2,
    schedules: [
      { id: 201, day: "martes", startTime: "14:00", endTime: "18:00" },
      { id: 202, day: "jueves", startTime: "14:00", endTime: "18:00" }
    ]
  }
}

// Datos de las instalaciones
const facilities = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    image: "/placeholder.svg"
  }
]

// Función auxiliar para verificar si una fecha corresponde al horario de una instalación
const isScheduledDay = (date: Date, facilityId: number): boolean => {
  if (facilityId === 1) { // Cancha de Fútbol (Grass)
    return isMonday(date) || isWednesday(date) || isFriday(date)
  } else if (facilityId === 2) { // Piscina Municipal
    return isTuesday(date) || isThursday(date)
  }
  return false
}

export default function ProgramadasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([])
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([])

  useEffect(() => {
    const loadData = async () => {
      // Configurar para mostrar la semana del 15 al 19 de abril de 2025
      const targetDate = new Date(2025, 3, 16) // 16 de abril de 2025 (miércoles)
      const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // Comenzar semana en lunes
      const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })
      
      // Obtener todos los días de la semana
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      // Generar visitas programadas para la semana basadas en los horarios asignados
      const visits: ScheduledVisit[] = []
      
      // Asegurar que se muestre específicamente la visita del miércoles 16/04/2025 para la Cancha de Fútbol (Grass)
      const specificDate = new Date(2025, 3, 16) // 16 de abril de 2025 (miércoles)
      
      weekDays.forEach(date => {
        // Revisar cada instalación y sus horarios
        Object.entries(assignedSchedules).forEach(([facilityId, facilityData]) => {
          const facility = facilities.find(f => f.id === parseInt(facilityId))
          if (!facility) return

          // Verificar si es la fecha específica del 16/04/2025 para la Cancha de Fútbol (Grass)
          const isSpecificDate = date.getDate() === 16 && date.getMonth() === 3 && date.getFullYear() === 2025
          const isGrassCourt = facility.id === 1 && isSpecificDate
          
          // Forzar la inclusión de la visita del miércoles para la Cancha de Fútbol (Grass)
          if (isGrassCourt || isScheduledDay(date, facility.id)) {
            // Para la fecha específica del miércoles 16/04/2025 para Cancha de Fútbol (Grass), usar el horario de miércoles
            let schedules;
            if (isGrassCourt) {
              // Forzar el uso del horario de miércoles para esta fecha específica
              schedules = facilityData.schedules.find(s => s.day === "miercoles")
            } else {
              // Para el resto de fechas, usar la lógica normal
              schedules = facilityData.schedules.find(s => {
                const dayName = format(date, 'EEEE', { locale: es }).toLowerCase()
                return s.day === dayName
              })
            }

            if (schedules) {
              // Crear un ID verdaderamente único usando una combinación de fecha, facilityId y día
              const uniqueId = parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}${facilityId}${schedules.id}`)
              
              visits.push({
                id: uniqueId, // ID único basado en fecha y facilityId
                facilityId: parseInt(facilityId),
                facilityName: facility.name,
                location: facility.location,
                date: format(date, 'dd/MM/yyyy'),
                scheduledTime: schedules.startTime,
                scheduledEndTime: schedules.endTime,
                image: facility.image
              })
            }
          }
        })
      })

      // Ordenar las visitas por fecha y hora
      visits.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number)
        const [dayB, monthB, yearB] = b.date.split('/').map(Number)
        const dateA = new Date(yearA, monthA - 1, dayA)
        const dateB = new Date(yearB, monthB - 1, dayB)
        
        const dateComparison = dateA.getTime() - dateB.getTime()
        if (dateComparison !== 0) return dateComparison
        return a.scheduledTime.localeCompare(b.scheduledTime)
      })

      setScheduledVisits(visits)
      setFilteredVisits(visits)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = scheduledVisits

    if (searchQuery) {
      filtered = filtered.filter(
        (visit) =>
          visit.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visit.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredVisits(filtered)
  }, [searchQuery, scheduledVisits])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

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
          <Link href="/coordinador/asistencia">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Visitas Programadas</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary-light">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Visitas</CardTitle>
          <CardDescription>Visitas programadas para esta semana según tu horario asignado</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVisits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{visit.facilityName}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" /> {visit.location}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">{visit.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{visit.scheduledTime} - {visit.scheduledEndTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/coordinador/instalaciones/${visit.facilityId}`}>Ver Detalles</Link>
                    </Button>
                    <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                      <Link href={`/coordinador/asistencia/registrar?id=${visit.id}&facilityId=${visit.facilityId}`}>
                        Registrar Asistencia
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay visitas programadas</h3>
              <p className="text-gray-500 mt-2">No tienes visitas programadas para esta semana.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}