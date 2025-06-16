"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, CheckCircle, ClipboardList, BarChart3, Building, ListChecks, CheckSquare, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import { useAuth } from "@/context/AuthContext"
import { CircularChart } from "@/app/admin/components/charts/CircularChart"

// Definir tipos para los datos
type Visit = {
  id: number
  facilityId: number
  scheduleId: number
  facilityName: string
  location: string
  date: string
  scheduledTime: string
  scheduledEndTime: string
  status: string
}

type Observation = {
  id: number
  facilityId: number
  facilityName: string
  location: string
  description: string
  status: string
  date: string
  priority: string
  photos: string[]
}

type DashboardData = {
  stats: {
    totalFacilities: number
    pendingVisits: number
    completedVisits: number
    pendingObservations: number
  }
  upcomingVisits: Visit[]
  recentObservations: Observation[]
  attendanceStats: {
    onTime: number
    late: number
    missed: number
    total: number
  }
}

// Datos de ejemplo actualizados para el dashboard
const dashboardData: DashboardData = {
  stats: {
    totalFacilities: 2, // Corregido de 5 a 2
    pendingVisits: 5,   // Corregido de 3 a 5
    completedVisits: 5, // Corregido de 12 a 4
    pendingObservations: 1, // Corregido de 2 a 1
  },
  // Datos actualizados según la imagen de referencia de Visitas Programadas (tres más recientes: 16/04, 17/04, 18/04)
  upcomingVisits: [
    {
      id: 103,
      facilityId: 2,
      scheduleId: 103,
      facilityName: "Cancha de Fútbol (Grass)",
      location: "Parque Juan Pablo II",
      date: "2025-04-19",
      scheduledTime: "08:00",
      scheduledEndTime: "12:00",
      status: "pendiente",
    },
    {
      id: 102,
      facilityId: 1,
      scheduleId: 102,
      facilityName: "Piscina Municipal",
      location: "Complejo Deportivo Municipal",
      date: "2025-04-18",
      scheduledTime: "14:00",
      scheduledEndTime: "18:00",
      status: "pendiente",
    },
    {
      id: 101,
      facilityId: 2,
      scheduleId: 101,
      facilityName: "Cancha de Fútbol (Grass)",
      location: "Parque Juan Pablo II",
      date: "2025-04-17",
      scheduledTime: "08:00",
      scheduledEndTime: "12:00",
      status: "pendiente",
    },
  ],
  // Datos actualizados según la imagen compartida de Observaciones Recientes
  recentObservations: [
    {
      id: 1,
      facilityId: 1,
      facilityName: "Piscina Municipal",
      location: "Complejo Deportivo Municipal",
      description: "Azulejos rotos en el borde sur de la piscina",
      status: "aprobada",
      date: "2025-03-20",
      priority: "media",
      photos: ["/placeholder.svg?height=100&width=100"],
    },
    {
      id: 2,
      facilityId: 1,
      facilityName: "Piscina Municipal",
      location: "Complejo Deportivo Municipal",
      description: "Fuga de agua en las duchas de hombres",
      status: "completada",
      date: "2025-03-10",
      priority: "alta",
      photos: ["/placeholder.svg?height=100&width=100"],
    },
    {
      id: 3,
      facilityId: 2,
      facilityName: "Cancha de Fútbol (Grass)",
      location: "Parque Juan Pablo II",
      description: "Daños en la red de la portería norte",
      status: "pendiente",
      date: "2025-04-01",
      priority: "media",
      photos: ["/placeholder.svg?height=100&width=100"],
    },
  ],
  attendanceStats: {
    onTime: 4,
    late: 1,
    missed: 1,
    total: 6,
  },
}

