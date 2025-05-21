"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Search, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import MantenimientoDetails from "./components/MantenimientoDetails"
import { API_BASE_URL } from "@/lib/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MantenimientoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [maintenances, setMaintenances] = useState([])
  const [facilities, setFacilities] = useState([])

  const [filteredMaintenances, setFilteredMaintenances] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [facilityFilter, setFacilityFilter] = useState("all")
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const getMaintenanceStatus = (maintenance) => {
    // Si el mantenimiento tiene un estado explícito, lo usamos
    if (maintenance.estado) {
      switch (maintenance.estado) {
        case "programado": return "scheduled";
        case "en-progreso": return "in-progress";
        case "completado": return "completed";
        case "cancelado": return "cancelled";
      }
    }

    // Si no tiene estado, lo inferimos por las fechas
    const now = new Date()
    const start = new Date(maintenance.fechaInicio)
    const end = new Date(maintenance.fechaFin)
    if (now < start) return "scheduled"
    if (now >= start && now <= end) return "in-progress"
    if (now > end) return "completed"
    return "unknown"
  }

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("activos")

  // Función para cargar los datos según la pestaña activa
  const loadMaintenanceData = async (tab = activeTab) => {
    // No activamos el loading al cambiar entre tabs para evitar parpadeos
    const isInitialLoad = tab === activeTab;
    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      let endpoint = "";

      // Seleccionar el endpoint según la pestaña
      switch (tab) {
        case "activos":
          endpoint = `${API_BASE_URL}/mantenimientos/activos`;
          break;
        case "programados":
          endpoint = `${API_BASE_URL}/mantenimientos/programados`;
          break;
        case "historial":
          endpoint = `${API_BASE_URL}/mantenimientos/historial`;
          break;
        default:
          endpoint = `${API_BASE_URL}/mantenimientos/filtrar`;
      }

      const resMaintenances = await fetch(endpoint);

      if (!resMaintenances.ok) {
        throw new Error(`Error al cargar datos: ${resMaintenances.status}`);
      }

      const maintenanceData = await resMaintenances.json();
      setMaintenances(maintenanceData);
      setFilteredMaintenances(maintenanceData);

      // Resetear filtros al cambiar de pestaña
      setSearchTerm("");
      setStatusFilter("all");
      setFacilityFilter("all");
    } catch (error) {
      console.error("Error loading maintenance data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de mantenimiento.",
        variant: "destructive"
      });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }

  // Cargar las instalaciones
  const loadFacilities = async () => {
    try {
      const resFacilities = await fetch(`${API_BASE_URL}/instalaciones`)
      if (!resFacilities.ok) {
        throw new Error(`Error al cargar instalaciones: ${resFacilities.status}`)
      }
      const facilitiesData = await resFacilities.json()
      setFacilities(facilitiesData)
    } catch (error) {
      console.error("Error loading facilities:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las instalaciones.",
        variant: "destructive"
      })
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadFacilities()
    loadMaintenanceData()
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
      // Buscar por el ID de la instalación en el nombre de la instalación
      // Ya que el backend devuelve el nombre pero no el ID directamente
      const facilityId = Number.parseInt(facilityFilter);
      const facility = facilities.find(f => f.id === facilityId);

      if (facility) {
        result = result.filter((m) =>
          m.instalacionNombre === facility.nombre
        );
      }
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
        // Si el mantenimiento tiene un estado explícito en el backend
        if (status && typeof status === 'object' && status.estado) {
          switch (status.estado) {
            case "programado":
              return <Badge className="bg-yellow-100 text-yellow-800">Programado</Badge>
            case "en-progreso":
              return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
            case "completado":
              return <Badge className="bg-green-100 text-green-800">Completado</Badge>
            case "cancelado":
              return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
            default:
              return null
          }
        }
        return null
    }
  }

  const handleDelete = (m) => {
    setSelectedMaintenance(m);
    setShowDeleteDialog(true);
  }

  const handleCancelMaintenance = (m) => {
    setSelectedMaintenance(m);
    setShowCancelDialog(true);
  }

  const confirmCancelMaintenance = async () => {
    if (!selectedMaintenance) return;

    try {
      // Aquí se debe implementar la lógica para cambiar el estado a "cancelled"
      const res = await fetch(`${API_BASE_URL}/mantenimientos/${selectedMaintenance.id}/cancelar`, {
        method: "PUT"
      });

      if (res.ok) {
        // Cerrar el diálogo primero
        setShowCancelDialog(false);

        // Cambiar a la pestaña de historial para mostrar el mantenimiento cancelado
        setActiveTab("historial");

        // Actualizar la lista de mantenimientos después de cancelar
        // Usar un timeout más largo para asegurar que la pestaña cambie primero
        setTimeout(() => {
          loadMaintenanceData("historial");

          // Mostrar el toast después de que los datos se hayan cargado
          toast({
            title: "Mantenimiento cancelado",
            description: `Se canceló correctamente el mantenimiento de "${selectedMaintenance.instalacionNombre}". Se ha movido al historial.`,
          });
        }, 300);
      } else {
        toast({
          title: "Error al cancelar",
          description: "No se pudo cancelar el mantenimiento.",
          variant: "destructive"
        });
        setShowCancelDialog(false);
      }
    } catch (err) {
      console.error("Error al cancelar:", err);
      toast({
        title: "Error de red",
        description: "Hubo un problema al conectarse con el servidor.",
        variant: "destructive"
      });
      setShowCancelDialog(false);
    } finally {
      setSelectedMaintenance(null);
    }
  }

  const handleDeleteMaintenance = async (m) => {
    try {
      const res = await fetch(`${API_BASE_URL}/mantenimientos/${m.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        // Actualizar la lista de mantenimientos después de eliminar
        loadMaintenanceData()

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
    } finally {
      setShowDeleteDialog(false);
      setSelectedMaintenance(null);
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
      {/* Diálogo de confirmación para cancelar mantenimiento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar mantenimiento</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div className="flex items-center space-x-2 text-amber-600 mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Esta acción cambiará el estado del mantenimiento a "Cancelado".</span>
                </div>
                {selectedMaintenance && (
                  <div className="mt-2">
                    ¿Estás seguro de que deseas cancelar el mantenimiento programado para{" "}
                    <strong>{selectedMaintenance.instalacionNombre}</strong>?
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelMaintenance} className="bg-red-600 hover:bg-red-700">
              Sí, cancelar mantenimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminar mantenimiento */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mantenimiento</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Esta acción eliminará permanentemente el registro de mantenimiento.</span>
                </div>
                {selectedMaintenance && (
                  <div className="mt-2">
                    ¿Estás seguro de que deseas eliminar el mantenimiento de{" "}
                    <strong>{selectedMaintenance.instalacionNombre}</strong>?
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMaintenance && handleDeleteMaintenance(selectedMaintenance)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
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
      <Tabs
        defaultValue="activos"
        className="w-full"
        value={activeTab}
        onValueChange={(value) => {
          // Primero actualizamos la pestaña activa para una respuesta inmediata en la UI
          setActiveTab(value)
          // Luego cargamos los datos en segundo plano
          setTimeout(() => loadMaintenanceData(value), 0)
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDelete}
            handleCancelMaintenance={handleCancelMaintenance}
            activeTab={activeTab}
          />
        </TabsContent>

        <TabsContent value="programados" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDelete}
            handleCancelMaintenance={handleCancelMaintenance}
            activeTab={activeTab}
          />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <MaintenanceTable
            maintenances={filteredMaintenances}
            getMaintenanceStatus={getMaintenanceStatus}
            getStatusBadge={getStatusBadge}
            handleDelete={handleDelete}
            handleCancelMaintenance={handleCancelMaintenance}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Tabla
function MaintenanceTable({ maintenances, getMaintenanceStatus, getStatusBadge, handleDelete, handleCancelMaintenance, activeTab }) {
  if (maintenances.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-md shadow">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mt-6" />
        <h3 className="mt-4 text-lg font-medium">No hay mantenimientos</h3>
        <p className="mt-2 text-gray-500 mb-6">No hay datos disponibles para esta sección.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md bg-white shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-medium">Instalación</th>
            <th className="text-left py-3 px-4 font-medium">Descripción</th>
            <th className="text-left py-3 px-4 font-medium">Fechas</th>
            <th className="text-left py-3 px-4 font-medium">Estado</th>
            <th className="text-left py-3 px-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maintenances.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{m.instalacionNombre}</td>
              <td className="py-3 px-4">{m.descripcion}</td>
              <td className="py-3 px-4">
                {(() => {
                  // Ajustar las fechas para manejar correctamente la zona horaria
                  const inicio = new Date(m.fechaInicio);
                  const fin = new Date(m.fechaFin);

                  // Ajustar por la zona horaria local para evitar problemas con las horas
                  const offsetInicio = inicio.getTimezoneOffset() * 60000;
                  const offsetFin = fin.getTimezoneOffset() * 60000;

                  const inicioLocal = new Date(inicio.getTime() - offsetInicio);
                  const finLocal = new Date(fin.getTime() - offsetFin);

                  return `${format(inicioLocal, "dd/MM/yyyy", { locale: es })} - ${format(finLocal, "dd/MM/yyyy", { locale: es })}`;
                })()}
              </td>
              <td className="py-3 px-4">{getStatusBadge(getMaintenanceStatus(m))}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Link href={`/admin/instalaciones/mantenimiento/${m.id}`}>
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => activeTab === "historial" ? handleDelete(m) : handleCancelMaintenance(m)}
                  >
                    {activeTab === "historial" ? "Eliminar" : "Cancelar"}
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
