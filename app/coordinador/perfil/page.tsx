"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { User, Mail, Phone, Shield, Key, Save, Building2, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { API_BASE_URL } from "@/lib/config";


// Interfaz para las instalaciones asignadas
interface Instalacion {
  id: number;
  nombre: string;
  ubicacion: string;
  horarios: string[];
}

// Interfaz para los datos de perfil
interface ProfileData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  direccion: string;
  instalaciones: Instalacion[];
}

export default function PerfilCoordinador() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    cargo: "Coordinador",
    departamento: "Deportes",
    direccion: "",
    instalaciones: []
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar los datos del perfil desde el backend
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Obtener información del coordinador desde el backend
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
          method: 'GET',
          credentials: 'include', // Para enviar cookies de sesión
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
          setIsLoading(false);
          return;
        }
        if (!response.ok) {
          console.error("Error en la respuesta:", response.status, response.statusText);
          throw new Error(`Error al obtener datos del perfil: ${response.status}`);
        }

        const userData = await response.json();
        console.log("Datos recibidos del perfil:", userData);

        // Obtener las instalaciones asignadas al coordinador desde el backend
        let instalacionesData = [];
        try {
          const instalacionesResponse = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${userData.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (instalacionesResponse.ok) {
            const instalaciones = await instalacionesResponse.json();
            console.log("Instalaciones asignadas:", instalaciones);

            // Para cada instalación, obtener sus horarios específicos
            const instalacionesConHorarios = await Promise.all(
              instalaciones.map(async (instalacion: any) => {
                try {
                  const horariosResponse = await fetch(`${API_BASE_URL}/horarios-coordinador/coordinador/${userData.id}/instalacion/${instalacion.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  });

                  let horarios = ["Horarios por definir"];
                  if (horariosResponse.ok) {
                    const horariosData = await horariosResponse.json();
                    console.log(`Horarios para instalación ${instalacion.id}:`, horariosData);

                    if (horariosData && horariosData.length > 0) {
                      // Agrupar horarios por día
                      const horariosPorDia: { [key: string]: string[] } = {};

                      horariosData.forEach((horario: any) => {
                        const dia = horario.diaSemana;
                        const horaInicio = horario.horaInicio.substring(0, 5); // HH:MM
                        const horaFin = horario.horaFin.substring(0, 5); // HH:MM
                        const horarioTexto = `${horaInicio} - ${horaFin}`;

                        if (!horariosPorDia[dia]) {
                          horariosPorDia[dia] = [];
                        }
                        horariosPorDia[dia].push(horarioTexto);
                      });

                      // Convertir a formato legible - usar minúsculas como en la BD
                      const diasOrden = [
                        { key: 'lunes', label: 'Lunes' },
                        { key: 'martes', label: 'Martes' },
                        { key: 'miercoles', label: 'Miércoles' },
                        { key: 'jueves', label: 'Jueves' },
                        { key: 'viernes', label: 'Viernes' },
                        { key: 'sabado', label: 'Sábado' },
                        { key: 'domingo', label: 'Domingo' }
                      ];

                      horarios = diasOrden
                        .filter(dia => horariosPorDia[dia.key])
                        .map(dia => `${dia.label}: ${horariosPorDia[dia.key].join(', ')}`);

                      if (horarios.length === 0) {
                        horarios = ["Sin horarios asignados"];
                      }
                    }
                  }

                  return {
                    id: instalacion.id,
                    nombre: instalacion.nombre,
                    ubicacion: instalacion.ubicacion || "Ubicación no especificada",
                    horarios: horarios
                  };
                } catch (error) {
                  console.error(`Error al obtener horarios para instalación ${instalacion.id}:`, error);
                  return {
                    id: instalacion.id,
                    nombre: instalacion.nombre,
                    ubicacion: instalacion.ubicacion || "Ubicación no especificada",
                    horarios: ["Error al cargar horarios"]
                  };
                }
              })
            );

            instalacionesData = instalacionesConHorarios;
          } else {
            console.warn("No se pudieron obtener las instalaciones asignadas");
          }
        } catch (error) {
          console.error("Error al obtener instalaciones:", error);
        }

        setProfileData({
          nombre: userData.nombre || "",
          apellidos: userData.apellidos || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          cargo: "Coordinador",
          departamento: "Deportes",
          direccion: userData.direccion || "",
          instalaciones: instalacionesData
        });
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del perfil",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);

    // Si se cancela la edición, restaurar los datos originales
    if (isEditing) {
      const fetchProfileData = async () => {
        // Recargar los datos del perfil
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error('Error al obtener datos del perfil');
          }

          const userData = await response.json();

          // Actualizar sólo los campos editables
          setProfileData(prev => ({
            ...prev,
            telefono: userData.telefono || "",
            direccion: userData.direccion || ""
          }));
        } catch (error) {
          console.error("Error al recargar el perfil:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfileData();
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
      // Enviar la solicitud de actualización al backend
      const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
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
        setIsEditing(false);
        setIsSaving(false);
        return;
      }
      if (!response.ok) {
        console.error("Error en la respuesta:", response.status, response.statusText);
        throw new Error(`Error al actualizar el perfil: ${response.status}`);
      }

      // Obtener los datos actualizados
      const updatedData = await response.json();

      // Actualizar el estado con los datos recibidos del servidor
      setProfileData(prev => ({
        ...prev,
        telefono: updatedData.telefono || prev.telefono,
        direccion: updatedData.direccion || prev.direccion
      }));

      // Establecer éxito y cerrar modo edición
      setIsSuccess(true);
      setIsEditing(false);

      toast({
        title: "Perfil actualizado",
        description: "Se han guardado los cambios correctamente",
      });

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
                <AvatarFallback className="text-4xl bg-primary text-white">
                  {profileData.nombre && profileData.apellidos
                    ? (profileData.nombre.charAt(0) + profileData.apellidos.charAt(0)).toUpperCase()
                    : profileData.nombre
                      ? profileData.nombre.charAt(0).toUpperCase()
                      : "CO"}
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
                {profileData.instalaciones.length > 0 ? (
                  profileData.instalaciones.map((instalacion) => (
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
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No tienes instalaciones asignadas actualmente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

