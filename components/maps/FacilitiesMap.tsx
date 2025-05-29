"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Coordinates, getCurrentLocation, createMapsUrl } from "@/lib/google-maps"

interface Facility {
  id: number
  nombre: string
  ubicacion: string
  latitud: number
  longitud: number
  radioValidacion: number
  imagenUrl?: string
  tipo: string
}

interface FacilitiesMapProps {
  facilities: Facility[]
  userLocation?: Coordinates | null
  onLocationUpdate?: (location: Coordinates) => void
}

export default function FacilitiesMap({ 
  facilities, 
  userLocation, 
  onLocationUpdate 
}: FacilitiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)

  // Inicializar el mapa
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return

      // Centro del mapa en San Miguel, Lima
      const center = { lat: -12.0776, lng: -77.0919 }
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })

      setMap(mapInstance)
    }

    // Cargar Google Maps API si no está cargada
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  // Agregar marcadores de instalaciones
  useEffect(() => {
    if (!map || !facilities.length) return

    // Limpiar marcadores existentes
    // (En una implementación más robusta, mantendríamos referencias a los marcadores)

    facilities.forEach((facility) => {
      if (!facility.latitud || !facility.longitud) return

      const marker = new google.maps.Marker({
        position: { lat: facility.latitud, lng: facility.longitud },
        map,
        title: facility.nombre,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#0cb7f2" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })

      // Círculo de validación
      const circle = new google.maps.Circle({
        strokeColor: '#0cb7f2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0cb7f2',
        fillOpacity: 0.15,
        map,
        center: { lat: facility.latitud, lng: facility.longitud },
        radius: facility.radioValidacion
      })

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${facility.nombre}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${facility.ubicacion}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">Radio de validación: ${facility.radioValidacion}m</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        setSelectedFacility(facility)
        infoWindow.open(map, marker)
      })
    })
  }, [map, facilities])

  // Agregar marcador de ubicación del usuario
  useEffect(() => {
    if (!map || !userLocation) return

    const userMarker = new google.maps.Marker({
      position: userLocation,
      map,
      title: 'Tu ubicación',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#ff4444" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      }
    })

    // Centrar el mapa en la ubicación del usuario
    map.setCenter(userLocation)
    map.setZoom(16)
  }, [map, userLocation])

  const handleGetLocation = async () => {
    setIsLoadingLocation(true)
    try {
      const location = await getCurrentLocation()
      onLocationUpdate?.(location)
    } catch (error) {
      console.error('Error obteniendo ubicación:', error)
      alert('No se pudo obtener tu ubicación. Verifica que hayas dado permisos de geolocalización.')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Instalaciones Asignadas
          </CardTitle>
          <CardDescription>
            Visualiza las instalaciones deportivas que tienes asignadas y su radio de validación para registro de asistencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleGetLocation}
                disabled={isLoadingLocation}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                {isLoadingLocation ? 'Obteniendo ubicación...' : 'Mi ubicación'}
              </Button>
              
              {userLocation && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(createMapsUrl(userLocation), '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir en Google Maps
                </Button>
              )}
            </div>

            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '400px' }}
            />

            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
                <span>Instalaciones asignadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Tu ubicación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary opacity-20 border border-primary"></div>
                <span>Radio de validación</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFacility && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedFacility.nombre}</CardTitle>
            <CardDescription>{selectedFacility.ubicacion}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedFacility.imagenUrl && (
                <img 
                  src={selectedFacility.imagenUrl} 
                  alt={selectedFacility.nombre}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedFacility.tipo}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Radio de validación:</span>
                  <span className="ml-2">{selectedFacility.radioValidacion} metros</span>
                </div>
              </div>

              <Button 
                onClick={() => window.open(createMapsUrl({
                  lat: selectedFacility.latitud,
                  lng: selectedFacility.longitud
                }), '_blank')}
                className="w-full"
              >
                Ver en Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
