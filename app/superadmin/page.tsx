"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Componente para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, change, isIncrease, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-gray-900/10 p-1.5 text-gray-900">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {change && (
        <div className="flex items-center mt-1">
          {isIncrease ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-xs ${isIncrease ? "text-green-500" : "text-red-500"}`}>{change}</span>
        </div>
      )}
    </CardContent>
  </Card>
)

// Componente para las alertas del sistema
const SystemAlert = ({ alert }) => {
  const getAlertIcon = (priority) => {
    switch (priority) {
      case "alta":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "media":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "baja":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case "resuelta":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center p-3 border-b last:border-0">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
        {getAlertIcon(alert.priority)}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{alert.title}</p>
            <p className="text-sm text-gray-500">{alert.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              className={`
              ${alert.priority === "alta" ? "bg-red-100 text-red-800" : ""}
              ${alert.priority === "media" ? "bg-yellow-100 text-yellow-800" : ""}
              ${alert.priority === "baja" ? "bg-blue-100 text-blue-800" : ""}
              ${alert.priority === "resuelta" ? "bg-green-100 text-green-800" : ""}
            `}
            >
              {alert.priority === "resuelta" ? "Resuelta" : `Prioridad ${alert.priority}`}
            </Badge>
            <span className="text-xs text-gray-500 mt-1">{alert.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para simular un gráfico de barras
const BarChartComponent = ({ data, title }) => (
  <div className="space-y-4">
    <h3 className="font-medium text-lg">{title}</h3>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-gray-900 h-2.5 rounded-full"
              style={{ width: `${(item.value / Math.max(...data.map((d) => d.value))) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function SuperadminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalReservations: 0,
    systemAlerts: 0,
    serverUptime: 0,
    databaseSize: 0,
  })
  const [systemAlerts, setSystemAlerts] = useState([])
  const [userStats, setUserStats] = useState([])
  const [recentLogins, setRecentLogins] = useState([])

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      // En un caso real, aquí se harían las llamadas a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalUsers: 1248,
        activeUsers: 856,
        totalReservations: 3542,
        systemAlerts: 3,
        serverUptime: 99.98,
        databaseSize: 2.4,
      })

      setSystemAlerts([
        {
          id: 1,
          title: "Error de conexión a la base de datos",
          description: "Se detectó un error temporal de conexión a la base de datos",
          priority: "alta",
          date: "Hace 2 horas",
        },
        {
          id: 2,
          title: "Uso elevado de CPU",
          description: "El servidor principal está experimentando un uso elevado de CPU",
          priority: "media",
          date: "Hace 5 horas",
        },
        {
          id: 3,
          title: "Actualización de seguridad pendiente",
          description: "Hay una actualización de seguridad pendiente para el sistema",
          priority: "baja",
          date: "Hace 1 día",
        },
        {
          id: 4,
          title: "Error de autenticación resuelto",
          description: "El problema con el servicio de autenticación ha sido resuelto",
          priority: "resuelta",
          date: "Hace 2 días",
        },
      ])

      setUserStats([
        { name: "Vecinos", value: 1050 },
        { name: "Coordinadores", value: 15 },
        { name: "Administradores", value: 8 },
      ])

      setRecentLogins([
        {
          id: 1,
          user: "admin@munisanmiguel.gob.pe",
          role: "Administrador",
          date: "05/04/2025, 09:15",
          ip: "192.168.1.1",
        },
        {
          id: 2,
          user: "coord@munisanmiguel.gob.pe",
          role: "Coordinador",
          date: "05/04/2025, 08:30",
          ip: "192.168.1.2",
        },
        {
          id: 3,
          user: "superadmin@munisanmiguel.gob.pe",
          role: "Superadmin",
          date: "05/04/2025, 08:00",
          ip: "192.168.1.3",
        },
        { id: 4, user: "vecino@example.com", role: "Vecino", date: "05/04/2025, 07:45", ip: "192.168.1.4" },
        {
          id: 5,
          user: "admin2@munisanmiguel.gob.pe",
          role: "Administrador",
          date: "04/04/2025, 18:20",
          ip: "192.168.1.5",
        },
      ])

      setIsLoading(false)
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard de Superadministrador</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control del sistema DeporSM.</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
          change="+12% desde el mes pasado"
          isIncrease={true}
          description="Usuarios registrados en el sistema"
        />
        <StatCard
          title="Usuarios Activos"
          value={stats.activeUsers}
          icon={<Activity className="h-4 w-4" />}
          change="+5% desde la semana pasada"
          isIncrease={true}
          description="Usuarios que han iniciado sesión en los últimos 30 días"
        />
        <StatCard
          title="Total de Reservas"
          value={stats.totalReservations}
          icon={<CheckCircle className="h-4 w-4" />}
          change="+8% desde el mes pasado"
          isIncrease={true}
          description="Reservas realizadas en el sistema"
        />
        <StatCard
          title="Alertas del Sistema"
          value={stats.systemAlerts}
          icon={<AlertTriangle className="h-4 w-4" />}
          change="-2 desde la semana pasada"
          isIncrease={false}
          description="Alertas activas que requieren atención"
        />
        <StatCard
          title="Uptime del Servidor"
          value={`${stats.serverUptime}%`}
          icon={<Server className="h-4 w-4" />}
          description="Disponibilidad del servidor en los últimos 30 días"
        />
        <StatCard
          title="Tamaño de la Base de Datos"
          value={`${stats.databaseSize} GB`}
          icon={<Database className="h-4 w-4" />}
          change="+0.2 GB desde el mes pasado"
          isIncrease={true}
          description="Espacio utilizado por la base de datos"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Alertas del sistema */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Alertas recientes que requieren atención</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/superadmin/monitoreo/alertas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {systemAlerts.map((alert) => (
                <SystemAlert key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución de usuarios */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <CardDescription>Usuarios registrados por tipo de rol</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={userStats} title="Usuarios por Rol" />
          </CardContent>
        </Card>
      </div>

      {/* Inicios de sesión recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inicios de Sesión Recientes</CardTitle>
            <CardDescription>Últimos accesos al sistema</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/superadmin/monitoreo/logs">Ver historial completo</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                  <th className="text-left py-3 px-4 font-medium">Dirección IP</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((login) => (
                  <tr key={login.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{login.user}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`
                      ${login.role === "Superadmin" ? "bg-purple-100 text-purple-800" : ""}
                      ${login.role === "Administrador" ? "bg-blue-100 text-blue-800" : ""}
                      ${login.role === "Coordinador" ? "bg-green-100 text-green-800" : ""}
                      ${login.role === "Vecino" ? "bg-gray-100 text-gray-800" : ""}
                    `}
                      >
                        {login.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{login.date}</td>
                    <td className="py-3 px-4">{login.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Estado del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>Resumen del estado actual de los componentes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Componente</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Uptime</th>
                  <th className="text-left py-3 px-4 font-medium">Última Actualización</th>
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Servidor Web</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </td>
                  <td className="py-3 px-4">99.98%</td>
                  <td className="py-3 px-4">05/04/2025, 08:00</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/superadmin/sistema/servidores">Ver detalles</Link>
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Base de Datos</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Operativa</Badge>
                  </td>
                  <td className="py-3 px-4">99.95%</td>
                  <td className="py-3 px-4">05/04/2025, 08:00</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/superadmin/sistema/configuracion">Ver detalles</Link>
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Servicio de Correo</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </td>
                  <td className="py-3 px-4">99.90%</td>
                  <td className="py-3 px-4">05/04/2025, 08:00</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/superadmin/sistema/servicios">Ver detalles</Link>
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Servicio de Autenticación</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Degradado</Badge>
                  </td>
                  <td className="py-3 px-4">98.50%</td>
                  <td className="py-3 px-4">05/04/2025, 08:00</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/superadmin/sistema/servicios">Ver detalles</Link>
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Servicio de Almacenamiento</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </td>
                  <td className="py-3 px-4">99.99%</td>
                  <td className="py-3 px-4">05/04/2025, 08:00</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/superadmin/sistema/servicios">Ver detalles</Link>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

