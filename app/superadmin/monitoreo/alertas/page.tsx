"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Search, Filter, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Datos de ejemplo para las alertas
const alertsData = [
  {
    id: 1,
    title: "Error de conexión a la base de datos",
    description: "Se detectó un error temporal de conexión a la base de datos principal.",
    priority: "alta",
    status: "activa",
    component: "Base de Datos",
    date: "05/04/2025, 10:15",
    details: "Error al intentar establecer conexión con el servidor de base de datos. Código de error: DB-5001.",
  },
  {
    id: 2,
    title: "Uso elevado de CPU",
    description: "El servidor principal está experimentando un uso elevado de CPU (>90%).",
    priority: "media",
    status: "activa",
    component: "Servidor Web",
    date: "05/04/2025, 09:30",
    details:
      "El servidor web principal ha estado operando con un uso de CPU superior al 90% durante los últimos 30 minutos.",
  },
  {
    id: 3,
    title: "Actualización de seguridad pendiente",
    description: "Hay una actualización de seguridad crítica pendiente para el sistema operativo.",
    priority: "baja",
    status: "activa",
    component: "Sistema Operativo",
    date: "04/04/2025, 15:45",
    details:
      "Se ha detectado una actualización de seguridad pendiente (CVE-2025-1234) que debe ser aplicada en los próximos 7 días.",
  },
  {
    id: 4,
    title: "Error de autenticación resuelto",
    description: "El problema con el servicio de autenticación ha sido resuelto.",
    priority: "alta",
    status: "resuelta",
    component: "Autenticación",
    date: "03/04/2025, 14:20",
    resolvedDate: "03/04/2025, 16:45",
    resolvedBy: "admin@munisanmiguel.gob.pe",
    resolution: "Se reinició el servicio de autenticación y se aplicó un parche de seguridad.",
    details: "Se detectaron múltiples intentos fallidos de autenticación desde direcciones IP sospechosas.",
  },
  {
    id: 5,
    title: "Espacio en disco bajo",
    description: "El servidor de almacenamiento está alcanzando su capacidad máxima (85% utilizado).",
    priority: "media",
    status: "resuelta",
    component: "Almacenamiento",
    date: "02/04/2025, 11:10",
    resolvedDate: "02/04/2025, 13:30",
    resolvedBy: "admin@munisanmiguel.gob.pe",
    resolution: "Se liberó espacio eliminando archivos temporales y logs antiguos.",
    details: "El servidor de almacenamiento principal está utilizando 850GB de 1TB disponibles.",
  },
  {
    id: 6,
    title: "Lentitud en el sistema de reservas",
    description: "Los usuarios reportan lentitud al realizar reservas en horas pico.",
    priority: "baja",
    status: "resuelta",
    component: "Aplicación",
    date: "01/04/2025, 18:30",
    resolvedDate: "01/04/2025, 20:15",
    resolvedBy: "admin@munisanmiguel.gob.pe",
    resolution: "Se optimizaron las consultas a la base de datos y se aumentaron los recursos del servidor.",
    details:
      "Múltiples usuarios reportaron tiempos de respuesta superiores a 5 segundos al intentar realizar reservas entre las 18:00 y 19:00.",
  },
]

