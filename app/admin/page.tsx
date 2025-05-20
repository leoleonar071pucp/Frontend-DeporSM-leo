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
interface MonthlyChanges {
  totalReservations?: number;
  activeReservations?: number;
  maintenanceAlerts?: number;
}

interface StatsState {
  totalReservations: number;
  activeReservations: number;
  totalFacilities: number;
  maintenanceAlerts: number;
  totalIncome: number;
  averageUsageTime: number;
  monthlyChanges?: MonthlyChanges;
}

interface FacilityStatusData {
  id: number;
  name: string;
  status: string;
  lastUpdate: string;
  reservations: number;
  maintenance: boolean;
}

interface RecentReservationData {
  id: number;
  userName: string;
  facilityName: string;
  date: string;
  time: string;
  status: "confirmada" | "pendiente" | "cancelada";
}

interface MaintenanceAlertData {
  id: number;
  facilityName: string;
  description: string;
  date: string;
  priority: "baja" | "media" | "alta" | "completada";
}

interface ChartDataState {
  reservationsByFacility: ChartDataItem[];
  incomeByMonth: ChartDataItem[];
  incomeByFacility: ChartDataItem[];
  reservationsByDay: ChartDataItem[];
  usageByHour: ChartDataItem[];
  reservationsByStatus?: ChartDataItem[];
  observacionesPorInstalacion?: ChartDataItem[];
  estadoMantenimientos?: ChartDataItem[];
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
  const [activeTab, setActiveTab] = useState("reservas")
  const [chartData, setChartData] = useState<ChartDataState>({
    reservationsByFacility: [],
    incomeByMonth: [],
    incomeByFacility: [],
    reservationsByDay: [],
    usageByHour: [],
    reservationsByStatus: [],
    observacionesPorInstalacion: [],
    estadoMantenimientos: [],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Llamada al endpoint de estadísticas
        const resStats = await fetch(`${API_BASE_URL}/reservas/stats`);
        const dataStats: {
          totalReservas: number;
          reservasActivas: number;
          totalInstalaciones: number;
          totalObservaciones: number;
          monthlyChangeTotalReservas: number;
          monthlyChangeReservasActivas: number;
          monthlyChangeTotalObservaciones: number;
        } = await resStats.json();

        setStats((prev: StatsState) => ({
          ...prev,
          totalReservations: dataStats.totalReservas ?? 0,
          activeReservations: dataStats.reservasActivas ?? 0,
          totalFacilities: dataStats.totalInstalaciones ?? 0,
          maintenanceAlerts: dataStats.totalObservaciones ?? 0,
          monthlyChanges: {
            totalReservations: dataStats.monthlyChangeTotalReservas ?? 0,
            activeReservations: dataStats.monthlyChangeReservasActivas ?? 0,
            maintenanceAlerts: dataStats.monthlyChangeTotalObservaciones ?? 0,
          }
        }));

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
        const resAlerts = await fetch(`/api/observaciones/recientes`)
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
        try {
          console.log("Obteniendo estado de instalaciones...");

          // Obtener todas las instalaciones activas como respaldo
          const resAllFacilities = await fetch(`${API_BASE_URL}/instalaciones?activo=true`);
          let allFacilities = [];

          if (resAllFacilities.ok) {
            allFacilities = await resAllFacilities.json();
            console.log("Instalaciones activas obtenidas:", allFacilities.length);
          }

          // Intentar obtener el estado actual de instalaciones
          let resFacilities = await fetch(`/api/instalaciones/estado-instalaciones`);

          // Si falla, intentar con el endpoint alternativo
          if (!resFacilities.ok) {
            console.error("Error al obtener estado de instalaciones:", resFacilities.status);
            console.log("Intentando con el endpoint alternativo...");

            try {
              resFacilities = await fetch(`/api/instalaciones/estado-alternativo`);

              if (!resFacilities.ok) {
                console.error("Error al obtener estado alternativo:", resFacilities.status);
                throw new Error("Ambos endpoints fallaron");
              }
            } catch (altError) {
              console.error("Error con el endpoint alternativo:", altError);

              // Si hay error en ambos endpoints, usar las instalaciones activas como respaldo
              if (allFacilities.length > 0) {
                console.log("Usando instalaciones activas como respaldo");
                setFacilityStatus(
                  allFacilities.map((f: any) => ({
                    id: f.id,
                    name: f.nombre,
                    status: 'disponible', // Por defecto disponible
                    reservations: 0,      // No tenemos datos de reservas
                    maintenance: false,
                    lastUpdate: new Date().toISOString()
                  }))
                );
              } else {
                // Si no hay respaldo, mostrar datos de ejemplo
                console.log("Usando datos de ejemplo");
                setFacilityStatus([
                  {
                    id: 1,
                    name: "Piscina Municipal",
                    status: "disponible",
                    reservations: 3,
                    maintenance: false,
                    lastUpdate: new Date().toISOString()
                  },
                  {
                    id: 2,
                    name: "Cancha de Fútbol Principal",
                    status: "disponible",
                    reservations: 5,
                    maintenance: false,
                    lastUpdate: new Date().toISOString()
                  },
                  {
                    id: 3,
                    name: "Gimnasio Municipal",
                    status: "mantenimiento",
                    reservations: 0,
                    maintenance: true,
                    lastUpdate: new Date().toISOString()
                  }
                ]);
              }
              return;
            }
          }

          const dataFacilities = await resFacilities.json();
          console.log("Datos de estado de instalaciones recibidos:", dataFacilities);

          if (Array.isArray(dataFacilities) && dataFacilities.length > 0) {
            // Mapear los datos a la estructura esperada
            setFacilityStatus(
              dataFacilities.map((f: any) => ({
                id: f.idInstalacion,
                name: f.nombreInstalacion,
                status: f.estado,
                reservations: f.reservasHoy,
                maintenance: f.estado === "mantenimiento",
                lastUpdate: new Date().toISOString()
              }))
            );
          } else if (allFacilities.length > 0) {
            // Si no hay datos de estado pero tenemos instalaciones activas
            console.log("No hay datos de estado, usando instalaciones activas");
            setFacilityStatus(
              allFacilities.map((f: any) => ({
                id: f.id,
                name: f.nombre,
                status: 'disponible',
                reservations: 0,
                maintenance: false,
                lastUpdate: new Date().toISOString()
              }))
            );
          } else {
            // Si no hay datos de ninguna fuente, mostrar mensaje
            console.log("No hay datos de instalaciones disponibles");
            setFacilityStatus([]);
          }
        } catch (error) {
          console.error("Error al cargar estado de instalaciones:", error);
          // En caso de error, establecer un array vacío
          setFacilityStatus([]);
        }

        // Llamada al endpoint de datos para gráficos
        try {
          console.log("Obteniendo datos de gráficos del backend...");
          const resCharts = await fetch(`/api/admin/dashboard/charts`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!resCharts.ok) {
            throw new Error(`Error al obtener datos de gráficos: ${resCharts.status}`);
          }

          const dataCharts = await resCharts.json();
          console.log("Datos de gráficos recibidos:", dataCharts);

          if (dataCharts && !dataCharts.error) {
            // Procesar datos de reservas por instalación
            const reservationsByFacility = Array.isArray(dataCharts.reservationsByFacility)
              ? dataCharts.reservationsByFacility
              : [];

            // Procesar datos de ingresos mensuales
            const incomeByMonth = Array.isArray(dataCharts.incomeByMonth)
              ? dataCharts.incomeByMonth.map((item: any) => ({
                  name: item.mes || item.name,
                  value: typeof item.valor === 'number' ? item.valor : (item.value || 0)
                }))
              : [];

            // Procesar datos de ingresos por instalación
            const incomeByFacility = Array.isArray(dataCharts.incomeByFacility)
              ? dataCharts.incomeByFacility
              : [];

            // Procesar datos de reservas por día
            const reservationsByDay = Array.isArray(dataCharts.reservationsByDay)
              ? dataCharts.reservationsByDay.map((item: any) => ({
                  name: item.dia || item.name,
                  value: typeof item.cantidad === 'number' ? item.cantidad : (item.value || 0)
                }))
              : [];

            // Procesar datos de uso por hora
            const usageByHour = Array.isArray(dataCharts.usageByHour)
              ? dataCharts.usageByHour.map((item: any) => ({
                  name: item.hora || item.name,
                  value: typeof item.cantidad === 'number' ? item.cantidad : (item.value || 0)
                }))
              : [];

            // Procesar datos de reservas por estado
            const reservationsByStatus = Array.isArray(dataCharts.reservationsByStatus)
              ? dataCharts.reservationsByStatus.map((item: any) => ({
                  // Capitalizar la primera letra del estado
                  name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : '',
                  value: typeof item.value === 'number' ? item.value : 0
                }))
              : [];

            // Procesar datos de observaciones por instalación
            const observacionesPorInstalacion = Array.isArray(dataCharts.observacionesPorInstalacion)
              ? dataCharts.observacionesPorInstalacion.map((item: any) => ({
                  name: item.instalacion || item.name,
                  value: typeof item.cantidad === 'number' ? item.cantidad : (item.value || 0)
                }))
              : [];

            // Procesar datos de estado de mantenimientos
            const estadoMantenimientos = Array.isArray(dataCharts.estadoMantenimientos)
              ? dataCharts.estadoMantenimientos.map((item: any) => ({
                  name: item.estado || item.name,
                  value: typeof item.cantidad === 'number' ? item.cantidad : (item.value || 0)
                }))
              : [];

            // Actualizar el estado con los datos procesados (sin usar datos de ejemplo)
            setChartData({
              reservationsByFacility: reservationsByFacility,
              incomeByMonth: incomeByMonth,
              incomeByFacility: incomeByFacility,
              reservationsByDay: reservationsByDay,
              usageByHour: usageByHour,
              reservationsByStatus: reservationsByStatus,
              observacionesPorInstalacion: observacionesPorInstalacion,
              estadoMantenimientos: estadoMantenimientos,
            });

            console.log("Datos de gráficos procesados y actualizados");
          } else {
            console.error("Error en los datos de gráficos:", dataCharts.error);
            // Usar datos vacíos en caso de error
            setChartData({
              reservationsByFacility: [],
              incomeByMonth: [],
              incomeByFacility: [],
              reservationsByDay: [],
              usageByHour: [],
              reservationsByStatus: [],
              observacionesPorInstalacion: [],
              estadoMantenimientos: [],
            });
          }
        } catch (chartError) {
          console.error("Error al cargar datos de gráficos:", chartError);
          // Usar datos vacíos en caso de error
          setChartData({
            reservationsByFacility: [],
            incomeByMonth: [],
            incomeByFacility: [],
            reservationsByDay: [],
            usageByHour: [],
            reservationsByStatus: [],
            observacionesPorInstalacion: [],
            estadoMantenimientos: [],
          });
        }

        // Ya no usamos datos de demostración
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      }

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">        <StatCard
          title="Total de Reservas"
          value={stats.totalReservations}
          icon={<CalendarIcon className="h-4 w-4" />}
          change={stats.monthlyChanges?.totalReservations ? `${stats.monthlyChanges.totalReservations >= 0 ? '+' : ''}${stats.monthlyChanges.totalReservations}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.totalReservations ? stats.monthlyChanges.totalReservations >= 0 : undefined}
          description="Total acumulado"
        />
        <StatCard
          title="Reservas Activas"
          value={stats.activeReservations}
          icon={<Activity className="h-4 w-4" />}
          change={stats.monthlyChanges?.activeReservations ? `${stats.monthlyChanges.activeReservations >= 0 ? '+' : ''}${stats.monthlyChanges.activeReservations}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.activeReservations ? stats.monthlyChanges.activeReservations >= 0 : undefined}
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
          change={stats.monthlyChanges?.maintenanceAlerts ? `${stats.monthlyChanges.maintenanceAlerts >= 0 ? '+' : ''}${stats.monthlyChanges.maintenanceAlerts}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.maintenanceAlerts ? stats.monthlyChanges.maintenanceAlerts >= 0 : undefined}
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

      {/* Gráficos y Análisis */}
      <div className="space-y-6">
        <Tabs defaultValue="reservas" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
          </TabsList>

          {/* PESTAÑA DE RESERVAS */}
          <TabsContent value="reservas" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Top 5 Instalaciones Más Reservadas</CardTitle>
                   <CardDescription>Instalaciones con mayor número de reservas</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart
                      data={chartData.reservationsByFacility}
                      title="Reservas Totales"
                    />
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle>Estado de Reservas</CardTitle>
                   <CardDescription>Distribución por estado de reserva</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart
                      data={chartData.reservationsByStatus || [
                        { name: "Pendientes", value: Math.round(stats.totalReservations * 0.2) },
                        { name: "Confirmadas", value: Math.round(stats.totalReservations * 0.4) },
                        { name: "Completadas", value: Math.round(stats.totalReservations * 0.3) },
                        { name: "Canceladas", value: Math.round(stats.totalReservations * 0.1) }
                      ]}
                      title="Reservas por Estado"
                    />
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          {/* PESTAÑA DE INGRESOS */}
          <TabsContent value="ingresos" className="mt-6">
             <div className="grid grid-cols-1 gap-6">
               <Card className="w-full overflow-hidden">
                 <CardHeader className="bg-white">
                   <CardTitle>Top 5 Instalaciones con Más Ingresos</CardTitle>
                   <CardDescription>Ingresos estimados por instalación (último mes)</CardDescription>
                 </CardHeader>
                 <CardContent className="bg-white">
                    <BarChart
                      data={chartData.incomeByFacility}
                      title="Ingresos por Instalación (S/.)"
                    />
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          {/* PESTAÑA DE MANTENIMIENTO */}
          <TabsContent value="mantenimiento" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Observaciones por Instalación</CardTitle>
                   <CardDescription>Número de observaciones reportadas</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart
                      data={chartData.observacionesPorInstalacion || []}
                      title="Observaciones Reportadas"
                    />
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle>Estado de Mantenimientos</CardTitle>
                   <CardDescription>Distribución por estado de mantenimiento</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <BarChart
                      data={chartData.estadoMantenimientos || []}
                      title="Estado de Mantenimientos"
                    />
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
                {facilityStatus.length > 0 ? (
                  facilityStatus.map((facility: FacilityStatusData, index: number) => {
                    // Verificar que la instalación tenga datos válidos
                    if (!facility) return null;

                    return (
                      <tr key={`facility-${facility.id || index}`} className="border-b">
                        <td className="py-3 px-4">{facility.name || 'Instalación sin nombre'}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              facility.status === "disponible" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {facility.status === "disponible" ? "Disponible" : "En mantenimiento"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{typeof facility.reservations === 'number' ? facility.reservations : 0}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {facility.id && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/instalaciones/${facility.id}`}>Ver</Link>
                              </Button>
                            )}
                            {facility.id && !facility.maintenance && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/instalaciones/${facility.id}/mantenimiento`}>
                                  Mantenimiento
                                </Link>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No hay instalaciones disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}