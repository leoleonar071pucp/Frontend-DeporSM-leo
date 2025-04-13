"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Mail, Phone, Building, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para el administrador
const adminData = {
  id: 1,
  name: "Juan Pérez",
  email: "juan.perez@munisanmiguel.gob.pe",
  phone: "987-654-321",
  department: "deportes",
  status: "activo",
  lastLogin: "05/04/2025, 09:15",
  createdAt: "01/01/2025",
  permissions: {
    manageInstallations: true,
    manageReservations: true,
    manageCoordinators: true,
    viewReports: true,
    manageSettings: false,
  },
  activity: [
    { action: "Inicio de sesión", date: "05/04/2025, 09:15", ip: "192.168.1.1" },
    { action: "Actualización de instalación #12", date: "04/04/2025, 16:30", ip: "192.168.1.1" },
    { action: "Aprobación de reserva #45", date: "04/04/2025, 14:20", ip: "192.168.1.1" },
    { action: "Inicio de sesión", date: "04/04/2025, 09:00", ip: "192.168.1.1" },
    { action: "Creación de coordinador", date: "03/04/2025, 15:45", ip: "192.168.1.1" },
  ],
}

export default function DetalleAdministradorPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(adminData)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }))
  }

  const handleStatusChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "activo" : "inactivo",
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el administrador
    console.log("Actualizando administrador:", formData)
    setIsEditing(false)
  }

  const handleResetPassword = () => {
    // Aquí iría la lógica para resetear la contraseña
    console.log("Reseteando contraseña para el administrador:", id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalle de Administrador</h1>
          <p className="text-muted-foreground">Gestiona la información y permisos del administrador</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/usuarios/administradores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos básicos del administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt={formData.name} />
                  <AvatarFallback className="bg-[#0cb7f2] text-white text-xl">
                    {formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{formData.name}</h3>
                <Badge
                  className={formData.status === "activo" ? "bg-[#def7ff] text-[#0cb7f2]" : "bg-gray-100 text-gray-800"}
                >
                  {formData.status === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Teléfono:</span>
                  <span className="text-sm font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Departamento:</span>
                  <span className="text-sm font-medium capitalize">{formData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fecha de creación:</span>
                  <span className="text-sm font-medium">{formData.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Último acceso:</span>
                  <span className="text-sm font-medium">{formData.lastLogin}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={() => setIsEditing(true)}>
                Editar Información
              </Button>
              <Button variant="outline" className="w-full" onClick={handleResetPassword}>
                Resetear Contraseña
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="bg-[#bceeff]">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white"
              >
                Permisos
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
                Actividad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Datos personales y de contacto del administrador</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            id="name"
                            name="name"
                            placeholder="Nombre completo"
                            className="pl-8"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="correo@munisanmiguel.gob.pe"
                            className="pl-8"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="Número de teléfono"
                            className="pl-8"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <div className="relative">
                          <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="pl-8">
                              <SelectValue placeholder="Selecciona un departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deportes">Deportes</SelectItem>
                              <SelectItem value="cultura">Cultura</SelectItem>
                              <SelectItem value="administracion">Administración</SelectItem>
                              <SelectItem value="tecnologia">Tecnología</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="status"
                            checked={formData.status === "activo"}
                            onCheckedChange={handleStatusChange}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="status" className="font-normal">
                            {formData.status === "activo" ? "Activo" : "Inactivo"}
                          </Label>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-[#0cb7f2] hover:bg-[#53d4ff]">
                            Guardar Cambios
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos y Accesos</CardTitle>
                  <CardDescription>Configura los permisos que tiene el administrador</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageInstallations"
                            checked={formData.permissions.manageInstallations}
                            onCheckedChange={() => handlePermissionChange("manageInstallations")}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="manageInstallations" className="font-normal">
                            Gestionar Instalaciones
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageReservations"
                            checked={formData.permissions.manageReservations}
                            onCheckedChange={() => handlePermissionChange("manageReservations")}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="manageReservations" className="font-normal">
                            Gestionar Reservas
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageCoordinators"
                            checked={formData.permissions.manageCoordinators}
                            onCheckedChange={() => handlePermissionChange("manageCoordinators")}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="manageCoordinators" className="font-normal">
                            Gestionar Coordinadores
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="viewReports"
                            checked={formData.permissions.viewReports}
                            onCheckedChange={() => handlePermissionChange("viewReports")}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="viewReports" className="font-normal">
                            Ver Reportes y Estadísticas
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageSettings"
                            checked={formData.permissions.manageSettings}
                            onCheckedChange={() => handlePermissionChange("manageSettings")}
                            disabled={!isEditing}
                          />
                          <Label htmlFor="manageSettings" className="font-normal">
                            Gestionar Configuración
                          </Label>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-[#0cb7f2] hover:bg-[#53d4ff]">
                            Guardar Cambios
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Historial de acciones realizadas por el administrador</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.activity.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                        <div className="mt-0.5">
                          <Clock className="h-5 w-5 text-[#0cb7f2]" />
                        </div>
                        <div>
                          <p className="font-medium">{item.action}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{item.date}</span>
                            <span className="mx-2">•</span>
                            <span>IP: {item.ip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Ver Historial Completo
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

