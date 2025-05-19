"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura
import { useAuth } from "@/context/AuthContext";

// Eliminamos la importación de axios
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, AlertTriangle, Calendar, Clock, Filter } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Actualizamos la interfaz para que coincida con los datos del backend
interface Instalacion {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  capacidad: number;
  horario: string;
  imagenUrl: string;
  precio: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Propiedades adicionales para el frontend
  status?: 'disponible' | 'mantenimiento';
  maintenanceStatus?: 'none' | 'required' | 'scheduled' | 'in-progress';
  lastVisit?: string;
  nextVisit?: string;
  isToday?: boolean;
  observations?: number;
  pendingObservations?: number;
}

export default function InstalacionesCoordinador() {
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState<Instalacion[]>([]);
  const [originalFacilities, setOriginalFacilities] = useState<Instalacion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
    // Obtener el usuario del contexto de autenticación
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {

    const loadData = async () => {
      try {
        // Si no hay usuario autenticado o no es coordinador, no cargar datos
        if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
          console.log("No hay usuario coordinador autenticado");
          setFacilities([]);
          setOriginalFacilities([]);
          setIsLoading(false);
          return;
        }

        // Usar el endpoint específico para coordinadores que devuelve solo las instalaciones asignadas
        const response = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${user.id}`, {
          credentials: 'include', // Importante para enviar cookies de autenticación
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Obtener datos completos para cada instalación
        const detailedFacilities = await Promise.all(data.map(async (instalacionBasica: any) => {
          try {
            const detailResponse = await fetch(`${API_BASE_URL}/instalaciones/${instalacionBasica.id}`);

            if (!detailResponse.ok) {
              throw new Error(`Error al obtener detalles de instalación: ${detailResponse.status}`);
            }

            const detailData = await detailResponse.json();

            // Agregar propiedades adicionales para el frontend
            return {
              ...detailData,
              status: detailData.activo ? 'disponible' : 'mantenimiento',
              maintenanceStatus: detailData.activo ? 'none' : 'in-progress',
              lastVisit: "15/04/2023",
              nextVisit: "15/05/2023",
              isToday: Math.random() > 0.7, // Simulación para demo
              observations: Math.floor(Math.random() * 10),
              pendingObservations: Math.floor(Math.random() * 5),
            };
          } catch (error) {
            console.error(`Error al obtener detalles para instalación ${instalacionBasica.id}:`, error);
            // Devolver datos básicos en caso de error
            return {
              ...instalacionBasica,
              status: 'disponible',
              maintenanceStatus: 'none',
              lastVisit: "15/04/2023",
              nextVisit: "15/05/2023",
              isToday: false,
              observations: 0,
              pendingObservations: 0,
            };
          }
        }));

        setFacilities(detailedFacilities);
        setOriginalFacilities(detailedFacilities);
      } catch (error) {
        console.error("Error al cargar instalaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };    loadData();
  }, [user])
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim() === "") {
      // Si la búsqueda está vacía, restaurar datos originales
      setFacilities(originalFacilities);
      return;
    }

    setIsLoading(true);

    try {
      // Filtrar las instalaciones originales que ya están asignadas al coordinador
      // Esto garantiza que solo se busque entre las instalaciones que el coordinador tiene asignadas
      const filteredFacilities = originalFacilities.filter(
        facility => facility.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.tipo.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al buscar instalaciones:", error);
      // Si hay un error, mostrar un mensaje y mantener los datos actuales
    } finally {
      setIsLoading(false);
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "todas") {
      setFacilities(originalFacilities) // Resetear a todos los datos originales
    } else if (value === "hoy") {
      setFacilities(originalFacilities.filter((f) => f.isToday))
    } else if (value === "pendientes") {
      setFacilities(originalFacilities.filter((f) => f.pendingObservations && f.pendingObservations > 0))
    }
  }
    const handleFilterByType = async (tipo: string) => {
    setIsLoading(true);

    try {
      // Filtrar de las instalaciones originales que ya están asignadas al coordinador
      // Solo aquellas que coinciden con el tipo seleccionado
      const filteredFacilities = originalFacilities.filter(
        facility => facility.tipo.toLowerCase() === tipo.toLowerCase()
      );

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al filtrar instalaciones por tipo:", error);
    } finally {
      setIsLoading(false);
    }
  }
    const handleFilterByStatus = async (activo: boolean) => {
    setIsLoading(true);

    try {
      // Filtrar de las instalaciones originales que ya están asignadas al coordinador
      // Solo aquellas que coinciden con el estado activo seleccionado
      const filteredFacilities = originalFacilities.filter(
        facility => facility.activo === activo
      );

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al filtrar instalaciones por estado:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = (status: Instalacion['status'], maintenanceStatus: Instalacion['maintenanceStatus']) => {
    // Mostrar En Mantenimiento solo cuando está in-progress
    if (maintenanceStatus === "in-progress") {
      return <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>;
    }

    // En cualquier otro caso mostrar Disponible
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  }

  const getMaintenanceStatusBadge = (status: Instalacion['maintenanceStatus']) => {
    switch (status) {
      case "none":
        return null;
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
  if (authLoading || isLoading) {
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
          <h1 className="text-2xl font-bold tracking-tight">Instalaciones Asignadas</h1>
          <p className="text-muted-foreground">Gestiona las instalaciones deportivas a tu cargo</p>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href={selectedFacilityId ? `/coordinador/instalaciones/mapa?id=${selectedFacilityId}` : "/coordinador/instalaciones/mapa"}>
            <MapPin className="h-4 w-4 mr-2" />
            Ver en Mapa
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
              <DropdownMenuContent align="end">                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFacilities(originalFacilities)}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByStatus(true)}>
                  Disponibles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByStatus(false)}>
                  En mantenimiento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterByType("Cancha")}>
                  Canchas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("Piscina")}>
                  Piscinas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("Gimnasio")}>
                  Gimnasios
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="hoy">Visitas Hoy</TabsTrigger>
          <TabsTrigger value="pendientes">Observaciones Pendientes</TabsTrigger>
        </TabsList>        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card
                  key={facility.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${selectedFacilityId === facility.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedFacilityId(facility.id)}
                >
                  <div className="relative">
                    <img
                      src={facility.imagenUrl || "/placeholder.svg"}
                      alt={facility.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(facility.status, facility.maintenanceStatus)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{facility.nombre}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{facility.ubicacion}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">Última visita:</span>
                        </div>
                        <span className="text-sm font-medium">{facility.lastVisit}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Próxima visita:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {facility.isToday ? (
                            <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                          ) : (
                            facility.nextVisit
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <span className="text-sm">Observaciones:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {facility.pendingObservations && facility.pendingObservations > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {facility.pendingObservations} pendientes
                            </Badge>
                          ) : (
                            `${facility.observations} totales`
                          )}
                        </span>
                      </div>
                      {getMaintenanceStatusBadge(facility.maintenanceStatus) && (
                        <div className="flex justify-end mt-2">
                          {getMaintenanceStatusBadge(facility.maintenanceStatus)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/coordinador/instalaciones/${facility.id}`}>Ver Detalles</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                        <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>Reportar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>          ) : originalFacilities.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tienes instalaciones asignadas</h3>
              <p className="text-gray-500 mt-2">
                No hay instalaciones asignadas a tu cuenta de coordinador.
                Contacta con un administrador para solicitar acceso a instalaciones.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron instalaciones</h3>
              <p className="text-gray-500 mt-2">No hay instalaciones que coincidan con los criterios de búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {                  setSearchQuery("");
                  setActiveTab("todas");

                  const loadData = async () => {
                    try {
                      setIsLoading(true);
                        // Si no hay usuario autenticado o no es coordinador, no cargar datos
                      if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
                        console.log("No hay usuario coordinador autenticado");
                        setFacilities([]);
                        setOriginalFacilities([]);
                        setIsLoading(false);
                        return;
                      }

                      // Usar el endpoint específico para coordinadores
                      const response = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${user.id}`, {
                        credentials: 'include', // Importante para enviar cookies de autenticación// Importante para enviar cookies de autenticación
                      });

                      if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                      }

                      const data = await response.json();

                      // Obtener datos completos para cada instalación
                      const detailedFacilities = await Promise.all(data.map(async (instalacionBasica: any) => {
                        const detailResponse = await fetch(`${API_BASE_URL}/instalaciones/${instalacionBasica.id}`);

                        if (!detailResponse.ok) {
                          return {
                            ...instalacionBasica,
                            status: 'disponible',
                            maintenanceStatus: 'none',
                            lastVisit: "15/04/2023",
                            nextVisit: "15/05/2023",
                            isToday: false,
                            observations: 0,
                            pendingObservations: 0,
                          };
                        }

                        const detailData = await detailResponse.json();

                        return {
                          ...detailData,
                          status: detailData.activo ? 'disponible' : 'mantenimiento',
                          maintenanceStatus: detailData.activo ? 'none' : 'in-progress',
                          lastVisit: "15/04/2023",
                          nextVisit: "15/05/2023",
                          isToday: Math.random() > 0.7,
                          observations: Math.floor(Math.random() * 10),
                          pendingObservations: Math.floor(Math.random() * 5),
                        };
                      }));

                      setFacilities(detailedFacilities);
                      setOriginalFacilities(detailedFacilities);
                    } catch (error) {
                      console.error("Error al recargar instalaciones:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  };

                  loadAllData();
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}