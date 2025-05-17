"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react"

export default function Contacto() {
  const [formState, setFormState] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formState.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formState.email.trim()) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!formState.asunto) {
      newErrors.asunto = "El asunto es requerido"
    }

    if (!formState.mensaje.trim()) {
      newErrors.mensaje = "El mensaje es requerido"
    } else if (formState.mensaje.length < 10) {
      newErrors.mensaje = "El mensaje debe tener al menos 10 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({ ...prev, asunto: value }))

    // Limpiar error al editar
    if (errors.asunto) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.asunto
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulación de envío
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)

        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setFormState({
            nombre: "",
            email: "",
            telefono: "",
            asunto: "",
            mensaje: "",
          })
          setIsSuccess(false)
        }, 3000)
      }, 1500)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contacto</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envíanos un mensaje</CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">
                          Nombre completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          placeholder="Ingresa tu nombre completo"
                          value={formState.nombre}
                          onChange={handleChange}
                          className={errors.nombre ? "border-red-500" : ""}
                        />
                        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Correo electrónico <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Ingresa tu correo electrónico"
                          value={formState.email}
                          onChange={handleChange}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">
                          Teléfono <span className="text-gray-500 text-sm">(opcional)</span>
                        </Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          placeholder="Ingresa tu número de teléfono"
                          value={formState.telefono}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="asunto">
                          Asunto <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formState.asunto} onValueChange={handleSelectChange}>
                          <SelectTrigger id="asunto" className={errors.asunto ? "border-red-500" : ""}>
                            <SelectValue placeholder="Selecciona un asunto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consulta">Consulta general</SelectItem>
                            <SelectItem value="reserva">Problema con reserva</SelectItem>
                            <SelectItem value="instalacion">Información de instalación</SelectItem>
                            <SelectItem value="sugerencia">Sugerencia</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.asunto && <p className="text-red-500 text-sm">{errors.asunto}</p>}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="mensaje">
                        Mensaje <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="mensaje"
                        name="mensaje"
                        placeholder="Escribe tu mensaje aquí"
                        rows={5}
                        value={formState.mensaje}
                        onChange={handleChange}
                        className={errors.mensaje ? "border-red-500" : ""}
                      />
                      {errors.mensaje && <p className="text-red-500 text-sm">{errors.mensaje}</p>}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary-light"
                        disabled={isSubmitting || isSuccess}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            ¡Mensaje enviado!
                          </>
                        ) : (
                          "Enviar mensaje"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                  <CardDescription>Otras formas de contactarnos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-light rounded-full p-2 mt-1">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-gray-600">Av. Federico Gállese Nº 370</p>
                      <p className="text-gray-600">San Miguel, Lima</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary-light rounded-full p-2 mt-1">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <p className="text-gray-600">(01) 263-3392</p>
                      <p className="text-gray-600">Lunes a Viernes: 8:00 - 17:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary-light rounded-full p-2 mt-1">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Correo electrónico</h3>
                      <p className="text-gray-600">deportes@munisanmiguel.gob.pe</p>
                      <p className="text-gray-600">Tiempo de respuesta: 24-48 horas</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2">Horario de atención</h3>
                    <ul className="space-y-1 text-gray-600">
                      <li>
                        <strong>Lunes a Viernes:</strong> 8:00 - 17:00
                      </li>
                      <li>
                        <strong>Sábados:</strong> 9:00 - 13:00
                      </li>
                      <li>
                        <strong>Domingos y feriados:</strong> Cerrado
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.6540383027393!2d-77.08794492394823!3d-12.077731888074565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c96c8bf00001%3A0xfd0bc0b76b5ccc2e!2sMunicipalidad%20de%20San%20Miguel!5e0!3m2!1ses-419!2spe!4v1712018018641!5m2!1ses-419!2spe"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-md"
                    ></iframe>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

