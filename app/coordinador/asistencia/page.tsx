"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar as CalendarIcon, Clock, MapPin, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceRecord } from "./types"
import { DepartureDialog } from "./components/departure-dialog"
import { AttendanceDetailsDialog } from "./components/attendance-details-dialog"
import { toast } from "@/components/ui/use-toast"

// Datos de ejemplo para las asistencias
const attendanceData: AttendanceRecord[] = [
  {
    id: 1,
    facilityId: 1,
    scheduleId: 101,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-05", // Viernes
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: "07:55",
    departureTime: "12:05",
    status: "a-tiempo",
    departureStatus: "a-tiempo",
    notes: "", // Notas vacías para estado "a-tiempo"
    departureNotes: "",
  },
  // Ejemplo de registro con entrada pero sin salida (día actual)
  {
    id: 6,
    facilityId: 2,
    scheduleId: 203,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Este",
    date: "2025-04-19", // Día actual (19 de abril)
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: "08:05",
    departureTime: null, // Salida no registrada
    status: "a-tiempo",
    departureStatus: "pendiente",
    notes: "",
    departureNotes: "",
  },
  {
    id: 2,
    facilityId: 1,
    scheduleId: 103,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-03", // Miércoles
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: "08:10",
    departureTime: "11:45",
    status: "tarde",
    departureStatus: "a-tiempo",
    notes: "Tráfico en la avenida principal",
    departureNotes: "Reunión urgente en la municipalidad",
  },
  {
    id: 3,
    facilityId: 2,
    scheduleId: 201,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-02", // Martes
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: "08:00",
    departureTime: "12:00",
    status: "a-tiempo",
    departureStatus: "a-tiempo",
    notes: "", // Notas vacías para estado "a-tiempo"
    departureNotes: "",
  },
  {
    id: 4,
    facilityId: 2,
    scheduleId: 202,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-04", // Jueves
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: null,
    departureTime: null,
    status: "no-asistio",
    departureStatus: "no-asistio",
    notes: "Problemas de salud",
    departureNotes: "",
  },
  {
    id: 5,
    facilityId: 1,
    scheduleId: 102,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-01", // Lunes
    scheduledTime: "08:00",
    scheduledEndTime: "12:00",
    arrivalTime: "08:05",
    departureTime: "12:15",
    status: "a-tiempo",
    departureStatus: "tarde",
    notes: "", // Notas vacías para estado "a-tiempo"
    departureNotes: "Hubo que resolver un problema con usuarios",
  },
]

export default function AsistenciaPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [departureDialogOpen, setDepartureDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFilteredData(attendanceData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = attendanceData

    // Aplicar filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredData(filtered)
  }, [searchQuery])

  const handleSearchForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // La búsqueda se aplica en el useEffect
  }

  const getStatusBadge = (status: AttendanceRecord["status"] | AttendanceRecord["departureStatus"]) => {
    switch (status) {
      case "a-tiempo":
        return <Badge className="bg-green-100 text-green-800">A tiempo</Badge>
      case "tarde":
        return <Badge className="bg-yellow-100 text-yellow-800">Tarde</Badge>
      case "no-asistio":
        return <Badge className="bg-red-100 text-red-800">No asistió</Badge>
      case "pendiente":
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>
      default:
        return null
    }
  }

  const openDepartureDialog = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance)
    setDepartureDialogOpen(true)
  }
  
  const openDetailsDialog = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance)
    setDetailsDialogOpen(true)
  }

  const handleRegisterDeparture = (
    attendanceId: number,
    departureTime: string,
    location: GeolocationCoordinates,
    notes: string
  ) => {
    // En un escenario real, aquí llamaríamos a una API para registrar la salida
    console.log("Registrando salida:", {
      attendanceId,
      departureTime,
      location,
      notes,
    })

    // Actualizar los datos en el estado local para reflejar la salida registrada
    setFilteredData((prevData) =>
      prevData.map((item) => {
        if (item.id === attendanceId) {
          // Determinar el estado de salida basado en la hora programada de fin y la hora actual
          const scheduledEnd = item.scheduledEndTime || "00:00"
          let departureStatus: "a-tiempo" | "tarde" = "a-tiempo"
          
          // Convertir las horas a minutos para comparar fácilmente
          const schedEndParts = scheduledEnd.split(":")
          const schedEndMinutes = parseInt(schedEndParts[0]) * 60 + parseInt(schedEndParts[1])
          
          const depParts = departureTime.split(":")
          const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1])
          
          // Si la diferencia es mayor a 5 minutos después, es tarde
          if (depMinutes - schedEndMinutes > 5) {
            departureStatus = "tarde"
          } else {
            departureStatus = "a-tiempo"
          }
          
          return {
            ...item,
            departureTime,
            departureStatus,
            departureNotes: notes,
          }
        }
        return item
      })
    )

    toast({
      title: "Salida registrada",
      description: `Has registrado tu salida a las ${departureTime}`,
    })
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registro de Asistencia</h1>
        <p className="text-muted-foreground">Gestiona tus visitas y asistencias a las instalaciones asignadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary transition-colors">
          <Link href="/coordinador/asistencia/calendario">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Vista Calendario
              </CardTitle>
              <CardDescription>
                Visualiza tu horario de las instalaciones asignadas
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <Link href="/coordinador/asistencia/programadas">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Visitas Programadas
              </CardTitle>
              <CardDescription>
                Revisa y gestiona tus próximas visitas programadas
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <form onSubmit={handleSearchForm} className="flex-grow flex gap-2">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilteredData(attendanceData)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendanceData.filter((a) => a.status === "a-tiempo"))}>
                  A tiempo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendanceData.filter((a) => a.status === "tarde"))}>
                  Tarde
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendanceData.filter((a) => a.status === "no-asistio"))}>
                  No asistió
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Asistencias</CardTitle>
          <CardDescription>Registro de todas tus visitas a instalaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instalación</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora Programada</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Estado Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Estado Salida</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.facilityName}</p>
                          <p className="text-sm text-gray-500">{item.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(item.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {item.scheduledTime} - {item.scheduledEndTime || "N/A"}
                      </TableCell>
                      <TableCell>{item.arrivalTime || "-"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.departureTime || "-"}</TableCell>
                      <TableCell>
                        {item.status === "no-asistio" 
                          ? getStatusBadge("no-asistio") 
                          : (item.arrivalTime && !item.departureTime 
                              ? getStatusBadge("pendiente") 
                              : item.departureStatus 
                                ? getStatusBadge(item.departureStatus) 
                                : "-"
                            )
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {item.arrivalTime && !item.departureTime && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-2 border-primary"
                              onClick={() => openDepartureDialog(item)}
                            >
                              Registrar Salida
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 border-2 border-gray-300"
                            onClick={() => openDetailsDialog(item)}
                          >
                            Detalles
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No se encontraron registros de asistencia
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de registro de salida */}
      <DepartureDialog
        open={departureDialogOpen}
        onClose={() => setDepartureDialogOpen(false)}
        attendance={selectedAttendance}
        onRegisterDeparture={handleRegisterDeparture}
      />
      
      {/* Diálogo de detalles de asistencia */}
      <AttendanceDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        attendance={selectedAttendance}
      />
    </div>
  )
}

