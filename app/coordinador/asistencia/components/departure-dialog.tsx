"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { AttendanceRecord } from "../types"
import { MapPin, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface DepartureDialogProps {
  open: boolean
  onClose: () => void
  attendance: AttendanceRecord | null
  onRegisterDeparture: (attendanceId: number, departureTime: string, location: GeolocationCoordinates, notes: string) => void
}

export function DepartureDialog({ open, onClose, attendance, onRegisterDeparture }: DepartureDialogProps) {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [isLocationValid, setIsLocationValid] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  
  // Resetear el estado cuando se abre o cierra el diálogo
  useEffect(() => {
    if (open) {
      setLocation(null)
      setLocationError("")
      setIsLocationValid(false)
    }
  }, [open])
  
  const checkLocation = () => {
    setIsCheckingLocation(true)
    setLocationError("")
    
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización")
      setIsCheckingLocation(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords)
        
        // Simulación de validación de ubicación 
        // En producción, aquí se verificaría si las coordenadas están dentro del rango permitido
        const isValid = Math.random() > 0.3 // 70% de probabilidad de éxito para la demo
        
        setIsLocationValid(isValid)
        setIsCheckingLocation(false)
        
        if (isValid) {
          toast({
            title: "Ubicación validada",
            description: "Tu ubicación ha sido validada correctamente."
          })
        } else {
          toast({
            title: "Ubicación no válida",
            description: "Debes estar físicamente en la instalación para registrar tu salida.",
            variant: "destructive"
          })
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error)
        
        let errorMessage = "Error desconocido al obtener la ubicación."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de geolocalización denegado."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "La información de ubicación no está disponible."
            break
          case error.TIMEOUT:
            errorMessage = "La solicitud de ubicación ha expirado."
            break
        }
        
        setLocationError(errorMessage)
        setIsCheckingLocation(false)
        
        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive"
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }
  
  const handleRegisterDeparture = () => {
    if (!attendance) return
    
    if (!isLocationValid || !location) {
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
    
    // Llamar a la función para registrar la salida
    onRegisterDeparture(attendance.id, currentTime, location, "")
    
    // Cerrar el diálogo después de procesar
    setIsLoading(false)
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>
            Confirma tu salida de la instalación. Esto registrará tu ubicación y hora actual.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {attendance && (
            <div className="grid gap-2">
              <h3 className="font-medium">{attendance.facilityName}</h3>
              <p className="text-sm text-gray-500">{attendance.location}</p>
              <p className="text-sm">
                Hora programada: {attendance.scheduledTime} - {attendance.scheduledEndTime || "No definida"}
              </p>
            </div>
          )}
          
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Validación de Ubicación</h3>
              <p className="text-sm text-gray-500 mb-4">
                Debes validar tu ubicación para confirmar que estás saliendo de la instalación
              </p>
              
              {!isLocationValid ? (
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Importante</h4>
                  <p className="text-sm text-blue-700">
                    El sistema validará tu ubicación mediante geolocalización.
                  </p>
                </div>
              ) : null}
              
              {location && isLocationValid ? (
                <div className="grid gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Ubicación actual</h4>
                      <p className="text-sm text-gray-500">
                        Latitud: {location.latitude.toFixed(6)}, Longitud: {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {locationError ? (
                <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm mb-4">
                  <p className="font-medium">Error:</p>
                  <p>{locationError}</p>
                </div>
              ) : null}
              
              <div className="flex flex-col items-center gap-3">
                {!isLocationValid ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={checkLocation}
                    disabled={isCheckingLocation}
                  >
                    {isCheckingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Validar Ubicación
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Ubicación validada</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="sm:flex-1"
            disabled={isLoading || isCheckingLocation}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegisterDeparture} 
            disabled={isLoading || !isLocationValid || isCheckingLocation}
            className="bg-primary hover:bg-primary/90 sm:flex-1"
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