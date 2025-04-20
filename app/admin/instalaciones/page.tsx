"use client"

import React, { useState, useEffect } from "react" // Importar React
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Trash2, AlertTriangle, Filter, Settings } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Asegurarse que DialogTrigger esté importado
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Interfaz para Instalación ---
interface Facility {
  id: number;
  name: string;
  type: string; // Podría ser un tipo union si los tipos son fijos: 'piscina' | 'cancha-futbol-grass' | ...
  location: string;
  status: "disponible" | "mantenimiento"; // Tipos definidos
  maintenanceStatus: "none" | "required" | "scheduled" | "in-progress"; // Tipos definidos
  lastMaintenance: string | null; // O Date si se prefiere
  nextMaintenance: string | null; // O Date
  capacity: number;
  price: string;
  contactNumber: string;
  image: string;
}

// Datos de ejemplo para las instalaciones (tipados con Facility)
const facilitiesData: Facility[] = [
  { id: 1, name: "Piscina Municipal", type: "piscina", location: "Complejo Deportivo Municipal", status: "disponible", maintenanceStatus: "none", lastMaintenance: "15/03/2025", nextMaintenance: null, capacity: 30, price: "S/. 15.00 por hora", contactNumber: "987-654-321", image: "/placeholder.svg?height=200&width=300" },
  { id: 2, name: "Cancha de Fútbol (Grass)", type: "cancha-futbol-grass", location: "Parque Juan Pablo II", status: "disponible", maintenanceStatus: "scheduled", lastMaintenance: "10/03/2025", nextMaintenance: "10/04/2025", capacity: 22, price: "S/. 120.00 por hora", contactNumber: "987-654-322", image: "/placeholder.svg?height=200&width=300" },
  { id: 3, name: "Gimnasio Municipal", type: "gimnasio", location: "Complejo Deportivo Municipal", status: "disponible", maintenanceStatus: "none", lastMaintenance: "05/03/2025", nextMaintenance: null, capacity: 50, price: "S/. 20.00 por día", contactNumber: "987-654-323", image: "/placeholder.svg?height=200&width=300" },
  { id: 4, name: "Cancha de Fútbol (Loza)", type: "cancha-futbol-loza", location: "Parque Simón Bolívar", status: "mantenimiento", maintenanceStatus: "in-progress", lastMaintenance: "01/03/2025", nextMaintenance: "08/04/2025", capacity: 14, price: "S/. 80.00 por hora", contactNumber: "987-654-324", image: "/placeholder.svg?height=200&width=300" },
  { id: 5, name: "Pista de Atletismo", type: "pista-atletismo", location: "Complejo Deportivo Municipal", status: "disponible", maintenanceStatus: "required", lastMaintenance: "20/02/2025", nextMaintenance: null, capacity: 30, price: "S/. 10.00 por hora", contactNumber: "987-654-325", image: "/placeholder.svg?height=200&width=300" },
]

