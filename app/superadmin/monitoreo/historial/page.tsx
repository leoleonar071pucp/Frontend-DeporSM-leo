"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search,
  Filter,
  CalendarIcon,
  Download,
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  Settings,
  FileText,
  Database,
  X,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Datos de ejemplo para el historial de acceso
const accessHistoryData = [
  {
    id: 1,
    user: "admin@munisanmiguel.gob.pe",
    name: "Juan Pérez",
    role: "Administrador",
    action: "login",
    resource: null,
    ip: "192.168.1.1",
    device: "Chrome / Windows",
    date: "05/04/2025, 09:15",
    status: "success",
  },
  {
    id: 2,
    user: "coord@munisanmiguel.gob.pe",
    name: "Roberto Gómez",
    role: "Coordinador",
    action: "login",
    resource: null,
    ip: "192.168.1.2",
    device: "Safari / macOS",
    date: "05/04/2025, 08:30",
    status: "success",
  },
  {
    id: 3,
    user: "superadmin@munisanmiguel.gob.pe",
    name: "Admin Principal",
    role: "Superadmin",
    action: "settings_change",
    resource: "Configuración del Sistema",
    ip: "192.168.1.3",
    device: "Firefox / Ubuntu",
    date: "05/04/2025, 08:00",
    status: "success",
  },
  {
    id: 4,
    user: "vecino@example.com",
    name: "Ana Martínez",
    role: "Vecino",
    action: "login",
    resource: null,
    ip: "192.168.1.4",
    device: "Chrome / Android",
    date: "05/04/2025, 07:45",
    status: "success",
  },
  {
    id: 5,
    user: "admin2@munisanmiguel.gob.pe",
    name: "María López",
    role: "Administrador",
    action: "login",
    resource: null,
    ip: "192.168.1.5",
    device: "Edge / Windows",
    date: "04/04/2025, 18:20",
    status: "success",
  },
  {
    id: 6,
    user: "hacker@example.com",
    name: "Desconocido",
    role: "Desconocido",
    action: "login",
    resource: null,
    ip: "203.0.113.1",
    device: "Chrome / Windows",
    date: "04/04/2025, 16:45",
    status: "failed",
  },
  {
    id: 7,
    user: "admin@munisanmiguel.gob.pe",
    name: "Juan Pérez",
    role: "Administrador",
    action: "data_access",
    resource: "Base de Datos",
    ip: "192.168.1.1",
    device: "Chrome / Windows",
    date: "04/04/2025, 15:30",
    status: "success",
  },
  {
    id: 8,
    user: "superadmin@munisanmiguel.gob.pe",
    name: "Admin Principal",
    role: "Superadmin",
    action: "user_create",
    resource: "Gestión de Usuarios",
    ip: "192.168.1.3",
    device: "Firefox / Ubuntu",
    date: "04/04/2025, 14:15",
    status: "success",
  },
  {
    id: 9,
    user: "coord@munisanmiguel.gob.pe",
    name: "Roberto Gómez",
    role: "Coordinador",
    action: "logout",
    resource: null,
    ip: "192.168.1.2",
    device: "Safari / macOS",
    date: "04/04/2025, 12:30",
    status: "success",
  },
  {
    id: 10,
    user: "vecino@example.com",
    name: "Ana Martínez",
    role: "Vecino",
    action: "reservation_create",
    resource: "Reservas",
    ip: "192.168.1.4",
    device: "Chrome / Android",
    date: "04/04/2025, 11:15",
    status: "success",
  },
]

