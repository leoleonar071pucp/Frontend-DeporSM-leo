"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation" // Importar useRouter
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // Importar useAuth

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null) // Estado para mensajes de error
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter() // Inicializar useRouter
  const { login } = useAuth() // Obtener la función login del contexto
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    setError(null) // Limpiar errores previos
    setIsLoading(true)

    // --- Simulación de llamada a API ---
    // En una implementación real, aquí harías fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    console.log("Intentando iniciar sesión con:", { email, password })
    setTimeout(() => {
      // Simular éxito o fracaso
      // Simular admin si el correo es admin@example.com
      if (email === "admin@example.com" && password === "password") {
        console.log("Inicio de sesión simulado exitoso (ADMIN)")
        const simulatedUser = {
          id: "admin-001",
          nombre: "Administrador Principal",
          email: email,
          dni: "00000001",
          telefono: "911222333",
          direccion: "Oficina Central",
          role: 'admin' as const // Asignar rol admin
        };
        login(simulatedUser);
        router.push("/admin"); // Redirigir al dashboard de admin
      } else if (email === "coordinador@example.com" && password === "password") {
        console.log("Inicio de sesión simulado exitoso (COORDINADOR)")
        const simulatedUser = {
          id: "coord-001",
          nombre: "Coordinador Principal",
          email: email,
          dni: "00000002",
          telefono: "922333444",
          direccion: "Oficina de Coordinación",
          role: 'coordinador' as const
        };
        login(simulatedUser);
        router.push("/coordinador");
      } else if (email === "test@example.com" && password === "password") { // Mantener usuario vecino de prueba
        console.log("Inicio de sesión simulado exitoso")
        // Crear datos de usuario simulados (añadir DNI y teléfono)
        const simulatedUser = {
          id: "user-123",
          nombre: "Usuario Test Logueado",
          email: email,
          dni: "12345678", // DNI simulado para login
          telefono: "999888777",
          direccion: "Av. Ejemplo 123, San Miguel",
          role: 'vecino' as const // Asignar rol vecino por defecto
          // avatarUrl: "url-del-avatar.jpg"
        };
        login(simulatedUser); // Llamar a la función login del contexto
        router.push("/"); // Redirigir usando router
      } else {
        console.log("Inicio de sesión simulado fallido")
        setError("Credenciales inválidas. Inténtalo de nuevo.")
        setIsLoading(false)
      }
      // setIsLoading(false) // Esto se maneja dentro del if/else ahora
    }, 2000)
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
                  <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p> // Mostrar mensaje de error
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

