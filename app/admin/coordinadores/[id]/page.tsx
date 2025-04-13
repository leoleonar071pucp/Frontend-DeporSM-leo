"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  { id: 1, name: "Cancha de Fútbol (Grass)", location: "Parque Juan Pablo II" },
  { id: 2, name: "Piscina Municipal", location: "Complejo Deportivo Municipal" },
  { id: 3, name: "Gimnasio Municipal", location: "Complejo Deportivo Municipal" },
  { id: 4, name: "Pista de Atletismo", location: "Complejo Deportivo Municipal" },
  { id: 5, name: "Cancha de Tenis", location: "Parque Juan Pablo II" },
  { id: 6, name: "Cancha de Básquetbol", location: "Parque Juan Pablo II" },
  { id: 7, name: "Cancha de Voleibol", location: "Complejo Deportivo Municipal" },
  { id: 8, name: "Sala de Artes Marciales", location: "Gimnasio Municipal" },
]

// Datos de ejemplo para los coordinadores
const coordinatorsData = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "987-654-321",
    assignedFacilities: [1, 2],
    status: "activo",
    lastLogin: "05/04/2025, 09:15",
  },
  {
    id: 2,
    name: "María López",
    email: "maria.lopez@example.com",
    phone: "987-654-322",
    assignedFacilities: [3, 4],
    status: "activo",
    lastLogin: "04/04/2025, 14:30",
  },
  {
    id: 3,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "987-654-323",
    assignedFacilities: [5],
    status: "inactivo",
    lastLogin: "01/04/2025, 10:45",
  },
]

export default function EditarCoordinadorPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [coordinator, setCoordinator] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "activo",
  })
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const foundCoordinator = coordinatorsData.find((c) => c.id === Number.parseInt(params.id))

      if (foundCoordinator) {
        setCoordinator(foundCoordinator)
        setFormData({
          name: foundCoordinator.name,
          email: foundCoordinator.email,
          phone: foundCoordinator.phone || "",
          status: foundCoordinator.status,
        })
        setSelectedFacilities(foundCoordinator.assignedFacilities)
      }

      setIsLoading(false)
    }

    loadData()
  }, [params.id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId],
    )
  }

  const handleStatusChange = (checked) => {
    setFormData((prev) => ({ ...prev, status: checked ? "activo" : "inactivo" }))
  }

  const filteredFacilities = facilitiesData.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación básica
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para actualizar el coordinador
    console.log("Actualizando coordinador:", { ...formData, facilities: selectedFacilities })

    toast({
      title: "Coordinador actualizado",
      description: "El coordinador ha sido actualizado exitosamente.",
    })

    // Redireccionar a la lista de coordinadores
    // router.push("/admin/coordinadores")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!coordinator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/coordinadores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Coordinador no encontrado</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Coordinador no encontrado</h3>
            <p className="text-gray-500 mt-2">El coordinador que estás buscando no existe.</p>
            <Button className="mt-6 bg-primary hover:bg-primary-light" asChild>
              <Link href="/admin/coordinadores">Ver todos los coordinadores</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/coordinadores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Editar Coordinador</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza los datos del coordinador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nombre completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nombre completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Correo electrónico <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="987-654-321"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="status" checked={formData.status === "activo"} onCheckedChange={handleStatusChange} />
                      <Label htmlFor="status">{formData.status === "activo" ? "Activo" : "Inactivo"}</Label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Cambiar contraseña</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nueva contraseña</Label>
                      <Input id="password" name="password" type="password" placeholder="********" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="********" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Deja estos campos en blanco si no deseas cambiar la contraseña.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Instalaciones Asignadas</CardTitle>
                <CardDescription>Selecciona las instalaciones que supervisará este coordinador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar instalación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                  {filteredFacilities.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFacilities.map((facility) => (
                        <div key={facility.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`facility-${facility.id}`}
                            checked={selectedFacilities.includes(facility.id)}
                            onCheckedChange={() => toggleFacility(facility.id)}
                          />
                          <Label htmlFor={`facility-${facility.id}`} className="flex-1 cursor-pointer text-sm">
                            {facility.name}
                            <span className="block text-xs text-gray-500">{facility.location}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No se encontraron instalaciones</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Instalaciones seleccionadas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacilities.length > 0 ? (
                      selectedFacilities.map((facilityId) => {
                        const facility = facilitiesData.find((f) => f.id === facilityId)
                        return (
                          <Badge key={facilityId} variant="secondary" className="flex items-center gap-1">
                            {facility?.name}
                            <button
                              type="button"
                              onClick={() => toggleFacility(facilityId)}
                              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Eliminar</span>
                            </button>
                          </Badge>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500">Ninguna instalación seleccionada</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/coordinadores">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-light">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

