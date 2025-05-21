"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

// Componente que utiliza useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validar el token cuando se carga la página
  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      setError("Token no proporcionado. Por favor, solicita un nuevo enlace de restablecimiento.")
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (response.ok && data.valid) {
          setIsTokenValid(true)
        } else {
          setError("El enlace de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo.")
        }
      } catch (error) {
        console.error("Error al validar token:", error)
        setError("Error al validar el enlace de restablecimiento. Por favor, inténtalo de nuevo.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    setError(null)

    if (!formData.newPassword.trim()) {
      setError("Por favor, ingresa una nueva contraseña.")
      return false
    }

    if (formData.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Limpiar el formulario
        setFormData({
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
      setError("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <Link href="/login" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver a Iniciar Sesión
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restablecer Contraseña</CardTitle>
            <CardDescription>
              {isValidating
                ? "Validando enlace de restablecimiento..."
                : isTokenValid
                ? "Ingresa tu nueva contraseña para restablecer tu cuenta."
                : "El enlace de restablecimiento no es válido."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isValidating ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isSuccess ? (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-medium text-green-800 mb-2">Contraseña Restablecida</h3>
                <p className="text-sm text-green-700">
                  Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Button
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => router.push("/login")}
                >
                  Ir a Iniciar Sesión
                </Button>
              </div>
            ) : isTokenValid ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="flex items-center gap-1">
                      <Lock className="h-4 w-4 text-primary" /> Nueva contraseña
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Ingresa tu nueva contraseña"
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-1">
                      <Lock className="h-4 w-4 text-primary" /> Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirma tu nueva contraseña"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Restableciendo contraseña...
                      </>
                    ) : (
                      "Restablecer Contraseña"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-medium text-red-800 mb-2">Enlace Inválido</h3>
                <p className="text-sm text-red-700">
                  {error || "El enlace de restablecimiento es inválido o ha expirado."}
                </p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary-light"
                  onClick={() => router.push("/recuperar-contrasena")}
                >
                  Solicitar Nuevo Enlace
                </Button>
              </div>
            )}
          </CardContent>
          {!isValidating && !isSuccess && isTokenValid && (
            <CardFooter>
              <p className="text-xs text-gray-500 text-center w-full">
                Asegúrate de elegir una contraseña segura que no hayas utilizado antes.
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

// Componente de carga para el Suspense
function LoadingResetPassword() {
  return (
    <div className="min-h-screen bg-primary-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Restablecer Contraseña</CardTitle>
            <CardDescription>Cargando...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente principal que envuelve el formulario en un Suspense
export default function ResetearContrasena() {
  return (
    <Suspense fallback={<LoadingResetPassword />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
