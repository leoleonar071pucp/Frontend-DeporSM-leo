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
  requiereMantenimiento?: boolean
  enMantenimiento?: boolean
  tieneMantenimientoProgramado?: boolean
  createdAt: string
  updatedAt: string
}

// Mapeo entre los valores de visualización y los valores de almacenamiento
const typeMapping = {
  "Piscina": ["piscina"],
  "Cancha de Fútbol (Grass)": ["cancha-futbol-grass", "cancha de fútbol (grass)"],
  "Cancha de Fútbol (Loza)": ["cancha-futbol-loza", "cancha de fútbol (loza)"],
  "Gimnasio": ["gimnasio"],
  "Pista de Atletismo": ["pista-atletismo", "pista de atletismo"]
};

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

      console.log("Obteniendo información de mantenimiento para", data.length, "instalaciones");

      // Obtener información de mantenimiento para cada instalación
      const facilitiesWithMaintenance = await Promise.all(
        data.map(async (facility) => {
          try {
            // Verificar si la instalación está en mantenimiento
            const maintenanceResponse = await fetch(`${API_BASE_URL}/mantenimientos/instalacion/${facility.id}`)
            let enMantenimiento = false;
            let tieneMantenimientoProgramado = false;

            if (maintenanceResponse.ok) {
              const maintenanceData = await maintenanceResponse.json()

              // Asegurarse de que el valor sea un booleano
              enMantenimiento = maintenanceData.enMantenimiento === true;

              // Verificar si tiene mantenimiento programado
              tieneMantenimientoProgramado = maintenanceData.tieneMantenimientoProgramado === true;

              // Mostrar en consola para depuración
              console.log(`Instalación ${facility.id} - ${facility.nombre} - Estado de mantenimiento:`, {
                respuesta: maintenanceData,
                enMantenimiento,
                tieneMantenimientoProgramado
              });
            }

            // Verificar si la instalación requiere mantenimiento
            const requiresMaintenanceResponse = await fetch(`${API_BASE_URL}/observaciones/instalacion/${facility.id}/requiere-mantenimiento`)
            let requiereMantenimiento = false;

            if (requiresMaintenanceResponse.ok) {
              const requiresMaintenanceData = await requiresMaintenanceResponse.json()

              // Asegurarse de que el valor sea un booleano
              requiereMantenimiento = requiresMaintenanceData.requiereMantenimiento === true;

              // Mostrar en consola para depuración
              console.log(`Instalación ${facility.id} - ${facility.nombre} - Requiere mantenimiento:`, {
                respuesta: requiresMaintenanceData,
                valorFinal: requiereMantenimiento
              });
            } else {
              console.error(`Error al obtener estado de mantenimiento para instalación ${facility.id}: ${requiresMaintenanceResponse.status}`);
            }

            // Prioridad de estados:
            // 1. Si está en mantenimiento, ese es el estado principal
            // 2. Si tiene mantenimiento programado, ese es el estado principal
            // 3. Si requiere mantenimiento, ese es el estado principal
            if (enMantenimiento) {
              requiereMantenimiento = false;
              tieneMantenimientoProgramado = false;
            } else if (tieneMantenimientoProgramado) {
              requiereMantenimiento = false;
            }

            // Crear objeto con la información actualizada
            const updatedFacility = {
              ...facility,
              enMantenimiento,
              tieneMantenimientoProgramado,
              requiereMantenimiento
            };

            // Mostrar en consola para depuración si tiene algún estado de mantenimiento
            if (enMantenimiento || tieneMantenimientoProgramado || requiereMantenimiento) {
              console.log(`Estado final de instalación ${facility.id} - ${facility.nombre}:`, {
                enMantenimiento: updatedFacility.enMantenimiento,
                tieneMantenimientoProgramado: updatedFacility.tieneMantenimientoProgramado,
                requiereMantenimiento: updatedFacility.requiereMantenimiento,
                activo: updatedFacility.activo
              });
            }

            return updatedFacility;
          } catch (error) {
            console.error(`Error fetching maintenance for facility ${facility.id}:`, error)
            return facility
          }
        })
      )

      console.log("Total de instalaciones procesadas:", facilitiesWithMaintenance.length);

      // Contar instalaciones por estado para depuración
      const enMantenimientoCount = facilitiesWithMaintenance.filter(f => f.enMantenimiento).length;
      const tieneMantenimientoProgramadoCount = facilitiesWithMaintenance.filter(f => f.tieneMantenimientoProgramado).length;
      const requiereMantenimientoCount = facilitiesWithMaintenance.filter(f => f.requiereMantenimiento).length;
      const activasCount = facilitiesWithMaintenance.filter(f => f.activo).length;

      console.log("Resumen de estados:", {
        enMantenimiento: enMantenimientoCount,
        tieneMantenimientoProgramado: tieneMantenimientoProgramadoCount,
        requiereMantenimiento: requiereMantenimientoCount,
        activas: activasCount
      });

      // Mostrar IDs de instalaciones en mantenimiento para depuración
      if (enMantenimientoCount > 0) {
        console.log("Instalaciones en mantenimiento:",
          facilitiesWithMaintenance
            .filter(f => f.enMantenimiento)
            .map(f => `${f.id} - ${f.nombre}`)
        );
      }

      // Mostrar IDs de instalaciones con mantenimiento programado para depuración
      if (tieneMantenimientoProgramadoCount > 0) {
        console.log("Instalaciones con mantenimiento programado:",
          facilitiesWithMaintenance
            .filter(f => f.tieneMantenimientoProgramado)
            .map(f => `${f.id} - ${f.nombre}`)
        );
      }

      // Mostrar IDs de instalaciones que requieren mantenimiento para depuración
      if (requiereMantenimientoCount > 0) {
        console.log("Instalaciones que requieren mantenimiento:",
          facilitiesWithMaintenance
            .filter(f => f.requiereMantenimiento)
            .map(f => `${f.id} - ${f.nombre}`)
        );
      }

      setFacilities(facilitiesWithMaintenance)
      setFilteredFacilities(facilitiesWithMaintenance)
    } catch (error) {
      console.error("Error fetching facilities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch facilities in maintenance
  const fetchFacilitiesInMaintenance = async () => {
    setIsLoading(true)
    try {
      // Crear un array para almacenar todas las instalaciones relacionadas con mantenimiento
      let allMaintenanceFacilities: Facility[] = [];

      // 1. Obtener instalaciones en mantenimiento activo
      const inMaintenanceResponse = await fetch(`${API_BASE_URL}/instalaciones/en-mantenimiento`)
      if (inMaintenanceResponse.ok) {
        const inMaintenanceData: Facility[] = await inMaintenanceResponse.json()
        console.log("Instalaciones en mantenimiento:", inMaintenanceData);

        // Marcar estas instalaciones como en mantenimiento (prioridad más alta)
        const facilitiesInMaintenance = inMaintenanceData.map(facility => ({
          ...facility,
          enMantenimiento: true,
          tieneMantenimientoProgramado: false, // Si ya está en mantenimiento, no tiene mantenimiento programado
          requiereMantenimiento: false // Si ya está en mantenimiento, no requiere mantenimiento
        }))

        // Agregar al array combinado
        allMaintenanceFacilities = [...facilitiesInMaintenance];
      }

      // 2. Obtener todas las instalaciones para filtrar las que requieren mantenimiento
      const allFacilitiesResponse = await fetch(`${API_BASE_URL}/instalaciones`)
      if (allFacilitiesResponse.ok) {
        const allFacilitiesData: Facility[] = await allFacilitiesResponse.json()

        // Filtrar instalaciones que requieren mantenimiento
        const requiresMaintenanceFacilities = await Promise.all(
          allFacilitiesData.map(async (facility) => {
            try {
              // Verificar si la instalación requiere mantenimiento
              const requiresMaintenanceResponse = await fetch(`${API_BASE_URL}/observaciones/instalacion/${facility.id}/requiere-mantenimiento`)
              let requiereMantenimiento = false;

              if (requiresMaintenanceResponse.ok) {
                const requiresMaintenanceData = await requiresMaintenanceResponse.json()
                requiereMantenimiento = requiresMaintenanceData.requiereMantenimiento === true;
              }

              // Verificar si la instalación tiene mantenimiento programado
              const maintenanceResponse = await fetch(`${API_BASE_URL}/mantenimientos/instalacion/${facility.id}`)
              let tieneMantenimientoProgramado = false;

              if (maintenanceResponse.ok) {
                const maintenanceData = await maintenanceResponse.json()
                tieneMantenimientoProgramado = maintenanceData.tieneMantenimientoProgramado === true;
              }

              // Si tiene algún estado de mantenimiento, incluirla
              if (requiereMantenimiento || tieneMantenimientoProgramado) {
                console.log(`Instalación ${facility.id} - ${facility.nombre} - Estados:`, {
                  requiereMantenimiento,
                  tieneMantenimientoProgramado
                });

                return {
                  ...facility,
                  requiereMantenimiento,
                  tieneMantenimientoProgramado,
                  enMantenimiento: false
                };
              }
              return null;
            } catch (error) {
              console.error(`Error verificando mantenimiento para instalación ${facility.id}:`, error);
              return null;
            }
          })
        );

        // Filtrar resultados nulos y las instalaciones que ya están en mantenimiento
        const validRequiresMaintenanceFacilities = requiresMaintenanceFacilities
          .filter(facility => facility !== null)
          .filter(facility => !allMaintenanceFacilities.some(f => f.id === facility?.id));

        // Agregar al array combinado
        allMaintenanceFacilities = [...allMaintenanceFacilities, ...validRequiresMaintenanceFacilities as Facility[]];
      }

      // Establecer el resultado final
      console.log("Total de instalaciones en pestaña mantenimiento:", allMaintenanceFacilities.length);
      setFilteredFacilities(allMaintenanceFacilities)

      // Si no se encontraron instalaciones, mostrar mensaje
      if (allMaintenanceFacilities.length === 0) {
        console.log("No se encontraron instalaciones en mantenimiento o que requieran mantenimiento");
      }
    } catch (error) {
      console.error("Error fetching facilities in maintenance:", error)
      setFilteredFacilities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Aplicar filtros localmente sin hacer peticiones adicionales al servidor
  const applyFilters = () => {
    let result = [...facilities];

    // Mostrar todos los tipos disponibles para depuración
    console.log('Todos los tipos disponibles:', [...new Set(facilities.map(f => f.tipo))]);

    // Filtrar por estado (activo/inactivo)
    if (activeTab === "disponibles") {
      // Filtrar instalaciones activas que NO requieren mantenimiento, NO tienen mantenimiento programado y NO están en mantenimiento
      result = result.filter(facility =>
        facility.activo &&
        !facility.requiereMantenimiento &&
        !facility.tieneMantenimientoProgramado &&
        !facility.enMantenimiento
      );
      console.log("Instalaciones disponibles (activas y sin mantenimiento):", result.length);
    }
    // Para la pestaña de mantenimiento, usamos el endpoint específico en handleTabChange

    // Filtrar por tipo
    if (currentFilter) {
      // Mostrar en consola para depuración
      console.log(`Filtrando por tipo: "${currentFilter}"`);

      result = result.filter(facility => {
        if (!facility.tipo) return false;

        // Obtener los posibles valores de almacenamiento para el tipo seleccionado
        const possibleValues = typeMapping[currentFilter as keyof typeof typeMapping] || [];

        // Verificar si el tipo de la instalación coincide con alguno de los posibles valores
        const matchByMapping = possibleValues.some(value =>
          facility.tipo.toLowerCase() === value.toLowerCase() ||
          facility.tipo.toLowerCase().includes(value.toLowerCase())
        );

        // También verificar si hay una coincidencia directa o por inclusión
        const directMatch = facility.tipo.toLowerCase() === currentFilter.toLowerCase();
        const includesMatch = facility.tipo.toLowerCase().includes(currentFilter.toLowerCase());

        const match = matchByMapping || directMatch || includesMatch;

        console.log(`Comparando: "${facility.tipo}" con "${currentFilter}" - Resultado: ${match}`);
        console.log(`  - Por mapeo: ${matchByMapping}`);
        console.log(`  - Coincidencia directa: ${directMatch}`);
        console.log(`  - Inclusión: ${includesMatch}`);

        return match;
      });

      console.log(`Instalaciones encontradas: ${result.length}`);
      if (result.length === 0) {
        console.log('Tipos disponibles:', [...new Set(facilities.map(f => f.tipo))]);
      }
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
      if (activeTab === "mantenimiento") {
        // Para la pestaña de mantenimiento, volver a aplicar el filtro de mantenimiento
        // cuando cambie la búsqueda o el filtro de tipo
        filterMaintenanceFacilities();
      } else {
        // Para las otras pestañas, aplicar filtros normalmente
        applyFilters();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentFilter, facilities, activeTab]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchFacilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La función handleSearch ya no es necesaria porque los filtros se aplican automáticamente

  // Función para filtrar instalaciones en mantenimiento
  const filterMaintenanceFacilities = () => {
    console.log("Filtrando instalaciones en mantenimiento");

    // Filtrar instalaciones que están en mantenimiento, tienen mantenimiento programado o requieren mantenimiento
    let maintenanceFacilities = facilities.filter(facility => {
      const isInMaintenance = facility.enMantenimiento === true;
      const hasScheduledMaintenance = facility.tieneMantenimientoProgramado === true;
      const requiresMaintenance = facility.requiereMantenimiento === true;
      const shouldInclude = isInMaintenance || hasScheduledMaintenance || requiresMaintenance;

      // Mostrar en consola para depuración
      console.log(`Evaluando instalación ${facility.id} - ${facility.nombre}:`, {
        enMantenimiento: isInMaintenance,
        tieneMantenimientoProgramado: hasScheduledMaintenance,
        requiereMantenimiento: requiresMaintenance,
        incluir: shouldInclude
      });

      return shouldInclude;
    });

    // Aplicar filtro de búsqueda si existe
    if (searchQuery.trim() !== "") {
      maintenanceFacilities = maintenanceFacilities.filter(facility =>
        facility.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(`Aplicando filtro de búsqueda "${searchQuery}" - Resultados: ${maintenanceFacilities.length}`);
    }

    // Aplicar filtro de tipo si existe
    if (currentFilter) {
      maintenanceFacilities = maintenanceFacilities.filter(facility => {
        if (!facility.tipo) return false;

        // Obtener los posibles valores de almacenamiento para el tipo seleccionado
        const possibleValues = typeMapping[currentFilter as keyof typeof typeMapping] || [];

        // Verificar si el tipo de la instalación coincide con alguno de los posibles valores
        const matchByMapping = possibleValues.some(value =>
          facility.tipo.toLowerCase() === value.toLowerCase() ||
          facility.tipo.toLowerCase().includes(value.toLowerCase())
        );

        // También verificar si hay una coincidencia directa o por inclusión
        const directMatch = facility.tipo.toLowerCase() === currentFilter.toLowerCase();
        const includesMatch = facility.tipo.toLowerCase().includes(currentFilter.toLowerCase());

        return matchByMapping || directMatch || includesMatch;
      });
      console.log(`Aplicando filtro de tipo "${currentFilter}" - Resultados: ${maintenanceFacilities.length}`);
    }

    console.log("Instalaciones filtradas para pestaña mantenimiento:", maintenanceFacilities.length);
    if (maintenanceFacilities.length > 0) {
      console.log("Instalaciones incluidas en pestaña mantenimiento:",
        maintenanceFacilities.map(f => {
          if (f.enMantenimiento) return `${f.id} - ${f.nombre} (En Mantenimiento)`;
          if (f.tieneMantenimientoProgramado) return `${f.id} - ${f.nombre} (Mantenimiento programado)`;
          if (f.requiereMantenimiento) return `${f.id} - ${f.nombre} (Requiere Mantenimiento)`;
          return `${f.id} - ${f.nombre} (Estado desconocido)`;
        }));
    } else {
      console.log("No se encontraron instalaciones que requieran mantenimiento o estén en mantenimiento");
    }

    // Verificar si hay instalaciones que deberían estar en mantenimiento pero no lo están
    const shouldBeInMaintenance = facilities.filter(f =>
      (f.enMantenimiento || f.tieneMantenimientoProgramado || f.requiereMantenimiento) &&
      !maintenanceFacilities.some(mf => mf.id === f.id)
    );

    if (shouldBeInMaintenance.length > 0) {
      console.error("Instalaciones que deberían estar en mantenimiento pero no se incluyeron:",
        shouldBeInMaintenance.map(f => `${f.id} - ${f.nombre}`));
    }

    setFilteredFacilities(maintenanceFacilities);
  }

  // Función para manejar el cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Para la pestaña de mantenimiento, filtrar localmente las instalaciones que requieren mantenimiento
    if (value === "mantenimiento") {
      filterMaintenanceFacilities();
    } else {
      // Para las otras pestañas, aplicar filtros localmente
      applyFilters()
    }
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
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Piscina")}>Piscina</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Cancha de Fútbol (Grass)")}>Cancha de Fútbol (Grass)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Cancha de Fútbol (Losa)")}>Cancha de Fútbol (Losa)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Gimnasio")}>Gimnasio</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleTypeFilterClick("Pista de Atletismo")}>Pista de Atletismo</DropdownMenuItem>
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
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {/* Lógica de prioridad para mostrar un solo badge:
                          1. Si está en mantenimiento, mostrar "En Mantenimiento"
                          2. Si requiere mantenimiento, mostrar "Requiere Mantenimiento"
                          3. Si no, mostrar "Activo" o "Inactivo" según corresponda */}
                      {(() => {
                        // Mostrar en consola el estado de la instalación para depuración
                        console.log(`Renderizando instalación ${facility.id} - ${facility.nombre}:`, {
                          enMantenimiento: facility.enMantenimiento,
                          requiereMantenimiento: facility.requiereMantenimiento,
                          activo: facility.activo
                        });

                        // Lógica de prioridad para mostrar un solo badge:
                        // 1. Si está en mantenimiento, mostrar "En Mantenimiento"
                        // 2. Si tiene mantenimiento programado, mostrar "Mantenimiento programado"
                        // 3. Si requiere mantenimiento, mostrar "Requiere Mantenimiento"
                        // 4. Si no, mostrar "Disponible" o "Inactivo" según corresponda
                        if (facility.enMantenimiento) {
                          return (
                            <Badge className="bg-blue-100 text-blue-800">
                              En Mantenimiento
                            </Badge>
                          );
                        } else if (facility.tieneMantenimientoProgramado) {
                          return (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Mantenimiento programado
                            </Badge>
                          );
                        } else if (facility.requiereMantenimiento) {
                          return (
                            <Badge
                              className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200"
                              onClick={() => {
                                setActiveTab("mantenimiento");
                                fetchFacilitiesInMaintenance();
                              }}
                            >
                              Requiere Mantenimiento
                            </Badge>
                          );
                        } else {
                          return (
                            <Badge className={facility.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {facility.activo ? "Disponible" : "Inactivo"}
                            </Badge>
                          );
                        }
                      })()}
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