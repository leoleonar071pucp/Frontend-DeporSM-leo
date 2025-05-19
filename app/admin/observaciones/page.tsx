"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { useNotification } from "@/context/NotificationContext"
import { API_BASE_URL } from "@/lib/config"

interface Observation {
  id: number
  facilityName: string
  description: string
  coordinatorName: string
  date: string
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'completada'
  priority: 'alta' | 'media' | 'baja'
}

export default function ObservacionesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [priorityFilter, setPriorityFilter] = useState("todas")
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"aprobar" | "rechazar">()
  const [feedback, setFeedback] = useState("")
  const [observationsData, setObservationsData] = useState<Observation[]>([])

  const { addNotification } = useNotification()
  const { toast } = useToast()

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const response = await fetch(`/api/observaciones/all`)
        const data = await response.json()

        console.log("Respuesta recibida:", data);

        // Verificar si data es un array
        if (Array.isArray(data)) {
          console.log("La respuesta es un array con", data.length, "elementos");

          // Verificar si el array tiene elementos y si tienen la estructura esperada
          if (data.length > 0 && data[0].idObservacion) {
            const mappedData: Observation[] = data.map((obs: any) => ({
              id: obs.idObservacion,
              facilityName: obs.instalacion,
              description: obs.descripcion,
              coordinatorName: obs.coordinador,
              date: obs.fecha,
              status: obs.estado,
              priority: obs.prioridad,
            }));

            setObservationsData(mappedData);
          } else {
            console.error("El array no tiene la estructura esperada:", data[0]);
            setObservationsData([]);
          }
        }
        // Si no es un array, podría ser un objeto con un mensaje de error
        else if (data && typeof data === 'object') {
          console.error("La respuesta no es un array:", data);

          // Si hay un mensaje de error, mostrarlo
          if (data.error) {
            console.error("Error recibido:", data.error);
          }

          setObservationsData([]);
        }
        else {
          console.error("Respuesta inesperada:", data);
          setObservationsData([]);
        }
      } catch (error) {
        console.error("Error al cargar observaciones:", error)
      }
    }

    fetchObservations()
  }, [])

  const filteredObservations = observationsData.filter((observation) => {
    const searchMatch =
      observation.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())

    const statusMatch = statusFilter === "todas" || observation.status === statusFilter
    const priorityMatch = priorityFilter === "todas" || observation.priority === priorityFilter

    return searchMatch && statusMatch && priorityMatch
  })

  const handleViewDetail = (observation: Observation) => {
    setSelectedObservation(observation)
    setIsDetailDialogOpen(true)
  }

  const handleAction = (observation: Observation, action: "aprobar" | "rechazar") => {
    setSelectedObservation(observation)
    setActionType(action)
    setFeedback("")
    setIsActionDialogOpen(true)
  }

  const handleActionConfirm = () => {
    if (!selectedObservation || !actionType) return;

    const updatedObservations = observationsData.map(obs => {
      if (obs.id === selectedObservation.id) {
        return {
          ...obs,
          status: actionType === "aprobar" ? "aprobada" : "rechazada"
        }
      }
      return obs
    })

    setObservationsData(updatedObservations)

    toast({
      title: actionType === 'aprobar' ? "Observación aprobada" : "Observación rechazada",
      description: `La observación sobre ${selectedObservation.facilityName} ha sido ${actionType === 'aprobar' ? 'aprobada' : 'rechazada'}.`,
    })

    addNotification({
      title: actionType === 'aprobar' ? "Observación aprobada" : "Observación rechazada",
      message: `Se ha ${actionType === 'aprobar' ? 'aprobado' : 'rechazado'} la observación sobre ${selectedObservation.facilityName}.`,
      type: "mantenimiento"
    })

    setIsActionDialogOpen(false)
    setFeedback('')
    setSelectedObservation(null)
  }

  const getStatusBadge = (status: Observation['status']) => {
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

  const getPriorityBadge = (priority: Observation['priority']) => {
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
                      <TableCell className="font-medium">{observation.facilityName}</TableCell>
                      <TableCell>{observation.description}</TableCell>
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


      {/* Dialog para ver detalles de la observación */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Observación</DialogTitle>
            <DialogDescription>
              Información completa sobre la observación seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Instalación</h3>
                <p className="text-sm text-gray-700">{selectedObservation.facilityName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Descripción</h3>
                <p className="text-sm text-gray-700">{selectedObservation.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Coordinador</h3>
                <p className="text-sm text-gray-700">{selectedObservation.coordinatorName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Fecha</h3>
                <p className="text-sm text-gray-700">{selectedObservation.date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Estado</h3>
                <div>{getStatusBadge(selectedObservation.status)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Prioridad</h3>
                <div>{getPriorityBadge(selectedObservation.priority)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para aprobar o rechazar una observación */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "aprobar" ? "Aprobar Observación" : "Rechazar Observación"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "aprobar"
                ? "La observación pasará a estado 'Aprobada' y se notificará al coordinador."
                : "La observación pasará a estado 'Rechazada' y se notificará al coordinador."}
            </DialogDescription>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Instalación</h3>
                <p className="text-sm text-gray-700">{selectedObservation.facilityName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Descripción</h3>
                <p className="text-sm text-gray-700">{selectedObservation.description}</p>
              </div>
              <div>
                <Label htmlFor="feedback">Comentarios (opcional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Añade comentarios adicionales..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant={actionType === "aprobar" ? "default" : "destructive"}
            >
              {actionType === "aprobar" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