export default function CoordinadorDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Obtener el ID del coordinador desde el contexto de autenticación
        const coordinadorId = user?.id ? parseInt(user.id) : 4 // Fallback para pruebas

        console.log(`Cargando dashboard para coordinador ID: ${coordinadorId}`)

        const response = await fetch(`/api/coordinador/dashboard/${coordinadorId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Error al cargar dashboard: ${response.status}`)
        }

        const backendData = await response.json()

        if (backendData.error) {
          throw new Error(backendData.error)
        }

        console.log('Dashboard data received:', backendData)

        // Transformar los datos del backend al formato esperado por el frontend
        const transformedData: DashboardData = {
          stats: {
            totalFacilities: backendData.stats?.totalFacilities || 0,
            pendingVisits: backendData.stats?.pendingVisits || 0,
            completedVisits: backendData.stats?.completedVisits || 0,
            pendingObservations: backendData.stats?.pendingObservations || 0,
          },
          upcomingVisits: backendData.upcomingVisits || [],
          recentObservations: backendData.recentObservations || [],
          attendanceStats: {
            onTime: backendData.attendanceStats?.onTime || 0,
            late: backendData.attendanceStats?.late || 0,
            missed: backendData.attendanceStats?.missed || 0,
            total: backendData.attendanceStats?.total || 0,
          }
        }

        setData(transformedData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
        // Usar datos de fallback en caso de error
        setData(dashboardData)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "aprobada":
      case "en_proceso":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rechazada":
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      case "completada":
      case "resuelta":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      case "programada":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>
      case "media":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
      case "baja":
        return <Badge className="bg-blue-100 text-blue-800">Baja</Badge>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de control del coordinador</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error al cargar datos</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se pudieron cargar los datos</p>
        </div>
      </div>
    )
  }

  // Calcular porcentajes para las estadísticas de asistencia
  const attendancePercentages = {
    onTime: data.attendanceStats.total > 0 ? (data.attendanceStats.onTime / data.attendanceStats.total) * 100 : 0,
    late: data.attendanceStats.total > 0 ? (data.attendanceStats.late / data.attendanceStats.total) * 100 : 0,
    missed: data.attendanceStats.total > 0 ? (data.attendanceStats.missed / data.attendanceStats.total) * 100 : 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control del coordinador</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Instalaciones Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{data.stats.totalFacilities}</div>
              <Building className="h-6 w-6 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Instalaciones bajo tu supervisión</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/coordinador/instalaciones">Ver instalaciones</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visitas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{data.stats.pendingVisits}</div>
              <ListChecks className="h-6 w-6 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Visitas programadas próximamente</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/coordinador/asistencia/programadas">Ver programación</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visitas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{data.stats.completedVisits}</div>
              <CheckSquare className="h-6 w-6 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de visitas realizadas</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/coordinador/asistencia">Ver historial</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Observaciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{data.stats.pendingObservations}</div>
              <AlertCircle className="h-6 w-6 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Observaciones en revisión</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/coordinador/observaciones">Ver observaciones</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Visitas</CardTitle>
            <CardDescription>Visitas programadas para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingVisits.map((visit) => (
                  <div key={visit.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{visit.facilityName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" /> {visit.location}
                    </p>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Fecha</p>
                          <p className="font-medium">{format(createLocalDate(visit.date), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Horario</p>
                          <p className="font-medium">{visit.scheduledTime} - {visit.scheduledEndTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No hay visitas programadas</h3>
                <p className="text-gray-500 mt-2">No tienes visitas programadas próximamente.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary-light" asChild>
              <Link href="/coordinador/asistencia/programadas">Ver todas las visitas programadas</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observaciones Recientes</CardTitle>
            <CardDescription>Últimas observaciones reportadas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentObservations.length > 0 ? (
              <div className="space-y-4">
                {data.recentObservations.map((observation) => (
                  <div key={observation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{observation.facilityName}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(observation.status)}
                        {getPriorityBadge(observation.priority)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{observation.description}</p>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Fecha</p>
                          <p>{format(createLocalDate(observation.date), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-gray-500">Ubicación</p>
                          <p>{observation.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No hay observaciones recientes</h3>
                <p className="text-gray-500 mt-2">No has reportado observaciones recientemente.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary-light" asChild>
              <Link href="/coordinador/observaciones">Ver todas las observaciones</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Asistencia</CardTitle>
            <CardDescription>Resumen de tus registros de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">A tiempo</span>
                  </div>
                  <span className="text-sm font-medium">{data.attendanceStats.onTime} visitas</span>
                </div>
                <Progress
                  value={attendancePercentages.onTime}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-green-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Tarde</span>
                </div>
                <span className="text-sm font-medium">{data.attendanceStats.late} visitas</span>
              </div>
              <Progress
                value={attendancePercentages.late}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">No asistió</span>
                </div>
                <span className="text-sm font-medium">{data.attendanceStats.missed} visitas</span>
              </div>
              <Progress
                value={attendancePercentages.missed}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-red-500"
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de visitas:</span>
              <span className="font-bold">{data.attendanceStats.total}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-medium">Tasa de asistencia:</span>
              <span className="font-bold text-green-600">
                {data.attendanceStats.total > 0
                  ? Math.round(
                      ((data.attendanceStats.onTime + data.attendanceStats.late) / data.attendanceStats.total) * 100,
                    )
                  : 0
                }
                %
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary hover:bg-primary-light" asChild>
            <Link href="/coordinador/asistencia">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver estadísticas detalladas
            </Link>
          </Button>        </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Asistencia</CardTitle>
            <CardDescription>Vista visual de tus registros de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <CircularChart
              data={[
                {
                  name: "A tiempo",
                  value: data.attendanceStats.onTime,
                  color: "#10b981"
                },
                {
                  name: "Tarde",
                  value: data.attendanceStats.late,
                  color: "#f59e0b"
                },
                {
                  name: "No asistió",
                  value: data.attendanceStats.missed,
                  color: "#ef4444"
                }
              ].filter(item => item.value > 0)}
              title="Distribución de Asistencia"
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}