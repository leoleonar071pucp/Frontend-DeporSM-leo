"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura
import { useAuth } from "@/context/AuthContext";

// Eliminamos la importación de axios
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, AlertTriangle, Calendar, Clock, Filter } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Actualizamos la interfaz para que coincida con los datos del backend
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
  hasVisitToday?: boolean; // Nueva propiedad para visitas programadas hoy (sin importar la hora)
  observations?: number;
  pendingObservations?: number;
}

export default function InstalacionesCoordinador() {
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState<Instalacion[]>([]);
  const [originalFacilities, setOriginalFacilities] = useState<Instalacion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
    // Obtener el usuario del contexto de autenticación
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {

    const loadData = async () => {
      try {
        // Si no hay usuario autenticado o no es coordinador, no cargar datos
        if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
          console.log("No hay usuario coordinador autenticado");
          setFacilities([]);
          setOriginalFacilities([]);
          setIsLoading(false);
          return;
        }

        // Usar el endpoint específico para coordinadores que devuelve solo las instalaciones asignadas
        const response = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${user.id}`, {
          credentials: 'include', // Importante para enviar cookies de autenticación
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Obtener todos los horarios del coordinador de una vez
        let allHorarios: any[] = [];
        try {
          const horariosResponse = await fetch(`${API_BASE_URL}/horarios-coordinador/coordinador/${user.id}`, {
            credentials: 'include'
          });

          if (horariosResponse.ok) {
            allHorarios = await horariosResponse.json();
            console.log('Todos los horarios del coordinador:', allHorarios);
          }
        } catch (error) {
          console.error('Error al obtener horarios del coordinador:', error);
        }

        // Obtener fecha actual en zona horaria de Perú/Lima
        const now = new Date();
        const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
        const currentDay = peruTime.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const todayDayName = dayNames[currentDay];

        console.log('=== INFORMACIÓN DE FECHA ACTUAL ===');
        console.log('Fecha actual Peru:', peruTime);
        console.log('Día actual (número):', currentDay);
        console.log('Día actual (nombre):', todayDayName);

        // Obtener datos completos para cada instalación
        const detailedFacilities = await Promise.all(data.map(async (instalacionBasica: any) => {
          try {
            const detailResponse = await fetch(`${API_BASE_URL}/instalaciones/${instalacionBasica.id}`);

            if (!detailResponse.ok) {
              throw new Error(`Error al obtener detalles de instalación: ${detailResponse.status}`);
            }

            const detailData = await detailResponse.json();

            // Obtener datos reales de asistencia y observaciones
            let lastVisit = "Sin visitas";
            let nextVisit = "No programada";
            let isToday = false;
            let hasVisitToday = false; // Nueva variable para visitas programadas hoy
            let observations = 0;
            let pendingObservations = 0;

            console.log(`=== PROCESANDO INSTALACIÓN ${instalacionBasica.id} ===`);
            console.log('Nombre:', instalacionBasica.nombre || detailData.nombre);

            // Buscar horarios para esta instalación específica
            const horariosParaEstaInstalacion = allHorarios.filter(h => h.instalacionId === instalacionBasica.id);
            console.log('Horarios encontrados para esta instalación:', horariosParaEstaInstalacion);

            // Verificar si hay visita programada para hoy
            const horarioHoy = horariosParaEstaInstalacion.find((h: any) => h.diaSemana.toLowerCase() === todayDayName.toLowerCase());
            console.log('Horario encontrado para hoy:', horarioHoy);

            if (horarioHoy) {
              // Siempre marcar que tiene visita hoy (sin importar la hora)
              hasVisitToday = true;
              console.log('hasVisitToday establecido a true para instalación', instalacionBasica.id);

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
                isToday = true;
                nextVisit = `Hoy\n${horaInicioFormatted} - ${horaFinFormatted}`;
              } else {
                // Si ya pasó la hora, mostrar que era hoy pero ya pasó
                nextVisit = `Hoy (${horaInicioFormatted} - ${horaFinFormatted})\nYa realizada`;
              }
            }

            // Si no tiene visita hoy, buscar el próximo día
            if (!hasVisitToday) {
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

                  nextVisit = `${nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1)} ${dayOfMonth}/${month}\n${horaInicioFormatted} - ${horaFinFormatted}`;
                  nextVisitFound = true;
                  break;
                }
              }

              if (!nextVisitFound) {
                nextVisit = "No programada";
              }
            }

            // Obtener datos de asistencia del coordinador para esta instalación
            try {
              const asistenciaResponse = await fetch(`${API_BASE_URL}/asistencia-coordinador/instalacion/${instalacionBasica.id}`, {
                credentials: 'include'
              });

              if (asistenciaResponse.ok) {
                const asistenciaData = await asistenciaResponse.json();
                if (asistenciaData && asistenciaData.length > 0) {
                  // Obtener la última visita
                  const ultimaAsistencia = asistenciaData[asistenciaData.length - 1];
                  lastVisit = new Date(ultimaAsistencia.fechaHora).toLocaleDateString('es-PE');
                }
              }
            } catch (error) {
              console.error(`Error al obtener asistencia para instalación ${instalacionBasica.id}:`, error);
            }

            // Obtener observaciones de la instalación
            try {
              const observacionesResponse = await fetch(`${API_BASE_URL}/observaciones/instalacion/${instalacionBasica.id}`, {
                credentials: 'include'
              });

              if (observacionesResponse.ok) {
                const observacionesData = await observacionesResponse.json();
                observations = observacionesData.length;
                pendingObservations = observacionesData.filter((obs: any) => obs.estado === 'pendiente').length;
              }
            } catch (error) {
              console.error(`Error al obtener observaciones para instalación ${instalacionBasica.id}:`, error);
            }

            console.log(`Instalación ${instalacionBasica.id} - hasVisitToday final:`, hasVisitToday);

            return {
              ...detailData,
              status: detailData.activo ? 'disponible' : 'mantenimiento',
              maintenanceStatus: detailData.activo ? 'none' : 'in-progress',
              lastVisit,
              nextVisit,
              isToday,
              hasVisitToday,
              observations,
              pendingObservations,
            };
          } catch (error) {
            console.error(`Error al obtener detalles para instalación ${instalacionBasica.id}:`, error);
            // Devolver datos básicos en caso de error
            return {
              ...instalacionBasica,
              status: 'disponible',
              maintenanceStatus: 'none',
              lastVisit: "15/04/2023",
              nextVisit: "15/05/2023",
              isToday: false,
              hasVisitToday: false,
              observations: 0,
              pendingObservations: 0,
            };
          }
        }));

        console.log('=== RESUMEN FINAL DE INSTALACIONES ===');
        console.log('Total instalaciones cargadas:', detailedFacilities.length);
        console.log('Instalaciones con visitas hoy:', detailedFacilities.filter(f => f.hasVisitToday).length);
        console.log('Detalle de hasVisitToday:', detailedFacilities.map(f => ({
          id: f.id,
          nombre: f.nombre,
          hasVisitToday: f.hasVisitToday
        })));

        setFacilities(detailedFacilities);
        setOriginalFacilities(detailedFacilities);
      } catch (error) {
        console.error("Error al cargar instalaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };    loadData();
  }, [user])
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim() === "") {
      // Si la búsqueda está vacía, restaurar datos originales
      setFacilities(originalFacilities);
      return;
    }

    setIsLoading(true);

    try {
      // Filtrar las instalaciones originales que ya están asignadas al coordinador
      // Esto garantiza que solo se busque entre las instalaciones que el coordinador tiene asignadas
      const filteredFacilities = originalFacilities.filter(
        facility => facility.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    facility.tipo.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al buscar instalaciones:", error);
      // Si hay un error, mostrar un mensaje y mantener los datos actuales
    } finally {
      setIsLoading(false);
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    console.log(`=== CAMBIO DE PESTAÑA A: ${value} ===`);
    console.log('Total instalaciones originales:', originalFacilities.length);

    if (value === "todas") {
      setFacilities(originalFacilities) // Resetear a todos los datos originales
    } else if (value === "programadas") {
      // Mostrar instalaciones que tienen visitas programadas para hoy (sin importar si ya pasó la hora)
      const facilitiesWithVisitsToday = originalFacilities.filter((f) => f.hasVisitToday);
      console.log('Instalaciones con visitas hoy:', facilitiesWithVisitsToday.length);
      console.log('Detalles:', facilitiesWithVisitsToday.map(f => ({
        id: f.id,
        nombre: f.nombre,
        hasVisitToday: f.hasVisitToday
      })));
      setFacilities(facilitiesWithVisitsToday);
    } else if (value === "pendientes") {
      // Mostrar instalaciones que realmente tienen observaciones pendientes
      const facilitiesWithPendingObs = originalFacilities.filter((f) => f.pendingObservations && f.pendingObservations > 0);
      console.log('Instalaciones con observaciones pendientes:', facilitiesWithPendingObs.length);
      setFacilities(facilitiesWithPendingObs);
    }
  }
    const handleFilterByType = async (tipo: string) => {
    setIsLoading(true);

    try {
      // Filtrar de las instalaciones originales que ya están asignadas al coordinador
      // Solo aquellas que coinciden con el tipo seleccionado
      const filteredFacilities = originalFacilities.filter(
        facility => facility.tipo.toLowerCase() === tipo.toLowerCase()
      );

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al filtrar instalaciones por tipo:", error);
    } finally {
      setIsLoading(false);
    }
  }
    const handleFilterByStatus = async (disponible: boolean) => {
    setIsLoading(true);

    try {
      // Filtrar de las instalaciones originales que ya están asignadas al coordinador
      let filteredFacilities;

      if (disponible) {
        // Mostrar instalaciones disponibles (activas y sin mantenimiento)
        filteredFacilities = originalFacilities.filter(
          facility => facility.activo && facility.maintenanceStatus !== 'in-progress'
        );
      } else {
        // Mostrar instalaciones en mantenimiento
        filteredFacilities = originalFacilities.filter(
          facility => !facility.activo || facility.maintenanceStatus === 'in-progress'
        );
      }

      setFacilities(filteredFacilities);
    } catch (error) {
      console.error("Error al filtrar instalaciones por estado:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = (status: Instalacion['status'], maintenanceStatus: Instalacion['maintenanceStatus']) => {
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
        return null;
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
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instalaciones Asignadas</h1>
          <p className="text-muted-foreground">Gestiona las instalaciones deportivas a tu cargo</p>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href={selectedFacilityId ? `/coordinador/instalaciones/mapa?id=${selectedFacilityId}` : "/coordinador/instalaciones/mapa"}>
            <MapPin className="h-4 w-4 mr-2" />
            Ver en Mapa
          </Link>
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary-light">
                Buscar
              </Button>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFacilities(originalFacilities)}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByStatus(true)}>
                  Disponibles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByStatus(false)}>
                  En mantenimiento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterByType("piscina")}>
                  Piscinas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("cancha-futbol-grass")}>
                  Canchas de Fútbol (Grass)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("cancha-futbol-loza")}>
                  Canchas de Fútbol (Loza)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("gimnasio")}>
                  Gimnasios
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByType("pista-atletismo")}>
                  Pistas de Atletismo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="programadas">Visitas Programadas</TabsTrigger>
          <TabsTrigger value="pendientes">Observaciones Pendientes</TabsTrigger>
        </TabsList>        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card
                  key={facility.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${selectedFacilityId === facility.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedFacilityId(facility.id)}
                >
                  <div className="relative">
                    <img
                      src={facility.imagenUrl || "/placeholder.svg"}
                      alt={facility.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(facility.status, facility.maintenanceStatus)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{facility.nombre}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{facility.ubicacion}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">Última visita:</span>
                        </div>
                        <span className="text-sm font-medium">{facility.lastVisit}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Próxima visita:</span>
                        </div>
                        <span className="text-sm font-medium whitespace-pre-line text-right">
                          {facility.isToday ? (
                            <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                          ) : (
                            facility.nextVisit
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <span className="text-sm">Observaciones:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {facility.pendingObservations && facility.pendingObservations > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {facility.pendingObservations} pendientes
                            </Badge>
                          ) : (
                            `${facility.observations} totales`
                          )}
                        </span>
                      </div>
                      {getMaintenanceStatusBadge(facility.maintenanceStatus) && (
                        <div className="flex justify-end mt-2">
                          {getMaintenanceStatusBadge(facility.maintenanceStatus)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/coordinador/instalaciones/${facility.id}`}>Ver Detalles</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                        <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>Reportar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>          ) : originalFacilities.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tienes instalaciones asignadas</h3>
              <p className="text-gray-500 mt-2">
                No hay instalaciones asignadas a tu cuenta de coordinador.
                Contacta con un administrador para solicitar acceso a instalaciones.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron instalaciones</h3>
              <p className="text-gray-500 mt-2">No hay instalaciones que coincidan con los criterios de búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {                  setSearchQuery("");
                  setActiveTab("todas");

                  const loadData = async () => {
                    try {
                      setIsLoading(true);
                        // Si no hay usuario autenticado o no es coordinador, no cargar datos
                      if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
                        console.log("No hay usuario coordinador autenticado");
                        setFacilities([]);
                        setOriginalFacilities([]);
                        setIsLoading(false);
                        return;
                      }

                      // Usar el endpoint específico para coordinadores
                      const response = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${user.id}`, {
                        credentials: 'include', // Importante para enviar cookies de autenticación// Importante para enviar cookies de autenticación
                      });

                      if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                      }

                      const data = await response.json();

                      // Obtener datos completos para cada instalación
                      const detailedFacilities = await Promise.all(data.map(async (instalacionBasica: any) => {
                        const detailResponse = await fetch(`${API_BASE_URL}/instalaciones/${instalacionBasica.id}`);

                        if (!detailResponse.ok) {
                          return {
                            ...instalacionBasica,
                            status: 'disponible',
                            maintenanceStatus: 'none',
                            lastVisit: "15/04/2023",
                            nextVisit: "15/05/2023",
                            isToday: false,
                            hasVisitToday: false,
                            observations: 0,
                            pendingObservations: 0,
                          };
                        }

                        const detailData = await detailResponse.json();

                        return {
                          ...detailData,
                          status: detailData.activo ? 'disponible' : 'mantenimiento',
                          maintenanceStatus: detailData.activo ? 'none' : 'in-progress',
                          lastVisit: "Sin datos",
                          nextVisit: "Sin datos",
                          isToday: false,
                          hasVisitToday: false,
                          observations: 0,
                          pendingObservations: 0,
                        };
                      }));

                      setFacilities(detailedFacilities);
                      setOriginalFacilities(detailedFacilities);
                    } catch (error) {
                      console.error("Error al recargar instalaciones:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  };

                  loadData();
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}