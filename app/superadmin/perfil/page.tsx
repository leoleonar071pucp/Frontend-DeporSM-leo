"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Shield, Lock, Save, Upload, CheckCircle, Loader2, Monitor, Smartphone, LogOut, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext" // Importar el contexto de autenticación
import { useToast } from "@/hooks/use-toast" // Importar el hook para toast
import { Separator } from "@/components/ui/separator"

// Definición de tipos para mejorar la seguridad de tipos
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  lastLogin: string;
  ipAddress: string;
}

export default function PerfilSuperadminPage() {
  const { user } = useAuth() // Obtener el usuario del contexto de autenticación
  const { toast } = useToast() // Obtener toast para notificaciones
  const [isSaving, setIsSaving] = useState(false) // Estado para botón de guardado
  const [isSuccess, setIsSuccess] = useState(false) // Estado para mensaje de éxito
  const [isEditing, setIsEditing] = useState(false) // Estado para modo de edición

  // Inicializar datos del perfil con la información de usuario del contexto
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Administrador Principal",
    email: "superadmin@munisanmiguel.gob.pe",
    phone: "987-654-321",
    lastLogin: "05/04/2025, 08:00",
    ipAddress: "192.168.1.3",
  })

  // Actualizar los datos del perfil cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfileData(prevData => ({
        ...prevData,
        name: user.nombre || prevData.name,
        email: user.email || prevData.email,
        phone: user.telefono || prevData.phone,
      }))
    }
  }, [user])

  // Manejadores de eventos
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleSaveProfile = () => {
    setIsSaving(true)
    
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)
      setIsEditing(false)
      
      // Mostrar toast de éxito
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      })
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  // Generar iniciales para el avatar desde el nombre del usuario
  const userInitials = user?.nombre
    ? user.nombre.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : 'SA';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt="@superadmin" />
                <AvatarFallback className="text-4xl bg-primary text-white">{userInitials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user?.nombre || profileData.name}</h2>
              <p className="text-gray-500">Administrador Principal del Sistema</p>
              <p className="text-gray-500">Superadministrador</p>

              <Separator className="my-4" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Sistema</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name.split(' ')[0] || ""}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Apellidos
                  </Label>
                  <Input
                    id="apellidos"
                    name="apellidos"
                    value={profileData.name.split(' ').slice(1).join(' ') || ""}
                    onChange={handleInputChange}
                    disabled={true}
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
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary-light" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                <p className="text-sm text-muted-foreground">
                  Para cambiar tu contraseña, haz clic en el botón de abajo
                </p>
                <Button className="bg-primary hover:bg-primary-light" asChild>
                  <Link href="/superadmin/cambiar-contrasena">
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium">Sesiones Activas</h3>
                <p className="text-sm text-muted-foreground mb-4">Gestiona los dispositivos donde has iniciado sesión</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Windows PC - Chrome</p>
                        <p className="text-sm text-gray-500">Lima, Perú • Última actividad: Ahora</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Actual</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">iPhone - Safari</p>
                        <p className="text-sm text-gray-500">Lima, Perú • Última actividad: Hace 2 días</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-gray-600 gap-1">
                      <LogOut className="h-3.5 w-3.5" />
                      Cerrar
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" className="text-gray-600 gap-1">
                    <LogOut className="h-4 w-4 mr-1" />
                    Cerrar todas las otras sesiones
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

