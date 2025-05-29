"use client"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation } from "lucide-react"
import Link from "next/link"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api"
import { useSearchParams } from "next/navigation"

// Actualizamos la interfaz para que coincida con la estructura del backend
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
  latitud?: number;
  longitud?: number;
  radioValidacion?: number;

  // Propiedades adicionales para el frontend
  status?: 'disponible' | 'mantenimiento';
  maintenanceStatus?: 'none' | 'required' | 'scheduled' | 'in-progress';
  coordinates?: {
    lat: number;
    lng: number;
  };
  isToday?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
}

// Establecer una ubicación predeterminada (San Miguel, Lima, Perú)
const center = {
  lat: -12.0776,
  lng: -77.0919,
}

export default function MapaInstalaciones() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState<Instalacion[]>([])
  const [userLocation, setUserLocation] = useState(center)
  const [selectedFacility, setSelectedFacility] = useState<Instalacion | null>(null)
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  // Obtener el usuario del contexto de autenticación
  const { user, isLoading: authLoading } = useAuth();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })
  useEffect(() => {
    const loadData = async () => {
      try {
        // Si no hay usuario autenticado o no es coordinador, no cargar datos
        if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
          console.log("No hay usuario coordinador autenticado");
          setFacilities([]);
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
        console.log("Datos recibidos del backend:", data);

        // Obtener horarios del coordinador para verificar visitas programadas hoy
        let horariosCoordinador: any[] = [];
        try {
          const horariosResponse = await fetch(`${API_BASE_URL}/horarios-coordinador/coordinador/${user.id}`, {
            credentials: 'include'
          });

          if (horariosResponse.ok) {
            horariosCoordinador = await horariosResponse.json();
          }
        } catch (error) {
          console.warn("Error al obtener horarios del coordinador:", error);
        }

        // Obtener fecha actual en zona horaria de Perú/Lima
        const now = new Date();
        const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
        const currentDay = peruTime.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const todayDayName = dayNames[currentDay];

        // Procesar los datos para agregar propiedades adicionales para el frontend
        const processedData = data.map((instalacion: any) => {
          // Usar coordenadas reales de la base de datos si están disponibles
          let coordinates = null;
          if (instalacion.latitud && instalacion.longitud) {
            coordinates = {
              lat: instalacion.latitud,
              lng: instalacion.longitud
            };
            console.log(`Instalación ${instalacion.nombre} tiene coordenadas: ${instalacion.latitud}, ${instalacion.longitud}`);
          } else {
            // Fallback: generar coordenadas cerca del centro de San Miguel
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;
            coordinates = {
              lat: center.lat + latOffset,
              lng: center.lng + lngOffset
            };
            console.log(`Instalación ${instalacion.nombre} sin coordenadas, usando fallback`);
          }

          // Verificar si tiene visitas programadas hoy
          const horariosParaEstaInstalacion = horariosCoordinador.filter((h: any) => h.instalacionId === instalacion.id);
          const horarioHoy = horariosParaEstaInstalacion.find((h: any) => h.diaSemana.toLowerCase() === todayDayName.toLowerCase());
          const hasVisitToday = !!horarioHoy;

          // Agregar propiedades adicionales para el frontend
          return {
            ...instalacion,
            // Agregar campos que podrían faltar
            descripcion: instalacion.descripcion || '',
            horario: instalacion.horario || '',
            precio: instalacion.precio || 0,
            status: instalacion.activo ? 'disponible' : 'mantenimiento',
            maintenanceStatus: instalacion.activo ? 'none' : 'in-progress',
            coordinates,
            isToday: hasVisitToday
          };
        });

        setFacilities(processedData);

        // Si hay un ID seleccionado en los parámetros de consulta, encontrar y seleccionar esa instalación
        if (selectedId) {
          const selected = processedData.find((facility: Instalacion) => facility.id === parseInt(selectedId));
          if (selected) {
            setSelectedFacility(selected);
          }
        }
      } catch (error) {
        console.error("Error al cargar instalaciones:", error);
      } finally {
        // Intentar obtener la ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              // En caso de error, usar ubicación predeterminada
              setUserLocation(center);
            }
          );
        }

        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedId, user])

  const getStatusColor = (status: 'disponible' | 'mantenimiento') => {
    switch (status) {
      case "disponible":
        return "bg-green-500"
      case "mantenimiento":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarkerIcon = (status: 'disponible' | 'mantenimiento' | undefined, maintenanceStatus: string | undefined) => {
    // Verde para disponible, rojo para en mantenimiento
    const color = maintenanceStatus === "in-progress" ? "#ef4444" : "#22c55e";

    return {
      path: google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 10,
    }
  }

  const getStatusBadge = (status: 'disponible' | 'mantenimiento' | undefined, maintenanceStatus: string | undefined) => {
    // Mostrar En Mantenimiento solo cuando está in-progress
    if (maintenanceStatus === "in-progress") {
      return <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>;
    }

    // En cualquier otro caso mostrar Disponible
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  }

  const onLoad = useCallback((map: google.maps.Map) => {
    if (facilities.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      facilities.forEach((facility) => {
        if (facility.coordinates) {
          bounds.extend(facility.coordinates);
        }
      });

      bounds.extend(userLocation);
      map.fitBounds(bounds);
    }
  }, [facilities, userLocation])
  if (authLoading || isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/coordinador/instalaciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Mapa de Instalaciones Asignadas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">          <CardHeader>
            <CardTitle>Ubicación de Instalaciones</CardTitle>
            <CardDescription>Visualiza las instalaciones deportivas asignadas a tu cargo en el mapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[500px] rounded-md overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={15}
                onLoad={onLoad}
              >
                {/* Marcadores de instalaciones */}
                {facilities.map((facility) => (
                  facility.coordinates && (
                    <div key={facility.id}>
                      <Marker
                        position={facility.coordinates}
                        icon={getMarkerIcon(facility.status, facility.maintenanceStatus)}
                        onClick={() => setSelectedFacility(facility)}
                      />
                      {/* Círculo de validación para registro de asistencia */}
                      <Circle
                        center={facility.coordinates}
                        radius={facility.radioValidacion || 100}
                        options={{
                          fillColor: facility.maintenanceStatus === "in-progress" ? "#ef4444" : "#22c55e",
                          fillOpacity: 0.1,
                          strokeColor: facility.maintenanceStatus === "in-progress" ? "#ef4444" : "#22c55e",
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                    </div>
                  )
                ))}

                {/* Marcador de ubicación del usuario */}
                <Marker
                  position={userLocation}
                  icon={{
                    path: google?.maps?.SymbolPath?.CIRCLE || 0,
                    fillColor: "#6366f1",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 8,
                  }}
                />

                {/* Ventana de información para la instalación seleccionada */}
                {selectedFacility && selectedFacility.coordinates && (
                  <InfoWindow
                    position={selectedFacility.coordinates}
                    onCloseClick={() => setSelectedFacility(null)}
                  >
                    <div className="p-2">
                      <h3 className="font-bold mb-1">{selectedFacility.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedFacility.ubicacion}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        Radio de validación: {selectedFacility.radioValidacion || 100}m
                      </p>
                      {getStatusBadge(selectedFacility.status, selectedFacility.maintenanceStatus)}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>En mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                  <span>Tu ubicación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-20 border border-green-500"></div>
                  <span>Radio de validación</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>          <CardHeader>
            <CardTitle>Instalaciones Asignadas</CardTitle>
            <CardDescription>Lista de instalaciones deportivas a tu cargo</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFacility ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{selectedFacility.nombre}</h3>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(selectedFacility.status, selectedFacility.maintenanceStatus)}
                      {selectedFacility.isToday && (
                        <Badge className="bg-blue-100 text-blue-800">Visita Hoy</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{selectedFacility.ubicacion}</p>
                  <div className="text-xs text-gray-400 mb-4">
                    <p>Coordenadas: {selectedFacility.latitud?.toFixed(6)}, {selectedFacility.longitud?.toFixed(6)}</p>
                    <p>Radio de validación: {selectedFacility.radioValidacion || 100}m</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/coordinador/instalaciones/${selectedFacility.id}`}>Ver Detalles</Link>
                    </Button>
                    {selectedFacility.isToday && (
                      <Button size="sm" className="w-full bg-primary hover:bg-primary-light" asChild>
                        <Link href="/coordinador/asistencia/programadas">
                          Registrar Asistencia
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setSelectedFacility(null)}>
                  Volver a la lista
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {facilities
                  .sort((a, b) => {
                    if (!a.coordinates || !b.coordinates) return 0;

                    const distA = Math.sqrt(
                      Math.pow(a.coordinates.lat - userLocation.lat, 2) +
                        Math.pow(a.coordinates.lng - userLocation.lng, 2)
                    )
                    const distB = Math.sqrt(
                      Math.pow(b.coordinates.lat - userLocation.lat, 2) +
                        Math.pow(b.coordinates.lng - userLocation.lng, 2)
                    )
                    return distA - distB
                  })
                  .map((facility) => (
                    <div
                      key={facility.id}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary"
                      onClick={() => setSelectedFacility(facility)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{facility.nombre}</h3>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(facility.status, facility.maintenanceStatus)}
                          {facility.isToday && (
                            <Badge className="bg-blue-100 text-blue-800">Visita Hoy</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{facility.ubicacion}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

