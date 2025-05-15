"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Search, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import MantenimientoDetails from "./components/MantenimientoDetails"

export default function MantenimientoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [maintenances, setMaintenances] = useState([])
  const [facilities, setFacilities] = useState([])

  const [filteredMaintenances, setFilteredMaintenances] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [facilityFilter, setFacilityFilter] = useState("all")
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const { toast } = useToast()

  const getMaintenanceStatus = (maintenance) => {
    const now = new Date()
    const start = new Date(maintenance.fechaInicio)
    const end = new Date(maintenance.fechaFin)
    if (now < start) return "scheduled"
    if (now >= start && now <= end) return "in-progress"
    if (now > end) return "completed"
    return "unknown"
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const resMaintenances = await fetch("http://localhost:8080/api/mantenimientos/filtrar")
        const maintenanceData = await resMaintenances.json()
        setMaintenances(maintenanceData)
        setFilteredMaintenances(maintenanceData)

        const resFacilities = await fetch("http://localhost:8080/api/instalaciones")
        const facilitiesData = await resFacilities.json()
        setFacilities(facilitiesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    let result = maintenances

    if (searchTerm) {
      result = result.filter(
        (m) =>
          m.instalacionNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((m) => getMaintenanceStatus(m) === statusFilter)
    }

    if (facilityFilter !== "all") {
      result = result.filter((m) => m.facilityId === Number.parseInt(facilityFilter))
    }

    setFilteredMaintenances(result)
  }, [searchTerm, statusFilter, facilityFilter, maintenances])

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return null
    }
  }

  const handleDeleteMaintenance = async (m) => {
    try {
      const res = await fetch(`http://localhost:8080/api/mantenimientos/${m.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setMaintenances((prev) => prev.filter((mt) => mt.id !== m.id))
        setFilteredMaintenances((prev) => prev.filter((mt) => mt.id !== m.id))
        toast({
          title: "Mantenimiento eliminado",
          description: `Se eliminó correctamente el mantenimiento de "${m.instalacionNombre}".`,
        })
      } else {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el mantenimiento.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error al eliminar:", err)
      toast({
        title: "Error de red",
        description: "Hubo un problema al conectarse con el servidor.",
        variant: "destructive"
      })
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Mantenimiento de Instalaciones</h1>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/admin/instalaciones/programar-mantenimiento">
            <Plus className="h-4 w-4 mr-2" />
            Programar Mantenimiento
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los mantenimientos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o descripción"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="in-progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facility">Instalación</Label>
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger id="facility">
                  <SelectValue placeholder="Filtrar por instalación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id.toString()}>
                      {facility.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances.filter((m) => getMaintenanceStatus(m) === "in-progress")}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDeleteMaintenance}
          />
        </TabsContent>

        <TabsContent value="programados" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances.filter((m) => getMaintenanceStatus(m) === "scheduled")}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDeleteMaintenance}
          />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances.filter((m) => getMaintenanceStatus(m) === "completed")}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDeleteMaintenance}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Tabla
function MaintenanceTable({ maintenances, getMaintenanceStatus, getStatusBadge, handleDelete }) {
  if (maintenances.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No hay mantenimientos</h3>
        <p className="mt-1 text-gray-500">No hay datos disponibles.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Instalación</th>
            <th className="text-left py-3 px-4 font-medium">Descripción</th>
            <th className="text-left py-3 px-4 font-medium">Fechas</th>
            <th className="text-left py-3 px-4 font-medium">Estado</th>
            <th className="text-left py-3 px-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maintenances.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="py-3 px-4">{m.instalacionNombre}</td>
              <td className="py-3 px-4">{m.descripcion}</td>
              <td className="py-3 px-4">
                {format(new Date(m.fechaInicio), "dd/MM/yyyy")} - {format(new Date(m.fechaFin), "dd/MM/yyyy")}
              </td>
              <td className="py-3 px-4">{getStatusBadge(getMaintenanceStatus(m))}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Link href={`/admin/instalaciones/mantenimiento/${m.id}`}>
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(m)}>
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