export default function InstalacionesAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState<Facility[]>([]) // Tipar estado
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null) // Tipar estado

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFacilities(facilitiesData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Función para filtrar (combinando búsqueda y tabs de estado)
  const filterAndSearchFacilities = (tab: string, query: string) => {
    let filtered = facilitiesData;

    // Filtrar por estado (Tabs)
    if (tab === "disponibles") {
      filtered = filtered.filter((f) => f.status === "disponible");
    } else if (tab === "mantenimiento") {
      filtered = filtered.filter((f) => f.status === "mantenimiento" || f.maintenanceStatus !== "none");
    }
    // Si es "todas", no se filtra por estado

    // Filtrar por búsqueda
    if (query.trim() !== "") {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (facility: Facility) => // Tipar facility
          facility.name.toLowerCase().includes(lowerQuery) ||
          facility.type.toLowerCase().includes(lowerQuery) ||
          facility.location.toLowerCase().includes(lowerQuery)
      );
    }
    setFacilities(filtered);
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterAndSearchFacilities(activeTab, searchQuery); // Usar función combinada
  }

  // Manejar cambio de pestaña (solo actualiza el estado activo)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterAndSearchFacilities(value, searchQuery); // Filtrar al cambiar tab
  }

   // Manejar clic en filtro de tipo (Dropdown)
   const handleTypeFilterClick = (typeFilter: string | null) => {
     let filtered = facilitiesData;
     if (typeFilter) {
         filtered = facilitiesData.filter((f) => f.type.includes(typeFilter));
     }
     // Aplicar también el filtro de estado actual y búsqueda
     const currentQuery = searchQuery;
     const currentStatusTab = activeTab;

     if (currentStatusTab === "disponibles") {
        filtered = filtered.filter((f) => f.status === "disponible");
     } else if (currentStatusTab === "mantenimiento") {
        filtered = filtered.filter((f) => f.status === "mantenimiento" || f.maintenanceStatus !== "none");
     }

     if (currentQuery.trim() !== "") {
        const lowerQuery = currentQuery.toLowerCase();
        filtered = filtered.filter(
            (facility: Facility) =>
            facility.name.toLowerCase().includes(lowerQuery) ||
            facility.type.toLowerCase().includes(lowerQuery) ||
            facility.location.toLowerCase().includes(lowerQuery)
        );
     }

     setFacilities(filtered);
   }


  const handleDeleteClick = (facility: Facility) => { // Tipar facility
    setFacilityToDelete(facility)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!facilityToDelete) return; // Comprobación de nulidad
    // En un caso real, aquí se haría la llamada a la API para eliminar la instalación
    setFacilities(prevFacilities => prevFacilities.filter((f) => f.id !== facilityToDelete.id)) // Usar callback para seguridad
    setShowDeleteDialog(false)
    setFacilityToDelete(null)
  }

  const getMaintenanceStatusBadge = (status: Facility['maintenanceStatus']) => { // Tipar status
    switch (status) {
      case "none":
        return null
      case "required":
        return <Badge className="bg-red-100 text-red-800">Requiere mantenimiento</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: Facility['status'], maintenanceStatus: Facility['maintenanceStatus']) => {
    // No mostrar badge de "En mantenimiento" si ya hay un estado de mantenimiento específico
    if (maintenanceStatus === "required" || maintenanceStatus === "scheduled") {
      return status === "disponible" ? <Badge className="bg-green-100 text-green-800">Disponible</Badge> : null;
    }

    switch (status) {
      case "disponible":
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case "mantenimiento":
        return <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>
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
          <h1 className="text-2xl font-bold tracking-tight">Instalaciones Deportivas</h1>
          <p className="text-muted-foreground">Gestiona todas las instalaciones deportivas del distrito</p>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/admin/instalaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Instalación
          </Link>
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, tipo o ubicación..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} // Tipar evento
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
                  Filtrar por Tipo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Usar handleTypeFilterClick */}
                <DropdownMenuItem onSelect={() => handleTypeFilterClick(null)}>Todas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("piscina")}>Piscinas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("cancha-futbol")}>Canchas de fútbol</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("gimnasio")}>Gimnasio</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("pista-atletismo")}>Pista de atletismo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas de Estado */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
          <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
        </TabsList>

        {/* Contenido de las Pestañas (Renderiza la lista filtrada) */}
        <TabsContent value={activeTab} className="mt-4">
          {facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility: Facility) => ( // Tipar facility
                <Card key={facility.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={facility.image || "/placeholder.svg"}
                      alt={facility.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(facility.status, facility.maintenanceStatus)}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{facility.name}</CardTitle>
                    <CardDescription>{facility.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tipo:</span>
                        <span className="text-sm font-medium">{facility.type.replace(/-/g, " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Capacidad:</span>
                        <span className="text-sm font-medium">{facility.capacity} personas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Precio:</span>
                        <span className="text-sm font-medium">{facility.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Contacto:</span>
                        <span className="text-sm font-medium">{facility.contactNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Último mantenimiento:</span>
                        <span className="text-sm font-medium">{facility.lastMaintenance || 'N/A'}</span>
                      </div>
                      {facility.nextMaintenance && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Próximo mantenimiento:</span>
                          <span className="text-sm font-medium">{facility.nextMaintenance}</span>
                        </div>
                      )}
                      {getMaintenanceStatusBadge(facility.maintenanceStatus) && (
                        <div className="flex justify-end mt-2">
                          {getMaintenanceStatusBadge(facility.maintenanceStatus)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/instalaciones/${facility.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Detalle
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      {facility.maintenanceStatus !== 'scheduled' && facility.maintenanceStatus !== 'in-progress' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/instalaciones/${facility.id}/mantenimiento`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Mantenimiento
                          </Link>
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(facility)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron instalaciones</h3>
              <p className="text-gray-500 mt-2">No hay instalaciones que coincidan con los criterios de búsqueda o filtros aplicados.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setActiveTab("todas") // Resetear tab también
                  setFacilities(facilitiesData) // Resetear a datos originales
                }}
              >
                Limpiar filtros y búsqueda
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la instalación "{facilityToDelete?.name}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
