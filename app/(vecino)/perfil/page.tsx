"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Loader2, User, Mail, Phone, Lock, Bell, Shield, MapPin } from "lucide-react"
// Loader2 ya está importado
export default function Perfil() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Estados locales para los campos editables, inicializados desde el contexto
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  // DNI y Email usualmente no son editables, los tomamos directo del user si existen
  const dni = user?.dni || "" // Asumiendo que dni podría estar en User

  // Efecto para inicializar/actualizar estados locales cuando user cambie
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "")
      setEmail(user.email || "")
      // Asumiendo que telefono y direccion podrían venir del user o una API
      setTelefono(user.telefono || "") // Necesitarías añadir 'telefono' a la interfaz User en AuthContext
      setDireccion(user.direccion || "") // Necesitarías añadir 'direccion' a la interfaz User en AuthContext
    }
  }, [user])

  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    reservas: true,
    promociones: false,
    mantenimiento: true,
  })

  const [selectedFrequency, setSelectedFrequency] = useState("tiempo-real")

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edición
      setIsEditing(false)
    } else {
      // Iniciar edición
      setIsEditing(true)
    }
  }

  // Actualizar manejador para los nuevos estados locales
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'nombre': setNombre(value); break;
      case 'email': setEmail(value); break; // Permitir editar email si es necesario
      case 'telefono': setTelefono(value); break;
      case 'direccion': setDireccion(value); break;
      // No incluir DNI ya que no es editable
    }
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    setIsSaving(true)

    // Simulación de guardado (enviarías nombre, email, telefono, direccion a la API)
    const updatedData = { nombre, email, telefono, direccion };
    console.log("Simulando guardado de perfil:", updatedData);
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)
      setIsEditing(false)
      // Aquí podrías actualizar el user en AuthContext si la API devuelve los datos actualizados
      // updateUserContext(updatedData); // Función hipotética en AuthContext

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica para cambiar contraseña
  }

   // --- Protección de Ruta ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // --- Renderizado Condicional por Carga/Autenticación ---
   if (isAuthLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // --- Renderizado Principal ---
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

          <Tabs defaultValue="informacion">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="informacion">Información Personal</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="informacion">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>Gestiona tu información personal</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isSuccess && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Guardado correctamente</span>
                        </div>
                      )}
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={handleEditToggle}
                        className={isEditing ? "" : "bg-primary hover:bg-primary-light"}
                      >
                        {isEditing ? "Cancelar" : "Editar perfil"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="@usuario" />
                        <AvatarFallback className="bg-primary-light text-white text-xl">
                          {/* Usar datos del contexto/estado */}
                          {nombre
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase() || <User />}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          Cambiar foto
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="flex-grow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Nombre completo
                          </Label>
                          <Input
                            id="nombre"
                            name="nombre"
                            value={nombre} // Usar estado local
                            onChange={handleInputChange}
                            readOnly // Siempre solo lectura
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Correo electrónico
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email} // Usar estado local
                            onChange={handleInputChange}
                            readOnly // Siempre solo lectura
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            Teléfono
                          </Label>
                          <Input
                            id="telefono"
                            name="telefono"
                            value={telefono} // Usar estado local
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dni" className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            DNI
                          </Label>
                          <Input
                            id="dni"
                            name="dni"
                            value={dni} // Usar variable derivada del contexto
                            onChange={handleInputChange}
                            disabled={true} // DNI no se puede editar
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="direccion" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Dirección
                          </Label>
                          <Input
                            id="direccion"
                            name="direccion"
                            value={direccion} // Usar estado local
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-6 flex justify-end">
                          <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              "Guardar cambios"
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguridad">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>Gestiona tu contraseña y configuración de seguridad</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Contraseña actual
                        </Label>
                        <Input id="current-password" type="password" placeholder="Ingresa tu contraseña actual" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Nueva contraseña
                        </Label>
                        <Input id="new-password" type="password" placeholder="Ingresa tu nueva contraseña" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Confirmar nueva contraseña
                        </Label>
                        <Input id="confirm-password" type="password" placeholder="Confirma tu nueva contraseña" />
                      </div>

                      <div className="mt-6">
                        <Button type="submit" className="bg-primary hover:bg-primary-light">
                          Cambiar contraseña
                        </Button>
                      </div>
                    </div>
                  </form>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Sesiones activas</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Chrome en Windows</p>
                            <p className="text-sm text-gray-500">Lima, Perú • Activa ahora</p>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Actual</div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Safari en iPhone</p>
                            <p className="text-sm text-gray-500">Lima, Perú • Hace 2 días</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Cerrar sesión
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline">Cerrar todas las sesiones</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificaciones">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de notificaciones</CardTitle>
                  <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notificaciones por correo electrónico
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications" className="font-medium">
                              Recibir notificaciones por correo
                            </Label>
                            <p className="text-sm text-gray-500">
                              Recibe todas las notificaciones en tu correo electrónico
                            </p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notificationSettings.email}
                            onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="reservas-notifications" className="font-medium">
                              Reservas
                            </Label>
                            <p className="text-sm text-gray-500">
                              Confirmaciones, recordatorios y cambios en tus reservas
                            </p>
                          </div>
                          <Switch
                            id="reservas-notifications"
                            checked={notificationSettings.reservas}
                            onCheckedChange={(checked) => handleNotificationChange("reservas", checked)}
                            disabled={!notificationSettings.email}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="promociones-notifications" className="font-medium">
                              Promociones
                            </Label>
                            <p className="text-sm text-gray-500">Ofertas especiales, descuentos y eventos</p>
                          </div>
                          <Switch
                            id="promociones-notifications"
                            checked={notificationSettings.promociones}
                            onCheckedChange={(checked) => handleNotificationChange("promociones", checked)}
                            disabled={!notificationSettings.email}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="mantenimiento-notifications" className="font-medium">
                              Mantenimiento
                            </Label>
                            <p className="text-sm text-gray-500">Información sobre mantenimiento de instalaciones</p>
                          </div>
                          <Switch
                            id="mantenimiento-notifications"
                            checked={notificationSettings.mantenimiento}
                            onCheckedChange={(checked) => handleNotificationChange("mantenimiento", checked)}
                            disabled={!notificationSettings.email}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Sección de Frecuencia de Notificaciones eliminada */}

                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-primary hover:bg-primary-light">Guardar preferencias</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

