"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Search, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import MantenimientoDetails from "./components/MantenimientoDetails"

// Datos de ejemplo para los mantenimientos
const maintenanceDB = [
  {
    id: 2,
    facilityId: 2,
    facilityName: "Cancha de Fútbol (Grass)",
    facilityLocation: "Parque Juan Pablo II",
    type: "correctivo",
    description: "Reparación del sistema de riego automático",
    startDate: "10/04/2025",
    startTime: "09:00",
    endDate: "12/04/2025",
    endTime: "18:00",
    status: "scheduled",
    affectsAvailability: false,
    createdBy: "Admin Principal",
    createdAt: "02/04/2025",
  },
  {
    id: 3,
    facilityId: 4,
    facilityName: "Cancha de Fútbol (Loza)",
    facilityLocation: "Parque Simón Bolívar",
    type: "correctivo",
    description: "Reparación de grietas en la superficie",
    startDate: "01/04/2025",
    startTime: "07:00",
    endDate: "08/04/2025",
    endTime: "16:00",
    status: "in-progress",
    affectsAvailability: true,
    createdBy: "Admin Principal",
    createdAt: "25/03/2025",
  },
  {
    id: 6,
    facilityId: 1,
    facilityName: "Piscina Municipal",
    facilityLocation: "Complejo Deportivo Municipal",
    type: "correctivo",
    description: "Reparación del sistema de filtración",
    startDate: "01/03/2025",
    startTime: "08:00",
    endDate: "05/03/2025",
    endTime: "17:00",
    status: "completed",
    affectsAvailability: true,
    createdBy: "Admin Principal",
    createdAt: "25/02/2025",
  },
]

// Datos de ejemplo para las instalaciones
const facilitiesDB = [
  {
    id: 1,
    name: "Piscina Municipal",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    type: "cancha-futbol-grass",
    location: "Parque Juan Pablo II",
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    type: "gimnasio",
    location: "Complejo Deportivo Municipal",
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    type: "cancha-futbol-loza",
    location: "Parque Simón Bolívar",
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    type: "pista-atletismo",
    location: "Complejo Deportivo Municipal",
  },
]

