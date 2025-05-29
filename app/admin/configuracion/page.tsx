"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Loader2, Bell, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ConfiguracionAdmin() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("seguridad")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // Estado para la configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email: true
  })

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmacionPassword: "",
  })

  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para validación de coincidencia de contraseñas
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar preferencias de notificaciones desde el backend
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/preferencias-notificaciones`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setNotificationSettings({
            email: data.email
          });
        }
      } catch (error) {
        console.error("Error al cargar preferencias de notificaciones:", error);
      }
    };

    fetchNotificationPreferences();
  }, []);

  // Manejadores para alternar la visibilidad de las contraseñas
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(prev => !prev);
  const toggleNewPasswordVisibility = () => setShowNewPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Verificar coincidencia de contraseñas
    if (name === 'passwordNueva') {
      setPasswordsMatch(value === passwordData.confirmacionPassword || passwordData.confirmacionPassword === "");
    } else if (name === 'confirmacionPassword') {
      setPasswordsMatch(value === passwordData.passwordNueva);
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

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.passwordActual) {
      newErrors.passwordActual = "La contraseña actual es obligatoria"
    }

    if (!passwordData.passwordNueva) {
      newErrors.passwordNueva = "La nueva contraseña es obligatoria"
    } else if (passwordData.passwordNueva.length < 6) {
      newErrors.passwordNueva = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!passwordData.confirmacionPassword) {
      newErrors.confirmacionPassword = "Debes confirmar la nueva contraseña"
    } else if (passwordData.passwordNueva !== passwordData.confirmacionPassword) {
      newErrors.confirmacionPassword = "Las contraseñas no coinciden"
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
      const response = await fetch(`${API_BASE_URL}/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
        });
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        // El backend devuelve el mensaje de error en el body
        throw new Error(typeof errorData === 'string' ? errorData :
          (errorData.message || "Error al cambiar la contraseña"));
      }

      // Limpiar campos de contraseña y restablecer estados
      setPasswordData({
        passwordActual: "",
        passwordNueva: "",
        confirmacionPassword: ""
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
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar la contraseña",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/preferencias-notificaciones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notificationSettings)
      });

      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
        });
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error al guardar preferencias: ${response.status}`);
      }

      setIsSuccess(true);

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
      });

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las preferencias de notificaciones",
      });
    } finally {
      setIsSavingNotifications(false);
    }
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
                    <Label htmlFor="passwordActual" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Contraseña actual
                    </Label>
                    <div className="relative">
                      <Input
                        id="passwordActual"
                        name="passwordActual"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        value={passwordData.passwordActual}
                        onChange={handlePasswordChange}
                        className={errors.passwordActual ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleCurrentPasswordVisibility}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.passwordActual && <p className="text-red-500 text-sm">{errors.passwordActual}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordNueva" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="passwordNueva"
                        name="passwordNueva"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Ingresa tu nueva contraseña"
                        value={passwordData.passwordNueva}
                        onChange={handlePasswordChange}
                        className={errors.passwordNueva ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.passwordNueva && <p className="text-red-500 text-sm">{errors.passwordNueva}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmacionPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Confirmar nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmacionPassword"
                        name="confirmacionPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu nueva contraseña"
                        value={passwordData.confirmacionPassword}
                        onChange={handlePasswordChange}
                        className={!passwordsMatch && passwordData.confirmacionPassword ? "border-red-500 focus-visible:ring-red-500" : errors.confirmacionPassword ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && passwordData.confirmacionPassword && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Las contraseñas no coinciden
                      </div>
                    )}
                    {errors.confirmacionPassword && passwordsMatch && <p className="text-red-500 text-sm">{errors.confirmacionPassword}</p>}
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
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-primary hover:bg-primary-light"
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
              >
                {isSavingNotifications ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar preferencias"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

