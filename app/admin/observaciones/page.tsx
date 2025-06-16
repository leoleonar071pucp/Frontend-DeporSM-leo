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
import { TablePagination, useTablePagination } from "@/components/ui/table-pagination"

interface Observation {
  id: number
  facilityName: string
  title: string
  description: string
  coordinatorName: string
  date: string
  status: 'pendiente' | 'en_proceso' | 'resuelta' | 'cancelada' | 'aprobada' | 'rechazada' | 'completada'
  priority: 'alta' | 'media' | 'baja'
  photos?: string[]
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
        const response = await fetch(`${API_BASE_URL}/observaciones/all`, {
          credentials: 'include' // Incluir cookies para autenticación
        })
        const data = await response.json()

        console.log("Respuesta recibida:", data);

        // Verificar si data es un array
        if (Array.isArray(data)) {
          console.log("La respuesta es un array con", data.length, "elementos");

          // Verificar si el array tiene elementos y si tienen la estructura esperada
          if (data.length > 0 && data[0].idObservacion) {
            const mappedData: Observation[] = data.map((obs: any) => {
              // Procesar las URLs de las fotos si existen
              let photos: string[] = [];
              if (obs.fotosUrl) {
                // Verificar primero si la cadena comienza con http:// o https://
                if (typeof obs.fotosUrl === 'string' &&
                    (obs.fotosUrl.startsWith('http://') || obs.fotosUrl.startsWith('https://'))) {
                  // Es una URL directa o múltiples URLs separadas por comas
                  const urlsArray = obs.fotosUrl.split(',');
                  for (let i = 0; i < urlsArray.length; i++) {
                    photos.push(urlsArray[i].trim());
                  }
                } else {
                  try {
                    // Intentar parsear como JSON solo si no parece ser una URL directa
                    if (typeof obs.fotosUrl === 'string' &&
                        (obs.fotosUrl.startsWith('[') || obs.fotosUrl.startsWith('{'))) {
                      photos = JSON.parse(obs.fotosUrl);
                    }
                  } catch (e) {
                    console.error("Error al parsear fotosUrl:", e);
                    // Si falla el parseo JSON, intentar como cadena separada por comas
                    if (typeof obs.fotosUrl === 'string') {
                      const urlsArray = obs.fotosUrl.split(',');
                      for (let i = 0; i < urlsArray.length; i++) {
                        photos.push(urlsArray[i].trim());
                      }
                    }
                  }
                }

                // Registrar para depuración
                console.log("URLs de fotos procesadas:", photos);
              }

              return {
                id: obs.idObservacion,
                facilityName: obs.instalacion,
                title: obs.titulo || "Sin título", // Agregamos el campo título con un valor por defecto
                description: obs.descripcion,
                coordinatorName: obs.coordinador,
                date: obs.fecha,
                status: obs.estado,
                priority: obs.prioridad,
                photos: photos.length > 0 ? photos : undefined
              };
            });

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
        toast({
          title: "Error",
          description: "No se pudieron cargar las observaciones. Intente nuevamente.",
          variant: "destructive"
        });
        setObservationsData([]);
      }
    }

