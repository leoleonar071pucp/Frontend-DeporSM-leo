"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    location: "Parque Juan Pablo II",
    status: "buen-estado",
    coordinates: { lat: -12.077, lng: -77.083 },
    isToday: true,
  },
  {
    id: 2,
    name: "Piscina Municipal",
    location: "Complejo Deportivo Municipal",
    status: "requiere-atencion",
    coordinates: { lat: -12.079, lng: -77.085 },
    isToday: true,
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    location: "Complejo Deportivo Municipal",
    status: "buen-estado",
    coordinates: { lat: -12.079, lng: -77.086 },
    isToday: false,
  },
  {
    id: 4,
    name: "Pista de Atletismo",
    location: "Complejo Deportivo Municipal",
    status: "mantenimiento-requerido",
    coordinates: { lat: -12.08, lng: -77.085 },
    isToday: false,
  },
  {
    id: 5,
    name: "Cancha de Fútbol (Loza)",
    location: "Parque Simón Bolívar",
    status: "en-mantenimiento",
    coordinates: { lat: -12.075, lng: -77.088 },
    isToday: false,
  },
]

export default function MapaInstalaciones() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedFacility, setSelectedFacility] = useState(null)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFacilities(facilitiesData)

      // Establecer una ubicación predeterminada para San Miguel, Lima
      // en lugar de intentar obtener la ubicación del usuario
      setUserLocation({ lat: -12.078, lng: -77.084 })
      setIsLoading(false)
    }

    loadData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "buen-estado":
        return "bg-green-500"
      case "requiere-atencion":
        return "bg-yellow-500"
      case "mantenimiento-requerido":
        return "bg-red-500"
      case "en-mantenimiento":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "buen-estado":
        return <Badge className="bg-green-100 text-green-800">Buen estado</Badge>
      case "requiere-atencion":
        return <Badge className="bg-yellow-100 text-yellow-800">Requiere atención</Badge>
      case "mantenimiento-requerido":
        return <Badge className="bg-red-100 text-red-800">Mantenimiento requerido</Badge>
      case "en-mantenimiento":
        return <Badge className="bg-blue-100 text-blue-800">En mantenimiento</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
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
            <CardDescription>Visualiza todas las instalaciones asignadas en el mapa</CardDescription>
            <div className="text-sm text-amber-600 mb-2">
              Nota: Se está utilizando una ubicación predeterminada para San Miguel. La geolocalización no está
              disponible en el modo de vista previa.
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[500px] bg-gray-200 rounded-md overflow-hidden">
              {/* Aquí iría el componente de mapa real, pero para este ejemplo usaremos un placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">Mapa de San Miguel, Lima</p>
              </div>

              {/* Marcadores de instalaciones (simulados) */}
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className={`absolute w-6 h-6 rounded-full ${getStatusColor(facility.status)} cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 border-white`}
                  style={{
                    left: `${((facility.coordinates.lng + 77.09) / 0.02) * 100}%`,
                    top: `${((facility.coordinates.lat + 12.09) / 0.02) * 100}%`,
                  }}
                  onClick={() => setSelectedFacility(facility)}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              ))}

              {/* Marcador de ubicación del usuario (simulado) */}
              {userLocation && (
                <div
                  className="absolute w-6 h-6 rounded-full bg-primary cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 border-white animate-pulse"
                  style={{
                    left: `${((userLocation.lng + 77.09) / 0.02) * 100}%`,
                    top: `${((userLocation.lat + 12.09) / 0.02) * 100}%`,
                  }}
                >
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Buen estado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Requiere atención</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Mantenimiento requerido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">En mantenimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm">Tu ubicación</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instalaciones Cercanas</CardTitle>
            <CardDescription>Instalaciones ordenadas por cercanía a tu ubicación</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFacility ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{selectedFacility.name}</h3>
                    {getStatusBadge(selectedFacility.status)}
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
                    // Ordenar por distancia (simulada)
                    const distA = Math.sqrt(
                      Math.pow(a.coordinates.lat - (userLocation?.lat || 0), 2) +
                        Math.pow(a.coordinates.lng - (userLocation?.lng || 0), 2),
                    )
                    const distB = Math.sqrt(
                      Math.pow(b.coordinates.lat - (userLocation?.lat || 0), 2) +
                        Math.pow(b.coordinates.lng - (userLocation?.lng || 0), 2),
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
                        {getStatusBadge(facility.status)}
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

