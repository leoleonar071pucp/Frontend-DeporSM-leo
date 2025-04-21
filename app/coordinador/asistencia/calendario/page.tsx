"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Interfaces
interface Schedule {
  id: number
  day: string
  startTime: string
  endTime: string
}

interface Facility {
  facilityId: number
  facilityName: string
  schedules: Schedule[]
}

interface AssignedSchedules {
  [key: string]: Facility
}

interface ScheduleInSlot {
  facilityId: number
  facilityName: string
  startTime: string
  endTime: string
}

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

// Datos de ejemplo para los horarios asignados
const assignedSchedules: AssignedSchedules = {
  "1": {
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    schedules: [
      { id: 101, day: "lunes", startTime: "08:00", endTime: "12:00" },
      { id: 102, day: "miercoles", startTime: "08:00", endTime: "12:00" },
      { id: 103, day: "viernes", startTime: "08:00", endTime: "12:00" }
    ]
  },
  "2": {
    facilityId: 2,
    facilityName: "Piscina Municipal",
    schedules: [
      { id: 201, day: "martes", startTime: "14:00", endTime: "18:00" },
      { id: 202, day: "jueves", startTime: "14:00", endTime: "18:00" }
    ]
  }
}

export default function CalendarioPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadData()
  }, [])

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
        <h1 className="text-2xl font-bold tracking-tight">Calendario de Asistencias</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
          <CardDescription>Vista general de tus horarios asignados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
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
                          // Buscar los horarios que coinciden con este día y hora
                          const schedulesInThisSlot: ScheduleInSlot[] = [];
                          
                          Object.values(assignedSchedules).forEach(facility => {
                            facility.schedules.forEach(schedule => {
                              if (schedule.day === day.id) {
                                const scheduleStart = parseInt(schedule.startTime.split(':')[0]);
                                const scheduleEnd = parseInt(schedule.endTime.split(':')[0]);
                                
                                // Verificar si este horario cae en el slot actual
                                if (scheduleStart <= startHour && scheduleEnd > startHour) {
                                  schedulesInThisSlot.push({
                                    facilityId: facility.facilityId,
                                    facilityName: facility.facilityName,
                                    startTime: schedule.startTime,
                                    endTime: schedule.endTime
                                  });
                                }
                              }
                            });
                          });
                          
                          return (
                            <td key={`${day.id}-${time}`} className="border p-1 align-top">
                              {schedulesInThisSlot.map((schedule, idx) => (
                                <div 
                                  key={idx} 
                                  className="text-xs p-1 rounded bg-blue-100 text-blue-800"
                                >
                                  {schedule.facilityName}
                                </div>
                              ))}
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
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span>Horario asignado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}