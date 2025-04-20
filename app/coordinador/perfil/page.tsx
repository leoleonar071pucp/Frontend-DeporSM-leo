"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Shield, Key, Save, Building2, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react"

export default function PerfilCoordinador() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: "Carlos",
    apellidos: "Rodríguez García",
    email: "carlos.rodriguez@example.com",
    telefono: "987-654-321",
    cargo: "Coordinador",
    departamento: "Deportes",
    direccion: "Av. Principal 123, San Miguel",
    instalaciones: [
      {
        id: 1,
        nombre: "Cancha de Fútbol (Grass)",
        ubicacion: "Parque Juan Pablo II",
        horarios: ["Lun, Mie, Vie: 08:00 - 12:00"]
      },
      {
        id: 2,
        nombre: "Piscina Municipal",
        ubicacion: "Complejo Deportivo Municipal",
        horarios: ["Mar, Jue: 14:00 - 18:00"]
      }
    ]
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)
      setIsEditing(false)

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="@coordinador" />
                <AvatarFallback className="text-4xl bg-primary text-white">CR</AvatarFallback>
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
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profileData.direccion}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Instalaciones Asignadas</CardTitle>
              <CardDescription>Instalaciones bajo tu supervisión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.instalaciones.map((instalacion) => (
                  <div key={instalacion.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{instalacion.nombre}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {instalacion.ubicacion}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {instalacion.horarios.map((horario, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" />
                          {horario}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

