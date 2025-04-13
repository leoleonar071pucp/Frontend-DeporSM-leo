"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Shield, Key, Save } from "lucide-react"

export default function PerfilPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "987-654-321",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()

    // Aquí iría la lógica para actualizar el perfil
    console.log("Actualizando perfil:", formData)

    toast({
      title: "Perfil actualizado",
      description: "Tu información de perfil ha sido actualizada exitosamente.",
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    // Validación básica
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para cambiar la contraseña
    console.log("Cambiando contraseña")

    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido actualizada exitosamente.",
    })

    // Limpiar el formulario
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="informacion">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informacion">Información Personal</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            </TabsList>
            <TabsContent value="informacion">
              <Card>
                <form onSubmit={handleProfileSubmit}>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="name"
                          name="name"
                          className="pl-8"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          className="pl-8"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="phone"
                          name="phone"
                          className="pl-8"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-primary hover:bg-primary-light">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="seguridad">
              <Card>
                <form onSubmit={handlePasswordSubmit}>
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Actualiza tu contraseña y configura las opciones de seguridad</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña actual</Label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          className="pl-8"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          className="pl-8"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          className="pl-8"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-primary hover:bg-primary-light">
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="@coordinador" />
                <AvatarFallback className="text-2xl bg-primary-light text-white">CR</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{formData.name}</h2>
              <p className="text-gray-500">Coordinador</p>
              <div className="w-full mt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.phone}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" className="w-full">
                Cambiar Foto
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Información de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Coordinador</span>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Último acceso</h3>
                <p className="mt-1 text-sm">05/04/2025, 09:15</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Instalaciones asignadas</h3>
                <p className="mt-1 text-sm">2 instalaciones</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

