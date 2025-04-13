"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Filter, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Datos de ejemplo para las notificaciones
const notificationsData = [
  {
    id: 1,
    title: "Nueva reserva",
    message: "Se ha realizado una nueva reserva para Cancha de Fútbol (Grass)",
    date: "Hace 10 minutos",
    read: false,
    type: "reserva",
  },
  {
    id: 2,
    title: "Mantenimiento programado",
    message: "Recordatorio: Mantenimiento de Piscina Municipal mañana",
    date: "Hace 2 horas",
    read: false,
    type: "mantenimiento",
  },
  {
    id: 3,
    title: "Pago confirmado",
    message: "Se ha confirmado el pago de la reserva #12345",
    date: "Hace 5 horas",
    read: true,
    type: "pago",
  },
  {
    id: 4,
    title: "Solicitud de mantenimiento",
    message: "El coordinador ha solicitado mantenimiento para la Pista de Atletismo",
    date: "Hace 1 día",
    read: false,
    type: "mantenimiento",
  },
  {
    id: 5,
    title: "Reserva cancelada",
    message: "La reserva #12346 ha sido cancelada por el usuario",
    date: "Hace 1 día",
    read: true,
    type: "reserva",
  },
  {
    id: 6,
    title: "Reporte generado",
    message: "El reporte mensual de ingresos está disponible para su descarga",
    date: "Hace 2 días",
    read: true,
    type: "reporte",
  },
  {
    id: 7,
    title: "Nueva solicitud de reserva",
    message: "Hay una nueva solicitud de reserva pendiente de aprobación",
    date: "Hace 3 días",
    read: true,
    type: "reserva",
  },
]

export default function NotificacionesAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState("todas")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNotifications(notificationsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todas") {
      setNotifications(notificationsData)
    } else if (value === "no-leidas") {
      setNotifications(notificationsData.filter((n) => !n.read))
    } else if (value === "leidas") {
      setNotifications(notificationsData.filter((n) => n.read))
    }
  }

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    setNotifications(notifications.filter((n) => n.id !== notificationToDelete.id))
    setShowDeleteDialog(false)
    setNotificationToDelete(null)
  }

  const confirmClearAll = () => {
    setNotifications([])
    setShowClearAllDialog(false)
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
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona todas tus notificaciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
          <Button variant="outline" className="text-red-600" onClick={() => setShowClearAllDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar todo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="no-leidas">No leídas</TabsTrigger>
            <TabsTrigger value="leidas">Leídas</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar por tipo
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {notifications.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 ${!notification.read ? "bg-primary-background" : ""}`}
                    >
                      <div className="bg-primary rounded-full p-2 text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                notification.type === "reserva"
                                  ? "bg-blue-100 text-blue-800"
                                  : notification.type === "mantenimiento"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : notification.type === "pago"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{notification.date}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex justify-end mt-2 gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Marcar como leída
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteClick(notification)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-gray-500 mt-2">No tienes notificaciones en esta categoría</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer.
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

      {/* Diálogo de confirmación para limpiar todo */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpiar todas las notificaciones</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmClearAll}>
              Limpiar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