    fetchObservations()
  }, [])

  const filteredObservations = observationsData.filter((observation) => {
    const searchMatch =
      observation.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())

    const statusMatch = statusFilter === "todas" || observation.status === statusFilter
    const priorityMatch = priorityFilter === "todas" || observation.priority === priorityFilter

    return searchMatch && statusMatch && priorityMatch
  })

  // Paginación
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedObservations,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems
  } = useTablePagination(filteredObservations, 10)

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

  const handleActionConfirm = async () => {
    if (!selectedObservation || !actionType) return;

    try {
      // Preparar datos para enviar al backend
      const requestData = {
        comentario: feedback
      };

      // Determinar la URL del endpoint según la acción
      const endpoint = actionType === "aprobar"
        ? `/api/observaciones/${selectedObservation.id}/aprobar`
        : `/api/observaciones/${selectedObservation.id}/rechazar`;

      // Realizar la petición al backend
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });

      if (!response.ok) {
        // Si hay un error, mostrar mensaje como toast en lugar de lanzar un error
        const errorData = await response.json();

        // Mensaje personalizado para el caso de mantenimiento activo
        let errorTitle = "No se pudo procesar la observación";
        let errorDescription = errorData.mensaje || 'Error al procesar la observación';
        let isMaintenanceError = false;

        // Verificar si es el error específico de mantenimiento
        if (errorData.mensaje && errorData.mensaje.includes("mantenimiento programado o en progreso")) {
          errorTitle = "⚠️ INSTALACIÓN EN MANTENIMIENTO";
          errorDescription = "Esta instalación ya tiene un mantenimiento programado o en progreso. No se puede aprobar esta observación hasta que el mantenimiento actual se complete.";
          isMaintenanceError = true;

          // Registrar en consola para depuración
          console.error("Error de mantenimiento activo:", errorData);
        }
        // Verificar si es el error específico de observación en proceso
        else if (errorData.mensaje && errorData.mensaje.includes("Ya existe una observación en proceso para esta instalación")) {
          errorTitle = "⚠️ OBSERVACIÓN EN PROCESO";
          errorDescription = "Ya existe una observación en proceso para esta instalación. No se puede aprobar otra observación hasta que la actual sea resuelta.";
          isMaintenanceError = true; // Usamos la misma variable para mostrar un alert

          // Registrar en consola para depuración
          console.error("Error de observación en proceso:", errorData);
        }

        // Mostrar mensaje de error como toast
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
          duration: isMaintenanceError ? 6000 : 3000, // Mostrar por más tiempo si es error de mantenimiento
        });

        // Si es un error de mantenimiento o de observación en proceso, mostrar un diálogo de alerta adicional
        if (isMaintenanceError) {
          // Usar un alert nativo para asegurar que el usuario vea el mensaje
          setTimeout(() => {
            alert("IMPORTANTE: " + errorDescription);
          }, 500);
        }

        // Cerrar el diálogo y limpiar el estado
        setIsActionDialogOpen(false);
        setFeedback('');

        return; // Salir de la función sin continuar
      }

      // Actualizar el estado local
      // Leer la respuesta para evitar errores, aunque no la usemos directamente
      await response.json();

      // Determinar el nuevo estado según la acción
      const newStatus = actionType === "aprobar" ? "en_proceso" : "cancelada";

      // Actualizar la lista de observaciones
      const updatedObservations = observationsData.map(obs => {
        if (obs.id === selectedObservation.id) {
          return {
            ...obs,
            status: newStatus as Observation['status']
          }
        }
        return obs
      });

      setObservationsData(updatedObservations);

      // Mostrar notificación de éxito
      toast({
        title: actionType === 'aprobar' ? "Observación aprobada" : "Observación rechazada",
        description: `La observación sobre ${selectedObservation.facilityName} ha sido ${actionType === 'aprobar' ? 'aprobada' : 'rechazada'}.`,
      });

      // Agregar notificación al sistema
      addNotification({
        title: actionType === 'aprobar' ? "Observación aprobada" : "Observación rechazada",
        message: `Se ha ${actionType === 'aprobar' ? 'aprobado' : 'rechazado'} la observación sobre ${selectedObservation.facilityName}.`,
        type: "mantenimiento"
      });

      // Cerrar el diálogo y limpiar el estado
      setIsActionDialogOpen(false);
      setFeedback('');
      setSelectedObservation(null);

    } catch (error) {
      console.error('Error al procesar la observación:', error);

      // Mostrar mensaje de error
      toast({
        title: "Error",
        description: "No se pudo procesar la observación. Intente nuevamente.",
        variant: "destructive"
      });
    }
  }

  const getStatusBadge = (status: Observation['status']) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "en_proceso":
        return <Badge className="bg-blue-100 text-blue-800">En Proceso</Badge>
      case "resuelta":
        return <Badge className="bg-green-100 text-green-800">Resuelta</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      // Mantener compatibilidad con estados anteriores
      case "aprobada":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rechazada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "completada":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: Observation['priority']) => {
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
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
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
                  <TableHead>Nº Observación</TableHead>
                  <TableHead>Instalación</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedObservations.length > 0 ? (
                  paginatedObservations.map((observation) => (
                    <TableRow key={observation.id}>
                      <TableCell className="font-medium">{`OBS-${observation.id}`}</TableCell>
                      <TableCell className="font-medium">{observation.facilityName}</TableCell>
                      <TableCell className="font-medium">{observation.title}</TableCell>
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
                    <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                      No se encontraron observaciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {filteredObservations.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
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
                <h3 className="text-sm font-medium">Título</h3>
                <p className="text-sm text-gray-700 font-medium">{selectedObservation.title}</p>
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

              {/* Sección de imágenes */}
              <div>
                <h3 className="text-sm font-medium">Imágenes</h3>
                {selectedObservation.photos && selectedObservation.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedObservation.photos.map((photo, index) => {
                      // Asegurarse de que la URL es válida
                      let photoUrl = '/placeholder.svg';

                      try {
                        if (typeof photo === 'string') {
                          photoUrl = photo;
                        } else if (photo && typeof photo === 'object') {
                          // Intentar acceder a la propiedad url de manera segura
                          const photoObj = photo as any;
                          if (photoObj.url) {
                            photoUrl = photoObj.url;
                          }
                        }
                      } catch (e) {
                        console.error("Error al procesar foto:", e);
                      }

                      return (
                        <a
                          key={index}
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={photoUrl}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              // Si la imagen no carga, mostrar un placeholder
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay imágenes disponibles</p>
                )}
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
                ? "La observación pasará a estado 'En Proceso', la instalación se marcará como 'Requiere Mantenimiento' y se notificará al coordinador."
                : "La observación pasará a estado 'Cancelada' y se notificará al coordinador."}
            </DialogDescription>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Instalación</h3>
                <p className="text-sm text-gray-700">{selectedObservation.facilityName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Título</h3>
                <p className="text-sm text-gray-700 font-medium">{selectedObservation.title}</p>
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
