"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Calendar, Clock, MapPin, Users, Info, Phone } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

import { facilitiesDB, Facility } from "@/data/facilities"
import EditFacility from "./edit-facility"

export default function InstalacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { id: facilityId } = React.use(params)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const foundFacility = facilitiesDB.find((f) => f.id === Number.parseInt(facilityId))
      setFacility(foundFacility || null)
      setIsLoading(false)
    }

    loadData()
  }, [facilityId])

  const handleSave = (updatedFacility: Facility) => {
    setFacility(updatedFacility)
    setIsEditing(false)
  }

  const getMaintenanceStatusBadge = (status: string) => {
    switch (status) {
      case "none":
        return null
      case "required":
        return <Badge className="bg-red-100 text-red-800">Requiere mantenimiento</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento programado</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
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
            <Link href="/admin/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Instalación no encontrada</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Instalación no encontrada</h3>
            <p className="text-gray-500 mt-2">La instalación que estás buscando no existe o ha sido eliminada.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/admin/instalaciones">Ver todas las instalaciones</Link>
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
            <Link href="/admin/instalaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{facility.name}</h1>
        </div>
        <div className="flex gap-2">
          {isSuccess && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Guardado correctamente</span>
            </div>
          )}
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "" : "bg-primary hover:bg-primary-light"}
          >
            {isEditing ? "Cancelar" : "Editar instalación"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <EditFacility
          facility={facility}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
        />
      ) : (
        <>
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
                      <Badge
                        className={`${
                          facility.status === "disponible" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {facility.status === "disponible" ? "Disponible" : "En mantenimiento"}
                      </Badge>
                      {getMaintenanceStatusBadge(facility.maintenanceStatus)}
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
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Capacidad</p>
                            <p className="text-sm text-gray-600">{facility.capacity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Último mantenimiento</p>
                            <p className="text-sm text-gray-600">{facility.lastMaintenance}</p>
                          </div>
                        </div>
                        {facility.nextMaintenance && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Próximo mantenimiento</p>
                              <p className="text-sm text-gray-600">{facility.nextMaintenance}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-primary font-bold mt-4">{facility.price}</p>
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
                  <CardTitle>Estado de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Último mantenimiento</p>
                      <p className="text-sm text-gray-600">{facility.lastMaintenance}</p>
                    </div>
                  </div>
                  {facility.nextMaintenance ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Próximo mantenimiento</p>
                        <p className="text-sm text-gray-600">{facility.nextMaintenance}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Estado</p>
                        <p className="text-sm text-gray-600">
                          {facility.maintenanceStatus === "required"
                            ? "Requiere mantenimiento"
                            : "No hay mantenimiento programado"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {(facility.maintenanceStatus === 'none' || facility.maintenanceStatus === 'required') && (
                    <Button className="w-full bg-primary hover:bg-primary-light" asChild>
                      <Link href={`/admin/instalaciones/${facility.id}/mantenimiento`}>Programar mantenimiento</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reservas Recientes</CardTitle>
              <CardDescription>Últimas reservas realizadas para esta instalación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Juan Pérez</td>
                      <td className="py-3 px-4">05/04/2025</td>
                      <td className="py-3 px-4">18:00 - 19:00</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin/reservas">Ver detalles</Link>
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">María López</td>
                      <td className="py-3 px-4">06/04/2025</td>
                      <td className="py-3 px-4">10:00 - 11:00</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin/reservas">Ver detalles</Link>
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Carlos Rodríguez</td>
                      <td className="py-3 px-4">06/04/2025</td>
                      <td className="py-3 px-4">16:00 - 17:00</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/admin/reservas">Ver detalles</Link>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/reservas">Ver todas las reservas</Link>
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}

