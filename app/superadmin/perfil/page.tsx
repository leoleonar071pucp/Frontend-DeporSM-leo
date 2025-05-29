"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Shield, Lock, Save, CheckCircle, Loader2 } from "lucide-react"

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

// Función para formatear teléfono
const formatPhoneNumber = (phoneNumber: string): string => {
  // Eliminar cualquier caracter que no sea un número
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Verificar si el teléfono tiene 9 dígitos (formato peruano)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  }

  // Si tiene otro número de dígitos, devolver con formato básico
  return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
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
      setProfileData(prevData => {
        // Verificar si el teléfono del usuario es el predeterminado "900000000" o similar
        const isDefaultPhone = user.telefono &&
          (user.telefono === "900000000" ||
           user.telefono === "900-000-000" ||
           user.telefono.replace(/\D/g, '') === "900000000");

        return {
          ...prevData,
          name: user.nombre || prevData.name,
          email: user.email || prevData.email,
          // Usar el teléfono predeterminado "987-654-321" si es el número genérico "900000000"
          phone: (user.telefono && !isDefaultPhone) ?
                 formatPhoneNumber(user.telefono) :
                 "987-654-321",
        }
      })
    }
  }, [user])

  // Manejadores de eventos
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'phone') {
      // Para el campo de teléfono, solo permitir números y máximo 9 dígitos
      const onlyNums = value.replace(/\D/g, '').substring(0, 9);
      setProfileData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(onlyNums)
      }))
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }))
    }
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
  const userInitials = user?.nombre && user?.apellidos
    ? (user.nombre.charAt(0) + user.apellidos.charAt(0)).toUpperCase()
    : user?.nombre
      ? user.nombre.charAt(0).toUpperCase()
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
                    placeholder="Ej: 999-888-777"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="font-medium"
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">Formato: 999-888-777</p>
                  )}
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


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

