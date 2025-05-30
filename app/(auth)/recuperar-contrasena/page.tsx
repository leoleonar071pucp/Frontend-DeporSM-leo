"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSuccess(false)

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Solicitud de restablecimiento enviada con éxito.")
        setIsSuccess(true)
      } else {
        console.error("Error al solicitar restablecimiento:", data.error)

        // Mensajes de error más amigables para el usuario
        if (data.error && data.error.includes("Error al enviar el correo de restablecimiento")) {
          setError("No se pudo enviar el correo de recuperación. Por favor, inténtalo más tarde o contacta al administrador.")
        } else {
          setError(data.error || "Error al procesar la solicitud. Por favor, inténtalo de nuevo.")
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      setError("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")

      // Mostrar información adicional en la consola para depuración
      if (error instanceof Error) {
        console.error("Detalles del error:", error.message)
        console.error("Stack trace:", error.stack)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative" 
         style={{ backgroundImage: 'url("https://www.ciudaris.com/blog/wp-content/uploads/destacado-vivir-en-san-miguel.jpg")' }}>
      {/* Overlay for transparency - whitish translucent tone */}
      <div className="absolute inset-0 bg-white/30"></div>
      <div className="max-w-md w-full relative z-10">
        <div className="mb-6">
          <Link href="/login" className="text-gray-800 hover:underline flex items-center gap-1 bg-gray-200/70 px-3 py-1 rounded backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico asociado a tu cuenta. Te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-medium text-green-800 mb-2">Correo Enviado</h3>
                <p className="text-sm text-green-700">
                  Hemos enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para crear una nueva contraseña.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                       <Mail className="h-4 w-4 text-primary" /> Correo electrónico
                    </Label>
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
                        Enviando solicitud...
                      </>
                    ) : (
                      "Enviar Solicitud de Restablecimiento"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          {!isSuccess && (
             <CardFooter>
                <p className="text-xs text-gray-500 text-center w-full">
                    Si no recibes el correo en unos minutos, revisa tu carpeta de spam o verifica que el correo ingresado sea correcto.
                </p>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}