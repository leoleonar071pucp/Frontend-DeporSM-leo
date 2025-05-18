"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Users, Activity, AlertTriangle, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

// Importar componentes personalizados
import { StatCard } from "./components/StatCard"
import { RecentReservation } from "./components/RecentReservation"
import { MaintenanceAlert } from "./components/MaintenanceAlert"
import { BarChart } from "./components/charts/BarChart"
import { PieChart } from "./components/charts/PieChart"
import { LineChart } from "./components/charts/LineChart"

// Interfaces para el estado
interface StatsState {
  totalReservations: number;
  activeReservations: number;
  totalFacilities: number;
  maintenanceAlerts: number;
  totalIncome: number;
  averageUsageTime: number;
}

interface FacilityStatusData {
  id: number;
  name: string;
  status: "disponible" | "mantenimiento";
  reservations: number;
  maintenance: boolean;
}

interface ChartDataState {
  reservationsByFacility: ChartDataItem[];
  incomeByMonth: ChartDataItem[];
  reservationsByDay: ChartDataItem[];
  usageByHour: ChartDataItem[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  // Tipar estados iniciales
  const [stats, setStats] = useState<StatsState>({
    totalReservations: 0,
    activeReservations: 0,
    totalFacilities: 0,
    maintenanceAlerts: 0,
    totalIncome: 0,
    averageUsageTime: 0,
  })
  const [recentReservations, setRecentReservations] = useState<RecentReservationData[]>([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlertData[]>([])
  const [facilityStatus, setFacilityStatus] = useState<FacilityStatusData[]>([])
  const [activeTab, setActiveTab] = useState("general")
  const [chartData, setChartData] = useState<ChartDataState>({
    reservationsByFacility: [],
    incomeByMonth: [],
    reservationsByDay: [],
    usageByHour: [],
  })

  useEffect(() => {
  const loadData = async () => {
    try {
      // Llamada al endpoint de estadísticas
      const resStats = await fetch(`${API_BASE_URL}/reservas/stats`)
      const dataStats = await resStats.json()

      setStats((prev) => ({
        ...prev,
        totalReservations: dataStats.totalReservas ?? 0,
        activeReservations: dataStats.reservasActivas ?? 0,
        totalFacilities: dataStats.totalInstalaciones ?? 0,
        maintenanceAlerts: dataStats.totalObservaciones ?? 0,
      }))

      // Llamada al endpoint de reservas recientes
      const resRecents = await fetch(`${API_BASE_URL}/reservas/recientes`)
      const dataRecents = await resRecents.json()

      setRecentReservations(
        dataRecents.map((r: any) => ({
          id: r.idReserva,
          userName: r.nombreUsuario,
          facilityName: r.nombreInstalacion,
          status: r.estado,
          date: r.fecha,
          time: `${r.horaInicio} - ${r.horaFin}`,
        }))
      )

      // Llamada al endpoint de observaciones recientes
      const resAlerts = await fetch(`${API_BASE_URL}/observaciones/recientes`)
      const dataAlerts = await resAlerts.json()

      setMaintenanceAlerts(
        dataAlerts.map((o: any) => ({
          id: o.idObservacion,
          facilityName: o.nombreInstalacion,
          description: o.descripcion,
          priority: o.prioridad,
          date: o.fecha,
        }))
      )

      // Llamada al endpoint de estado actual de instalaciones
      const resFacilities = await fetch(`${API_BASE_URL}/instalaciones/estado-instalaciones`)
      const dataFacilities = await resFacilities.json()

      setFacilityStatus(
        dataFacilities.map((f: any) => ({
          id: f.idInstalacion,
          name: f.nombreInstalacion,
          status: f.estado,
          reservations: f.reservasHoy,
          maintenance: f.estado === "mantenimiento",
        }))
      )
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error)
    }

    setChartData({
      reservationsByFacility: [
        { name: "Piscina Municipal", value: 65 },
        { name: "Cancha de Fútbol (Grass)", value: 85 },
        { name: "Gimnasio Municipal", value: 45 },
        { name: "Cancha de Fútbol (Loza)", value: 35 },
        { name: "Pista de Atletismo", value: 18 },
      ],
      incomeByMonth: [
        { name: "Ene", value: 1200 }, { name: "Feb", value: 1350 }, { name: "Mar", value: 1500 },
        { name: "Abr", value: 1650 }, { name: "May", value: 1800 }, { name: "Jun", value: 1950 },
      ],
      reservationsByDay: [
        { name: "Lun", value: 35 }, { name: "Mar", value: 28 }, { name: "Mié", value: 32 },
        { name: "Jue", value: 30 }, { name: "Vie", value: 42 }, { name: "Sáb", value: 50 }, { name: "Dom", value: 45 },
      ],
      usageByHour: [
        { name: "8:00", value: 15 }, { name: "9:00", value: 20 }, { name: "10:00", value: 25 },
        { name: "11:00", value: 30 }, { name: "12:00", value: 20 }, { name: "13:00", value: 15 },
        { name: "14:00", value: 10 }, { name: "15:00", value: 15 }, { name: "16:00", value: 25 },
        { name: "17:00", value: 35 }, { name: "18:00", value: 45 }, { name: "19:00", value: 40 }, { name: "20:00", value: 30 },
      ],
    })

    setIsLoading(false)
  }

  loadData()
}, [])




  const handleTabChange = (value: string) => { // Tipar 'value'
    setActiveTab(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de DeporSM.</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Reservas"
          value={stats.totalReservations}
          icon={<CalendarIcon className="h-4 w-4" />}
          change="+12% desde el mes pasado"
          isIncrease={true}
          description="Total acumulado"
        />
        <StatCard
          title="Reservas Activas"
          value={stats.activeReservations}
          icon={<Activity className="h-4 w-4" />}
          change="+5% desde la semana pasada"
          isIncrease={true}
          description="Pendientes y confirmadas"
        />
        <StatCard
          title="Instalaciones"
          value={stats.totalFacilities}
          icon={<Users className="h-4 w-4" />}
          description="Total de instalaciones"
        />
        <StatCard
          title="Observaciones"
          value={stats.maintenanceAlerts}
          icon={<AlertTriangle className="h-4 w-4" />}
          change="-2 desde la semana pasada"
          isIncrease={false}
          description="Observaciones de los coordinadores"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Reservas recientes */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Reservas Recientes</CardTitle>
              <CardDescription>Las últimas 5 reservas realizadas en el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reservas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {recentReservations.map((reservation) => (
                <RecentReservation key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de mantenimiento */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Observaciones</CardTitle>
              <CardDescription>Observaciones de los coordinadores</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/observaciones">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {maintenanceAlerts.map((alert) => (
                <MaintenanceAlert key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Estado de Instalaciones */}
      <div className="space-y-6">
        <Tabs defaultValue="general" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="uso">Uso</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Instalación</CardTitle>
                  <CardDescription>Distribución de reservas en el último mes</CardDescription>
                </CardHeader>
                <CardContent>
                   <PieChart data={chartData.reservationsByFacility} title="Reservas por Instalación" />
                </CardContent>
              </Card>
              <Card>
                 <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                  <CardDescription>Ingresos estimados de los últimos 6 meses</CardDescription>
                </CardHeader>
                 <CardContent>
                   <LineChart data={chartData.incomeByMonth} title="Ingresos Mensuales" />
                 </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reservas" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Reservas por Día de la Semana</CardTitle>
                   <CardDescription>Promedio de reservas por día</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart data={chartData.reservationsByDay} title="Reservas por Día" />
                 </CardContent>
               </Card>
                <Card>
                 <CardHeader>
                   <CardTitle>Horas Pico de Uso</CardTitle>
                   <CardDescription>Distribución de reservas por hora</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <LineChart data={chartData.usageByHour} title="Uso por Hora" />
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          <TabsContent value="ingresos" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Ingresos por Instalación</CardTitle>
                    <CardDescription>Ingresos estimados por tipo de instalación (último mes)</CardDescription>
                 </CardHeader>
                 <CardContent>
                    {/* Simulación basada en reservas y precio estimado */}
                    <BarChart
                      data={chartData.reservationsByFacility.map((item: ChartDataItem) => ({
                        name: item.name,
                        value: item.value * (item.name.includes("Fútbol") ? 100 : item.name.includes("Piscina") ? 15 : 20) // Precio estimado
                      }))}
                      title="Ingresos por Instalación"
                    />
                 </CardContent>
               </Card>
                <Card>
                 <CardHeader>
                   <CardTitle>Ingresos Totales (Últimos 6 Meses)</CardTitle>
                   <CardDescription>Evolución de los ingresos totales</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <LineChart data={chartData.incomeByMonth} title="Ingresos Totales" />
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          <TabsContent value="uso" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Ocupación por Instalación</CardTitle>
                   <CardDescription>Porcentaje de ocupación estimado</CardDescription>
                 </CardHeader>
                  <CardContent>
                     {/* Simulación simple de ocupación */}
                     <BarChart
                       data={chartData.reservationsByFacility.map((item: ChartDataItem) => ({
                         name: item.name,
                         value: Math.min(100, Math.round((item.value / (item.name.includes("Gimnasio") ? 50 : 30)) * 100)) // Estimación simple
                       }))}
                       title="Ocupación (%)"
                     />
                  </CardContent>
               </Card>
                <Card>
                 <CardHeader>
                   <CardTitle>Horas Más Populares</CardTitle>
                   <CardDescription>Horas con mayor número de reservas</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart data={chartData.usageByHour} title="Reservas por Hora" />
                 </CardContent>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Estado Actual de Instalaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual de Instalaciones</CardTitle>
          <CardDescription>Vista rápida de la disponibilidad y mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instalación</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reservas Hoy</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facilityStatus.map((facility: FacilityStatusData) => ( // Tipar facility
                  <tr key={facility.id} className="border-b">
                    <td className="py-3 px-4">{facility.name}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          facility.status === "disponible" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {facility.status === "disponible" ? "Disponible" : "En mantenimiento"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{facility.reservations}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/instalaciones/${facility.id}`}>Ver</Link>
                        </Button>
                        {!facility.maintenance && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/instalaciones/${facility.id}/mantenimiento`}>
                              Mantenimiento
                            </Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}