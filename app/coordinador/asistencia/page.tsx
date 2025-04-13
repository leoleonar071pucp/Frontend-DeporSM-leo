"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, Clock, MapPin, Filter, CheckCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Datos de ejemplo para las asistencias
const attendanceData = [
  {
    id: 1,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-05",
    scheduledTime: "14:00",
    arrivalTime: "13:55",
    status: "a-tiempo",
    notes: "Todo en orden",
  },
  {
    id: 2,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-05",
    scheduledTime: "16:30",
    arrivalTime: "16:45",
    status: "tarde",
    notes: "Tráfico en la avenida principal",
  },
  {
    id: 3,
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-04",
    scheduledTime: "09:00",
    arrivalTime: "09:00",
    status: "a-tiempo",
    notes: "",
  },
  {
    id: 4,
    facilityId: 4,
    facilityName: "Pista de Atletismo",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-03",
    scheduledTime: "11:30",
    arrivalTime: null,
    status: "no-asistio",
    notes: "Problemas de salud",
  },
  {
    id: 5,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-02",
    scheduledTime: "14:00",
    arrivalTime: "14:05",
    status: "a-tiempo",
    notes: "",
  },
]

// Datos de ejemplo para las visitas programadas
const scheduledVisits = [
  {
    id: 101,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    date: "2025-04-06",
    scheduledTime: "14:00",
  },
  {
    id: 102,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-06",
    scheduledTime: "16:30",
  },
  {
    id: 103,
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    location: "Complejo Deportivo Municipal",
    date: "2025-04-07",
    scheduledTime: "09:00",
  },
]

export default function AsistenciaPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [scheduled, setScheduled] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("historial")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAttendance(attendanceData)
      setScheduled(scheduledVisits)
      setFilteredData(attendanceData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === "historial") {
      let filtered = attendance

      // Aplicar filtro de búsqueda
      if (searchQuery) {
        filtered = filtered.filter(
          (item) =>
            item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      setFilteredData(filtered)
    } else if (activeTab === "calendario") {
      // Filtrar por fecha seleccionada
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      const filtered = attendance.filter((item) => item.date === dateStr)
      setFilteredData(filtered)
    } else if (activeTab === "programadas") {
      let filtered = scheduled

      // Aplicar filtro de búsqueda
      if (searchQuery) {
        filtered = filtered.filter(
          (item) =>
            item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      setFilteredData(filtered)
    }
  }, [activeTab, searchQuery, selectedDate, attendance, scheduled])

  const handleSearch = (e) => {
    e.preventDefault()
    // La búsqueda se aplica en el useEffect
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "a-tiempo":
        return <Badge className="bg-green-100 text-green-800">A tiempo</Badge>
      case "tarde":
        return <Badge className="bg-yellow-100 text-yellow-800">Tarde</Badge>
      case "no-asistio":
        return <Badge className="bg-red-100 text-red-800">No asistió</Badge>
      default:
        return null
    }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registro de Asistencia</h1>
          <p className="text-muted-foreground">Gestiona tus visitas y asistencias a las instalaciones asignadas</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
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
                <DropdownMenuItem onClick={() => setFilteredData(attendance)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendance.filter((a) => a.status === "a-tiempo"))}>
                  A tiempo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendance.filter((a) => a.status === "tarde"))}>
                  Tarde
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilteredData(attendance.filter((a) => a.status === "no-asistio"))}>
                  No asistió
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="historial" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
        </TabsList>

        <TabsContent value="historial" className="mt-4">
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
                      <TableHead>Hora de Llegada</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Notas</TableHead>
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
                          <TableCell>{item.scheduledTime}</TableCell>
                          <TableCell>{item.arrivalTime || "-"}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{item.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No se encontraron registros de asistencia
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
                <CardDescription>Selecciona una fecha para ver tus asistencias</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={es}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Asistencias del {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.length > 0 ? (
                  <div className="space-y-4">
                    {filteredData.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{item.facilityName}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-4 w-4" /> {item.location}
                            </p>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500">Hora programada</p>
                              <p className="font-medium">{item.scheduledTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500">Hora de llegada</p>
                              <p className="font-medium">{item.arrivalTime || "-"}</p>
                            </div>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-500">Notas:</p>
                            <p>{item.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No hay registros para esta fecha</h3>
                    <p className="text-gray-500 mt-2">
                      No se encontraron asistencias registradas para el día seleccionado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programadas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitas Programadas</CardTitle>
              <CardDescription>Próximas visitas que debes realizar</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduled.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduled.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{visit.facilityName}</h3>
                        <Badge className="bg-blue-100 text-blue-800">Programada</Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                        <MapPin className="h-4 w-4" /> {visit.location}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Fecha</p>
                          <p className="font-medium">{format(new Date(visit.date), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Hora</p>
                          <p className="font-medium">{visit.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/coordinador/instalaciones/${visit.facilityId}`}>Ver Detalles</Link>
                        </Button>
                        <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                          <Link href={`/coordinador/asistencia/registrar?id=${visit.id}`}>Registrar Asistencia</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No hay visitas programadas</h3>
                  <p className="text-gray-500 mt-2">No tienes visitas programadas próximamente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

