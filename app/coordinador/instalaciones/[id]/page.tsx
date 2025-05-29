"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  ClipboardList,
  Phone,
  XOctagon,
} from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


// Eliminamos el array estático de instalaciones

interface Observation {
  id: number;
  title: string;
  date: string;
  description: string;
  priority: string;
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'completada';
  coordinator: string;
  photos: string[];
}

// Actualizar la interfaz para reflejar los datos que vienen del backend
interface Instalacion {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  capacidad: number;
  horario: string;
  imagenUrl: string;
  precio: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Propiedades adicionales para el frontend
  status?: 'disponible' | 'mantenimiento';
  maintenanceStatus?: 'none' | 'required' | 'scheduled' | 'in-progress';
  lastVisit?: string;
  nextVisit?: string;
  isToday?: boolean;
  contactNumber?: string;
  schedule?: string;
  features?: string[];
  amenities?: string[];
  rules?: string[];
  observations?: Observation[];
}

export default function InstalacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const facilityId = resolvedParams.id;
  const [isLoading, setIsLoading] = useState(true);
  const [facility, setFacility] = useState<Instalacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [hasVisitToday, setHasVisitToday] = useState(false);
  const [nextVisit, setNextVisit] = useState<string | null>(null);

  // Obtener el usuario del contexto de autenticación
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Función para mapear estados de observaciones del backend al frontend
  const mapObservationStatus = (backendStatus: string): Observation['status'] => {
    switch (backendStatus.toLowerCase()) {
      case 'pendiente':
        return 'pendiente';
      case 'en_proceso':
        return 'aprobada';
      case 'resuelta':
        return 'completada';
      case 'cancelada':
        return 'rechazada';
      default:
        return 'pendiente';
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      // Si no hay usuario autenticado o no es coordinador, redirigir
      if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
        setAuthorized(false);
        setError("No tienes permisos para ver esta instalación");
        setIsLoading(false);
        return;
      }      try {
        // Verificar si el coordinador tiene acceso a esta instalación
        const accessResponse = await fetch(
          `${API_BASE_URL}/instalaciones/coordinador/${user.id}`,
          { credentials: 'include' }
        );

        if (!accessResponse.ok) {
          throw new Error(`Error HTTP: ${accessResponse.status}`);
        }        const assignedFacilities = await accessResponse.json();
          // Verificar si la instalación solicitada está en las asignadas al coordinador
        const hasAccess = assignedFacilities.some((facility: any) =>
          facility.id === parseInt(facilityId) || facility.instalacion_id === parseInt(facilityId)
        );

        setAuthorized(hasAccess);

        // Si no tiene acceso, no cargar los datos
        if (!hasAccess) {
          setError("No tienes permiso para ver esta instalación. Solo puedes acceder a las instalaciones asignadas a tu cuenta.");
          setIsLoading(false);
          return;
        }        // Obtener los datos de la instalación desde el backend
        const response = await fetch(`${API_BASE_URL}/instalaciones/${facilityId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Obtener horarios del coordinador para esta instalación específica
        let visitToday = false;
        let nextVisitDate = "No programada";
        try {
          const horariosResponse = await fetch(`${API_BASE_URL}/horarios-coordinador/coordinador/${user.id}`, {
            credentials: 'include'
          });

          if (horariosResponse.ok) {
            const allHorarios = await horariosResponse.json();

            // Obtener fecha actual en zona horaria de Perú/Lima
            const now = new Date();
            const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
            const currentDay = peruTime.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const todayDayName = dayNames[currentDay];

            // Buscar horarios para esta instalación específica
            const horariosParaEstaInstalacion = allHorarios.filter((h: any) => h.instalacionId === parseInt(facilityId));

            // Verificar si hay visita programada para hoy
            const horarioHoy = horariosParaEstaInstalacion.find((h: any) => h.diaSemana.toLowerCase() === todayDayName.toLowerCase());

            if (horarioHoy) {
              // Verificar si la hora actual es antes del horario programado para isToday
              const currentHour = peruTime.getHours();
              const currentMinute = peruTime.getMinutes();
              const [horaInicio] = horarioHoy.horaInicio.split(':').map(Number);
              const currentTimeInMinutes = currentHour * 60 + currentMinute;
              const scheduledTimeInMinutes = horaInicio * 60;

              // Formatear horarios para mostrar solo HH:MM
              const horaInicioFormatted = horarioHoy.horaInicio.substring(0, 5);
              const horaFinFormatted = horarioHoy.horaFin.substring(0, 5);

              if (currentTimeInMinutes < scheduledTimeInMinutes) {
                visitToday = true;
                nextVisitDate = `Hoy\n${horaInicioFormatted} - ${horaFinFormatted}`;
              } else {
                // Si ya pasó la hora, mostrar que era hoy pero ya pasó
                nextVisitDate = `Hoy (${horaInicioFormatted} - ${horaFinFormatted})\nYa realizada`;
              }
            }

            // Si no tiene visita hoy, buscar el próximo día
            if (!visitToday) {
              let nextVisitFound = false;

              // Buscar en los próximos 7 días
              for (let i = 1; i <= 7; i++) {
                const nextDayIndex = (currentDay + i) % 7;
                const nextDayName = dayNames[nextDayIndex];

                const horarioProximo = horariosParaEstaInstalacion.find((h: any) =>
                  h.diaSemana.toLowerCase() === nextDayName.toLowerCase()
                );

                if (horarioProximo) {
                  // Calcular la fecha del próximo día
                  const nextDate = new Date(peruTime);
                  nextDate.setDate(nextDate.getDate() + i);

                  const dayOfMonth = nextDate.getDate().toString().padStart(2, '0');
                  const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');

                  // Formatear horarios para mostrar solo HH:MM
                  const horaInicioFormatted = horarioProximo.horaInicio.substring(0, 5);
                  const horaFinFormatted = horarioProximo.horaFin.substring(0, 5);

                  nextVisitDate = `${nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1)} ${dayOfMonth}/${month}\n${horaInicioFormatted} - ${horaFinFormatted}`;
                  nextVisitFound = true;
                  break;
                }
              }

              if (!nextVisitFound) {
                nextVisitDate = "No programada";
              }
            }
          }
        } catch (visitError) {
          console.warn("Error al verificar horarios:", visitError);
        }

        setHasVisitToday(visitToday);
        setNextVisit(nextVisitDate);

        // Obtener observaciones reales de la instalación
        let mappedObservations: Observation[] = [];
        try {
          console.log(`Obteniendo observaciones para instalación ${facilityId}`);
          const obsResponse = await fetch(`${API_BASE_URL}/observaciones/instalacion/${facilityId}`, {
            credentials: 'include'
          });

          console.log(`Response status: ${obsResponse.status}`);

          if (obsResponse.ok) {
            const obsData = await obsResponse.json();
            console.log('Datos de observaciones recibidos:', obsData);

            // Mapear los datos de observaciones al formato esperado
            mappedObservations = obsData.map((obs: any) => ({
              id: obs.idObservacion,
              title: obs.titulo,
              date: (() => {
                // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
                const [year, month, day] = obs.fecha.split('-');
                return `${day}/${month}/${year}`;
              })(),
              description: obs.descripcion,
              priority: obs.prioridad,
              status: mapObservationStatus(obs.estado),
              coordinator: obs.coordinador,
              photos: obs.fotosUrl ? obs.fotosUrl.split(',').filter((url: string) => url.trim()) : []
            }));

            console.log('Observaciones mapeadas:', mappedObservations);
          } else {
            console.warn(`Error al obtener observaciones: ${obsResponse.status} ${obsResponse.statusText}`);
          }
        } catch (obsError) {
          console.warn("Error al obtener observaciones:", obsError);
        }

        // Obtener datos de asistencia del coordinador para esta instalación (última visita)
        let lastVisitDate = "Sin visitas";
        try {
          const asistenciaResponse = await fetch(`${API_BASE_URL}/asistencia-coordinador/instalacion/${facilityId}`, {
            credentials: 'include'
          });

          if (asistenciaResponse.ok) {
            const asistenciaData = await asistenciaResponse.json();
            if (asistenciaData && asistenciaData.length > 0) {
              // Obtener la última visita
              const ultimaAsistencia = asistenciaData[asistenciaData.length - 1];
              lastVisitDate = new Date(ultimaAsistencia.fechaHora).toLocaleDateString('es-PE');
            }
          }
        } catch (error) {
          console.error(`Error al obtener asistencia para instalación ${facilityId}:`, error);
        }

        // Procesar los datos para agregar propiedades adicionales para el frontend
        const processedData = {
          ...data,
          status: data.activo ? 'disponible' : 'mantenimiento',
          maintenanceStatus: data.activo ? 'none' : 'in-progress',
          lastVisit: lastVisitDate,
          nextVisit: nextVisitDate || "Sin visitas programadas",
          isToday: visitToday,
          contactNumber: data.contactoNumero || "987-654-321",
          features: data.caracteristicas || [
            `Tipo: ${data.tipo}`,
            `Capacidad: ${data.capacidad} personas`,
            `Precio: S/. ${data.precio} por hora`,
          ],
          amenities: data.comodidades || [],
          rules: data.reglas || [],
          observations: mappedObservations
        };



        setFacility(processedData);
      } catch (error) {
        console.error("Error al cargar detalles de la instalación:", error);
        setError("No se pudo cargar la información de la instalación");
      } finally {
        setIsLoading(false);
      }
    };    // Solo verificar acceso y cargar datos si la autenticación ha terminado
    if (!authLoading) {
      checkAccess();
    }
  }, [facilityId, user, authLoading, router])

  const getStatusBadge = (maintenanceStatus: Instalacion['maintenanceStatus']) => {
    // Mostrar En Mantenimiento solo cuando está in-progress
    if (maintenanceStatus === "in-progress") {
      return <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>;
    }

    // En cualquier otro caso mostrar Disponible
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  }

  const getMaintenanceStatusBadge = (status: Instalacion['maintenanceStatus']) => {
    switch (status) {
      case "none":
        return null
      case "required":
        return <Badge className="bg-red-100 text-red-800">Requiere Mantenimiento</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      default:
        return null
    }
  }

  const getObservationStatusBadge = (status: Observation['status']) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "aprobada":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rechazada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "completada":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "alta":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>
      case "media":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
      case "baja":
        return <Badge className="bg-blue-100 text-blue-800">Baja</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority || 'Sin prioridad'}</Badge>
    }
  }
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Acceso Denegado</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XOctagon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">No tienes acceso a esta instalación</h3>
            <p className="text-gray-500 mt-2 text-center">
              Esta instalación no está asignada a tu cuenta de coordinador.<br/>
              Solo puedes ver los detalles de las instalaciones que te han sido asignadas.
            </p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/coordinador/instalaciones">Ver mis instalaciones asignadas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!facility || error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>          <h1 className="text-2xl font-bold tracking-tight">Instalación no encontrada</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Error al cargar la instalación</h3>
            <p className="text-gray-500 mt-2">
              {error || "La instalación que estás buscando no existe o no está disponible."}
            </p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/coordinador/instalaciones">Ver todas las instalaciones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{facility.nombre}</h1>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary-light" asChild>
            <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Reportar Observación
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{facility.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {facility.ubicacion}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(facility.maintenanceStatus)}
                  {getMaintenanceStatusBadge(facility.maintenanceStatus)}
                  {facility.isToday && <Badge className="bg-blue-100 text-blue-800">Visita hoy</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={facility.imagenUrl || "/placeholder.svg"}
                alt={facility.nombre}
                className="w-full h-64 object-cover rounded-md mb-6"
              />

              <Tabs defaultValue="descripcion">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                  <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                  <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                  <TabsTrigger value="reglas">Reglas</TabsTrigger>
                </TabsList>
                <TabsContent value="descripcion" className="mt-4">
                  <p className="text-gray-700 mb-4">{facility.descripcion}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Última visita</p>
                        <p className="text-sm text-gray-600">{facility.lastVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Próxima visita</p>
                        <div className="text-sm text-gray-600 whitespace-pre-line">
                          {facility.isToday ? (
                            <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                          ) : (
                            nextVisit || facility.nextVisit
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="caracteristicas" className="mt-4">
                  <ul className="space-y-2">
                    {facility.features && facility.features.length > 0 ? (
                      facility.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{typeof feature === 'string' ? feature : (feature as any).descripcion}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No hay características registradas</li>
                    )}
                  </ul>
                </TabsContent>
                <TabsContent value="comodidades" className="mt-4">
                  <ul className="space-y-2">
                    {facility.amenities && facility.amenities.length > 0 ? (
                      facility.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{typeof amenity === 'string' ? amenity : (amenity as any).descripcion}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No hay comodidades registradas</li>
                    )}
                  </ul>
                </TabsContent>
                <TabsContent value="reglas" className="mt-4">
                  <ul className="space-y-2">
                    {facility.rules && facility.rules.length > 0 ? (
                      facility.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{typeof rule === 'string' ? rule : (rule as any).descripcion}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No hay reglas registradas</li>
                    )}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observaciones Reportadas</CardTitle>
              <CardDescription>Historial de observaciones para esta instalación</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                console.log('Facility observations:', facility.observations);
                console.log('Observations length:', facility.observations?.length);
                return facility.observations && facility.observations.length > 0 ? (
                  <div className="space-y-4">
                    {facility.observations.map((observation) => (
                      <div key={observation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{observation.title}</h4>
                              <p className="text-sm text-gray-500">{observation.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {getPriorityBadge(observation.priority)}
                            {getObservationStatusBadge(observation.status)}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{observation.description}</p>
                        {observation.photos && observation.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {observation.photos.map((photo, index) => (
                              <a
                                key={index}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={photo || "/placeholder.svg"}
                                  alt={`Foto ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay observaciones reportadas para esta instalación.</p>
                  </div>
                );
              })()}
            </CardContent>

          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-sm text-gray-600">{facility.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-gray-600">{facility.contactNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Próxima Visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {facility.isToday ? <Badge className="bg-blue-100 text-blue-800">Hoy</Badge> : (nextVisit || facility.nextVisit)}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="bg-primary-pale p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Recordatorio</h3>
                <p className="text-sm text-gray-700">
                  Recuerda que debes estar físicamente en la instalación para registrar observaciones. El sistema
                  validará tu ubicación mediante geolocalización.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {hasVisitToday ? (
                <Button className="w-full bg-primary hover:bg-primary-light" asChild>
                  <Link href="/coordinador/asistencia/programadas">Registrar Asistencia</Link>
                </Button>
              ) : (
                <div className="w-full text-center text-gray-500 text-sm">
                  No hay visitas programadas para hoy
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

