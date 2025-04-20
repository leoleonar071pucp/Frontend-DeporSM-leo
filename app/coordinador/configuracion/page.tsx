"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Save, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("seguridad")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Estado para la configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    observaciones: true,
    asignaciones: true,
    recordatorios: true,
    mantenimiento: true
  })

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es obligatoria"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es obligatoria"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la nueva contraseña"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setIsSaving(true)

    // Simulación de cambio de contraseña
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)

      // Resetear formulario y mensaje de éxito
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  const handleSaveNotifications = () => {
    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)

      toast({
        title: "Configuración guardada",
        description: "Tus preferencias han sido actualizadas exitosamente.",
      })

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias de notificaciones</p>
      </div>

      <Tabs defaultValue="seguridad" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="seguridad" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
                </div>
                {isSuccess && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Contraseña actualizada correctamente</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Contraseña actual
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={errors.currentPassword ? "border-red-500" : ""}
                    />
                    {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Nueva contraseña
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Confirmar nueva contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        "Cambiar contraseña"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Preferencias de notificaciones</CardTitle>
                  <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
                </div>
                {isSuccess && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Preferencias guardadas correctamente</span>
                  </div>
                )}
              </div>
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
                        <Label htmlFor="observaciones-notifications" className="font-medium">
                          Observaciones
                        </Label>
                        <p className="text-sm text-gray-500">Notificaciones sobre tus observaciones reportadas</p>
                      </div>
                      <Switch
                        id="observaciones-notifications"
                        checked={notificationSettings.observaciones}
                        onCheckedChange={(checked) => handleNotificationChange("observaciones", checked)}
                        disabled={!notificationSettings.email}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="asignaciones-notifications" className="font-medium">
                          Asignaciones
                        </Label>
                        <p className="text-sm text-gray-500">Notificaciones sobre nuevas instalaciones asignadas</p>
                      </div>
                      <Switch
                        id="asignaciones-notifications"
                        checked={notificationSettings.asignaciones}
                        onCheckedChange={(checked) => handleNotificationChange("asignaciones", checked)}
                        disabled={!notificationSettings.email}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="recordatorios-notifications" className="font-medium">
                          Recordatorios
                        </Label>
                        <p className="text-sm text-gray-500">Recordatorios de visitas e inspecciones</p>
                      </div>
                      <Switch
                        id="recordatorios-notifications"
                        checked={notificationSettings.recordatorios}
                        onCheckedChange={(checked) => handleNotificationChange("recordatorios", checked)}
                        disabled={!notificationSettings.email}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mantenimiento-notifications" className="font-medium">
                          Mantenimiento
                        </Label>
                        <p className="text-sm text-gray-500">Notificaciones sobre mantenimiento programado</p>
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
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-primary hover:bg-primary-light" onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar preferencias
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

