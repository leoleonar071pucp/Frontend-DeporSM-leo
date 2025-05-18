"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, AlertTriangle, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormEvent } from "react"
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from '@/context/AuthContext';

type User = {
  id: string;
  [key: string]: any;
};

// Definimos la interfaz para un objeto de observación
interface Observation {
  id: number;
  facilityId: number;
  facilityName: string;
  description: string;
  status: string;
  date: string;
  createdAt: string;
  photos: string[];
  priority: string;
  completedAt?: string;
  feedback?: string;
  location: string; // Añadimos la ubicación
  fotosUrl?: string; // Campo original de URLs separadas por comas
}

// Datos de respaldo en caso de que la API falle
const observationsData: Observation[] = [
  {
    id: 1,
    facilityId: 1,
    facilityName: "Piscina Municipal",
    description: "Filtro de agua requiere mantenimiento",
    status: "aprobada",
    date: "02/04/2025",
    createdAt: "02/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
    location: "Complejo Deportivo Municipal"
  },
  {
    id: 2,
    facilityId: 1,
    facilityName: "Piscina Municipal",
    description: "Azulejos rotos en el borde sur de la piscina",
    status: "aprobada",
    date: "20/03/2025",
    createdAt: "20/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
    location: "Complejo Deportivo Municipal"
  },
  {
    id: 3,
    facilityId: 1,
    facilityName: "Piscina Municipal",
    description: "Fuga de agua en las duchas de hombres",
    status: "completada",
    date: "10/03/2025",
    createdAt: "10/03/2025",
    completedAt: "15/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
    location: "Complejo Deportivo Municipal"
  },
  {
    id: 4,
    facilityId: 2,
    facilityName: "Cancha de Fútbol (Grass)",
    description: "Daños en la red de la portería norte",
    status: "pendiente",
    date: "01/04/2025",
    createdAt: "01/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
    location: "Parque Juan Pablo II"
  },
  {
    id: 5,
    facilityId: 2,
    facilityName: "Cancha de Fútbol (Grass)",
    description: "Grass desgastado en el área central",
    status: "aprobada",
    date: "15/03/2025",
    createdAt: "15/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "baja",
    location: "Parque Juan Pablo II"
  },
]