export default function AlertasPage() {
  const [alerts, setAlerts] = useState(alertsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("todas")
  const [componentFilter, setComponentFilter] = useState("todos")
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [resolutionNote, setResolutionNote] = useState("")
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)

  // Filtrar alertas según los criterios de búsqueda y filtros
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "todas" || alert.priority === priorityFilter
    const matchesComponent = componentFilter === "todos" || alert.component === componentFilter

    return matchesSearch && matchesPriority && matchesComponent
  })

  // Obtener alertas activas y resueltas
  const activeAlerts = filteredAlerts.filter((alert) => alert.status === "activa")
  const resolvedAlerts = filteredAlerts.filter((alert) => alert.status === "resuelta")

  // Componentes únicos para el filtro
  const uniqueComponents = [...new Set(alerts.map((alert) => alert.component))]

  const handleResolveAlert = (alertId) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resuelta",
              resolvedDate: new Date().toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              resolvedBy: "superadmin@munisanmiguel.gob.pe",
              resolution: resolutionNote,
            }
          : alert,
      ),
    )
    setShowResolutionDialog(false)
    setResolutionNote("")
  }

  const openResolutionDialog = (alert) => {
    setSelectedAlert(alert)
    setShowResolutionDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas del Sistema</h1>
        <p className="text-muted-foreground">Monitorea y gestiona las alertas del sistema</p>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar alertas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las prioridades</SelectItem>
                    <SelectItem value="alta">Prioridad alta</SelectItem>
                    <SelectItem value="media">Prioridad media</SelectItem>
                    <SelectItem value="baja">Prioridad baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={componentFilter} onValueChange={setComponentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Componente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los componentes</SelectItem>
                    {uniqueComponents.map((component) => (
                      <SelectItem key={component} value={component}>
                        {component}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setPriorityFilter("todas")
                  setComponentFilter("todos")
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido de alertas */}
      <Tabs defaultValue="activas" className="space-y-4">
        <TabsList className="bg-[#bceeff]">
          <TabsTrigger value="activas" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas Activas ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resueltas" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Alertas Resueltas ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Activas</CardTitle>
              <CardDescription>Alertas que requieren atención o seguimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-lg font-medium">No hay alertas activas</p>
                  <p className="text-gray-500">Todos los sistemas están funcionando correctamente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                            rounded-full p-2 flex-shrink-0
                            ${alert.priority === "alta" ? "bg-red-100" : ""}
                            ${alert.priority === "media" ? "bg-yellow-100" : ""}
                            ${alert.priority === "baja" ? "bg-blue-100" : ""}
                          `}
                          >
                            <AlertTriangle
                              className={`
                              h-5 w-5
                              ${alert.priority === "alta" ? "text-red-500" : ""}
                              ${alert.priority === "media" ? "text-yellow-500" : ""}
                              ${alert.priority === "baja" ? "text-blue-500" : ""}
                            `}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{alert.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge
                                className={`
                                ${alert.priority === "alta" ? "bg-red-100 text-red-800" : ""}
                                ${alert.priority === "media" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${alert.priority === "baja" ? "bg-blue-100 text-blue-800" : ""}
                              `}
                              >
                                Prioridad {alert.priority}
                              </Badge>
                              <Badge className="bg-gray-100 text-gray-800">{alert.component}</Badge>
                              <span className="text-xs text-gray-500">{alert.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button variant="outline" size="sm" onClick={() => openResolutionDialog(alert)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resueltas">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Resueltas</CardTitle>
              <CardDescription>Historial de alertas que han sido resueltas</CardDescription>
            </CardHeader>
            <CardContent>
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-lg font-medium">No hay alertas resueltas</p>
                  <p className="text-gray-500">No se han resuelto alertas recientemente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full p-2 bg-green-100 flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{alert.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge className="bg-green-100 text-green-800">Resuelta</Badge>
                              <Badge className="bg-gray-100 text-gray-800">{alert.component}</Badge>
                              <span className="text-xs text-gray-500">
                                Detectada: {alert.date} | Resuelta: {alert.resolvedDate}
                              </span>
                            </div>
                            {alert.resolution && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Resolución:</p>
                                <p className="text-sm text-gray-600">{alert.resolution}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para resolver alerta */}
      <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>Proporciona detalles sobre cómo se resolvió la alerta.</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="font-medium">{selectedAlert.title}</h3>
                <p className="text-sm text-gray-500">{selectedAlert.description}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Nota de resolución</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Describe cómo se resolvió el problema..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolutionDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={() => handleResolveAlert(selectedAlert.id)}>
              Confirmar Resolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

