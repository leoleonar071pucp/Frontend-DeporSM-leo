"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react"

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSuccess(false)

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      return
    }

    setIsLoading(true)

    // --- Simulación de envío de solicitud ---
    console.log("Simulando envío de solicitud para:", email)
    setTimeout(() => {
      // Simular éxito o fracaso (ej. si el correo existe en la BD)
      if (email === "test@example.com" || email === "usuario@registrado.com") { // Correos simulados que existen
        console.log("Solicitud simulada enviada con éxito.")
        setIsSuccess(true)
      } else {
        console.log("Correo no encontrado (simulado).")
        setError("No se encontró una cuenta asociada a este correo electrónico.")
      }
      setIsLoading(false)
    }, 1500)
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
            <CardTitle>Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico asociado a tu cuenta. Si existe, enviaremos una solicitud al administrador para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-medium text-green-800 mb-2">Solicitud Enviada</h3>
                <p className="text-sm text-green-700">
                  Hemos enviado una solicitud al administrador. Se te notificará cuando tu contraseña haya sido restablecida.
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
                    <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
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
                    El administrador revisará tu solicitud y podría contactarte o restablecer tu contraseña directamente.
                </p>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}