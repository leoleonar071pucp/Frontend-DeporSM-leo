"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Importar useRouter aunque no se use directamente ahora, es útil para futuras redirecciones
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Check, X, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // Importar useAuth
import { API_BASE_URL } from "@/lib/config"
import { getSecurityConfig } from "@/lib/api-security"

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
  const [direccion, setDireccion] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [securityConfig, setSecurityConfig] = useState<any>(null)
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    specialChar: false,
    number: false,
    uppercase: false
  })

  useEffect(() => {
    getSecurityConfig().then(setSecurityConfig).catch(() => setSecurityConfig(null))
  }, [])

  useEffect(() => {
    // Revalidar contraseña cuando cambia la configuración de seguridad
    if (securityConfig) {
      validatePassword(password)
    }
  }, [securityConfig])

  useEffect(() => {
    // Validar contraseña inicial para mostrar los requisitos
    validatePassword(password)
  }, [password, securityConfig])

  const handleVerifyDNI = async (e: React.FormEvent) => {
    e.preventDefault()

    if (dni.trim() === "" || !/^\d{8}$/.test(dni.trim())) {
      setError("Por favor, ingresa un DNI válido de 8 dígitos.")
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      console.log("Verificando DNI con RENIEC:", dni)

      // Llamar al endpoint de verificación con RENIEC
      const response = await fetch(`${API_BASE_URL}/usuarios/verify-dni-reniec?dni=${dni}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log("Respuesta de RENIEC:", data)

      if (response.ok && data.success) {
        // Verificación exitosa con RENIEC
        console.log("Verificación DNI exitosa con RENIEC:", data.nombreCompleto)
        setNombre(data.nombreCompleto)
        setStep("registration")
      } else {
        // Error en la verificación
        const errorMessage = data.error || "Error al verificar el DNI con RENIEC"
        console.log("Error en verificación DNI:", errorMessage)
        setError(errorMessage)
      }

    } catch (error) {
      console.error("Error al verificar DNI:", error)
      setError("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // --- Validaciones ---
    if (!email || !telefono || !direccion || !password) {
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

    // Validar todas las reglas de contraseña
    const validations = validatePassword(password)
    const isPasswordValid = Object.values(validations).every(valid => valid)
    
    if (!isPasswordValid) {
      setError("Por favor, corrija los requisitos de contraseña señalados abajo.")
      return
    }
    // --- Fin Validaciones ---
    setIsLoading(true)

    try {
      // Preparar los datos para el registro
      // Dividir el nombre completo en nombre y apellidos (2 primeras palabras para nombre, resto para apellidos)
      const nombreCompleto = nombre.split(' ');
      const nombreParts = nombreCompleto.slice(0, 2);
      const apellidosParts = nombreCompleto.slice(2);

      const userData = {
        nombre: nombreParts.join(' '), // 2 primeras palabras como nombre
        apellidos: apellidosParts.join(' '), // Resto como apellidos
        email: email,
        telefono: telefono,
        direccion: direccion, // Usar la dirección ingresada por el usuario
        dni: dni,
        password: password,
        rol: {
          id: 4, // ID del rol vecino
          nombre: "vecino"
        },
        activo: true
      }

      console.log("Enviando datos de registro:", userData)

      // Realizar la petición al backend
      const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      // Procesar la respuesta
      if (response.ok) {
        const data = await response.json()
        console.log("Registro exitoso:", data)

        // Nota: Ya no necesitamos crear un objeto de usuario aquí
        // porque vamos a usar el login real con el backend

        // Iniciar sesión automáticamente usando el endpoint de login
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // Importante para mantener la sesión
            body: JSON.stringify({
              email: data.email,
              password: password
            })
          });

          if (loginResponse.ok) {
            const userData = await loginResponse.json();
            // Actualizar el contexto de autenticación
            login(userData);
            console.log("Inicio de sesión automático exitoso");
          } else {
            console.error("Error en inicio de sesión automático:", await loginResponse.text());
            // Aún así continuamos al paso de éxito
          }
        } catch (loginError) {
          console.error("Error al intentar iniciar sesión automáticamente:", loginError);
          // Continuamos al paso de éxito aunque falle el login
        }

        // Mostrar pantalla de éxito
        setStep("success")
      } else {
        // Manejar errores de la API
        const errorData = await response.text()
        console.error("Error en el registro:", errorData)

        // Mensajes de error específicos
        if (errorData.includes("El correo ya está registrado")) {
          setError("Este correo electrónico ya está registrado. Por favor, utiliza otro correo o intenta recuperar tu contraseña.")
        } else if (errorData.includes("El DNI ya está registrado")) {
          setError("Este DNI ya está registrado en el sistema. Si eres tú, por favor intenta iniciar sesión o recuperar tu contraseña.")
        } else {
          setError(errorData || "Error al registrar usuario. Por favor, inténtalo de nuevo.")
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      setError("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para validar contraseña en tiempo real
  const validatePassword = (pwd: string) => {
    const validations = {
      length: securityConfig ? pwd.length >= securityConfig.minPasswordLength : pwd.length >= 6,
      specialChar: securityConfig?.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(pwd) : true,
      number: securityConfig?.requireNumbers ? /\d/.test(pwd) : true,
      uppercase: securityConfig?.requireUppercase ? /[A-Z]/.test(pwd) : true
    }
    setPasswordValidations(validations)
    return validations
  }

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
                    <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
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
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="Ingresa tu dirección completa"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea una contraseña (mín. 6 caracteres)"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          validatePassword(e.target.value)
                        }}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Indicadores de validación de contraseña - Mostrar siempre */}
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Requisitos de contraseña:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {passwordValidations.length ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${passwordValidations.length ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                          Al menos {securityConfig?.minPasswordLength || 6} caracteres
                        </span>
                      </div>
                      
                      {securityConfig?.requireSpecialChars && (
                        <div className="flex items-center gap-2">
                          {passwordValidations.specialChar ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordValidations.specialChar ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                            Al menos un carácter especial
                          </span>
                        </div>
                      )}
                      
                      {securityConfig?.requireNumbers && (
                        <div className="flex items-center gap-2">
                          {passwordValidations.number ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordValidations.number ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                            Al menos un número
                          </span>
                        </div>
                      )}
                      
                      {securityConfig?.requireUppercase && (
                        <div className="flex items-center gap-2">
                          {passwordValidations.uppercase ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordValidations.uppercase ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                            Al menos una letra mayúscula
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && step === "registration" && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
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
        )}      </div>
    </div>
  );
}
