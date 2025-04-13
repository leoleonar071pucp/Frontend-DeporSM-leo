"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Loader2, Mail, Phone, User, Shield, Calendar, MapPin } from "lucide-react"

export default function PerfilAdmin() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: "Juan Pérez",
    apellidos: "García López",
    email: "admin@munisanmiguel.gob.pe",
    telefono: "987-654-321",
    cargo: "Administrador",
    departamento: "Deportes",
    fechaIngreso: "01/01/2023",
    direccion: "Av. Principal 123, San Miguel",
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edición
      setIsEditing(false)
    } else {
      // Iniciar edición
      setIsEditing(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
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

    if (!profileData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!profileData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios"
    }

    if (!profileData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!profileData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)
      setIsEditing(false)

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y profesional</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="@admin" />
                <AvatarFallback className="text-4xl bg-primary text-white">JP</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {profileData.nombre} {profileData.apellidos}
              </h2>
              <p className="text-gray-500">{profileData.cargo}</p>
              <p className="text-sm text-gray-500 mt-1">{profileData.departamento}</p>

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
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Desde {profileData.fechaIngreso}</span>
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
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Información Personal</TabsTrigger>
              <TabsTrigger value="profesional">Información Profesional</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Datos Personales</CardTitle>
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
                          disabled={!isEditing}
                          className={errors.nombre ? "border-red-500" : ""}
                        />
                        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
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
                          disabled={!isEditing}
                          className={errors.apellidos ? "border-red-500" : ""}
                        />
                        {errors.apellidos && <p className="text-red-500 text-sm">{errors.apellidos}</p>}
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
                          disabled={!isEditing}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
            </TabsContent>

            <TabsContent value="profesional" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Información Profesional</CardTitle>
                      <CardDescription>Detalles de tu rol y departamento</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Cargo
                      </Label>
                      <Input value={profileData.cargo} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Departamento
                      </Label>
                      <Input value={profileData.departamento} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Fecha de ingreso
                      </Label>
                      <Input value={profileData.fechaIngreso} disabled />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Permisos y accesos</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Gestión de instalaciones</p>
                          <p className="text-sm text-gray-500">Crear, editar y eliminar instalaciones</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Permitido</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Gestión de reservas</p>
                          <p className="text-sm text-gray-500">Aprobar, rechazar y cancelar reservas</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Permitido</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Gestión de mantenimiento</p>
                          <p className="text-sm text-gray-500">Programar y gestionar mantenimientos</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Permitido</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Gestión de usuarios</p>
                          <p className="text-sm text-gray-500">Crear, editar y eliminar usuarios</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">No permitido</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Gestión de reportes</p>
                          <p className="text-sm text-gray-500">Generar y descargar reportes</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Permitido</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500">
                    Para solicitar cambios en tus permisos, contacta al administrador del sistema.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

