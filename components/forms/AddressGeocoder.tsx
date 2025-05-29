"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Search, CheckCircle, AlertTriangle } from "lucide-react"
import { geocodeAddress, formatCoordinates, Coordinates } from "@/lib/google-maps"

interface AddressGeocoderProps {
  onCoordinatesChange: (coordinates: Coordinates | null) => void
  onAddressChange?: (address: string) => void
  initialAddress?: string
  initialCoordinates?: Coordinates
  className?: string
  required?: boolean
}

export default function AddressGeocoder({
  onCoordinatesChange,
  onAddressChange,
  initialAddress = "",
  initialCoordinates,
  className = "",
  required = false
}: AddressGeocoderProps) {
  const [address, setAddress] = useState(initialAddress)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates || null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGeocoded, setHasGeocoded] = useState(false)

  // Efecto para inicializar coordenadas si se proporcionan
  useEffect(() => {
    if (initialCoordinates) {
      setCoordinates(initialCoordinates)
      setHasGeocoded(true)
    }
  }, [initialCoordinates])

  const handleGeocode = async () => {
    if (!address.trim()) {
      setError("Por favor ingresa una dirección")
      return
    }

    setIsGeocoding(true)
    setError(null)

    try {
      // Agregar "San Miguel, Lima, Perú" si no está incluido
      let fullAddress = address.trim()
      if (!fullAddress.toLowerCase().includes('san miguel')) {
        fullAddress += ', San Miguel, Lima, Perú'
      } else if (!fullAddress.toLowerCase().includes('lima')) {
        fullAddress += ', Lima, Perú'
      } else if (!fullAddress.toLowerCase().includes('perú')) {
        fullAddress += ', Perú'
      }

      const result = await geocodeAddress(fullAddress)

      if (result) {
        setCoordinates(result)
        setHasGeocoded(true)
        onCoordinatesChange(result)
      } else {
        setError("No se pudieron obtener las coordenadas para esta dirección. Verifica que sea una dirección válida en San Miguel, Lima.")
        setCoordinates(null)
        onCoordinatesChange(null)
      }
    } catch (error) {
      console.error('Error en geocodificación:', error)
      setError("Error al obtener coordenadas. Verifica tu conexión a internet.")
      setCoordinates(null)
      onCoordinatesChange(null)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    onAddressChange?.(value) // Notificar al componente padre del cambio de dirección
    // Limpiar coordenadas cuando se cambia la dirección
    if (hasGeocoded) {
      setCoordinates(null)
      setHasGeocoded(false)
      onCoordinatesChange(null)
    }
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleGeocode()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address">
          Dirección de la instalación {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex gap-2">
          <Input
            id="address"
            type="text"
            placeholder="Ej: Av. Federico Gállese 370, San Miguel"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            required={required}
          />
          <Button
            type="button"
            onClick={handleGeocode}
            disabled={isGeocoding || !address.trim()}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isGeocoding ? 'Buscando...' : 'Geocodificar'}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Ingresa la dirección completa para obtener las coordenadas automáticamente
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {coordinates && hasGeocoded && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Coordenadas obtenidas</p>
                  <p className="text-sm text-gray-600">{formatCoordinates(coordinates)}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Geocodificado
              </Badge>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Latitud</Label>
                  <p className="font-mono">{coordinates.lat.toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Longitud</Label>
                  <p className="font-mono">{coordinates.lng.toFixed(6)}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver en Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasGeocoded && address.trim() && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Haz clic en "Geocodificar" para obtener las coordenadas de esta dirección
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
