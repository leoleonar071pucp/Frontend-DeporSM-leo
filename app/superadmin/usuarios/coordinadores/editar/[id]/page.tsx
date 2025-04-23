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

// Datos de ejemplo para los coordinadores (simula la base de datos)
const coordinadoresData = [
  {
    id: 1,
    nombre: "Roberto",
    apellidos: "Gómez",
    email: "roberto.gomez@munisanmiguel.gob.pe",
    telefono: "987-654-326",
    direccion: "Av. Los Patriotas 321, San Miguel",
    facilities: [1, 2],
    status: "activo",
  },
  {
    id: 2,
    nombre: "Claudia",
    apellidos: "Fuentes",
    email: "claudia.fuentes@munisanmiguel.gob.pe",
    telefono: "987-654-327",
    direccion: "Jr. Las Margaritas 456, San Miguel",
    facilities: [3, 4],
    status: "activo",
  },
  {
    id: 3,
    nombre: "Jorge",
    apellidos: "Ramírez",
    email: "jorge.ramirez@munisanmiguel.gob.pe",
    telefono: "987-654-328",
    direccion: "Calle Los Jazmines 789, San Miguel",
    facilities: [5],
    status: "inactivo",
  },
  {
    id: 4,
    nombre: "Patricia",
    apellidos: "Medina",
    email: "patricia.medina@munisanmiguel.gob.pe",
    telefono: "987-654-329",
    direccion: "Av. La Marina 1234, San Miguel",
    facilities: [6, 7],
    status: "activo",
  },
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

export default function EditarCoordinadorPage({ params }: { params: { id: string } }) {
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
        const coordinador = coordinadoresData.find(c => c.id === numericId)
        
        if (coordinador) {
          setFormData({
            nombre: coordinador.nombre,
            apellidos: coordinador.apellidos,
            email: coordinador.email,
            telefono: coordinador.telefono,
            direccion: coordinador.direccion,
            password: "",
            confirmPassword: "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se encontró el coordinador solicitado",
            variant: "destructive"
          })
          router.push("/superadmin/usuarios/coordinadores")
        }
        
        setIsLoading(false)
      }, 800)
    }

    fetchData()
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        title: "Coordinador actualizado",
        description: successMessage,
      })
      
      router.push("/superadmin/usuarios/coordinadores")
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando información del coordinador...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Editar Coordinador</h1>
          <p className="text-muted-foreground">Modifica la información del coordinador</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/usuarios/coordinadores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza la información personal del coordinador</CardDescription>
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