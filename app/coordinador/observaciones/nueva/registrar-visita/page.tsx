"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Camera, Upload, Save, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"

// Define interfaces
interface Facility {
  id: number;
  name: string;
  image: string;
  location: string;
  coordinates: { lat: number; lng: number };
}

interface PhotoData {
  id: number;
  name: string;
  url: string;
}

interface FormData {
  description: string;
  priority: string;
  photos: PhotoData[];
}

// Datos de ejemplo para las instalaciones
const facilitiesDB: Facility[] = [
  {
    id: 1,
    name: "Cancha de Futbol (Grass)",
    image: "/placeholder.svg?height=400&width=800",
    location: "Parque Juan Pablo II",
    coordinates: { lat: -12.0464, lng: -77.0428 }, // Coordenadas ficticias
  },
  {
    id: 2,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=400&width=800",
    location: "Complejo Deportivo Municipal",
    coordinates: { lat: -12.05, lng: -77.04 }, // Coordenadas ficticias
  },
]

export default function RegistrarVisitaPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const facilityId = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [formData, setFormData] = useState<FormData>({
    description: "",
    priority: "media",
    photos: [],
  })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocationValid, setIsLocationValid] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const foundFacility = facilitiesDB.find((f) => f.id === Number.parseInt(facilityId || "0"))
      setFacility(foundFacility || null)
      setIsLoading(false)
    }

    loadData()
  }, [facilityId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulación de carga de fotos
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map((file) => ({
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
      }))

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }))
    }
  }

  const removePhoto = (photoId: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== photoId),
    }))
  }

  const checkLocation = () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada por tu navegador.")
      setIsCheckingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userCoords)

        // Simulación de validación de ubicación
        // En un caso real, se calcularía la distancia entre las coordenadas
        const isValid = Math.random() > 0.3 // 70% de probabilidad de éxito para la demo

        setIsLocationValid(isValid)
        setIsCheckingLocation(false)

        if (isValid) {
          toast({
            title: "Ubicación validada",
            description: "Tu ubicación ha sido validada correctamente.",
          })
        } else {
          toast({
            title: "Ubicación no válida",
            description: "Debes estar físicamente en la instalación para registrar una visita.",
            variant: "destructive",
          })
        }
      },
      (error) => {
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
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLocationValid) {
      toast({
        title: "Ubicación no validada",
        description: "Debes validar tu ubicación antes de registrar la visita.",
        variant: "destructive",
      })
      return
    }

    // Validación básica
    if (!formData.description) {
      toast({
        title: "Error",
        description: "Por favor ingresa una descripción de la observación.",
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para guardar la observación
    if (facility) {
      console.log("Guardando observación:", { ...formData, facilityId: facility.id })
    }

    toast({
      title: "Visita registrada",
      description: "La visita y observación han sido registradas exitosamente.",
    })

    // Redireccionar a la lista de observaciones
    // router.push("/coordinador/observaciones")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Instalación no encontrada</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Instalación no encontrada</h3>
            <p className="text-gray-500 mt-2">La instalación que estás buscando no existe o no está asignada a ti.</p>
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
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href={`/coordinador/instalaciones/${facility.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Registrar Visita</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Visita</CardTitle>
                <CardDescription>Registra tu visita a la instalación y reporta cualquier observación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{facility.name}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {facility.location}
                    </p>
                  </div>
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Observaciones <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe el estado de la instalación, problemas encontrados, etc."
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fotos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <Label
                        htmlFor="photos"
                        className="flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-gray-50"
                      >
                        <Camera className="h-6 w-6 text-gray-400" />
                        <span>Tomar o seleccionar fotos</span>
                      </Label>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-full"
                        onClick={() => {
                          const photoInput = document.getElementById("photos");
                          if (photoInput) photoInput.click();
                        }}
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Subir fotos
                      </Button>
                    </div>
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Validación de Ubicación</CardTitle>
                <CardDescription>
                  Debes validar tu ubicación para confirmar que estás físicamente en la instalación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary-pale p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Importante</h3>
                  <p className="text-sm text-gray-700">
                    Para registrar una visita, debes estar físicamente en la instalación. El sistema validará tu
                    ubicación mediante geolocalización.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary-light"
                    onClick={checkLocation}
                    disabled={isCheckingLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isCheckingLocation ? "Validando..." : "Validar Ubicación"}
                  </Button>
                </div>

                {locationError && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
                    <p className="font-medium">Error:</p>
                    <p>{locationError}</p>
                  </div>
                )}

                {isLocationValid && (
                  <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
                    <p className="font-medium">Ubicación validada</p>
                    <p>Tu ubicación ha sido verificada correctamente.</p>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Estado de la validación:</h3>
                  {isLocationValid ? (
                    <Badge className="bg-green-100 text-green-800">Ubicación validada</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">Pendiente de validación</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={!isLocationValid}>
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Visita
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

