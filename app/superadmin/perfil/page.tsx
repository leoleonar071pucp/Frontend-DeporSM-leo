"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Shield, Lock, Save, Upload, Bell, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PerfilSuperadminPage() {
  const [profileData, setProfileData] = useState({
    name: "Administrador Principal",
    email: "superadmin@munisanmiguel.gob.pe",
    phone: "(01) 987-6543",
    department: "Tecnología",
    lastLogin: "05/04/2025, 08:00",
    ipAddress: "192.168.1.3",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    systemAlerts: true,
    securityAlerts: true,
    maintenanceAlerts: false,
    emailFrequency: "immediate",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationToggle = (setting) => {
    setNotificationSettings((prev) => ({ ...prev, [setting]: !prev[setting] }))
  }

  const handleFrequencyChange = (value) => {
    setNotificationSettings((prev) => ({ ...prev, emailFrequency: value }))
  }

  const handleSaveProfile = () => {
    // Aquí iría la lógica para guardar el perfil
    console.log("Guardando perfil:", profileData)
  }

  const handleSaveNotifications = () => {
    // Aquí iría la lógica para guardar las notificaciones
    console.log("Guardando notificaciones:", notificationSettings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>Tu información personal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="@superadmin" />
                <AvatarFallback className="bg-[#0cb7f2] text-white text-2xl">SA</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-white">
                <Upload className="h-4 w-4" />
                <span className="sr-only">Cambiar imagen</span>
              </Button>
            </div>
            <h3 className="text-xl font-bold">{profileData.name}</h3>
            <p className="text-sm text-muted-foreground">Superadministrador</p>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Último acceso</span>
                <span className="text-sm font-medium">{profileData.lastLogin}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Dirección IP</span>
                <span className="text-sm font-medium">{profileData.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Rol</span>
                <span className="text-sm font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-[#0cb7f2]" />
                  Superadministrador
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="bg-[#bceeff]">
              <TabsTrigger value="personal" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Información Personal
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
                <Lock className="h-4 w-4 mr-2" />
                Seguridad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        name="name"
                        className="pl-8"
                        value={profileData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="pl-8"
                        value={profileData.email}
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
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={profileData.department}
                      onValueChange={(value) => setProfileData((prev) => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Selecciona un departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                        <SelectItem value="Administración">Administración</SelectItem>
                        <SelectItem value="Deportes">Deportes</SelectItem>
                        <SelectItem value="Cultura">Cultura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailAlerts">Alertas por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones importantes por correo electrónico
                        </p>
                      </div>
                      <Switch
                        id="emailAlerts"
                        checked={notificationSettings.emailAlerts}
                        onCheckedChange={() => handleNotificationToggle("emailAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemAlerts">Alertas del Sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones sobre el estado del sistema
                        </p>
                      </div>
                      <Switch
                        id="systemAlerts"
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={() => handleNotificationToggle("systemAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="securityAlerts">Alertas de Seguridad</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones sobre eventos de seguridad
                        </p>
                      </div>
                      <Switch
                        id="securityAlerts"
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={() => handleNotificationToggle("securityAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceAlerts">Alertas de Mantenimiento</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones sobre mantenimientos programados
                        </p>
                      </div>
                      <Switch
                        id="maintenanceAlerts"
                        checked={notificationSettings.maintenanceAlerts}
                        onCheckedChange={() => handleNotificationToggle("maintenanceAlerts")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="emailFrequency">Frecuencia de Emails</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <Select
                        id="emailFrequency"
                        value={notificationSettings.emailFrequency}
                        onValueChange={handleFrequencyChange}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Inmediata</SelectItem>
                          <SelectItem value="hourly">Cada hora</SelectItem>
                          <SelectItem value="daily">Diaria</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveNotifications}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad de la Cuenta</CardTitle>
                  <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                    <p className="text-sm text-muted-foreground">
                      Para cambiar tu contraseña, haz clic en el botón de abajo
                    </p>
                    <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
                      <a href="/superadmin/cambiar-contrasena">
                        <Lock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </a>
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium">Sesiones Activas</h3>
                    <p className="text-sm text-muted-foreground mb-4">Estas son tus sesiones activas actualmente</p>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">Sesión Actual</p>
                          <p className="text-sm text-gray-500">Navegador: Chrome en Windows</p>
                          <p className="text-sm text-gray-500">IP: {profileData.ipAddress}</p>
                        </div>
                        <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activa</Badge>
                      </div>

                      <div className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">Sesión Móvil</p>
                          <p className="text-sm text-gray-500">Aplicación: Android</p>
                          <p className="text-sm text-gray-500">IP: 192.168.1.5</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-500">
                          Cerrar Sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

