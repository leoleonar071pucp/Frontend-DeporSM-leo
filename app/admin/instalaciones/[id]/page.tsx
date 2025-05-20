"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Calendar, Clock, MapPin, Users, Info, Phone } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import EditFacility from "./edit-facility/page"

// Interfaz para las reservas recientes
interface RecentReservation {
  idReserva: number;
  nombreUsuario: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export default function InstalacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([])
  const { id: facilityId } = React.use(params)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos de la instalación
        const response = await fetch(`${API_BASE_URL}/instalaciones/${facilityId}`)
        if (!response.ok) throw new Error("Error al cargar instalación")
        const data = await response.json()

        // Determinar el estado de mantenimiento
        let maintenanceStatus = "none";
        if (data.estado === "mantenimiento") {
          maintenanceStatus = "in-progress";
        }

        // Cargar información de mantenimiento
        const maintenanceResponse = await fetch(`${API_BASE_URL}/mantenimientos/instalacion/${facilityId}`)
        let lastMaintenance = null;
        let nextMaintenance = null;
        let tieneMantenimientoActivo = false;
        let enMantenimiento = false;

        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json();
          console.log("Datos de mantenimiento:", maintenanceData);

          // Obtener último mantenimiento si existe
          if (maintenanceData.tieneMantenimientoCompletado) {
            lastMaintenance = maintenanceData.ultimoMantenimiento;
          }

          // Obtener próximo mantenimiento si existe
          if (maintenanceData.tieneMantenimientoProgramado) {
            nextMaintenance = maintenanceData.proximoMantenimiento;
            // Si hay mantenimiento programado, actualizar el estado
            maintenanceStatus = "scheduled";
          }

          // Verificar si está en mantenimiento actualmente
          if (maintenanceData.enMantenimiento) {
            enMantenimiento = true;
            maintenanceStatus = "in-progress";
          }

