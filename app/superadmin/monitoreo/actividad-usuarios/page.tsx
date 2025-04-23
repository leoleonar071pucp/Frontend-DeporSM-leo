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
  LogIn,
  LogOut,
  User,
  Settings,
  Database,
  X,
  Activity,
  ChevronLeft,
  BarChart,
  Download
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Datos de ejemplo para el monitoreo de actividad
const accessData = [
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
]

export default function ActividadUsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    role: "all",
    action: "all",
    status: "all",
    date: null as Date | null,
  })

  const getActionIcon = (action: string) => {
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
      case "user_update":
      case "user_view":
        return <User className="h-4 w-4 text-[#0cb7f2]" />
      case "reservation_create":
      case "reservation_view":
        return <Calendar className="h-4 w-4 text-[#0cb7f2]" />
      case "profile_view":
        return <User className="h-4 w-4 text-gray-500" />
      case "report_view":
        return <BarChart className="h-4 w-4 text-[#0cb7f2]" />
      case "data_export":
        return <Download className="h-4 w-4 text-[#0cb7f2]" />
      case "system_backup":
        return <Database className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionLabel = (action: string) => {
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
      case "user_update":
        return "Actualización de usuario"
      case "reservation_create":
        return "Creación de reserva"
      case "reservation_view":
        return "Visualización de reserva"
      case "profile_view":
        return "Visualización de perfil"
      case "report_view":
        return "Visualización de reporte"
      case "data_export":
        return "Exportación de datos"
      case "system_backup":
        return "Respaldo del sistema"
      case "user_view":
        return "Visualización de usuario"
      default:
        return action
    }
  }

  const getRoleBadge = (role: string) => {
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

  const filteredActivity = accessData.filter((entry) => {
    // Filtro de búsqueda
    const matchesSearch =
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.resource && entry.resource.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtros de rol, acción, estado y fecha
    const matchesRole = filters.role === "all" || entry.role === filters.role
    const matchesAction = filters.action === "all" || entry.action === filters.action
    const matchesStatus = filters.status === "all" || entry.status === filters.status
    
    // Validación mejorada para el filtro de fecha
    let matchesDate = true
    if (filters.date) {
      const selectedDateStr = format(filters.date, "dd/MM/yyyy")
      const entryDateParts = entry.date.split(',')[0].trim() // Extrae solo la parte de la fecha (sin la hora)
      matchesDate = entryDateParts === selectedDateStr
    }

    return matchesSearch && matchesRole && matchesAction && matchesStatus && matchesDate
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/superadmin/monitoreo" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoreo de Actividad de Usuarios</h1>
          <p className="text-muted-foreground">Supervisa las acciones y el comportamiento de los usuarios</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Actividad</CardTitle>
          <CardDescription>Acciones realizadas por los usuarios en el sistema</CardDescription>
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
                  <SelectItem value="Superadmin">Superadmin</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Coordinador">Coordinador</SelectItem>
                  <SelectItem value="Vecino">Vecino</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.action} onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value }))}>
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
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
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
                    selected={filters.date || undefined}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, date: date || null }))}
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
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((entry) => (
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
              Mostrando {filteredActivity.length} de {accessData.length} registros
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}