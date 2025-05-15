"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, CreditCard, Upload, User, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/context/NotificationContext" // Importar useNotification
import { useAuth } from "@/context/AuthContext" // Importar useAuth
import { Alert, AlertDescription } from "@/components/ui/alert"

// Datos de ejemplo para las instalaciones
const facilitiesDB = [
  {
    id: 1,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=200&width=300",
    price: "S/. 15.00",
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    image: "/placeholder.svg?height=200&width=300",
    price: "S/. 120.00",
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    image: "/placeholder.svg?height=200&width=300",
    price: "S/. 20.00",
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    image: "/placeholder.svg?height=200&width=300",
    price: "S/. 80.00",
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    image: "/placeholder.svg?height=200&width=300",
    price: "S/. 10.00",
  },
]

export default function ConfirmarReserva() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const facilityId = searchParams.get("id")
  const dateParam = searchParams.get("date")
  const timeParam = searchParams.get("time")

  const [paymentMethod, setPaymentMethod] = useState("online")
  const [voucherFile, setVoucherFile] = useState<File | null>(null)
  const [facility, setFacility] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    telefono: "",
    email: "",
    comentarios: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addNotification } = useNotification()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth() // Obtener datos de Auth

  const date = dateParam ? new Date(dateParam) : new Date()

  useEffect(() => {
    setLoading(true); // Iniciar carga

    // Verificar que todos los parámetros necesarios estén presentes
    if (!facilityId || !dateParam || !timeParam) {
      console.error("Error: Faltan parámetros necesarios para la confirmación de la reserva.");
      setFacility(null); // Establecer facility a null para indicar error
      setLoading(false); // Finalizar carga
      return; // Salir temprano
    }

    // Intentar parsear el ID de la instalación
    const parsedId = Number.parseInt(facilityId);
    if (isNaN(parsedId)) {
        console.error(`Error: ID de instalación inválido: ${facilityId}`);
        setFacility(null);
        setLoading(false);
        return;
    }

    // Simular carga y buscar la instalación
    // NOTA: En una aplicación real, aquí se haría una llamada a la API
    setTimeout(() => {
      const foundFacility = facilitiesDB.find((f) => f.id === parsedId);

      if (foundFacility) {
        setFacility(foundFacility);
      } else {
        console.error(`Error: Instalación con ID ${parsedId} no encontrada.`);
        setFacility(null); // Establecer facility a null si no se encuentra
      }
      setLoading(false); // Finalizar carga en ambos casos (encontrado o no)
    }, 500); // Simulación de retraso

  }, [facilityId, dateParam, timeParam]);

  // --- Protección de Ruta ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/reserva/confirmar'); // Redirigir si no está autenticado
    }
  }, [isAuthenticated, isAuthLoading, router]);

   // --- Prellenar formulario con datos del usuario ---
   useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || "",
        dni: user.dni || "", // Asumiendo que dni está en el contexto
        telefono: user.telefono || "", // Asumiendo que telefono está en el contexto
        email: user.email || ""
      }));
    }
  }, [user]); // Ejecutar cuando user cambie

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          voucher: "El archivo debe ser JPG, PNG o PDF",
        }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          voucher: "El archivo no debe superar los 5MB",
        }))
        return
      }

      setVoucherFile(file)

      // Limpiar error si existe
      if (errors.voucher) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.voucher
          return newErrors
        })
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Ya no validar campos prellenados (nombre, dni, telefono, email)
    // if (!formData.nombre.trim()) { ... }
    // if (!formData.dni.trim()) { ... }
    // if (!formData.telefono.trim()) { ... }
    // if (!formData.email.trim()) { ... }

    // Validar campos de pago según el método seleccionado
    if (paymentMethod === "online") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "El número de tarjeta es obligatorio"
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "El número de tarjeta debe tener 16 dígitos"
      }

      if (!formData.cardName.trim()) {
        newErrors.cardName = "El nombre en la tarjeta es obligatorio"
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "La fecha de expiración es obligatoria"
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = "Formato inválido (MM/AA)"
      } else {
        // Validar que la fecha no esté expirada
        const [month, year] = formData.cardExpiry.split("/").map(Number)
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear() % 100
        const currentMonth = currentDate.getMonth() + 1

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.cardExpiry = "La tarjeta ha expirado"
        }
      }

      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv = "El CVV es obligatorio"
      } else if (!/^\d{3,4}$/.test(formData.cardCvv)) {
        newErrors.cardCvv = "El CVV debe tener 3 o 4 dígitos"
      }
    } else if (paymentMethod === "deposito") {
      if (!voucherFile) {
        newErrors.voucher = "Debes subir un comprobante de pago"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (validateForm()) {
      // Mostrar un indicador de carga o procesamiento
      setIsSubmitting(true)

      // Simulación de procesamiento del formulario
      setTimeout(() => {
        let paymentSuccess = true;
        let status = 'pending'; // Default status

        // Simular fallo de pago online (ej. tarjeta específica)
        if (paymentMethod === 'online') {
          if (formData.cardNumber.endsWith('1234')) { // Simular fallo para tarjetas terminadas en 1234
            paymentSuccess = false;
            console.error("Simulación: Fallo en el pago online.");
            setErrors({ payment: "Hubo un problema al procesar tu pago. Verifica los datos de tu tarjeta o intenta con otro método." }); // Usar setErrors y una clave
          } else {
            status = 'success'; // Pago online exitoso
          }
        } else {
          status = 'pending'; // Depósito siempre queda pendiente
        }

        setIsSubmitting(false);

        if (paymentSuccess) {
          // Añadir notificación simulada solo si el pago fue exitoso o es depósito
          if (facility) {
              addNotification({
                  title: status === 'success' ? "Reserva Confirmada" : "Reserva Pendiente",
                  message: `Tu reserva para ${facility.name} (${timeParam} el ${format(date, "d/MM/yy")}) está ${status === 'success' ? 'confirmada' : 'pendiente de pago'}.`,
                  type: "reserva",
              });
          }
          // Generar un número de reserva simulado
          const reservationNumber = `RES-${Date.now().toString().slice(-6)}`;
          // Preparar parámetros para la URL
          const queryParams = new URLSearchParams({
              status: status,
              resNum: reservationNumber,
              facilityName: facility.name || "Instalación Desconocida",
              date: date.toISOString(), // Pasar fecha completa
              time: timeParam || "Horario Desconocido"
          });
          // Procesar el formulario y redirigir a la página de confirmación con los detalles
          console.log(`Redirigiendo a confirmación con estado: ${status} y detalles.`);
          router.push(`/reserva/confirmacion?${queryParams.toString()}`);
        }
        // Si paymentSuccess es false, no se redirige y se debería mostrar el error 'payment' en el formulario.

      }, 1500); // Aumentar un poco el delay para simular mejor
    }
  }

  // Añadir chequeo de carga de autenticación
  if (loading || isAuthLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información de la reserva...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!facility) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Instalación no encontrada</CardTitle>
              <CardDescription>La instalación que estás buscando no existe o ha sido eliminada.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-primary hover:bg-primary-light">
                <Link href="/instalaciones">Ver todas las instalaciones</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href={`/instalaciones/${facilityId}`} className="text-primary hover:underline">
              &larr; Volver a la instalación
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confirmar Reserva</CardTitle>
              <CardDescription>Completa los datos para finalizar tu reserva</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary-pale p-4 rounded-md">
                <h3 className="font-medium text-lg mb-2">Detalles de la Reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-light rounded-full p-2">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">{format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-light rounded-full p-2">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{timeParam}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-medium">{facility.name}</p>
                    <p className="text-primary font-bold">{facility.price}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <h3 className="font-medium text-lg mb-4">Datos del Solicitante</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">
                        Nombre completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        placeholder="Ingresa tu nombre completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={errors.nombre ? "border-red-500" : ""}
                        readOnly // Hacer campo de solo lectura
                      />
                      {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dni">
                        DNI <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dni"
                        name="dni"
                        placeholder="Ingresa tu DNI"
                        value={formData.dni}
                        onChange={handleInputChange}
                        className={errors.dni ? "border-red-500" : ""}
                        maxLength={8}
                        readOnly // Hacer campo de solo lectura
                      />
                      {errors.dni && <p className="text-red-500 text-sm">{errors.dni}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">
                        Teléfono <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        placeholder="Ingresa tu teléfono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className={errors.telefono ? "border-red-500" : ""}
                        maxLength={9}
                        readOnly // Hacer campo de solo lectura
                      />
                      {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-red-500" : ""}
                        readOnly // Hacer campo de solo lectura
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="comentarios">Comentarios adicionales (opcional)</Label>
                    <Textarea
                      id="comentarios"
                      name="comentarios"
                      placeholder="Ingresa cualquier información adicional que consideres relevante"
                      value={formData.comentarios}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Método de Pago</h3>
                  <Tabs defaultValue="online" onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="online">Pago en línea</TabsTrigger>
                      <TabsTrigger value="deposito">Depósito bancario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="online" className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">
                            Número de tarjeta <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              className={`pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              maxLength={19}
                            />
                          </div>
                          {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">
                            Nombre en la tarjeta <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              id="cardName"
                              name="cardName"
                              placeholder="NOMBRE APELLIDO"
                              className={`pl-10 ${errors.cardName ? "border-red-500" : ""}`}
                              value={formData.cardName}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.cardName && <p className="text-red-500 text-sm">{errors.cardName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">
                            Fecha de expiración <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cardExpiry"
                            name="cardExpiry"
                            placeholder="MM/AA"
                            className={errors.cardExpiry ? "border-red-500" : ""}
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            maxLength={5}
                          />
                          {errors.cardExpiry && <p className="text-red-500 text-sm">{errors.cardExpiry}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">
                            CVV <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cardCvv"
                            name="cardCvv"
                            placeholder="123"
                            className={errors.cardCvv ? "border-red-500" : ""}
                            value={formData.cardCvv}
                            onChange={handleInputChange}
                            maxLength={4}
                          />
                          {errors.cardCvv && <p className="text-red-500 text-sm">{errors.cardCvv}</p>}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="deposito" className="mt-4 space-y-4">
                      <div className="bg-primary-pale p-4 rounded-md">
                        <h4 className="font-medium mb-2">Instrucciones para el depósito</h4>
                        <p className="mb-2">Realiza el depósito o transferencia a la siguiente cuenta:</p>
                        <ul className="space-y-1 mb-4">
                          <li>
                            <strong>Banco:</strong> Banco de la Nación
                          </li>
                          <li>
                            <strong>Cuenta:</strong> 123-456789-012
                          </li>
                          <li>
                            <strong>Titular:</strong> Municipalidad de San Miguel
                          </li>
                          <li>
                            <strong>Monto:</strong> {facility.price}
                          </li>
                          <li>
                            <strong>Referencia:</strong> Reserva {facility.name}
                          </li>
                        </ul>
                        <p className="text-sm text-gray-600">
                          Una vez realizado el depósito, sube el comprobante de pago para que podamos validarlo.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="voucher">
                          Comprobante de pago <span className="text-red-500">*</span>
                        </Label>
                        <div
                          className={`border-2 border-dashed rounded-md p-6 text-center ${errors.voucher ? "border-red-500" : "border-gray-300"}`}
                        >
                          {voucherFile ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Archivo seleccionado:</p>
                              <p className="font-medium">{voucherFile.name}</p>
                              <Button variant="outline" size="sm" onClick={() => setVoucherFile(null)}>
                                Cambiar archivo
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                Haz clic para seleccionar o arrastra y suelta tu comprobante de pago
                              </p>
                              <Input id="voucher" type="file" className="hidden" onChange={handleFileChange} />
                              <Button variant="outline" onClick={() => document.getElementById("voucher")?.click()}>
                                Seleccionar archivo
                              </Button>
                            </div>
                          )}
                        </div>
                        {errors.voucher && <p className="text-red-500 text-sm">{errors.voucher}</p>}
                        <p className="text-xs text-gray-500">Formatos aceptados: JPG, PNG, PDF. Tamaño máximo: 5MB</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {formSubmitted && Object.keys(errors).length > 0 && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Por favor, corrige los errores en el formulario antes de continuar.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 space-y-4"> {/* Añadir space-y-4 */}
                  {/* Mostrar error general de pago */}
                  {errors.payment && (
                     <Alert variant="destructive">
                       <AlertCircle className="h-4 w-4" />
                       <AlertDescription>{errors.payment}</AlertDescription>
                     </Alert>
                  )}
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-light" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {paymentMethod === "online" ? "Procesando pago..." : "Enviando solicitud..."}
                      </>
                    ) : paymentMethod === "online" ? (
                      "Pagar y Confirmar Reserva"
                    ) : (
                      "Enviar Solicitud de Reserva"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

