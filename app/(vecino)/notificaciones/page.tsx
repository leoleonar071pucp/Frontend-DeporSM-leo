"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { useNotification } from "@/context/NotificationContext" // Import useNotification
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, Info, Trash2, Loader2 } from "lucide-react" // Import Loader2
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Definir interfaz para Notificación
interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: "success" | "info" | "warning" | "reserva" | "mantenimiento" | "pago" | "reporte"; // Tipos definidos
    category?: string;
    feedback?: string;
}

// Datos de ejemplo eliminados, ahora vienen del contexto

export default function Notificaciones() {
  // Usar el contexto de notificaciones
  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
    isLoading: isNotificationsLoading,
    error: notificationsError,
    refreshNotifications
  } = useNotification();

  const [activeTab, setActiveTab] = useState("todas")
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth() // Get auth state for protection
  const router = useRouter() // Get router instance

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "warning":
        return <Info className="h-6 w-6 text-yellow-500" />
      case "reserva":
        return <Calendar className="h-6 w-6 text-blue-500" />
      case "mantenimiento":
        return <Info className="h-6 w-6 text-orange-500" />
      case "pago":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "reporte":
        return <Info className="h-6 w-6 text-purple-500" />
      case "info":
      default:
        return <Calendar className="h-6 w-6 text-primary" />
    }
  }

  // Las funciones markAsRead, deleteNotification, markAllAsRead, deleteAllRead ahora vienen del contexto
  // y ya no necesitan definirse localmente.

  const filteredNotifications = () => {
    switch (activeTab) {
      case "no-leidas":
        return notifications.filter((notification) => !notification.read)
      case "leidas":
        return notifications.filter((notification) => notification.read)
      default: // "todas"
        return notifications
    }
  }

  // --- Protección de Ruta ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login'); // Redirigir si no está autenticado y la carga inicial terminó
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // --- Renderizado Condicional por Carga/Autenticación ---
   if (isAuthLoading || !isAuthenticated) {
    // Muestra un estado de carga o nada mientras redirige
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // Solo cargar notificaciones una vez al montar el componente
  // No es necesario recargar al cambiar de pestaña ya que solo filtramos los datos existentes
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    }
  }, [isAuthenticated, refreshNotifications]);

  // --- Renderizado Principal (Solo si está autenticado) ---
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>Gestiona todas tus notificaciones</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={!notifications.some((n) => !n.read)}
                  >
                    Marcar todas como leídas
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={!notifications.some((n) => n.read)}>
                        Eliminar leídas
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar notificaciones leídas?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará todas las notificaciones que ya has leído. Esta acción no se puede
                          deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteAllRead}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="todas">Todas ({notifications.length})</TabsTrigger>
                  <TabsTrigger value="no-leidas">No leídas ({notifications.filter((n) => !n.read).length})</TabsTrigger>
                  <TabsTrigger value="leidas">Leídas ({notifications.filter((n) => n.read).length})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {isNotificationsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : notificationsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">{notificationsError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => refreshNotifications()}
                      >
                        Reintentar
                      </Button>
                    </div>
                  ) : filteredNotifications().length > 0 ? (
                    <div className="space-y-4">
                      {filteredNotifications().map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border cursor-pointer ${notification.read ? "bg-white hover:bg-gray-50" : "bg-primary-background border-primary-light hover:bg-blue-50"}`}
                          onClick={() => !notification.read && markAsRead(notification.id)} // Marcar como leída al hacer clic solo si no está leída
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{notification.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{notification.date}</span>
                                  {/* Usar un diálogo separado para eliminar individualmente */}
                                  <AlertDialog open={notificationToDelete === notification.id} onOpenChange={(isOpen) => !isOpen && setNotificationToDelete(null)}>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                                        onClick={(e) => {
                                          e.stopPropagation() // Evitar que el clic marque como leída
                                          setNotificationToDelete(notification.id)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción eliminará permanentemente esta notificación.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                          }}
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              {notification.feedback && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                  <strong>Feedback:</strong> {notification.feedback}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No tienes notificaciones en esta categoría.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
} // Fin del componente Notificaciones
