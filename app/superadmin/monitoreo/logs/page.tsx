"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Filter, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Datos de ejemplo para los logs
const logsData = [
  {
    id: 1,
    timestamp: "2025-04-05T09:15:30",
    level: "ERROR",
    source: "Database",
    message: "Error de conexión a la base de datos: Connection timeout",
    user: "system",
    ip: "192.168.1.1",
  },
  {
    id: 2,
    timestamp: "2025-04-05T09:10:15",
    level: "WARNING",
    source: "Authentication",
    message: "Intento de inicio de sesión fallido para el usuario admin@munisanmiguel.gob.pe",
    user: "anonymous",
    ip: "192.168.1.2",
  },
  {
    id: 3,
    timestamp: "2025-04-05T09:05:45",
    level: "INFO",
    source: "User",
    message: "Usuario admin@munisanmiguel.gob.pe ha iniciado sesión",
    user: "admin@munisanmiguel.gob.pe",
    ip: "192.168.1.3",
  },
  {
    id: 4,
    timestamp: "2025-04-05T09:00:10",
    level: "INFO",
    source: "System",
    message: "Servicio de correo electrónico iniciado correctamente",
    user: "system",
    ip: "192.168.1.1",
  },
  {
    id: 5,
    timestamp: "2025-04-05T08:55:30",
    level: "DEBUG",
    source: "API",
    message: "Solicitud GET /api/users completada en 120ms",
    user: "system",
    ip: "192.168.1.1",
  },
  {
    id: 6,
    timestamp: "2025-04-05T08:50:15",
    level: "ERROR",
    source: "Payment",
    message: "Error al procesar el pago: Invalid card number",
    user: "vecino@example.com",
    ip: "192.168.1.4",
  },
  {
    id: 7,
    timestamp: "2025-04-05T08:45:45",
    level: "WARNING",
    source: "Security",
    message: "Múltiples intentos de inicio de sesión fallidos desde la IP 192.168.1.5",
    user: "system",
    ip: "192.168.1.1",
  },
  {
    id: 8,
    timestamp: "2025-04-05T08:40:10",
    level: "INFO",
    source: "Reservation",
    message: "Nueva reserva creada: RES-12345",
    user: "vecino@example.com",
    ip: "192.168.1.4",
  },
  {
    id: 9,
    timestamp: "2025-04-05T08:35:30",
    level: "DEBUG",
    source: "Database",
    message: "Consulta SQL ejecutada en 50ms: SELECT * FROM users",
    user: "system",
    ip: "192.168.1.1",
  },
  {
    id: 10,
    timestamp: "2025-04-05T08:30:15",
    level: "INFO",
    source: "System",
    message: "Sistema iniciado correctamente",
    user: "system",
    ip: "192.168.1.1",
  },
]

export default function LogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLogs(logsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    filterLogs()
  }

  const filterLogs = () => {
    let filtered = logsData

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.ip.includes(searchQuery),
      )
    }

    // Filtrar por nivel
    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.level === levelFilter)
    }

    // Filtrar por fuente
    if (sourceFilter !== "all") {
      filtered = filtered.filter((log) => log.source === sourceFilter)
    }

    // Filtrar por fecha
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      filtered = filtered.filter((log) => log.timestamp.startsWith(dateString))
    }

    setLogs(filtered)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulación de actualización de datos
    setTimeout(() => {
      setLogs(logsData)
      setIsRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    // En un caso real, aquí se generaría un archivo CSV o JSON con los logs
    console.log("Exportando logs:", logs)

    // Simulación de descarga
    const element = document.createElement("a")
    const file = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `logs_${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case "ERROR":
        return <Badge className="bg-red-100 text-red-800">ERROR</Badge>
      case "WARNING":
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>
      case "INFO":
        return <Badge className="bg-blue-100 text-blue-800">INFO</Badge>
      case "DEBUG":
        return <Badge className="bg-gray-100 text-gray-800">DEBUG</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs del Sistema</h1>
          <p className="text-muted-foreground">Monitorea los registros de actividad del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Actividad</CardTitle>
          <CardDescription>Visualiza y filtra los logs del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar en logs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                Buscar
              </Button>
            </form>

            <div className="flex gap-2">
              <Select
                value={levelFilter}
                onValueChange={(value) => {
                  setLevelFilter(value)
                  filterLogs()
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sourceFilter}
                onValueChange={(value) => {
                  setSourceFilter(value)
                  filterLogs()
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fuentes</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Authentication">Authentication</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Reservation">Reservation</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      filterLogs()
                    }}
                    initialFocus
                    locale={es}
                  />
                  {selectedDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedDate(null)
                          filterLogs()
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No se encontraron logs que coincidan con los criterios de búsqueda
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

