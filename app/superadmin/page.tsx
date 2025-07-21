"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Shield,

} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteTitle } from "@/components/site-title"
import { CircularChart } from "@/app/admin/components/charts/CircularChart"

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





export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    adminUsers: 0,
    coordUsers: 0,
    vecinoUsers: 0,
    securityIssues: 0,
  })


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
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Distribución de usuarios */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <CardDescription>Usuarios registrados por tipo de rol</CardDescription>
          </CardHeader>
          <CardContent>            <CircularChart
              data={[
                { name: "Administradores", value: stats.adminUsers, color: "#8b5cf6" },
                { name: "Coordinadores", value: stats.coordUsers, color: "#10b981" },
                { name: "Vecinos", value: stats.vecinoUsers, color: "#3b82f6" }
              ].filter(item => item.value > 0)}
              title="Distribución por Rol"
              height={340}
            />
          </CardContent>
        </Card>

        {/* Estado del Sistema */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Actividad y rendimiento general</CardDescription>
          </CardHeader>
          <CardContent>            <CircularChart
              data={[
                { name: "Usuarios Activos", value: Math.round(stats.totalUsers * 0.8), color: "#10b981" },
                { name: "Usuarios Inactivos", value: Math.round(stats.totalUsers * 0.2), color: "#f59e0b" }
              ].filter(item => item.value > 0)}
              title="Actividad de Usuarios"
              height={340}
            />
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

