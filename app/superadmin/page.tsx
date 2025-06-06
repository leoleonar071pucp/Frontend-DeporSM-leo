"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Server,
  CheckCircle,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  User,
  Lock,
  Shield,
  Eye,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SiteTitle } from "@/components/site-title"

// Definición de interfaces para tipos
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: string;
  isIncrease?: boolean;
  description: string;
}

interface ChartItem {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartItem[];
  title: string;
}

interface UserActivityItem {
  id: number;
  user: string;
  action: string;
  userType: string;
  date: string;
  type: "login" | "action";
}

interface UserActivityProps {
  activity: UserActivityItem;
}

interface MonthlyChanges {
  totalUsers: number;
  adminUsers: number;
  coordUsers: number;
  vecinoUsers: number;
}

interface StatsData {
  totalUsers: number;
  adminUsers: number;
  coordUsers: number;
  vecinoUsers: number;
  securityIssues: number;
  monthlyChanges?: MonthlyChanges;
}

// Componente para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, change, isIncrease, description }: StatCardProps) => (
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

// Componente para simular un gráfico de barras
const BarChartComponent = ({ data, title }: BarChartProps) => (
  <div className="space-y-4">
    <h3 className="font-medium text-lg">{title}</h3>
    <div className="space-y-2">
      {data.map((item: ChartItem, index: number) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-gray-900 h-2.5 rounded-full"
              style={{ width: `${(item.value / Math.max(...data.map((d: ChartItem) => d.value))) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Componente para la actividad reciente de usuarios
const UserActivity = ({ activity }: UserActivityProps) => {
  return (
    <div className="flex items-center p-3 border-b last:border-0">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
        {activity.type === "login" ? (
          <Eye className="h-5 w-5 text-blue-500" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{activity.user}</p>
            <p className="text-sm text-gray-500">{activity.action}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              className={activity.userType === "Administrador" ? "bg-[#def7ff] text-[#0cb7f2]" :
                activity.userType === "Coordinador" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"}
            >
              {activity.userType}
            </Badge>
            <span className="text-xs text-gray-500 mt-1">{activity.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    adminUsers: 0,
    coordUsers: 0,
    vecinoUsers: 0,
    securityIssues: 0,
  })
  const [userStats, setUserStats] = useState<ChartItem[]>([])
  const [recentActivity, setRecentActivity] = useState<UserActivityItem[]>([])
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }

        const data = await response.json();

        // Update stats
        setStats({
          totalUsers: data.totalUsers,
          adminUsers: data.adminUsers,
          coordUsers: data.coordUsers,
          vecinoUsers: data.vecinoUsers,
          securityIssues: 0,
          monthlyChanges: data.monthlyChanges,
        });

        // Update user stats for the chart
        if (data.userDistribution) {
          const userStatsData = Object.entries(data.userDistribution).map(([name, value]) => ({
            name,
            value: value as number,
          }));
          setUserStats(userStatsData);
        }

        // Update recent activity
        if (data.recentActivity) {
          setRecentActivity(data.recentActivity);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard de Superadministrador</h1>
        <p className="text-muted-foreground text-lg">Bienvenido al panel de control del sistema <SiteTitle inline />.</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
          change={stats.monthlyChanges !== undefined ? `${stats.monthlyChanges.totalUsers >= 0 ? '+' : ''}${stats.monthlyChanges.totalUsers}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.totalUsers >= 0}
          description="Usuarios registrados en el sistema"
        />
        <StatCard
          title="Administradores"
          value={stats.adminUsers}
          icon={<Shield className="h-4 w-4" />}
          change={stats.monthlyChanges !== undefined ? `${stats.monthlyChanges.adminUsers >= 0 ? '+' : ''}${stats.monthlyChanges.adminUsers}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.adminUsers >= 0}
          description="Administradores activos en el sistema"
        />
        <StatCard
          title="Coordinadores"
          value={stats.coordUsers}
          icon={<User className="h-4 w-4" />}
          change={stats.monthlyChanges !== undefined ? `${stats.monthlyChanges.coordUsers >= 0 ? '+' : ''}${stats.monthlyChanges.coordUsers}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.coordUsers >= 0}
          description="Coordinadores activos en el sistema"
        />
        <StatCard
          title="Vecinos"
          value={stats.vecinoUsers}
          icon={<Users className="h-4 w-4" />}
          change={stats.monthlyChanges?.vecinoUsers ? `${stats.monthlyChanges.vecinoUsers >= 0 ? '+' : ''}${stats.monthlyChanges.vecinoUsers}% desde el mes pasado` : ''}
          isIncrease={stats.monthlyChanges?.vecinoUsers >= 0}
          description="Vecinos registrados en el sistema"
        />
      </div>

      {/* Contenido principal - Reorganizado para la presentación */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Distribución de usuarios */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <CardDescription>Usuarios registrados por tipo de rol</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={userStats} title="Usuarios por Rol" />
          </CardContent>
        </Card>

        {/* Gestión de Usuarios */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administra los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/usuarios/administradores">
                <Shield className="h-4 w-4 mr-2" />
                Administradores
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/usuarios/coordinadores">
                <User className="h-4 w-4 mr-2" />
                Coordinadores
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/usuarios/vecinos">
                <Users className="h-4 w-4 mr-2" />
                Vecinos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secciones comentadas para la presentación
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/superadmin/monitoreo/actividad-usuarios">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {recentActivity.map((activity) => (
                <UserActivity key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoreo del Sistema</CardTitle>
            <CardDescription>Supervisa la actividad del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/monitoreo/actividad-usuarios">
                <Activity className="h-4 w-4 mr-2" />
                Actividad de Usuarios
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configura los parámetros del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/sistema/configuracion">
                <Settings className="h-4 w-4 mr-2" />
                Configuración General
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/sistema/seguridad">
                <Lock className="h-4 w-4 mr-2" />
                Seguridad
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/superadmin/perfil">
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  )
}

