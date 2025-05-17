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
import { Separator } from "@/components/ui/separator"

interface FormData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni: string;
  direccion: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  password?: string;
  confirmPassword?: string;
}

export default function EditarVecinoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { id } = params
  const [changePassword, setChangePassword] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    dni: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Cargar datos del vecino
  useEffect(() => {
    const fetchVecinoData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData({
            nombre: data.nombre || "",
            apellidos: data.apellidos || "",
            email: data.email || "",
            telefono: data.telefono || "",
            dni: data.dni || "",
            direccion: data.direccion || "",
            password: "",
            confirmPassword: "",
          })
        } else {
          throw new Error("Error al cargar los datos del vecino")
        }
      } catch (error) {
        console.error("Error fetching vecino:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del vecino",
          variant: "destructive",
        })
        router.push("/superadmin/usuarios/vecinos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVecinoData()
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido"
    }
    if (!formData.apellidos.trim()) {
      errors.apellidos = "Los apellidos son requeridos"
    }
    if (!formData.email.trim()) {
      errors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El email no es válido"
    }
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es requerido"
    }
    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es requerida"
    }
    if (!formData.dni.trim()) {
      errors.dni = "El DNI es requerido"
    } else if (!/^\d{8}$/.test(formData.dni)) {
      errors.dni = "El DNI debe tener 8 dígitos"
    }

    if (changePassword) {
      if (formData.password && formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast({
        title: "Error de validación",
        description: "Por favor, revise los campos del formulario",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const userData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        dni: formData.dni,
        direccion: formData.direccion,
        ...(changePassword && formData.password && { password: formData.password }),
        rol: 4 // Rol de vecino
      }

      const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast({
          title: "Vecino actualizado",
          description: `${formData.nombre} ${formData.apellidos} ha sido actualizado exitosamente.`,
        })
        router.push("/superadmin/usuarios/vecinos")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el vecino")
      }
    } catch (error) {
      console.error("Error al actualizar vecino:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el vecino",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando información del vecino...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/superadmin/usuarios/vecinos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Vecino</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Datos del Vecino</CardTitle>
            <CardDescription>
              Modifique los datos del vecino según sea necesario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos Personales</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre"
                  />
                  {formErrors.nombre && (
                    <p className="text-sm text-red-500">{formErrors.nombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Ingrese los apellidos"
                  />
                  {formErrors.apellidos && (
                    <p className="text-sm text-red-500">{formErrors.apellidos}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="Ingrese el DNI"
                    maxLength={8}
                  />
                  {formErrors.dni && (
                    <p className="text-sm text-red-500">{formErrors.dni}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ingrese el teléfono"
                  />
                  {formErrors.telefono && (
                    <p className="text-sm text-red-500">{formErrors.telefono}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingrese el email"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ingrese la dirección"
                  />
                  {formErrors.direccion && (
                    <p className="text-sm text-red-500">{formErrors.direccion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Datos de acceso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="changePassword">Cambiar contraseña</Label>
              </div>
              
              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingrese la nueva contraseña"
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500">{formErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirme la nueva contraseña"
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/superadmin/usuarios/vecinos">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              className="bg-[#0cb7f2] hover:bg-[#53d4ff]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}