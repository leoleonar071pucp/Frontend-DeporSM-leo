"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormData {
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

interface ReadOnlyData {
  email: string;
  dni: string;
}

interface FormErrors {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
}

export default function EditarVecinoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    activo: true
  })
  const [readOnlyData, setReadOnlyData] = useState<ReadOnlyData>({
    email: "",
    dni: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Cargar datos del vecino
  useEffect(() => {
    const loadVecinoData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/allVecinos`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al cargar los datos del vecino')
        }

        const vecinos = await response.json()
        const vecinoData = vecinos.find((v: any) => v.id === parseInt(params.id))
        
        if (!vecinoData) {
          throw new Error('Vecino no encontrado')
        }

        // Separar datos editables y no editables
        setFormData({
          nombre: vecinoData.nombre.split(' ')[0] || "",
          apellidos: vecinoData.nombre.split(' ').slice(1).join(' ') || "",
          telefono: vecinoData.telefono || "",
          direccion: vecinoData.direccion || "",
          activo: vecinoData.activo || false
        })
        
        setReadOnlyData({
          email: vecinoData.email || "",
          dni: vecinoData.dni || ""
        })
      } catch (error) {
        console.error('Error:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudieron cargar los datos del vecino",
          variant: "destructive",
        })
        router.push("/superadmin/usuarios/vecinos")
      } finally {
        setIsLoading(false)
      }
    }

    loadVecinoData()
  }, [params.id, router, toast])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos"
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${params.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          email: readOnlyData.email,
          dni: readOnlyData.dni
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error al actualizar el vecino')
      }

      toast({
        title: "Vecino actualizado",
        description: `El vecino ${formData.nombre} ${formData.apellidos} ha sido actualizado exitosamente.`
      })

      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/superadmin/usuarios/vecinos")
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el vecino. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Editar Vecino</h1>
          <p className="text-muted-foreground">
            Actualiza la información del vecino
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/usuarios/vecinos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Solo los campos habilitados pueden ser modificados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre"
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="Apellidos"
                  className={errors.apellidos ? "border-red-500" : ""}
                />
                {errors.apellidos && (
                  <p className="text-sm text-red-500">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DNI (No editable)</Label>
                <Input
                  value={readOnlyData.dni}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-muted-foreground">El DNI no se puede modificar</p>
              </div>

              <div className="space-y-2">
                <Label>Email (No editable)</Label>
                <Input
                  value={readOnlyData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-muted-foreground">El email no se puede modificar</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="123456789"
                  className={errors.telefono ? "border-red-500" : ""}
                />
                {errors.telefono && (
                  <p className="text-sm text-red-500">{errors.telefono}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle Example 123"
                  className={errors.direccion ? "border-red-500" : ""}
                />
                {errors.direccion && (
                  <p className="text-sm text-red-500">{errors.direccion}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
              <div>
                <Label htmlFor="activo" className="font-medium">Estado de la cuenta</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.activo 
                    ? "La cuenta está activa y el vecino puede hacer reservas" 
                    : "La cuenta está desactivada y el vecino no puede hacer reservas"}
                </p>
              </div>
              <Switch 
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#0cb7f2] hover:bg-[#53d4ff]"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}