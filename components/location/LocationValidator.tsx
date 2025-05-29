"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Coordinates, getCurrentLocation, validateUserLocation, formatCoordinates } from "@/lib/google-maps"

interface LocationValidatorProps {
  facilityLocation: Coordinates
  facilityName: string
  allowedRadius?: number
  onValidationResult?: (isValid: boolean, distance: number) => void
  onLocationUpdate?: (location: Coordinates) => void
  className?: string
}

export default function LocationValidator({
  facilityLocation,
  facilityName,
  allowedRadius = 100,
  onValidationResult,
  onLocationUpdate,
  className = ""
}: LocationValidatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    distance: number
    message: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGetLocation = async () => {
    setIsLoading(true)
    setError(null)
    setValidationResult(null)

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      })

      setUserLocation(location)
      onLocationUpdate?.(location)

      // Validar la ubicación
      const result = validateUserLocation(location, facilityLocation, allowedRadius)
      setValidationResult(result)
      onValidationResult?.(result.isValid, result.distance)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener ubicación'
      setError(errorMessage)
      console.error('Error obteniendo ubicación:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getValidationIcon = () => {
    if (!validationResult) return null
    
    if (validationResult.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getValidationBadge = () => {
    if (!validationResult) return null

    if (validationResult.isValid) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Ubicación válida
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800">
          Ubicación inválida
        </Badge>
      )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Validación de Ubicación
        </CardTitle>
        <CardDescription>
          Verifica que estés físicamente en {facilityName} para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleGetLocation}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {isLoading ? 'Obteniendo ubicación...' : 'Verificar mi ubicación'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {userLocation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Tu ubicación actual:</p>
                  <p className="text-xs text-gray-600">{formatCoordinates(userLocation)}</p>
                </div>
                {getValidationIcon()}
              </div>

              {validationResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getValidationBadge()}
                    <span className="text-sm text-gray-600">
                      Distancia: {validationResult.distance}m
                    </span>
                  </div>
                  
                  <Alert variant={validationResult.isValid ? "default" : "destructive"}>
                    <AlertDescription>
                      {validationResult.message}
                    </AlertDescription>
                  </Alert>

                  {!validationResult.isValid && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Debes estar dentro de {allowedRadius} metros de la instalación</p>
                      <p>• Asegúrate de que el GPS esté activado</p>
                      <p>• Intenta moverte más cerca de la instalación</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Se requiere permiso de geolocalización</p>
            <p>• La validación usa GPS de alta precisión</p>
            <p>• Radio de validación: {allowedRadius} metros</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