export default function ObservacionesCoordinador() {
  // Use the proper hook instead of direct context access
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [observations, setObservations] = useState<Observation[]>([])
  const [allObservations, setAllObservations] = useState<Observation[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("todas")
  const [activePriority, setActivePriority] = useState<string>("todas")
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false)
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)

  // Función para aplicar los filtros actuales (estado y prioridad)
  const applyFilters = (data: Observation[], tab: string = activeTab, priority: string = activePriority, query: string = searchQuery) => {
    let filtered = [...data];
    
    // Aplicar filtro por estado (pestaña)
    if (tab !== "todas") {
      filtered = filtered.filter((o) => o.status === tab.slice(0, -1)); // "pendientes" -> "pendiente"
    }
    
    // Aplicar filtro por prioridad
    if (priority !== "todas") {
      filtered = filtered.filter((o) => o.priority === priority);
    }
    
    // Aplicar búsqueda
    if (query) {
      filtered = filtered.filter(
        (observation) =>
          observation.description.toLowerCase().includes(query.toLowerCase()) ||
          observation.facilityName.toLowerCase().includes(query.toLowerCase()),
      );
    }
    
    return filtered;
  }
  // Función para mapear el estado de la API al formato del frontend
  const mapApiStatusToFrontend = (apiStatus: string): string => {
    switch (apiStatus.toLowerCase()) {
      case "en_proceso": 
        return "aprobada";
      case "resuelta": 
        return "completada";
      case "cancelada": 
        return "rechazada";
      default: 
        return apiStatus.toLowerCase();
    }
  }
  
  useEffect(() => {
    // Cargar datos desde la API
    const loadData = async () => {
      try {
        // Usamos el ID del usuario autenticado (o 4 como fallback)
        const userId = user?.id ? parseInt(user.id) : 4;
        
        console.log(`Cargando observaciones para coordinador con ID: ${userId}`);
        const response = await fetch(`${API_BASE_URL}/observaciones/coordinador/${userId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar observaciones');
        }
          const data = await response.json();
        
        // Depurar la respuesta API
        console.log('API Response data:', data);
        
      // Transformamos los datos de la API al formato necesario para nuestro componente
        const mappedData = data.map((obs: any) => {          // Procesar URLs de imágenes (puede ser null o contener múltiples URLs separadas por comas)
          const photoUrls: string[] = [];
          
          if (obs.fotosUrl) {
            try {
              if (typeof obs.fotosUrl === 'string') {
                // Limpiar la cadena y eliminar espacios en blanco
                const cleanUrlString = obs.fotosUrl.trim();
                
                if (cleanUrlString) {
                  // Intentar ambos separadores (coma y pipe) para mayor compatibilidad
                  const urlsArray = cleanUrlString.includes(',') 
                    ? cleanUrlString.split(',').filter((url: string) => url && url.trim())
                    : cleanUrlString.split('|').filter((url: string) => url && url.trim());
                  
                  // Filtrar URLs vacías y agregar al array
                  const validUrls = urlsArray.filter(url => url && url.trim());
                  if (validUrls.length > 0) {
                    photoUrls.push(...validUrls);
                  }
                }
              }
            } catch (error) {
              console.error(`Error processing fotosUrl for observation ${obs.idObservacion}:`, error);
            }
          }
          
          // Si no hay URLs, usar un placeholder
          if (photoUrls.length === 0) {
            photoUrls.push("/placeholder.svg?height=100&width=100");
          }
          
          // Imprimir para depuración
          console.log(`Observation ${obs.idObservacion} - fotos:`, photoUrls);
          
          return {            id: obs.idObservacion,
            facilityId: obs.idObservacion,
            facilityName: obs.instalacion,
            description: obs.descripcion,
            status: mapApiStatusToFrontend(obs.estado),
            date: obs.fecha,
            createdAt: obs.fecha,
            photos: photoUrls,
            priority: obs.prioridad.toLowerCase(),
            completedAt: obs.estado === "resuelta" ? obs.fecha : undefined,
            // Si no hay ubicación, usamos el nombre de la instalación como ubicación
            location: obs.ubicacion || obs.instalacion || "Sin ubicación",
            fotosUrl: obs.fotosUrl // Mantener el valor original para debugging
          }
        });        
        console.log('Observaciones mapeadas:', mappedData);
        console.log(`Se encontraron ${mappedData.length} observaciones para el coordinador`);
        
        setAllObservations(mappedData);
        const filtradas = applyFilters(mappedData);
        console.log(`Después de aplicar filtros quedan ${filtradas.length} observaciones`);
        setObservations(filtradas);
      } catch (error) {
        console.error("Error al cargar las observaciones:", error);
        // Si hay un error, cargamos los datos de ejemplo como fallback
        setAllObservations(observationsData);
        setObservations(applyFilters(observationsData));
      } finally {
        setIsLoading(false);
      }    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setObservations(applyFilters(allObservations, activeTab, activePriority, searchQuery))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Aplicamos los filtros inmediatamente para evitar un segundo renderizado
    setObservations(applyFilters(allObservations, value, activePriority, searchQuery))
  }
  
  const handlePriorityChange = (priority: string) => {
    setActivePriority(priority)
    // Aplicamos los filtros inmediatamente para evitar un segundo renderizado
    setObservations(applyFilters(allObservations, activeTab, priority, searchQuery))
  }

  const handleViewDetails = (observation: Observation) => {
    setSelectedObservation(observation)
    setShowDetailsDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "aprobada":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rechazada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "completada":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>
      case "media":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
      case "baja":
        return <Badge className="bg-blue-100 text-blue-800">Baja</Badge>
      case "urgente":
        return <Badge className="bg-red-500 text-white font-bold">Urgente</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Observaciones de Instalaciones</h1>
        <div className="flex space-x-2">
          <Link href="/coordinador/observaciones/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva observación
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            placeholder="Buscar por descripción o instalación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex justify-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Prioridad: {activePriority === "todas" ? "Todas" : activePriority.charAt(0).toUpperCase() + activePriority.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por prioridad</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePriorityChange("todas")}>Todas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange("baja")}>Baja</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange("media")}>Media</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange("alta")}>Alta</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange("urgente")}>Urgente</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
          <TabsTrigger value="rechazadas">Rechazadas</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          {isLoading ? (
            // Esqueleto de carga
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : observations.length === 0 ? (
            // Mensaje de no hay observaciones
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-4 text-lg font-medium">No hay observaciones que mostrar</h3>
              <p className="mt-2 text-sm text-gray-500">
                No se encontraron observaciones con los filtros seleccionados.
              </p>
            </div>
          ) : (
            // Lista de observaciones
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {observations.map((observation) => (
                <Card key={observation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">{observation.facilityName}</h3>
                      {getStatusBadge(observation.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{observation.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{observation.date}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{observation.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {getPriorityBadge(observation.priority)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(observation)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles */}
      {selectedObservation && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedObservation.facilityName}</DialogTitle>
              <DialogDescription>Detalles de la observación</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="font-medium">Estado:</span>
                {getStatusBadge(selectedObservation.status)}
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Prioridad:</span>
                {getPriorityBadge(selectedObservation.priority)}
              </div>
              <div>
                <span className="font-medium">Fecha:</span>
                <p className="text-sm text-gray-600">{selectedObservation.date}</p>
              </div>
              <div>
                <span className="font-medium">Ubicación:</span>
                <p className="text-sm text-gray-600">{selectedObservation.location}</p>
              </div>
              <div>
                <span className="font-medium">Descripción:</span>
                <p className="text-sm text-gray-600">{selectedObservation.description}</p>
              </div>
              {selectedObservation.completedAt && (
                <div>
                  <span className="font-medium">Completado en:</span>
                  <p className="text-sm text-gray-600">{selectedObservation.completedAt}</p>
                </div>
              )}              {selectedObservation.feedback && (
                <div>
                  <span className="font-medium">Comentarios:</span>
                  <p className="text-sm text-gray-600">{selectedObservation.feedback}</p>
                </div>
              )}
              
              {/* Sección de imágenes */}
              <div>
                <span className="font-medium">Imágenes:</span>
                {selectedObservation.photos.length > 0 && selectedObservation.photos[0] !== "/placeholder.svg?height=100&width=100" ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedObservation.photos.map((photo, index) => (
                      <a 
                        key={index} 
                        href={photo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic mt-1">No hay imágenes disponibles</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDetailsDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