export default function HistorialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    role: "all",
    action: "all",
    status: "all",
    date: null,
  })

  const getActionIcon = (action) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />
      case "logout":
        return <LogOut className="h-4 w-4 text-gray-500" />
      case "settings_change":
        return <Settings className="h-4 w-4 text-[#0cb7f2]" />
      case "data_access":
        return <Database className="h-4 w-4 text-[#0cb7f2]" />
      case "user_create":
        return <User className="h-4 w-4 text-[#0cb7f2]" />
      case "reservation_create":
        return <Calendar className="h-4 w-4 text-[#0cb7f2]" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case "login":
        return "Inicio de sesión"
      case "logout":
        return "Cierre de sesión"
      case "settings_change":
        return "Cambio de configuración"
      case "data_access":
        return "Acceso a datos"
      case "user_create":
        return "Creación de usuario"
      case "reservation_create":
        return "Creación de reserva"
      default:
        return action
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "Superadmin":
        return <Badge className="bg-purple-100 text-purple-800">Superadmin</Badge>
      case "Administrador":
        return <Badge className="bg-[#def7ff] text-[#0cb7f2]">Administrador</Badge>
      case "Coordinador":
        return <Badge className="bg-green-100 text-green-800">Coordinador</Badge>
      case "Vecino":
        return <Badge className="bg-gray-100 text-gray-800">Vecino</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Desconocido</Badge>
    }
  }

  const filteredHistory = accessHistoryData.filter((entry) => {
    // Filtro de búsqueda
    const matchesSearch =
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.resource && entry.resource.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtros de rol, acción, estado y fecha
    const matchesRole = filters.role === "all" || entry.role.toLowerCase() === filters.role
    const matchesAction = filters.action === "all" || entry.action === filters.action
    const matchesStatus = filters.status === "all" || entry.status === filters.status
    const matchesDate = !filters.date || entry.date.includes(format(filters.date, "dd/MM/yyyy"))

    return matchesSearch && matchesRole && matchesAction && matchesStatus && matchesDate
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial de Acceso</h1>
        <p className="text-muted-foreground">Monitorea la actividad de los usuarios en el sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividad</CardTitle>
          <CardDescription>Registro de acciones realizadas por los usuarios en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por usuario, IP o recurso..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={filters.role} onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="vecino">Vecino</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value }))}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="login">Inicio de sesión</SelectItem>
                  <SelectItem value="logout">Cierre de sesión</SelectItem>
                  <SelectItem value="settings_change">Cambio de configuración</SelectItem>
                  <SelectItem value="data_access">Acceso a datos</SelectItem>
                  <SelectItem value="user_create">Creación de usuario</SelectItem>
                  <SelectItem value="reservation_create">Creación de reserva</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Exitoso</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.date ? format(filters.date, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {filters.date && (
                <Button variant="ghost" size="icon" onClick={() => setFilters((prev) => ({ ...prev, date: null }))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-gray-500">{entry.user}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(entry.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getActionIcon(entry.action)}
                          <span className="ml-2">{getActionLabel(entry.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.resource || "-"}</TableCell>
                      <TableCell>{entry.ip}</TableCell>
                      <TableCell>{entry.device}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                        {entry.status === "success" ? (
                          <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Fallido</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {filteredHistory.length} de {accessHistoryData.length} registros
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Historial
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Sospechosa</CardTitle>
            <CardDescription>Intentos de acceso fallidos o actividad inusual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 pb-4 border-b">
                <div className="mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Múltiples intentos de inicio de sesión fallidos</p>
                  <p className="text-sm text-gray-500">Usuario: hacker@example.com</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>IP: 203.0.113.1</span>
                    <span className="mx-2">•</span>
                    <span>04/04/2025, 16:45</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 pb-4 border-b">
                <div className="mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Acceso desde ubicación inusual</p>
                  <p className="text-sm text-gray-500">Usuario: admin@munisanmiguel.gob.pe</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>IP: 198.51.100.1 (Nueva York, EE.UU.)</span>
                    <span className="mx-2">•</span>
                    <span>03/04/2025, 22:15</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Intento de acceso a área restringida</p>
                  <p className="text-sm text-gray-500">Usuario: coord@munisanmiguel.gob.pe</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>IP: 192.168.1.2</span>
                    <span className="mx-2">•</span>
                    <span>02/04/2025, 14:30</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Acceso</CardTitle>
            <CardDescription>Resumen de la actividad de acceso al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Inicios de sesión por rol (últimos 7 días)</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Vecinos</span>
                      <span className="font-medium">65</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gray-800 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Coordinadores</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#0cb7f2] h-2.5 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Administradores</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#53d4ff] h-2.5 rounded-full" style={{ width: "18%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Superadmins</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "5%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Dispositivos más utilizados</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Chrome / Windows</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#0cb7f2] h-2.5 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Chrome / Android</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#53d4ff] h-2.5 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Safari / iOS</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-[#a8e7ff] h-2.5 rounded-full" style={{ width: "18%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Otros</span>
                      <span className="font-medium">12%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gray-400 h-2.5 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