          // Verificar si tiene algún mantenimiento activo (programado o en progreso)
          if (maintenanceData.tieneMantenimientoActivo) {
            tieneMantenimientoActivo = true;
          }
        }

        // Formatear los datos para la interfaz
        const enrichedData = {
          ...data,
          id: data.id,
          name: data.nombre,
          description: data.descripcion,
          location: data.ubicacion,
          image: data.imagenUrl,
          price: `S/. ${parseFloat(data.precio).toFixed(2)} por hora`,
          capacity: `${data.capacidad} personas`,
          contactNumber: data.contactoNumero || "987-654-321",
          features: data.caracteristicas || [],
          amenities: data.comodidades || [],
          rules: data.reglas || [],
          lastMaintenance: lastMaintenance, // Datos reales del backend
          nextMaintenance: nextMaintenance,
          status: enMantenimiento ? "mantenimiento" : (data.estado || "disponible"),
          maintenanceStatus: maintenanceStatus,
          tieneMantenimientoActivo: tieneMantenimientoActivo,
          enMantenimiento: enMantenimiento
        }

        setFacility(enrichedData)

        // Cargar reservas recientes para esta instalación
        const reservationsResponse = await fetch(`${API_BASE_URL}/reservas/instalacion/${facilityId}`)
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json()
          console.log("Datos de reservas recibidos:", reservationsData);

          // Si hay datos, verificar el formato de la fecha
          if (reservationsData && reservationsData.length > 0) {
            console.log("Ejemplo de fecha recibida:", reservationsData[0].fecha, "Tipo:", typeof reservationsData[0].fecha);

            // Mostrar cómo se formatea la fecha
            const datePart = reservationsData[0].fecha.split('T')[0];
            const date = new Date(`${datePart}T12:00:00`);
            console.log("Fecha parseada:", date);
            console.log("Fecha formateada:", date.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }));
          }

          setRecentReservations(reservationsData)
        }
      } catch (error) {
        console.error(error)
        setFacility(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [facilityId])


  interface Facility {
    id: number
    name: string
    description: string
    location: string
    image: string
    price: string
    capacity: string
    contactNumber: string
    features: string[]
    amenities: string[]
    rules: string[]
    lastMaintenance: string
    nextMaintenance?: string | null
    status: string
    maintenanceStatus: "none" | "required" | "scheduled" | "in-progress"
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
      const datePart = dateString.split('T')[0];

      // Crear la fecha con la hora a mediodía para evitar problemas de zona horaria
      const date = new Date(`${datePart}T12:00:00`);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error("Fecha inválida:", dateString);
        return dateString;
      }

      // Usar el mismo formato que en la vista de "Mis Reservas"
      // Formatear la fecha usando toLocaleDateString para mostrar el día de la semana y el mes en texto
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateString;
    }
  }

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
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/instalaciones/${facility.id}/edit-facility`}>

              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
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
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Capacidad</p>
                            <p className="text-sm text-gray-600">{facility.capacity}</p>
                          </div>
                        </div>
                        {facility.lastMaintenance ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Último mantenimiento</p>
                              <p className="text-sm text-gray-600">{facility.lastMaintenance}</p>
                            </div>
                          </div>
                        ) : null}
                        {facility.nextMaintenance ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Próximo mantenimiento</p>
                              <p className="text-sm text-gray-600">{facility.nextMaintenance}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-primary font-bold mt-4">{facility.price}</p>
                    </TabsContent>
                    <TabsContent value="caracteristicas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.features && facility.features.length > 0 ? (
                          facility.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{typeof feature === 'string' ? feature : feature.descripcion}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No hay características registradas</li>
                        )}
                      </ul>
                    </TabsContent>
                    <TabsContent value="comodidades" className="mt-4">
                      <ul className="space-y-2">
                        {facility.amenities && facility.amenities.length > 0 ? (
                          facility.amenities.map((amenity, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{typeof amenity === 'string' ? amenity : amenity.descripcion}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No hay comodidades registradas</li>
                        )}
                      </ul>
                    </TabsContent>
                    <TabsContent value="reglas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.rules && facility.rules.length > 0 ? (
                          facility.rules.map((rule, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <span>{typeof rule === 'string' ? rule : rule.descripcion}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No hay reglas registradas</li>
                        )}
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
                  {facility.lastMaintenance ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Último mantenimiento</p>
                        <p className="text-sm text-gray-600">{facility.lastMaintenance}</p>
                      </div>
                    </div>
                  ) : null}

                  {facility.enMantenimiento ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Estado</p>
                        <p className="text-sm text-red-600 font-medium">
                          Esta instalación está en mantenimiento
                        </p>
                      </div>
                    </div>
                  ) : facility.nextMaintenance ? (
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
                  {!facility.tieneMantenimientoActivo ? (
                    <Button className="w-full bg-primary hover:bg-primary-light" onClick={() => router.push(`/admin/instalaciones/${facility.id}/mantenimiento`)}>
                      Programar mantenimiento
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      {facility.enMantenimiento ? "En mantenimiento" : "Mantenimiento programado"}
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
                      <th className="text-left py-3 px-4 font-medium">Nº Reserva</th>
                      <th className="text-left py-3 px-4 font-medium">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations && recentReservations.length > 0 ? (
                      recentReservations.map((reservation) => (
                        <tr key={reservation.idReserva} className="border-b">
                          <td className="py-3 px-4">{`RES-${reservation.idReserva}`}</td>
                          <td className="py-3 px-4">{reservation.nombreUsuario}</td>
                          <td className="py-3 px-4">
                            {/* Mostrar la fecha formateada con día de la semana */}
                            {formatDate(reservation.fecha)}
                          </td>
                          <td className="py-3 px-4">{`${reservation.horaInicio.substring(0, 5)} - ${reservation.horaFin.substring(0, 5)}`}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                reservation.estado === "confirmada" || reservation.estado === "completada"
                                  ? "bg-green-100 text-green-800"
                                  : reservation.estado === "pendiente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {reservation.estado.charAt(0).toUpperCase() + reservation.estado.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No hay reservas recientes para esta instalación
                        </td>
                      </tr>
                    )}
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