export default function MantenimientoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [maintenances, setMaintenances] = useState([])
  const [filteredMaintenances, setFilteredMaintenances] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [facilityFilter, setFacilityFilter] = useState("all")
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMaintenances(maintenanceDB)
      setFilteredMaintenances(maintenanceDB)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    // Aplicar filtros
    let result = maintenances

    // Filtro por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        (maintenance) =>
          maintenance.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      result = result.filter((maintenance) => maintenance.status === statusFilter)
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      result = result.filter((maintenance) => maintenance.type === typeFilter)
    }

    // Filtro por instalación
    if (facilityFilter !== "all") {
      result = result.filter((maintenance) => maintenance.facilityId === Number.parseInt(facilityFilter))
    }

    setFilteredMaintenances(result)
  }, [searchTerm, statusFilter, typeFilter, facilityFilter, maintenances])

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

  const getTypeBadge = (type) => {
    switch (type) {
      case "preventivo":
        return <Badge className="bg-green-100 text-green-800">Preventivo</Badge>
      case "correctivo":
        return <Badge className="bg-red-100 text-red-800">Correctivo</Badge>
      case "mejora":
        return <Badge className="bg-blue-100 text-blue-800">Mejora</Badge>
      default:
        return null
    }
  }

  const handleCancelMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance)
    setShowCancelDialog(true)
  }

  const handleViewDetails = (maintenance) => {
    setSelectedMaintenance(maintenance)
    setShowDetailsDialog(true)
  }

  const confirmCancelMaintenance = () => {
    // Actualizar el estado del mantenimiento a 'cancelled'
    const updatedMaintenances = maintenances.map((m) =>
      m.id === selectedMaintenance.id ? { ...m, status: "cancelled" } : m
    )
    setMaintenances(updatedMaintenances)
    setFilteredMaintenances(updatedMaintenances)
    setShowCancelDialog(false)
    
    toast({
      title: "Mantenimiento cancelado",
      description: "El mantenimiento ha sido cancelado exitosamente.",
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

      {/* Diálogo de confirmación para cancelar mantenimiento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar mantenimiento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar este mantenimiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmCancelMaintenance}>
              Sí, cancelar mantenimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalles de mantenimiento */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Mantenimiento</DialogTitle>
            <DialogDescription>
              Información detallada del mantenimiento
            </DialogDescription>
          </DialogHeader>
          {selectedMaintenance && <MantenimientoDetails maintenance={selectedMaintenance} />}
        </DialogContent>
      </Dialog>

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
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
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
                  <SelectItem value="all">Todas las instalaciones</SelectItem>
                  {facilitiesDB.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id.toString()}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activos">Mantenimientos Activos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Activos</CardTitle>
              <CardDescription>Mantenimientos que están actualmente en progreso</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMaintenances.filter((m) => m.status === "in-progress").length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No hay mantenimientos en progreso</h3>
                  <p className="mt-1 text-gray-500">Todos los mantenimientos están programados o completados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Instalación</th>
                        <th className="text-left py-3 px-4 font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium">Fechas</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaintenances
                        .filter((m) => m.status === "in-progress")
                        .map((maintenance) => (
                          <tr key={maintenance.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{maintenance.facilityName}</p>
                                <p className="text-sm text-gray-500">{maintenance.facilityLocation}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getTypeBadge(maintenance.type)}</td>
                            <td className="py-3 px-4">
                              <p className="line-clamp-2">{maintenance.description}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.startDate), 'dd/MM/yyyy')} ({maintenance.startTime}) - 
                                  </span>
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.endDate), 'dd/MM/yyyy')} ({maintenance.endTime})
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(maintenance.status)}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/instalaciones/${maintenance.facilityId}`}>Ver instalación</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/instalaciones/${maintenance.facilityId}/mantenimiento?id=${maintenance.id}`}>Editar</Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleCancelMaintenance(maintenance)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programados" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Programados</CardTitle>
              <CardDescription>Mantenimientos que están programados para fechas futuras</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMaintenances.filter((m) => m.status === "scheduled").length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No hay mantenimientos programados</h3>
                  <p className="mt-1 text-gray-500">No hay mantenimientos programados para fechas futuras.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Instalación</th>
                        <th className="text-left py-3 px-4 font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium">Fechas</th>
                        <th className="text-left py-3 px-4 font-medium">Afecta Disponibilidad</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaintenances
                        .filter((m) => m.status === "scheduled")
                        .map((maintenance) => (
                          <tr key={maintenance.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{maintenance.facilityName}</p>
                                <p className="text-sm text-gray-500">{maintenance.facilityLocation}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getTypeBadge(maintenance.type)}</td>
                            <td className="py-3 px-4">
                              <p className="line-clamp-2">{maintenance.description}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.startDate), 'dd/MM/yyyy')} ({maintenance.startTime}) - 
                                  </span>
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.endDate), 'dd/MM/yyyy')} ({maintenance.endTime})
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {maintenance.affectsAvailability ? (
                                <Badge className="bg-red-100 text-red-800">Sí</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">No</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/instalaciones/${maintenance.facilityId}`}>Ver instalación</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/instalaciones/${maintenance.facilityId}/mantenimiento?id=${maintenance.id}`}>Editar</Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleCancelMaintenance(maintenance)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Mantenimientos</CardTitle>
              <CardDescription>Mantenimientos completados o cancelados</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMaintenances.filter((m) => m.status === "completed" || m.status === "cancelled").length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No hay historial de mantenimientos</h3>
                  <p className="mt-1 text-gray-500">No hay mantenimientos completados o cancelados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Instalación</th>
                        <th className="text-left py-3 px-4 font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium">Fechas</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaintenances
                        .filter((m) => m.status === "completed" || m.status === "cancelled")
                        .map((maintenance) => (
                          <tr key={maintenance.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{maintenance.facilityName}</p>
                                <p className="text-sm text-gray-500">{maintenance.facilityLocation}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getTypeBadge(maintenance.type)}</td>
                            <td className="py-3 px-4">
                              <p className="line-clamp-2">{maintenance.description}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.startDate), 'dd/MM/yyyy')} ({maintenance.startTime}) - 
                                  </span>
                                  <span className="text-sm font-medium">
                                    {format(new Date(maintenance.endDate), 'dd/MM/yyyy')} ({maintenance.endTime})
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(maintenance.status)}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/instalaciones/${maintenance.facilityId}`}>Ver instalación</Link>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(maintenance)}>
                                  Ver detalles
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

