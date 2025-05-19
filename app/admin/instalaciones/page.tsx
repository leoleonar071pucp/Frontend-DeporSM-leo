"use client"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Trash2, AlertTriangle, Filter } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  id: number
  nombre: string
  descripcion: string
  ubicacion: string
  tipo: string
  capacidad: number
  horarioApertura: string
  horarioCierre: string
  imagenUrl: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export default function InstalacionesAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string | null>(null)

  // Fetch all facilities
  const fetchFacilities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/instalaciones`)
      const data: Facility[] = await response.json()
      setFacilities(data)
      setFilteredFacilities(data)
    } catch (error) {
      console.error("Error fetching facilities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Aplicar filtros localmente sin hacer peticiones adicionales al servidor
  const applyFilters = () => {
    let result = [...facilities];

    // Filtrar por estado (activo/inactivo)
    if (activeTab === "disponibles") {
      result = result.filter(facility => facility.activo);
    } else if (activeTab === "mantenimiento") {
      result = result.filter(facility => !facility.activo);
    }

    // Filtrar por tipo
    if (currentFilter) {
      result = result.filter(facility => facility.tipo === currentFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim() !== "") {
      result = result.filter(facility =>
        facility.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFacilities(result);
  }

  // Aplicar filtros cuando cambie cualquier criterio de filtrado
  useEffect(() => {
    if (facilities.length > 0) {
      applyFilters();
    }
  }, [searchQuery, activeTab, currentFilter, facilities]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchFacilities()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // No es necesario hacer nada aquí, ya que el efecto se encargará de aplicar los filtros
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // No es necesario hacer peticiones al servidor, los filtros se aplicarán automáticamente
  }

  const handleTypeFilterClick = (type: string | null) => {
    setCurrentFilter(type)
    // No es necesario hacer peticiones al servidor, los filtros se aplicarán automáticamente
  }

  const handleDeleteClick = (facility: Facility) => {
    setFacilityToDelete(facility)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!facilityToDelete) return
    try {
      const response = await fetch(`${API_BASE_URL}/instalaciones/${facilityToDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFacilities((prev) => prev.filter((f) => f.id !== facilityToDelete.id))
        setShowDeleteDialog(false)
        setFacilityToDelete(null)
      } else {
        console.error("Error deleting facility")
      }
    } catch (error) {
      console.error("Error deleting facility:", error)
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
          <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  // Los filtros se aplicarán automáticamente por el useEffect
                }}
              />
            </div>

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
                <DropdownMenuItem onSelect={() => handleTypeFilterClick(null)}>Todas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Piscina")}>Piscinas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Cancha")}>Canchas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Gimnasio")}>Gimnasios</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
          <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={facility.imagenUrl || "/placeholder.svg"}
                      alt={facility.imagenUrl}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={facility.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {facility.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{facility.nombre}</CardTitle>
                    <CardDescription>{facility.ubicacion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{facility.descripcion}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/instalaciones/${facility.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(facility)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron instalaciones</h3>
              <p className="text-gray-500 mt-2">No hay instalaciones que coincidan con los criterios de búsqueda.</p>
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
              ¿Estás seguro de que deseas eliminar la instalación "{facilityToDelete?.nombre}"? Esta acción no se puede
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