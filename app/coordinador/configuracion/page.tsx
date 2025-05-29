"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Save, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("seguridad")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Estado para la configuración de notificaciones (solo email)
  const [notificationSettings, setNotificationSettings] = useState({
    email: true
  })

  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para validación de coincidencia de contraseñas
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar preferencias de notificaciones al montar el componente
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/preferencias-notificaciones`, {
          credentials: 'include'
        });

        if (response.ok) {
          const preferences = await response.json();
          setNotificationSettings({
            email: preferences.email || false
          });
        } else {
          console.warn("No se pudieron cargar las preferencias de notificaciones");
        }
      } catch (error) {
        console.error("Error al cargar preferencias:", error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadNotificationPreferences();
  }, []);

  // Manejadores para alternar la visibilidad de las contraseñas
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(prev => !prev);
  const toggleNewPasswordVisibility = () => setShowNewPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Verificar coincidencia de contraseñas
    if (name === 'newPassword') {
      setPasswordsMatch(value === passwordData.confirmPassword || passwordData.confirmPassword === "");
    } else if (name === 'confirmPassword') {
      setPasswordsMatch(value === passwordData.newPassword);
    }

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  // Función para manejar cambios en notificaciones
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
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la nueva contraseña"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
      setPasswordsMatch(false);
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setIsChangingPassword(true)

    try {
      // Llamar al endpoint de API para cambiar contraseña
      const response = await fetch(`${API_BASE_URL}/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          passwordActual: passwordData.currentPassword,
          passwordNueva: passwordData.newPassword,
          confirmacionPassword: passwordData.confirmPassword
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // Limpiar campos de contraseña y restablecer estados
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        // Ocultar contraseñas
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        // Restablecer estado de coincidencia
        setPasswordsMatch(true);

        setIsSuccess(true);

        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente.",
        });

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        // Error al cambiar la contraseña
        const errorData = await response.json();

        // Añadir error al campo de contraseña actual si es incorrecta
        if (errorData.error && errorData.error.includes("contraseña actual no es válida")) {
          setErrors(prev => ({
            ...prev,
            currentPassword: "La contraseña actual es incorrecta"
          }));
        }

        toast({
          title: "Error al cambiar la contraseña",
          description: errorData.error || "La contraseña actual es incorrecta",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
        variant: "destructive"
      });
      console.error("Error al cambiar contraseña:", error);
    } finally {
      setIsChangingPassword(false);
    }
  }
  // Función para guardar notificaciones
  const handleSaveNotifications = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/preferencias-notificaciones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings),
        credentials: 'include'
      });

      if (response.ok) {
        setIsSaving(false)
        setIsSuccess(true)

        toast({
          title: "Configuración guardada",
          description: "Tus preferencias de notificaciones han sido actualizadas exitosamente.",
        })

        // Resetear mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setIsSuccess(false)
        }, 3000)
      } else {
        const errorData = await response.json();
        setIsSaving(false)

        toast({
          title: "Error al guardar preferencias",
          description: errorData.error || "No se pudieron guardar las preferencias",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
        variant: "destructive"
      });
      console.error("Error al guardar preferencias:", error);
    }
  }
  // Las variables de estado y funciones relacionadas con sesiones activas han sido eliminadas ya que esta sección fue ocultada

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias de notificaciones</p>
      </div>      <Tabs defaultValue="seguridad" value={activeTab} onValueChange={setActiveTab}>
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
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={errors.currentPassword ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleCurrentPasswordVisibility}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Ingresa tu nueva contraseña"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={errors.newPassword ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Confirmar nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu nueva contraseña"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={!passwordsMatch && passwordData.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : errors.confirmPassword ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && passwordData.confirmPassword && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Las contraseñas no coinciden
                      </div>
                    )}
                    {errors.confirmPassword && passwordsMatch && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary-light"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cambiando...
                        </>
                      ) : (
                        "Cambiar contraseña"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>          {/* Sesiones Activas - Comentado/oculto según requerimiento */}
          {/*
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Sesiones Activas</CardTitle>
                  <CardDescription>Gestiona los dispositivos donde has iniciado sesión</CardDescription>
                </div>
                {isSuccess && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Sesiones actualizadas correctamente</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <Laptop className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {session.device}
                          {session.current && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Actual
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.location} • Última actividad: {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={isSaving}
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1" />
                        Cerrar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleTerminateAllSessions}
                disabled={isSaving || activeSessions.length <= 1}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar todas las otras sesiones
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          */}
        </TabsContent>        <TabsContent value="notificaciones" className="mt-6">
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
                        disabled={isLoadingPreferences}
                      />
                    </div>


                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-primary hover:bg-primary-light"
                onClick={handleSaveNotifications}
                disabled={isSaving || isLoadingPreferences}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : isLoadingPreferences ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
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

