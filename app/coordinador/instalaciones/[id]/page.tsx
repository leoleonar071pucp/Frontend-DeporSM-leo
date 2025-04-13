"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  ClipboardList,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

// Datos de ejemplo para las instalaciones
const facilitiesDB = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    image: "/placeholder.svg?height=400&width=800",
    location: "Parque Juan Pablo II",
    description:
      "Cancha de fútbol con grass sintético de última generación, ideal para partidos de fútbol 7 o fútbol 11. Cuenta con iluminación para partidos nocturnos.",
    status: "buen-estado",
    lastVisit: "01/04/2025",
    nextVisit: "05/04/2025, 14:00",
    isToday: true,
    features: [
      "Dimensiones: 90m x 45m",
      "Grass sintético de alta calidad",
      "Iluminación nocturna",
      "Vestuarios y duchas",
      "Estacionamiento cercano",
    ],
    amenities: [
      "Vestuarios con casilleros",
      "Duchas con agua caliente",
      "Área de calentamiento",
      "Tribunas para espectadores",
      "Alquiler de balones (costo adicional)",
    ],
    rules: [
      "Uso de zapatillas adecuadas (no tacos metálicos)",
      "No consumir alimentos dentro de la cancha",
      "Respetar el horario reservado",
      "Máximo 22 jugadores por reserva",
      "Prohibido el consumo de alcohol",
    ],
    observations: [
      {
        id: 1,
        date: "01/04/2025",
        description: "Daños en la red de la portería norte",
        status: "pendiente",
        photos: ["/placeholder.svg?height=100&width=100"],
      },
      {
        id: 2,
        date: "15/03/2025",
        description: "Grass desgastado en el área central",
        status: "aprobada",
        photos: ["/placeholder.svg?height=100&width=100"],
      },
    ],
    schedule: "Lunes a Domingo: 8:00 - 22:00",
    contactNumber: "987-654-322",
  },
  {
    id: 2,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=400&width=800",
    location: "Complejo Deportivo Municipal",
    description:
      "Piscina semiolímpica con carriles para natación y área recreativa. Ideal para practicar natación, clases de aquagym y actividades acuáticas.",
    status: "requiere-atencion",
    lastVisit: "02/04/2025",
    nextVisit: "05/04/2025, 16:30",
    isToday: true,
    features: [
      "Dimensiones: 25m x 12.5m",
      "Profundidad: 1.2m - 2.0m",
      "6 carriles para natación",
      "Temperatura controlada (26-28°C)",
      "Vestuarios y duchas",
      "Salvavidas certificados",
    ],
    amenities: ["Vestuarios con casilleros", "Duchas con agua caliente", "Área de descanso", "Cafetería cercana"],
    rules: [
      "Uso obligatorio de gorro de baño",
      "Ducharse antes de ingresar a la piscina",
      "No correr en el área de la piscina",
      "No consumir alimentos dentro del área de la piscina",
      "Niños menores de 12 años deben estar acompañados por un adulto",
    ],
    observations: [
      {
        id: 3,
        date: "02/04/2025",
        description: "Filtro de agua requiere mantenimiento",
        status: "aprobada",
        photos: ["/placeholder.svg?height=100&width=100"],
      },
      {
        id: 4,
        date: "20/03/2025",
        description: "Azulejos rotos en el borde sur de la piscina",
        status: "aprobada",
        photos: ["/placeholder.svg?height=100&width=100"],
      },
      {
        id: 5,
        date: "10/03/2025",
        description: "Fuga de agua en las duchas de hombres",
        status: "completada",
        photos: ["/placeholder.svg?height=100&width=100"],
      },
    ],
    schedule: "Lunes a Viernes: 6:00 - 21:00, Sábados y Domingos: 8:00 - 18:00",
    contactNumber: "987-654-321",
  },
]

export default function InstalacionDetalle({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState<any>(null)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const foundFacility = facilitiesDB.find((f) => f.id === Number.parseInt(params.id))
      setFacility(foundFacility || null)
      setIsLoading(false)
    }

    loadData()
  }, [params.id])

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

  const getObservationStatusBadge = (status) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "aprobada":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rechazada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "completada":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{facility.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary-light" asChild>
            <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Reportar Observación
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{facility.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {facility.location}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(facility.status)}
                  {facility.isToday && <Badge className="bg-blue-100 text-blue-800">Visita hoy</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={facility.image || "/placeholder.svg"}
                alt={facility.name}
                className="w-full h-64 object-cover rounded-md mb-6"
              />

              <Tabs defaultValue="descripcion">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                  <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                  <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                  <TabsTrigger value="reglas">Reglas</TabsTrigger>
                </TabsList>
                <TabsContent value="descripcion" className="mt-4">
                  <p className="text-gray-700 mb-4">{facility.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Horario</p>
                        <p className="text-sm text-gray-600">{facility.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Última visita</p>
                        <p className="text-sm text-gray-600">{facility.lastVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Próxima visita</p>
                        <p className="text-sm text-gray-600">
                          {facility.isToday ? (
                            <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                          ) : (
                            facility.nextVisit
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="caracteristicas" className="mt-4">
                  <ul className="space-y-2">
                    {facility.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="comodidades" className="mt-4">
                  <ul className="space-y-2">
                    {facility.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="reglas" className="mt-4">
                  <ul className="space-y-2">
                    {facility.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observaciones Reportadas</CardTitle>
              <CardDescription>Historial de observaciones para esta instalación</CardDescription>
            </CardHeader>
            <CardContent>
              {facility.observations.length > 0 ? (
                <div className="space-y-4">
                  {facility.observations.map((observation) => (
                    <div key={observation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          <span className="font-medium">{observation.date}</span>
                        </div>
                        {getObservationStatusBadge(observation.status)}
                      </div>
                      <p className="text-gray-700 mb-3">{observation.description}</p>
                      {observation.photos && observation.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {observation.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo || "/placeholder.svg"}
                              alt={`Foto ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay observaciones reportadas para esta instalación.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary-light" asChild>
                <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>Reportar Nueva Observación</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-sm text-gray-600">{facility.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-gray-600">{facility.contactNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Próxima Visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-sm text-gray-600">
                    {facility.isToday ? <Badge className="bg-blue-100 text-blue-800">Hoy</Badge> : facility.nextVisit}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="bg-primary-pale p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Recordatorio</h3>
                <p className="text-sm text-gray-700">
                  Recuerda que debes estar físicamente en la instalación para registrar observaciones. El sistema
                  validará tu ubicación mediante geolocalización.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary-light" asChild>
                <Link href={`/coordinador/asistencia/registrar?id=${facility.id}`}>Registrar Asistencia</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

