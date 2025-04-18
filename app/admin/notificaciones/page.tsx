"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Filter, Trash2 } from "lucide-react"
import { useNotification } from "@/context/NotificationContext"
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

type TabType = "todas" | "no-leidas" | "leidas";
type NotificationType = "success" | "info" | "warning" | "reserva" | "mantenimiento" | "pago" | "reporte" | "todos";

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: Exclude<NotificationType, "todos">;
}

export default function NotificacionesAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("todas")
  const [selectedType, setSelectedType] = useState<NotificationType>("todos")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null)

  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
  } = useNotification()

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
  }

  const handleTypeChange = (type: NotificationType) => {
    setSelectedType(type)
  }

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete.id)
      setShowDeleteDialog(false)
      setNotificationToDelete(null)
    }
  }

  const confirmDeleteRead = () => {
    deleteAllRead()
    setShowClearAllDialog(false)
  }

  const filteredNotifications = notifications.filter(notification => {
    // Primero filtrar por tab
    const tabFilter = 
      activeTab === "todas" ? true :
      activeTab === "no-leidas" ? !notification.read :
      notification.read;

    // Luego filtrar por tipo
    const typeFilter = selectedType === "todos" || notification.type === selectedType;

    return tabFilter && typeFilter;
  });

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
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
          <Button variant="outline" className="text-red-600" onClick={() => setShowClearAllDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar leídas
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {selectedType === "todos" ? "Filtrar por tipo" : `Tipo: ${selectedType}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTypeChange("todos")}>
                Todos los tipos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange("reserva")}>
                Reservas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange("mantenimiento")}>
                Mantenimiento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange("pago")}>
                Pagos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange("reporte")}>
                Reportes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredNotifications.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 ${!notification.read ? "bg-primary-background cursor-pointer border-primary-light hover:bg-blue-50" : ""}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
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
                                      : notification.type === "reporte"
                                        ? "bg-purple-100 text-purple-800"
                                        : notification.type === "success"
                                          ? "bg-green-100 text-green-800"
                                          : notification.type === "info"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{notification.date}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex justify-end mt-2 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(notification)
                            }}
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

      {/* Diálogo de confirmación para eliminar leídas */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar notificaciones leídas</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar todas las notificaciones leídas? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRead}>
              Eliminar leídas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

