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

// Datos de ejemplo para las observaciones
const observationsData = [
  {
    id: 1,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    description: "Daños en la red de la portería norte",
    status: "pendiente",
    date: "05/04/2025",
    createdAt: "05/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
  },
  {
    id: 2,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    description: "Filtro de agua requiere mantenimiento",
    status: "aprobada",
    date: "02/04/2025",
    createdAt: "02/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
  },
  {
    id: 3,
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    description: "Máquina de cardio #3 fuera de servicio",
    status: "rechazada",
    date: "01/04/2025",
    createdAt: "01/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "baja",
    feedback: "Ya se ha reportado anteriormente y está en proceso de reparación.",
  },
  {
    id: 4,
    facilityId: 4,
    facilityName: "Pista de Atletismo",
    description: "Marcas de carril borrosas en la curva sur",
    status: "aprobada",
    date: "30/03/2025",
    createdAt: "30/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
  },
  {
    id: 5,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    description: "Azulejos rotos en el borde sur de la piscina",
    status: "completada",
    date: "20/03/2025",
    createdAt: "20/03/2025",
    completedAt: "25/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
  },
]

export default function ObservacionesCoordinador() {
  const [isLoading, setIsLoading] = useState(true)
  const [observations, setObservations] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedObservation, setSelectedObservation] = useState(null)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setObservations(observationsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Filtrar observaciones por descripción o instalación
    const filtered = observationsData.filter(
      (observation) =>
        observation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        observation.facilityName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setObservations(filtered)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todas") {
      setObservations(observationsData)
    } else if (value === "pendientes") {
      setObservations(observationsData.filter((o) => o.status === "pendiente"))
    } else if (value === "aprobadas") {
      setObservations(observationsData.filter((o) => o.status === "aprobada"))
    } else if (value === "completadas") {
      setObservations(observationsData.filter((o) => o.status === "completada"))
    }
  }

  const handleViewDetails = (observation) => {
    setSelectedObservation(observation)
    setShowDetailsDialog(true)
  }

  const getStatusBadge = (status) => {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "alta":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>
      case "media":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
      case "baja":
        return <Badge className="bg-blue-100 text-blue-800">Baja</Badge>
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
          <h1 className="text-2xl font-bold tracking-tight">Observaciones</h1>
          <p className="text-muted-foreground">Gestiona las observaciones reportadas para las instalaciones</p>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/coordinador/observaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Observación
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
                  placeholder="Buscar por descripción o instalación..."
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por prioridad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setObservations(observationsData)}>Todas</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setObservations(observationsData.filter((o) => o.priority === "alta"))}
                >
                  Alta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setObservations(observationsData.filter((o) => o.priority === "media"))}
                >
                  Media
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setObservations(observationsData.filter((o) => o.priority === "baja"))}
                >
                  Baja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {observations.length > 0 ? (
            <div className="space-y-4">
              {observations.map((observation) => (
                <Card key={observation.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">{observation.facilityName}</h3>
                          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                            {getStatusBadge(observation.status)}
                            {getPriorityBadge(observation.priority)}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{observation.description}</p>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500">Fecha</p>
                              <p>{observation.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500">Instalación</p>
                              <p>{observation.facilityName}</p>
                            </div>
                          </div>
                        </div>

                        {observation.photos && observation.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {observation.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo || "/placeholder.svg"}
                                alt={`Foto ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(observation)}
                          className="flex-1 md:flex-auto"
                        >
                          Ver Detalles
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-auto" asChild>
                          <Link href={`/coordinador/instalaciones/${observation.facilityId}`}>Ver Instalación</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron observaciones</h3>
              <p className="text-gray-500 mt-2">No hay observaciones que coincidan con los criterios de búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setObservations(observationsData)
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles de observación */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Observación</DialogTitle>
            <DialogDescription>
              Información completa de la observación para {selectedObservation?.facilityName}
            </DialogDescription>
          </DialogHeader>

          {selectedObservation && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{selectedObservation.facilityName}</h3>
                <div className="flex gap-2">
                  {getStatusBadge(selectedObservation.status)}
                  {getPriorityBadge(selectedObservation.priority)}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedObservation.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha de observación</p>
                  <p>{selectedObservation.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de creación</p>
                  <p>{selectedObservation.createdAt}</p>
                </div>
                {selectedObservation.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de completado</p>
                    <p>{selectedObservation.completedAt}</p>
                  </div>
                )}
              </div>

              {selectedObservation.feedback && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium mb-1">Retroalimentación del administrador:</p>
                  <p className="text-gray-700">{selectedObservation.feedback}</p>
                </div>
              )}

              {selectedObservation.photos && selectedObservation.photos.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Fotos:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedObservation.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cerrar
            </Button>
            <Button className="bg-primary hover:bg-primary-light" asChild>
              <Link href={`/coordinador/instalaciones/${selectedObservation?.facilityId}`}>Ver Instalación</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

