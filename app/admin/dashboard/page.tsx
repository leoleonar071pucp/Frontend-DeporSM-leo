"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConfiguracion } from "@/context/ConfiguracionContext"
import { AdminConfigWidget } from "@/components/admin-config-widget"
import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { MetadataGenerator } from "@/components/metadata-generator"
import { Loader2, BarChart3, Users, Calendar, Settings, Activity } from "lucide-react"

export default function AdminDashboardPage() {
  const { config, recargarConfig } = useConfiguracion()
  const configSistema = useConfiguracionSistema()
  
  // Al cargar la página, refrescar la config para asegurarnos de tener los datos actualizados
  useEffect(() => {
    recargarConfig()
  }, [recargarConfig])
  
  if (config.isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 p-8 pt-6">
      <MetadataGenerator title="Panel de Administración" />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Reservas</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% respecto al mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +12 nuevos esta semana
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas Reservadas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+1,234</div>
                <p className="text-xs text-muted-foreground">
                  +573 horas este mes
                </p>
              </CardContent>
            </Card>
            
            <AdminConfigWidget />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Reservas Recientes</CardTitle>
                <CardDescription>Las últimas reservas realizadas en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí iría una tabla o lista de reservas recientes */}
                <p className="text-muted-foreground">Cargando datos de reservas recientes...</p>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Resumen de Instalaciones</CardTitle>
                <CardDescription>Uso de instalaciones en el último mes</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí iría un gráfico de barras o similar */}
                <p className="text-muted-foreground">Cargando estadísticas de instalaciones...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Reservas</CardTitle>
              <CardDescription>
                Administra todas las reservas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aquí se mostrará una tabla completa con todas las reservas y opciones para filtrar y buscar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aquí se mostrará una tabla con todos los usuarios registrados y opciones para gestionar sus cuentas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Administra las opciones generales del sistema de reservas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Nombre del Sistema:</p>
                      <p className="text-xl font-bold mt-1">{configSistema.getNombreSitio()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email de Contacto:</p>
                      <p className="text-xl font-bold mt-1">{configSistema.getEmailContacto()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Modo Mantenimiento:</p>
                      <p className={`text-xl font-bold mt-1 ${configSistema.modoMantenimiento ? 'text-amber-600' : 'text-green-600'}`}>
                        {configSistema.modoMantenimiento ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reservas:</p>
                      <p className={`text-xl font-bold mt-1 ${configSistema.reservasEstanHabilitadas() ? 'text-green-600' : 'text-red-600'}`}>
                        {configSistema.reservasEstanHabilitadas() ? 'Habilitadas' : 'Deshabilitadas'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Acciones comunes de configuración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href="/superadmin/sistema/configuracion"
                  className="block w-full py-2 px-3 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
                >
                  Editar Configuración del Sistema
                </a>
                
                <a 
                  href="/superadmin/instalaciones"
                  className="block w-full py-2 px-3 bg-gray-100 text-gray-900 rounded-md text-center hover:bg-gray-200 transition-colors mt-2"
                >
                  Gestionar Instalaciones
                </a>
                
                <a 
                  href="/superadmin/usuarios"
                  className="block w-full py-2 px-3 bg-gray-100 text-gray-900 rounded-md text-center hover:bg-gray-200 transition-colors mt-2"
                >
                  Gestionar Usuarios
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
