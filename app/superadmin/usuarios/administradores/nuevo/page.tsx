"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, User, Mail, Phone, Building, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NuevoAdministradorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    permissions: {
      manageInstallations: true,
      manageReservations: true,
      manageCoordinators: true,
      viewReports: true,
      manageSettings: false,
    },
  })

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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para crear el administrador
    console.log("Creando administrador:", formData)

    // Redirigir a la lista de administradores
    router.push("/superadmin/usuarios/administradores")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Administrador</h1>
          <p className="text-muted-foreground">Crea un nuevo usuario con rol de administrador</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/usuarios/administradores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Ingresa la información personal del nuevo administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    required
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
                    required
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
                    required
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permisos y Accesos</CardTitle>
              <CardDescription>Configura los permisos que tendrá el administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageInstallations"
                    checked={formData.permissions.manageInstallations}
                    onCheckedChange={() => handlePermissionChange("manageInstallations")}
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
                  />
                  <Label htmlFor="manageSettings" className="font-normal">
                    Gestionar Configuración
                  </Label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-[#0cb7f2]" />
                    <h3 className="text-lg font-medium">Credenciales Iniciales</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Se enviará un correo electrónico al nuevo administrador con instrucciones para establecer su
                    contraseña.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/superadmin/usuarios/administradores")}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#0cb7f2] hover:bg-[#53d4ff]">
            Crear Administrador
          </Button>
        </div>
      </form>
    </div>
  )
}

