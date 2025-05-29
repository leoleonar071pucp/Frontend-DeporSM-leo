"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Loader2, User, Mail, Phone, Lock, Bell, Shield, MapPin, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"
export default function Perfil() {
  const { user, isAuthenticated, isLoading: isAuthLoading, checkAuthStatus } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // Estados locales para los campos editables
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [dni, setDni] = useState("")

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmacionPassword: ""
  })

  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para validación de coincidencia de contraseñas
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    promociones: false,
  })

  // Cargar datos del perfil desde el backend
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
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
          throw new Error(`Error al cargar el perfil: ${response.status}`);
        }

        const userData = await response.json();

        // Actualizar estados con los datos del usuario
        setNombre(userData.nombre || "");
        setApellidos(userData.apellidos || "");
        setEmail(userData.email || "");
        setTelefono(userData.telefono || "");
        setDireccion(userData.direccion || "");
        setDni(userData.dni || "");

        // Cargar preferencias de notificaciones si existen
        try {
          const notifResponse = await fetch(`${API_BASE_URL}/usuarios/preferencias-notificaciones`, {
            credentials: 'include',
          });

          if (notifResponse.ok) {
            const notifData = await notifResponse.json();
            setNotificationSettings({
              email: notifData.email,
              promociones: notifData.promociones
            });
          }
        } catch (error) {
          console.error("Error al cargar preferencias de notificaciones:", error);
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del perfil",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [user, isAuthenticated, router, toast])

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  }

  // Manejador para los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'nombre': setNombre(value); break;
      case 'email': setEmail(value); break;
      case 'telefono': setTelefono(value); break;
      case 'direccion': setDireccion(value); break;
      // Campos de contraseña
      case 'passwordActual':
        setPasswordData(prev => ({ ...prev, passwordActual: value }));
        break;
      case 'passwordNueva':
        setPasswordData(prev => {
          const newState = { ...prev, passwordNueva: value };
          // Verificar si las contraseñas coinciden
          setPasswordsMatch(newState.confirmacionPassword === "" || newState.passwordNueva === newState.confirmacionPassword);
          return newState;
        });
        break;
      case 'confirmacionPassword':
        setPasswordData(prev => {
          const newState = { ...prev, confirmacionPassword: value };
          // Verificar si las contraseñas coinciden
          setPasswordsMatch(newState.passwordNueva === newState.confirmacionPassword);
          return newState;
        });
        break;
    }
  }

  // Manejadores para alternar la visibilidad de las contraseñas
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(prev => !prev);
  const toggleNewPasswordVisibility = () => setShowNewPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  // Manejador para cambios en notificaciones
  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: checked }));
  }

  // Guardar cambios en el perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/actualizar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          telefono,
          direccion
        })
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
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (passwordData.passwordNueva !== passwordData.confirmacionPassword) {
      setPasswordsMatch(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (passwordData.passwordNueva.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    // Asegurarse de que se haya ingresado la contraseña actual
    if (!passwordData.passwordActual.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar tu contraseña actual",
      });
      return;
    }

    setIsChangingPassword(true);

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

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
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

  // Guardar preferencias de notificaciones
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

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
      });
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

   // --- Protección de Ruta ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // --- Renderizado Condicional por Carga/Autenticación ---
   if (isAuthLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // Mostrar indicador de carga mientras se obtienen los datos del perfil
  if (isLoadingProfile) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Cargando información del perfil...</p>
        </div>
      </main>
    );
  }

  // --- Renderizado Principal ---
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

          <Tabs defaultValue="informacion">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="informacion">Información Personal</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="informacion">
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
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="bg-primary text-white text-xl">
                          {nombre && apellidos
                            ? (nombre.charAt(0) + apellidos.charAt(0)).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <form onSubmit={handleSaveProfile} className="flex-grow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Nombre completo
                          </Label>
                          <Input
                            id="nombre"
                            name="nombre"
                            value={nombre} // Usar estado local
                            onChange={handleInputChange}
                            readOnly // Siempre solo lectura
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
                            value={email} // Usar estado local
                            onChange={handleInputChange}
                            readOnly // Siempre solo lectura
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
                            value={telefono} // Usar estado local
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dni" className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            DNI
                          </Label>
                          <Input
                            id="dni"
                            name="dni"
                            value={dni} // Usar variable derivada del contexto
                            onChange={handleInputChange}
                            disabled={true} // DNI no se puede editar
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="direccion" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Dirección
                          </Label>
                          <Input
                            id="direccion"
                            name="direccion"
                            value={direccion} // Usar estado local
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguridad">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>Gestiona tu contraseña y configuración de seguridad</CardDescription>
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
                            onChange={handleInputChange}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={toggleCurrentPasswordVisibility}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                            onChange={handleInputChange}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={toggleNewPasswordVisibility}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                            onChange={handleInputChange}
                            required
                            className={!passwordsMatch && passwordData.confirmacionPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
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
                      </div>

                      <div className="mt-6">
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

            <TabsContent value="notificaciones">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de notificaciones</CardTitle>
                  <CardDescription>Configura tus preferencias para recibir notificaciones por correo electrónico</CardDescription>
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
                            <Label htmlFor="promociones-notifications" className="font-medium">
                              Promociones
                            </Label>
                            <p className="text-sm text-gray-500">Ofertas especiales, descuentos y eventos</p>
                          </div>
                          <Switch
                            id="promociones-notifications"
                            checked={notificationSettings.promociones}
                            onCheckedChange={(checked) => handleNotificationChange("promociones", checked)}
                            disabled={!notificationSettings.email}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Sección de Frecuencia de Notificaciones eliminada */}

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
                      "Guardar configuración"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

