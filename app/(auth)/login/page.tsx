"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL, AUTH_CONFIG } from "@/lib/config"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      console.log("Intentando iniciar sesión con:", email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: AUTH_CONFIG.INCLUDE_CREDENTIALS ? "include" : "same-origin", // Importante para recibir y enviar cookies
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en inicio de sesión:", response.status, errorText)
        
        if (response.status === 401) {
          setError("Correo electrónico o contraseña incorrectos")
        } else {
          setError(errorText || "Error al iniciar sesión. Intente nuevamente.")
        }
        setIsLoading(false)
        return
      }

      const user = await response.json()
      console.log("Inicio de sesión exitoso. Rol:", user.rol?.nombre)
      login(user) // Guardar usuario en contexto

      toast({
        title: "¡Bienvenido/a!",
        description: `Has iniciado sesión como ${user.nombre}`,
      })

      // Redirigir según el rol
      switch (user.rol?.nombre) {
        case "superadmin":
          router.push("/superadmin")
          break
        case "admin":
          router.push("/admin")
          break
        case "coordinador":
          router.push("/coordinador")
          break
        default:
          router.push("/")
          break
      }
    } catch (err) {
      console.error("Error de red:", err)
      setError("Error de conexión. Por favor, verifica tu conexión a internet.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo conectar con el servidor",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/recuperar-contrasena" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


