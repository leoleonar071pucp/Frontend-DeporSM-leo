"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, X, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Datos de ejemplo para las observaciones
const observationsData = [
  {
    id: 1,
    facilityId: 1,
    facilityName: "Cancha de Fútbol (Grass)",
    facilityLocation: "Parque Juan Pablo II",
    description: "Daños en la red de la portería norte",
    status: "pendiente",
    date: "05/04/2025",
    createdAt: "05/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
    coordinatorId: 1,
    coordinatorName: "Carlos Rodríguez",
  },
  {
    id: 2,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    facilityLocation: "Complejo Deportivo Municipal",
    description: "Filtro de agua requiere mantenimiento",
    status: "aprobada",
    date: "02/04/2025",
    createdAt: "02/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
    coordinatorId: 1,
    coordinatorName: "Carlos Rodríguez",
    approvedAt: "03/04/2025",
    approvedBy: "Admin",
  },
  {
    id: 3,
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    facilityLocation: "Complejo Deportivo Municipal",
    description: "Máquina de cardio #3 fuera de servicio",
    status: "rechazada",
    date: "01/04/2025",
    createdAt: "01/04/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "baja",
    coordinatorId: 2,
    coordinatorName: "María López",
    feedback: "Ya se ha reportado anteriormente y está en proceso de reparación.",
    rejectedAt: "02/04/2025",
    rejectedBy: "Admin",
  },
  {
    id: 4,
    facilityId: 4,
    facilityName: "Pista de Atletismo",
    facilityLocation: "Complejo Deportivo Municipal",
    description: "Marcas de carril borrosas en la curva sur",
    status: "aprobada",
    date: "30/03/2025",
    createdAt: "30/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "media",
    coordinatorId: 2,
    coordinatorName: "María López",
    approvedAt: "31/03/2025",
    approvedBy: "Admin",
  },
  {
    id: 5,
    facilityId: 2,
    facilityName: "Piscina Municipal",
    facilityLocation: "Complejo Deportivo Municipal",
    description: "Azulejos rotos en el borde sur de la piscina",
    status: "completada",
    date: "20/03/2025",
    createdAt: "20/03/2025",
    completedAt: "25/03/2025",
    photos: ["/placeholder.svg?height=100&width=100"],
    priority: "alta",
    coordinatorId: 1,
    coordinatorName: "Carlos Rodríguez",
    approvedAt: "21/03/2025",
    approvedBy: "Admin",
  },
]

export default function ObservacionesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [priorityFilter, setPriorityFilter] = useState("todas")
  const [selectedObservation, setSelectedObservation] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")
  const [feedback, setFeedback] = useState("")

  const filteredObservations = observationsData.filter((observation) => {
    // Filtro de búsqueda
    const searchMatch =
      observation.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de estado
    const statusMatch = statusFilter === "todas" || observation.status === statusFilter

    // Filtro de prioridad
    const priorityMatch = priorityFilter === "todas" || observation.priority === priorityFilter

    return searchMatch && statusMatch && priorityMatch
  })

  const handleViewDetail = (observation) => {
    setSelectedObservation(observation)
    setIsDetailDialogOpen(true)
  }

  const handleAction = (observation, action) => {
    setSelectedObservation(observation)
    setActionType(action)
    setFeedback("")
    setIsActionDialogOpen(true)
  }

  const handleActionConfirm = () => {
    // Aquí iría la lógica para aprobar o rechazar la observación
    console.log(`${actionType} observación:`, selectedObservation.id, feedback)
    setIsActionDialogOpen(false)
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
        return <Badge className="bg-green-100 text-green-800">Baja</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Observaciones de Coordinadores</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Observaciones</CardTitle>
          <CardDescription>Revisa y gestiona las observaciones reportadas por los coordinadores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar observación..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las prioridades</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instalación</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObservations.length > 0 ? (
                  filteredObservations.map((observation) => (
                    <TableRow key={observation.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{observation.facilityName}</span>
                          <span className="text-xs text-gray-500">{observation.facilityLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{observation.description}</div>
                      </TableCell>
                      <TableCell>{observation.coordinatorName}</TableCell>
                      <TableCell>{observation.date}</TableCell>
                      <TableCell>{getStatusBadge(observation.status)}</TableCell>
                      <TableCell>{getPriorityBadge(observation.priority)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetail(observation)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                          {observation.status === "pendiente" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-500"
                                onClick={() => handleAction(observation, "aprobar")}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Aprobar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleAction(observation, "rechazar")}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Rechazar</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No se encontraron observaciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Observación</DialogTitle>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Instalación</h3>
                  <p className="mt-1">{selectedObservation.facilityName}</p>
                  <p className="text-sm text-gray-500">{selectedObservation.facilityLocation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Coordinador</h3>
                  <p className="mt-1">{selectedObservation.coordinatorName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Reporte</h3>
                  <p className="mt-1">{selectedObservation.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <div className="mt-1">{getStatusBadge(selectedObservation.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prioridad</h3>
                  <div className="mt-1">{getPriorityBadge(selectedObservation.priority)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                <p className="mt-1">{selectedObservation.description}</p>
              </div>

              {selectedObservation.photos && selectedObservation.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fotos</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedObservation.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedObservation.feedback && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Comentarios</h3>
                  <p className="mt-1">{selectedObservation.feedback}</p>
                </div>
              )}

              {selectedObservation.status === "pendiente" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="text-red-500"
                    onClick={() => {
                      setIsDetailDialogOpen(false)
                      handleAction(selectedObservation, "rechazar")
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary-light"
                    onClick={() => {
                      setIsDetailDialogOpen(false)
                      handleAction(selectedObservation, "aprobar")
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de acción (aprobar/rechazar) */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "aprobar" ? "Aprobar Observación" : "Rechazar Observación"}</DialogTitle>
            <DialogDescription>
              {actionType === "aprobar"
                ? "La observación será aprobada y se programará su mantenimiento."
                : "La observación será rechazada y no se tomará ninguna acción al respecto."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Comentarios (opcional)</Label>
              <Textarea
                id="feedback"
                placeholder="Añade comentarios sobre esta decisión..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className={actionType === "aprobar" ? "bg-primary hover:bg-primary-light" : "bg-red-500 hover:bg-red-600"}
              onClick={handleActionConfirm}
            >
              {actionType === "aprobar" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

