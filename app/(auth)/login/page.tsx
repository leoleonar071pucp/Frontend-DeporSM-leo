"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL, FRONTEND_URL } from "@/lib/config"

// Componente interno que usa searchParams
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deactivationMessage, setDeactivationMessage] = useState<string | null>(null)
  const [inactiveAccountError, setInactiveAccountError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"
  const { login, isAuthenticated, user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  // Redirigir si ya está autenticado
  // Check for deactivation message
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'account_deactivated') {
      setDeactivationMessage('Su cuenta ha sido desactivada. Por favor, contacte con la administración para obtener más información.')
    }
  }, [searchParams])

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      // Si ya está autenticado, redirigir según su rol
      if (user?.rol?.nombre) {
        switch (user.rol.nombre) {
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
            router.push("/") // Vecino o rol desconocido
            break
        }
      } else {
        // Si está autenticado pero no tiene rol definido
        router.push("/")
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router])
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInactiveAccountError(null)
    setIsLoading(true)
    try {
      console.log("Intentando iniciar sesión con:", email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Origin": FRONTEND_URL
        },
        credentials: "include", // Siempre incluir credenciales para enviar cookies
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en inicio de sesión:", response.status, errorText)
        
        // Depurar mensaje para detectar cualquier problema con usuarios inactivos
        console.log("Respuesta del servidor (texto completo):", errorText)
        console.log("¿Contiene 'inactiva'?", errorText.toLowerCase().includes("inactiva"))
        console.log("¿Contiene 'CUENTA_INACTIVA'?", errorText.includes("CUENTA_INACTIVA"))
        console.log("¿Contiene 'activo'?", errorText.toLowerCase().includes("activo"))
        console.log("¿El estado HTTP es 401?", response.status === 401)

        if (response.status === 401) {
          // Realizar una segunda verificación para determinar si el usuario existe pero está inactivo
          // Hacemos esto mediante una consulta adicional al servidor
          try {
            // Primera verificación: mensajes explícitos de cuenta inactiva
            const isInactiveAccount = 
              errorText.includes("CUENTA_INACTIVA:") || 
              errorText.toLowerCase().includes("desactivada") || 
              errorText.toLowerCase().includes("inactiva") || 
              errorText.toLowerCase().includes("inactivo") || 
              errorText.toLowerCase().includes("inactive") ||
              (errorText.toLowerCase().includes("activo") && !errorText.toLowerCase().includes("incorrecto"));
            
            console.log("¿Es cuenta inactiva según nuestros criterios iniciales?", isInactiveAccount);
            
            if (errorText.includes("CUENTA_INACTIVA:")) {
              // Extract the message after the prefix
              const message = errorText.replace("CUENTA_INACTIVA: ", "");
              setInactiveAccountError(message);
              console.log("Cuenta inactiva detectada (formato CUENTA_INACTIVA): ", message);
            } else if (isInactiveAccount) {
              const mensajeInactivo = "Su cuenta se encuentra inactiva. Por favor, contacte con la administración para obtener más información.";
              setInactiveAccountError(mensajeInactivo);
              console.log("Cuenta inactiva detectada por palabras clave: ", errorText);
            } else if (errorText.toLowerCase().includes("bad credentials") || 
                      errorText.toLowerCase().includes("credenciales incorrectas") || 
                      errorText.toLowerCase().includes("user is disabled")) {
              // Segunda verificación: verificamos si el usuario existe pero está inactivo
              // Esto ocurre cuando Spring Security transforma el error en "Bad credentials"
              console.log("Verificando si es un usuario inactivo con credenciales válidas...");
              
              // Verificamos si el email existe pero está inactivo
              const checkInactiveResponse = await fetch(`${API_BASE_URL}/auth/check-inactive?email=${encodeURIComponent(email)}`, {
                method: "GET",
                credentials: "include",
                headers: {
                  "Accept": "application/json",
                  "Origin": FRONTEND_URL
                }
              });
              
              const checkResult = await checkInactiveResponse.json();
              console.log("Respuesta de verificación de cuenta inactiva:", checkResult);
              
              if (checkResult.exists && !checkResult.active) {
                const mensajeInactivo = `Su cuenta de ${checkResult.userType || 'usuario'} se encuentra inactiva. Por favor, contacte con la administración para obtener más información.`;
                setInactiveAccountError(mensajeInactivo);
              } else {
                setError("Correo electrónico o contraseña incorrectos");
              }
            } else {
              setError("Correo electrónico o contraseña incorrectos");
            }
          } catch (verifyError) {
            console.error("Error al verificar estado de cuenta:", verifyError);
            setError("Correo electrónico o contraseña incorrectos");
          }
        } else {
          setError(errorText || "Error al iniciar sesión. Intente nuevamente.");
        }
        setIsLoading(false)
        return
      }

      const user = await response.json()
      console.log("Inicio de sesión exitoso. Rol:", user.rol?.nombre)
      login(user) // Guardar usuario en contexto



      // Redirigir según el rol o a la ruta de redirección si existe
      if (redirectPath && redirectPath !== "/login") {
        router.push(redirectPath)
      } else {
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
      }
    } catch (err) {
      console.error("Error de red:", err)
      setError("Error de conexión. Por favor, verifica tu conexión a internet.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo conectar con el servidor",
      })    } finally {
      setIsLoading(false);
    }
  };
    return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: 'url("/images/Fondo_SanMiguel.jpg")' }}>
      {/* Overlay for transparency - darker tone for better contrast */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-md w-full relative z-10">        <div className="mb-6">
          <Link href="/" className="text-white hover:text-gray-200 flex items-center gap-2 bg-black/40 hover:bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-200 border border-white/20">
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

                {deactivationMessage && (
                  <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">
                    <strong>Cuenta Desactivada:</strong> {deactivationMessage}
                  </p>
                )}

                {inactiveAccountError && (
                  <div className="text-sm text-red-700 bg-red-50 p-4 rounded-md border-2 border-red-400">
                    <strong className="text-base block mb-2">CUENTA INACTIVA</strong>
                    <p className="font-medium">{inactiveAccountError}</p>
                  </div>
                )}

                {error && !inactiveAccountError && (
                  <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>
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
        </Card>      </div>
    </div>
  );
}

// Componente de carga para el Suspense
function LoginLoading() {  return (    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: 'url("/images/Fondo_SanMiguel.jpg")' }}>
      {/* Overlay for transparency - darker tone for better contrast */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-md w-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-4 rounded-lg relative z-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-medium">Cargando...</p>      </div>
    </div>
  );
}

// Componente principal que exportamos
export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}


