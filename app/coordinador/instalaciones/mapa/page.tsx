"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation } from "lucide-react"
import Link from "next/link"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"

type FacilityStatus = 'disponible' | 'mantenimiento';

interface Facility {
  id: number;
  name: string;
  location: string;
  status: FacilityStatus;
  maintenanceStatus: 'none' | 'required' | 'scheduled' | 'in-progress';
  coordinates: {
    lat: number;
    lng: number;
  };
  isToday: boolean;
}

// Datos de ejemplo para las instalaciones asignadas al coordinador
const facilitiesData: Facility[] = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    status: "disponible",
    maintenanceStatus: "none",
    coordinates: { lat: -12.077, lng: -77.083 },
    isToday: true,
  },
  {
    id: 2,
    name: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    status: "mantenimiento",
    maintenanceStatus: "required",
    coordinates: { lat: -12.079, lng: -77.085 },
    isToday: true,
  }
]

const mapContainerStyle = {
  width: "100%",
  height: "500px",
}

const center = {
  lat: -12.078,
  lng: -77.084,
}

export default function MapaInstalaciones() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState<Facility[]>(facilitiesData)
  const [userLocation, setUserLocation] = useState(center)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFacilities(facilitiesData)

      // Intentar obtener la ubicación del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          () => {
            // En caso de error, usar ubicación predeterminada de San Miguel
            setUserLocation(center)
          }
        )
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  const getStatusColor = (status: FacilityStatus) => {
    switch (status) {
      case "disponible":
        return "bg-green-500"
      case "mantenimiento":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarkerIcon = (status: FacilityStatus, maintenanceStatus: string) => {
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

  const getStatusBadge = (status: FacilityStatus, maintenanceStatus: string) => {
    // Mostrar En Mantenimiento solo cuando está in-progress
    if (maintenanceStatus === "in-progress") {
      return <Badge className="bg-red-100 text-red-800">En mantenimiento</Badge>;
    }
    
    // En cualquier otro caso mostrar Disponible
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  }

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds()
    facilities.forEach((facility) => bounds.extend(facility.coordinates))
    bounds.extend(userLocation)
    map.fitBounds(bounds)
  }, [facilities, userLocation])

  if (isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/coordinador/instalaciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Mapa de Instalaciones</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ubicación de Instalaciones</CardTitle>
            <CardDescription>Visualiza todas tus instalaciones asignadas en el mapa</CardDescription>
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
                  <Marker
                    key={facility.id}
                    position={facility.coordinates}
                    icon={getMarkerIcon(facility.status, facility.maintenanceStatus)}
                    onClick={() => setSelectedFacility(facility)}
                  />
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
                {selectedFacility && (
                  <InfoWindow
                    position={selectedFacility.coordinates}
                    onCloseClick={() => setSelectedFacility(null)}
                  >
                    <div className="p-2">
                      <h3 className="font-bold mb-1">{selectedFacility.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedFacility.location}</p>
                      {getStatusBadge(selectedFacility.status, selectedFacility.maintenanceStatus)}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">En mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-sm">Tu ubicación</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instalaciones Asignadas</CardTitle>
            <CardDescription>Lista de todas tus instalaciones asignadas</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFacility ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{selectedFacility.name}</h3>
                    {getStatusBadge(selectedFacility.status, selectedFacility.maintenanceStatus)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{selectedFacility.location}</p>
                  {selectedFacility.isToday && (
                    <Badge className="bg-blue-100 text-blue-800">Visita programada hoy</Badge>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/coordinador/instalaciones/${selectedFacility.id}`}>Ver Detalles</Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary-light" asChild>
                      <Link href={`/coordinador/asistencia/registrar?facilityId=${selectedFacility.id}`}>
                        Registrar Asistencia
                      </Link>
                    </Button>
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
                        <h3 className="font-medium">{facility.name}</h3>
                        {getStatusBadge(facility.status, facility.maintenanceStatus)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{facility.location}</span>
                      </div>
                      {facility.isToday && (
                        <Badge className="bg-blue-100 text-blue-800 mt-2">Visita programada hoy</Badge>
                      )}
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

