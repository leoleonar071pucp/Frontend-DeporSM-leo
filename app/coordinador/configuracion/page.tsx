"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Bell, Moon, Sun, Save, Smartphone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    observaciones: true,
    asignaciones: true,
    recordatorios: true,
    mantenimiento: true,
    frecuencia: "inmediata",
  })
  const [displaySettings, setDisplaySettings] = useState({
    theme: "light",
    fontSize: "normal",
  })
  const [mobileSettings, setMobileSettings] = useState({
    geolocalizacion: true,
    camaraRapida: true,
    datosMoviles: false,
  })

  const handleNotificationChange = (key, value) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleDisplayChange = (key, value) => {
    setDisplaySettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleMobileChange = (key, value) => {
    setMobileSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log("Guardando configuración:", {
      notificationSettings,
      displaySettings,
      mobileSettings,
    })

    toast({
      title: "Configuración guardada",
      description: "Tu configuración ha sido actualizada exitosamente.",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Canales de notificación</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Correo electrónico</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notificaciones push</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones en el navegador</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tipos de notificaciones</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="observaciones-notifications">Observaciones</Label>
                  <p className="text-sm text-gray-500">Notificaciones sobre tus observaciones reportadas</p>
                </div>
                <Switch
                  id="observaciones-notifications"
                  checked={notificationSettings.observaciones}
                  onCheckedChange={(checked) => handleNotificationChange("observaciones", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="asignaciones-notifications">Asignaciones</Label>
                  <p className="text-sm text-gray-500">Notificaciones sobre nuevas instalaciones asignadas</p>
                </div>
                <Switch
                  id="asignaciones-notifications"
                  checked={notificationSettings.asignaciones}
                  onCheckedChange={(checked) => handleNotificationChange("asignaciones", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recordatorios-notifications">Recordatorios</Label>
                  <p className="text-sm text-gray-500">Recordatorios de visitas e inspecciones</p>
                </div>
                <Switch
                  id="recordatorios-notifications"
                  checked={notificationSettings.recordatorios}
                  onCheckedChange={(checked) => handleNotificationChange("recordatorios", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mantenimiento-notifications">Mantenimiento</Label>
                  <p className="text-sm text-gray-500">Notificaciones sobre mantenimiento programado</p>
                </div>
                <Switch
                  id="mantenimiento-notifications"
                  checked={notificationSettings.mantenimiento}
                  onCheckedChange={(checked) => handleNotificationChange("mantenimiento", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Frecuencia</h3>
              <RadioGroup
                value={notificationSettings.frecuencia}
                onValueChange={(value) => handleNotificationChange("frecuencia", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inmediata" id="frecuencia-inmediata" />
                  <Label htmlFor="frecuencia-inmediata">Inmediata</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="diaria" id="frecuencia-diaria" />
                  <Label htmlFor="frecuencia-diaria">Resumen diario</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semanal" id="frecuencia-semanal" />
                  <Label htmlFor="frecuencia-semanal">Resumen semanal</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                <Moon className="h-5 w-5" />
                Pantalla y Apariencia
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Tema</h3>
                <RadioGroup
                  value={displaySettings.theme}
                  onValueChange={(value) => handleDisplayChange("theme", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Claro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Oscuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">Usar configuración del sistema</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Tamaño de fuente</h3>
                <Select
                  value={displaySettings.fontSize}
                  onValueChange={(value) => handleDisplayChange("fontSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeño</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="xlarge">Extra grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configuración Móvil
              </CardTitle>
              <CardDescription>Configura opciones específicas para dispositivos móviles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="geolocalizacion">Geolocalización</Label>
                  <p className="text-sm text-gray-500">Permitir acceso a la ubicación para validar visitas</p>
                </div>
                <Switch
                  id="geolocalizacion"
                  checked={mobileSettings.geolocalizacion}
                  onCheckedChange={(checked) => handleMobileChange("geolocalizacion", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="camara-rapida">Acceso rápido a cámara</Label>
                  <p className="text-sm text-gray-500">Habilitar acceso rápido a la cámara para reportes</p>
                </div>
                <Switch
                  id="camara-rapida"
                  checked={mobileSettings.camaraRapida}
                  onCheckedChange={(checked) => handleMobileChange("camaraRapida", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="datos-moviles">Usar datos móviles</Label>
                  <p className="text-sm text-gray-500">Permitir sincronización usando datos móviles</p>
                </div>
                <Switch
                  id="datos-moviles"
                  checked={mobileSettings.datosMoviles}
                  onCheckedChange={(checked) => handleMobileChange("datosMoviles", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guardar Configuración</CardTitle>
          <CardDescription>Guarda todos los cambios realizados en tu configuración</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="bg-primary hover:bg-primary-light" onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

