"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Check, CheckCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para las notificaciones
const notificationsData = [
  {
    id: 1,
    title: "Nueva instalación asignada",
    message: "Se te ha asignado la Cancha de Fútbol (Grass)",
    date: "05/04/2025, 10:15",
    read: false,
    category: "asignacion",
  },
  {
    id: 2,
    title: "Observación aprobada",
    message: "Tu observación sobre la Piscina Municipal ha sido aprobada",
    date: "04/04/2025, 14:30",
    read: false,
    category: "observacion",
  },
  {
    id: 3,
    title: "Recordatorio de inspección",
    message: "Tienes una inspección programada para la Pista de Atletismo mañana",
    date: "03/04/2025, 09:45",
    read: false,
    category: "recordatorio",
  },
  {
    id: 4,
    title: "Observación rechazada",
    message: "Tu observación sobre el Gimnasio Municipal ha sido rechazada",
    date: "02/04/2025, 16:20",
    read: true,
    category: "observacion",
    feedback: "Ya se ha reportado anteriormente y está en proceso de reparación.",
  },
  {
    id: 5,
    title: "Mantenimiento programado",
    message: "Se ha programado mantenimiento para la Piscina Municipal",
    date: "01/04/2025, 11:10",
    read: true,
    category: "mantenimiento",
  },
]

export default function NotificacionesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState(notificationsData)
  const [activeTab, setActiveTab] = useState("todas")

  const filteredNotifications = notifications.filter((notification) => {
    const searchMatch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const categoryMatch =
      activeTab === "todas" || (activeTab === "no-leidas" && !notification.read) || notification.category === activeTab

    return searchMatch && categoryMatch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case "asignacion":
        return <Badge className="bg-blue-100 text-blue-800">Asignación</Badge>
      case "observacion":
        return <Badge className="bg-green-100 text-green-800">Observación</Badge>
      case "recordatorio":
        return <Badge className="bg-yellow-100 text-yellow-800">Recordatorio</Badge>
      case "mantenimiento":
        return <Badge className="bg-purple-100 text-purple-800">Mantenimiento</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          {unreadCount > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{unreadCount} sin leer</Badge>}
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4 mr-2" />
          Marcar todas como leídas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centro de Notificaciones</CardTitle>
          <CardDescription>Gestiona tus notificaciones y mantente al día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar notificación..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="no-leidas">No leídas</TabsTrigger>
              <TabsTrigger value="asignacion">Asignaciones</TabsTrigger>
              <TabsTrigger value="observacion">Observaciones</TabsTrigger>
              <TabsTrigger value="recordatorio">Recordatorios</TabsTrigger>
              <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${!notification.read ? "bg-primary-pale border-primary" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-primary" />
                          <span className="font-medium">{notification.title}</span>
                          {!notification.read && <Badge className="bg-red-100 text-red-800">Nueva</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(notification.category)}
                          <span className="text-xs text-gray-500">{notification.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      {notification.feedback && (
                        <div className="bg-gray-100 p-3 rounded-md text-sm mb-3">
                          <p className="font-medium">Comentarios:</p>
                          <p>{notification.feedback}</p>
                        </div>
                      )}
                      {!notification.read && (
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como leída
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No hay notificaciones</h3>
                  <p className="text-gray-500 mt-2">
                    No tienes notificaciones {activeTab !== "todas" ? "en esta categoría" : ""} en este momento.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

