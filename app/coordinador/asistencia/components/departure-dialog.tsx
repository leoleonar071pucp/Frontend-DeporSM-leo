"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { AttendanceRecord } from "../types"
import { Loader2, MapPin, Navigation, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Coordinates, getCurrentLocation, calculateDistance } from "@/lib/google-maps"
import { API_BASE_URL } from "@/lib/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DepartureDialogProps {
  open: boolean
  onClose: () => void
  attendance: AttendanceRecord | null
  onRegisterDeparture: (attendanceId: number, departureTime: string, departureStatus: "a-tiempo" | "tarde", location: Coordinates, notes: string) => void
}

export function DepartureDialog({ open, onClose, attendance, onRegisterDeparture }: DepartureDialogProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationValid, setIsLocationValid] = useState(false)
  const [facilityCoordinates, setFacilityCoordinates] = useState<Coordinates | null>(null)
  const [facilityRadius, setFacilityRadius] = useState<number>(100)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  // Función para formatear horarios (eliminar segundos si existen)
  const formatTime = (time: string | null): string => {
    if (!time) return "No definida";
    // Si el tiempo incluye segundos (HH:MM:SS), extraer solo HH:MM
    if (time.includes(":") && time.length > 5) {
      return time.substring(0, 5);
    }
    return time;
  }

  // Resetear el estado cuando se abre o cierra el diálogo
  useEffect(() => {
    if (open) {
      setUserLocation(null)
      setIsLocationValid(false)
      setFacilityCoordinates(null)
      setFacilityRadius(100)
      setIsCheckingLocation(false)
      setLocationError(null)
      setDistance(null)
    }
  }, [open])

  // Obtener coordenadas de la instalación cuando se abre el diálogo
  useEffect(() => {
    const fetchFacilityCoordinates = async () => {
      if (open && attendance?.facilityId) {
        try {
          const response = await fetch(`${API_BASE_URL}/instalaciones/${attendance.facilityId}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const facilityData = await response.json();
            if (facilityData.latitud && facilityData.longitud) {
              setFacilityCoordinates({
                lat: facilityData.latitud,
                lng: facilityData.longitud
              });
              setFacilityRadius(facilityData.radioValidacion || 100);
              console.log(`[DEBUG] Coordenadas obtenidas para instalación ${attendance.facilityId}:`, {
                lat: facilityData.latitud,
                lng: facilityData.longitud,
                radio: facilityData.radioValidacion || 100
              });
            } else {
              console.warn(`[DEBUG] Instalación ${attendance.facilityId} no tiene coordenadas configuradas`);
            }
          } else {
            console.error(`[DEBUG] Error al obtener instalación: ${response.status}`);
          }
        } catch (error) {
          console.error("Error al obtener coordenadas de la instalación:", error);
        }
      }
    };

    fetchFacilityCoordinates();
  }, [open, attendance?.facilityId])

  // Función para validar ubicación de salida (debe estar FUERA del radio)
  const handleGetLocation = async () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      })

      setUserLocation(location)

      if (facilityCoordinates) {
        // Calcular distancia
        const distanceToFacility = calculateDistance(location, facilityCoordinates)
        setDistance(Math.round(distanceToFacility))

        // Para salidas: válido si está FUERA del radio
        const isOutsideFacility = distanceToFacility > facilityRadius
        setIsLocationValid(isOutsideFacility)

        if (isOutsideFacility) {
          toast({
            title: "Ubicación validada para salida",
            description: `Has salido de la instalación. Distancia: ${Math.round(distanceToFacility)}m del centro.`
          })
        } else {
          toast({
            title: "Aún dentro de la instalación",
            description: `Estás a ${Math.round(distanceToFacility)}m del centro. Debes salir del radio de ${facilityRadius}m para registrar tu salida.`,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener ubicación'
      setLocationError(errorMessage)
      console.error('Error obteniendo ubicación:', error)
    } finally {
      setIsCheckingLocation(false)
    }
  }

  const handleRegisterDeparture = () => {
    if (!attendance) return

    if (!isLocationValid || !userLocation) {
      toast({
        title: "Ubicación no validada",
        description: "Debes validar tu ubicación antes de registrar la salida.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    // Obtener la hora actual formateada
    const currentTime = format(new Date(), "HH:mm")

    // Determinar el estado de salida basado en la lógica especificada
    const departureStatus = determineDepartureStatus(attendance.scheduledEndTime, currentTime)

    // Llamar a la función para registrar la salida
    onRegisterDeparture(attendance.id, currentTime, departureStatus, userLocation, "")

    // Cerrar el diálogo después de procesar
    setIsLoading(false)
    onClose()
  }

  // Función para determinar el estado de salida
  const determineDepartureStatus = (scheduledEndTime: string | null, departureTime: string): "a-tiempo" | "tarde" => {
    if (!scheduledEndTime) return "a-tiempo"

    // Convertir las horas a minutos para comparar fácilmente
    const [schedHours, schedMinutes] = scheduledEndTime.split(":").map(Number)
    const [depHours, depMinutes] = departureTime.split(":").map(Number)

    const schedTotalMinutes = schedHours * 60 + schedMinutes
    const depTotalMinutes = depHours * 60 + depMinutes

    // Si sale más de 10 minutos después de la hora programada, es tarde
    const diffMinutes = depTotalMinutes - schedTotalMinutes

    if (diffMinutes > 10) {
      return "tarde"
    } else {
      return "a-tiempo"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>
            Confirma tu salida de la instalación. Esto registrará tu ubicación y hora actual.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {attendance && (
            <div className="grid gap-2 px-1">
              <h3 className="font-medium">{attendance.facilityName}</h3>
              <p className="text-sm text-gray-500">{attendance.location}</p>
              <p className="text-sm">
                Hora programada: {formatTime(attendance.scheduledTime)} - {formatTime(attendance.scheduledEndTime)}
              </p>
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>• Hasta 10 minutos después: A tiempo</p>
                <p>• Más de 10 minutos después: Tarde</p>
              </div>
            </div>
          )}

          {/* Validación de ubicación personalizada para salidas */}
          {attendance && facilityCoordinates ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Validación de Salida
                </CardTitle>
                <CardDescription>
                  Verifica que hayas salido de {attendance.facilityName} para registrar tu salida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleGetLocation}
                    disabled={isCheckingLocation}
                    className="flex items-center gap-2 min-h-[44px] w-full justify-center"
                  >
                    <Navigation className="h-4 w-4" />
                    {isCheckingLocation ? 'Verificando ubicación...' : 'Verificar que he salido'}
                  </Button>

                  {locationError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {locationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {userLocation && distance !== null && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Tu ubicación actual:</p>
                          <p className="text-xs text-gray-600">
                            Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        {isLocationValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {isLocationValid ? (
                            <Badge className="bg-green-100 text-green-800">
                              Fuera de la instalación
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Dentro de la instalación
                            </Badge>
                          )}
                          <span className="text-sm text-gray-600">
                            Distancia: {distance}m
                          </span>
                        </div>

                        <Alert variant={isLocationValid ? "default" : "destructive"}>
                          <AlertDescription>
                            {isLocationValid
                              ? `Ubicación válida. Estás a ${distance} metros del centro de la instalación, fuera del radio de ${facilityRadius}m.`
                              : `Ubicación inválida. Estás a ${distance} metros del centro. Debes salir del radio de ${facilityRadius} metros para registrar tu salida.`
                            }
                          </AlertDescription>
                        </Alert>

                        {!isLocationValid && (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>• Debes estar fuera de {facilityRadius} metros de la instalación</p>
                            <p>• Asegúrate de que el GPS esté activado</p>
                            <p>• Sal completamente de las instalaciones antes de registrar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Se requiere permiso de geolocalización</p>
                    <p>• La validación usa GPS de alta precisión</p>
                    <p>• Debes estar FUERA del radio de {facilityRadius} metros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Mensaje de carga mientras se obtienen las coordenadas */
            attendance && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Obteniendo información de la instalación...</p>
              </div>
            )
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:flex-1 min-h-[44px] w-full"
            disabled={isLoading || isCheckingLocation}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRegisterDeparture}
            disabled={isLoading || isCheckingLocation || !isLocationValid}
            className="bg-primary hover:bg-primary/90 sm:flex-1 min-h-[44px] w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Salida"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}