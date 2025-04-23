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

// Datos de ejemplo para los administradores (simula la base de datos)
const administradoresData = [
  {
    id: 1,
    nombre: "Francisco",
    apellidos: "Morales",
    email: "francisco.morales@munisanmiguel.gob.pe",
    telefono: "987-123-456",
    direccion: "Av. La Marina 1500, San Miguel",
    area: "Deportes",
    status: "activo",
  },
  {
    id: 2,
    nombre: "Carmen",
    apellidos: "Vega",
    email: "carmen.vega@munisanmiguel.gob.pe",
    telefono: "987-123-457",
    direccion: "Jr. Las Flores 250, San Miguel",
    area: "Recreación",
    status: "activo",
  },
  {
    id: 3,
    nombre: "Manuel",
    apellidos: "Torres",
    email: "manuel.torres@munisanmiguel.gob.pe",
    telefono: "987-123-458",
    direccion: "Calle Los Pinos 456, San Miguel",
    area: "Infraestructura",
    status: "inactivo",
  }
]

// Definición del tipo para los errores del formulario
interface FormErrors {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

export default function EditarAdministradorPage({ params }: { params: { id: string } }) {
  const id = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [changePassword, setChangePassword] = useState(false)

  useEffect(() => {
    // Simulando la obtención de datos del servidor
    const fetchData = () => {
      setTimeout(() => {
        const numericId = parseInt(id, 10)
        const administrador = administradoresData.find(a => a.id === numericId)
        
        if (administrador) {
          setFormData({
            nombre: administrador.nombre,
            apellidos: administrador.apellidos,
            email: administrador.email,
            telefono: administrador.telefono,
            direccion: administrador.direccion,
            password: "",
            confirmPassword: "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se encontró el administrador solicitado",
            variant: "destructive"
          })
          router.push("/superadmin/usuarios/administradores")
        }
        
        setIsLoading(false)
      }, 800)
    }

    fetchData()
  }, [id, router, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario modifica el campo
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = () => {
    const errors: FormErrors = {}
    
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
    }
    
    if (!formData.apellidos.trim()) {
      errors.apellidos = "Los apellidos son obligatorios"
    }
    
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El formato de correo electrónico no es válido"
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
    }
    
    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es obligatoria"
    }
    
    // Validar contraseña solo si se ha marcado la opción de cambiar contraseña
    if (changePassword) {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria"
      } else if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }
    
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    
    // Simulación de envío al servidor
    setTimeout(() => {
      setIsSubmitting(false)
      
      const successMessage = changePassword 
        ? `Los datos y la contraseña de ${formData.nombre} ${formData.apellidos} han sido actualizados.`
        : `Los datos de ${formData.nombre} ${formData.apellidos} han sido actualizados.`
      
      toast({
        title: "Administrador actualizado",
        description: successMessage,
      })
      
      router.push("/superadmin/usuarios/administradores")
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando información del administrador...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Editar Administrador</h1>
          <p className="text-muted-foreground">Modifica la información del administrador</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/usuarios/administradores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza la información personal del administrador</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {formErrors.nombre && <p className="text-sm text-red-500">{formErrors.nombre}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                />
                {formErrors.apellidos && <p className="text-sm text-red-500">{formErrors.apellidos}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@munisanmiguel.gob.pe"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="987-654-321"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                {formErrors.telefono && <p className="text-sm text-red-500">{formErrors.telefono}</p>}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Av. Principal 123, San Miguel"
                  value={formData.direccion}
                  onChange={handleChange}
                />
                {formErrors.direccion && <p className="text-sm text-red-500">{formErrors.direccion}</p>}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="changePassword"
                  className="h-4 w-4 rounded border-gray-300 text-[#0cb7f2] focus:ring-[#0cb7f2]"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
                <Label htmlFor="changePassword" className="text-base font-medium">
                  Cambiar contraseña
                </Label>
              </div>
              
              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}