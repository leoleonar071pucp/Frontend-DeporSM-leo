"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, RefreshCw, UserX, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SeguridadPage() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiration: true,
    passwordExpirationDays: "90",
    minPasswordLength: "8",
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    sessionTimeout: "60",
    ipRestriction: false,
    allowedIPs: "",
  })

  const handleSwitchChange = (setting, checked) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: checked }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log("Guardando configuración de seguridad:", securitySettings)
  }

  // Datos de ejemplo para intentos de inicio de sesión fallidos
  const failedLoginAttempts = [
    {
      id: 1,
      user: "usuario@example.com",
      ip: "192.168.1.10",
      date: "05/04/2025, 10:15",
      attempts: 3,
      status: "bloqueado",
    },
    {
      id: 2,
      user: "admin@example.com",
      ip: "192.168.1.11",
      date: "05/04/2025, 09:30",
      attempts: 5,
      status: "bloqueado",
    },
    {
      id: 3,
      user: "coordinador@example.com",
      ip: "192.168.1.12",
      date: "04/04/2025, 16:45",
      attempts: 2,
      status: "activo",
    },
    {
      id: 4,
      user: "vecino@example.com",
      ip: "192.168.1.13",
      date: "04/04/2025, 14:20",
      attempts: 4,
      status: "bloqueado",
    },
  ]

  // Datos de ejemplo para actividad sospechosa
  const suspiciousActivity = [
    {
      id: 1,
      type: "Múltiples inicios de sesión",
      details: "5 inicios desde diferentes ubicaciones",
      date: "05/04/2025, 11:30",
      severity: "alta",
    },
    {
      id: 2,
      type: "Intento de acceso a área restringida",
      details: "Intento de acceso a configuración del sistema",
      date: "05/04/2025, 10:45",
      severity: "media",
    },
    {
      id: 3,
      type: "Cambio de contraseña frecuente",
      details: "3 cambios en las últimas 24 horas",
      date: "04/04/2025, 15:20",
      severity: "baja",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seguridad del Sistema</h1>
        <p className="text-muted-foreground">Configura los parámetros de seguridad del sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-[#bceeff]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            General
          </TabsTrigger>
          <TabsTrigger value="password" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            Contraseñas
          </TabsTrigger>
          <TabsTrigger value="session" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            Monitoreo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General de Seguridad</CardTitle>
              <CardDescription>Configura los parámetros generales de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSwitchChange("twoFactorAuth", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipRestriction">Restricción de IP</Label>
                    <p className="text-sm text-muted-foreground">Limita el acceso a direcciones IP específicas</p>
                  </div>
                  <Switch
                    id="ipRestriction"
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => handleSwitchChange("ipRestriction", checked)}
                  />
                </div>

                {securitySettings.ipRestriction && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="allowedIPs">IPs permitidas</Label>
                    <Input
                      id="allowedIPs"
                      name="allowedIPs"
                      placeholder="192.168.1.1, 192.168.1.2"
                      value={securitySettings.allowedIPs}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">Ingresa las direcciones IP separadas por comas</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Intentos máximos de inicio de sesión</Label>
                  <Select
                    value={securitySettings.maxLoginAttempts}
                    onValueChange={(value) => handleSelectChange("maxLoginAttempts", value)}
                  >
                    <SelectTrigger id="maxLoginAttempts">
                      <SelectValue placeholder="Selecciona el número de intentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 intentos</SelectItem>
                      <SelectItem value="5">5 intentos</SelectItem>
                      <SelectItem value="10">10 intentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Número de intentos fallidos antes de bloquear la cuenta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Duración del bloqueo (minutos)</Label>
                  <Select
                    value={securitySettings.lockoutDuration}
                    onValueChange={(value) => handleSelectChange("lockoutDuration", value)}
                  >
                    <SelectTrigger id="lockoutDuration">
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tiempo que permanecerá bloqueada la cuenta después de múltiples intentos fallidos
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveSettings}>
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Política de Contraseñas</CardTitle>
              <CardDescription>
                Configura los requisitos y políticas para las contraseñas de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordExpiration">Expiración de contraseñas</Label>
                    <p className="text-sm text-muted-foreground">
                      Requiere que los usuarios cambien su contraseña periódicamente
                    </p>
                  </div>
                  <Switch
                    id="passwordExpiration"
                    checked={securitySettings.passwordExpiration}
                    onCheckedChange={(checked) => handleSwitchChange("passwordExpiration", checked)}
                  />
                </div>

                {securitySettings.passwordExpiration && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="passwordExpirationDays">Días hasta la expiración</Label>
                    <Select
                      value={securitySettings.passwordExpirationDays}
                      onValueChange={(value) => handleSelectChange("passwordExpirationDays", value)}
                    >
                      <SelectTrigger id="passwordExpirationDays">
                        <SelectValue placeholder="Selecciona los días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                        <SelectItem value="180">180 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minPasswordLength">Longitud mínima de contraseña</Label>
                  <Select
                    value={securitySettings.minPasswordLength}
                    onValueChange={(value) => handleSelectChange("minPasswordLength", value)}
                  >
                    <SelectTrigger id="minPasswordLength">
                      <SelectValue placeholder="Selecciona la longitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 caracteres</SelectItem>
                      <SelectItem value="8">8 caracteres</SelectItem>
                      <SelectItem value="10">10 caracteres</SelectItem>
                      <SelectItem value="12">12 caracteres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Requisitos de complejidad</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireSpecialChars"
                        checked={securitySettings.requireSpecialChars}
                        onCheckedChange={(checked) => handleSwitchChange("requireSpecialChars", checked)}
                      />
                      <Label htmlFor="requireSpecialChars" className="font-normal">
                        Requerir caracteres especiales
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireNumbers"
                        checked={securitySettings.requireNumbers}
                        onCheckedChange={(checked) => handleSwitchChange("requireNumbers", checked)}
                      />
                      <Label htmlFor="requireNumbers" className="font-normal">
                        Requerir números
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireUppercase"
                        checked={securitySettings.requireUppercase}
                        onCheckedChange={(checked) => handleSwitchChange("requireUppercase", checked)}
                      />
                      <Label htmlFor="requireUppercase" className="font-normal">
                        Requerir mayúsculas
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveSettings}>
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Sesiones</CardTitle>
              <CardDescription>Configura los parámetros relacionados con las sesiones de usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de inactividad (minutos)</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) => handleSelectChange("sessionTimeout", value)}
                  >
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue placeholder="Selecciona el tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tiempo de inactividad antes de cerrar la sesión automáticamente
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Sesiones Activas</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Inicio</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>admin@munisanmiguel.gob.pe</TableCell>
                          <TableCell>Administrador</TableCell>
                          <TableCell>192.168.1.1</TableCell>
                          <TableCell>05/04/2025, 09:15</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Cerrar Sesión
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>coord@munisanmiguel.gob.pe</TableCell>
                          <TableCell>Coordinador</TableCell>
                          <TableCell>192.168.1.2</TableCell>
                          <TableCell>05/04/2025, 08:30</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Cerrar Sesión
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>vecino@example.com</TableCell>
                          <TableCell>Vecino</TableCell>
                          <TableCell>192.168.1.4</TableCell>
                          <TableCell>05/04/2025, 07:45</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Cerrar Sesión
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">Cerrar Todas las Sesiones</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveSettings}>
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Intentos de Inicio de Sesión Fallidos</CardTitle>
                <CardDescription>Usuarios con múltiples intentos fallidos de inicio de sesión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Intentos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {failedLoginAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell>{attempt.user}</TableCell>
                          <TableCell>{attempt.ip}</TableCell>
                          <TableCell>{attempt.attempts}</TableCell>
                          <TableCell>
                            {attempt.status === "bloqueado" ? (
                              <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {attempt.status === "bloqueado" ? (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Desbloquear
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <UserX className="h-4 w-4 mr-1" />
                                Bloquear
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Sospechosa</CardTitle>
                <CardDescription>Actividades potencialmente maliciosas detectadas en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suspiciousActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                      <div className="mt-0.5">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            activity.severity === "alta"
                              ? "text-red-500"
                              : activity.severity === "media"
                                ? "text-yellow-500"
                                : "text-blue-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{activity.type}</p>
                          <Badge
                            className={`ml-2 ${
                              activity.severity === "alta"
                                ? "bg-red-100 text-red-800"
                                : activity.severity === "media"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {activity.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Informe Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

