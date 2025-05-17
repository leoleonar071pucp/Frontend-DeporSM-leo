"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation" // Importar useRouter aunque no se use directamente ahora, es útil para futuras redirecciones
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // Importar useAuth

export default function Registro() {
  const [step, setStep] = useState<"verification" | "registration" | "success">("verification")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter() // Inicializar aunque no se use inmediatamente
  const { login } = useAuth() // Obtener la función login del contexto

  // Estados para los datos del formulario
  const [dni, setDni] = useState("")
  const [nombre, setNombre] = useState("") // Para almacenar el nombre (potencialmente de RENIEC)
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const handleVerifyDNI = (e: React.FormEvent) => {
    e.preventDefault()

    if (dni.trim() === "" || !/^\d{8}$/.test(dni.trim())) {
      setError("Por favor, ingresa un DNI válido de 8 dígitos.")
      return
    }
    setError(null)
    setIsLoading(true)

    // --- Simulación de llamada a API RENIEC ---
    console.log("Verificando DNI:", dni)
    setTimeout(() => {
      // Simular éxito o error de servicio
      if (dni === "11111111") { // Simular error del servicio RENIEC
         console.log("Verificación DNI simulada: Error de servicio")
         setError("Hubo un problema al verificar el DNI con RENIEC. Inténtalo más tarde.")
      } else { // Cualquier otro DNI válido (8 dígitos) simula éxito
        console.log("Verificación DNI simulada exitosa (sin restricción de vecino)")
        // Podríamos intentar obtener un nombre simulado o dejarlo vacío
        // Para mantener consistencia, usamos el nombre simulado si es el DNI 'bueno'
        const simulatedName = dni === "12345678" ? "Juan Pérez García (Simulado)" : "Usuario Verificado";
        setNombre(simulatedName)
        setStep("registration")
      }
      setIsLoading(false);
    }, 2000)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()

    setError(null) // Limpiar errores previos

    // --- Validaciones ---
    if (!email || !telefono || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos requeridos.")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      return
    }
     if (!/^\d{9}$/.test(telefono)) {
      setError("Por favor, ingresa un número de teléfono válido de 9 dígitos.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) { // Ejemplo de validación de longitud mínima
        setError("La contraseña debe tener al menos 6 caracteres.")
        return
    }
    // --- Fin Validaciones ---


    setIsLoading(true)

    // --- Simulación de llamada a API de Registro ---
    const registrationData = { dni, nombre, email, telefono, password }
    console.log("Intentando registrar con:", registrationData)
    setTimeout(() => {
        // Simular éxito (en una app real, esto dependería de la respuesta de la API)
        console.log("Registro simulado exitoso")
        // Crear datos de usuario simulados para el login inmediato
        const simulatedUser = {
          id: `user-${dni}`, // Usar DNI para un ID único simulado
          nombre: nombre,
          email: email,
          dni: dni, // Incluir DNI del formulario
          telefono: telefono,
          direccion: "Av. Registrada 456, San Miguel",
          role: 'vecino' as const // Asignar rol vecino por defecto al registrarse
          // avatarUrl: "url-del-avatar.jpg"
        };
        login(simulatedUser); // Llamar a login para establecer la sesión
        setStep("success"); // Avanzar al paso de éxito
        // No es necesario limpiar isLoading aquí porque el componente cambia
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

        {step === "verification" && (
          <Card>
            <CardHeader>
              <CardTitle>Registro de Vecino</CardTitle>
              <CardDescription>
                Para registrarte, primero debemos verificar tu identidad como vecino de San Miguel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyDNI}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input
                      id="dni"
                      placeholder="Ingresa tu DNI"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      required
                    />
                  </div>
                  {error && step === "verification" && (
                     <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                  )}
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar DNI"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">Tu DNI será verificado con la base de datos de RENIEC.</p>
            </CardFooter>
          </Card>
        )}

        {step === "registration" && (
          <Card>
            <CardHeader>
              <CardTitle>Completa tu Registro</CardTitle>
              <CardDescription>
                Hemos verificado tu identidad. Ahora completa tus datos para finalizar el registro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      placeholder="Ingresa tu nombre completo"
                      value={nombre} // Usar estado
                      disabled // Mantener deshabilitado si viene de RENIEC
                      readOnly // Mejor que disabled para copiar texto si es necesario
                    />
                    <p className="text-xs text-gray-500">Datos obtenidos de RENIEC</p>
                  </div>

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
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel" // Usar type="tel"
                      placeholder="Ingresa tu teléfono"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      maxLength={9}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Crea una contraseña (mín. 6 caracteres)"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {error && step === "registration" && (
                     <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                  )}
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Completar Registro"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500 text-center w-full">
                Al registrarte, aceptas nuestros{" "}
                <Link href="/terminos" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                y{" "}
                <Link href="/privacidad" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardHeader>
              <div className="mx-auto mb-4 bg-primary-light rounded-full p-3 w-16 h-16 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-center">¡Registro Exitoso!</CardTitle>
              <CardDescription className="text-center">Tu cuenta ha sido creada correctamente.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6">
                Ahora puedes acceder a todas las funcionalidades de la plataforma de reservas deportivas de San Miguel.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary-light">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

