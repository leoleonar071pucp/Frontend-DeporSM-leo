"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/config"

export default function CambiarContrasenaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es obligatoria"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es obligatoria"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la nueva contraseña"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          passwordActual: formData.currentPassword,
          passwordNueva: formData.newPassword,
          confirmacionPassword: formData.confirmPassword
        })
      });

      if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
        });
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        // El backend devuelve el mensaje de error en el body
        throw new Error(typeof errorData === 'string' ? errorData :
          (errorData.message || "Error al cambiar la contraseña"));
      }

      setIsSuccess(true)

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      })

      // Resetear formulario
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Redireccionar a la página de perfil después de 2 segundos
      setTimeout(() => {
        setIsSuccess(false)
        router.push('/superadmin/perfil')
      }, 2000)
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar la contraseña",
      });
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cambiar Contraseña</h1>
        <p className="text-muted-foreground">Actualiza tu contraseña de acceso al sistema</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Por seguridad, cambia tu contraseña periódicamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Contraseña actual
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Nueva contraseña
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            {isSuccess && (
              <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Contraseña actualizada correctamente</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

