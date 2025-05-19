"use client"

import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Loader2, Mail, Phone, User, Shield, Calendar, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function PerfilAdmin() {
  const { user, checkAuthStatus } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    cargo: "Administrador",
    departamento: "",
    direccion: "",
  })

  // Cargar datos del perfil desde el backend
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        setProfileData({
          nombre: user.nombre || "",
          apellidos: user.apellidos || "",
          email: user.email || "",
          telefono: user.telefono || "",
          cargo: "Administrador",
          departamento: "",
          direccion: user.direccion || "",
        })
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/actualizar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          telefono: profileData.telefono,
          direccion: profileData.direccion
        })
      });

      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Error al actualizar el perfil: ${response.status}`);
      }

      // Actualizar el contexto de autenticación para reflejar los cambios
      await checkAuthStatus();

      setIsSuccess(true);
      setIsEditing(false);

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el perfil",
      });
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={`@${profileData.nombre}`} />
                )}
                <AvatarFallback className="text-4xl bg-[#0cb7f2] text-white">
                  {user?.nombre?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {profileData.nombre} {profileData.apellidos}
              </h2>
              <p className="text-gray-500">{profileData.cargo}</p>

              <Separator className="my-4" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.direccion}</span>
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
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={profileData.nombre}
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
                      value={profileData.apellidos}
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
                    <Label htmlFor="telefono" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={profileData.telefono}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.telefono ? "border-red-500" : ""}
                    />
                    {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={profileData.direccion}
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
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  )
}

