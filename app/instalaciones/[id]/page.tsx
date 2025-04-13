"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isBefore, parse, set, isToday } from "date-fns" // Importar funciones adicionales
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, Info, MapPin, Users, Droplets, Dumbbell, Timer, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext" // Importar useAuth

// Base de datos de instalaciones
const facilitiesDB = [
  {
    id: 1,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "Piscina semiolímpica con carriles para natación y área recreativa. Ideal para practicar natación, clases de aquagym y actividades acuáticas.",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
    price: "S/. 15.00 por hora",
    features: [
      "Dimensiones: 25m x 12.5m",
      "Profundidad: 1.2m - 2.0m",
      "6 carriles para natación",
      "Temperatura controlada (26-28°C)",
      "Vestuarios y duchas",
      "Salvavidas certificados",
    ],
    amenities: ["Vestuarios con casilleros", "Duchas con agua caliente", "Área de descanso", "Cafetería cercana"],
    rules: [
      "Uso obligatorio de gorro de baño",
      "Ducharse antes de ingresar a la piscina",
      "No correr en el área de la piscina",
      "No consumir alimentos dentro del área de la piscina",
      "Niños menores de 12 años deben estar acompañados por un adulto",
    ],
    schedule: "Lunes a Viernes: 6:00 - 21:00, Sábados y Domingos: 8:00 - 18:00",
    capacity: "Máximo 30 personas simultáneamente",
    icon: <Droplets className="h-5 w-5" />,
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
    ],
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "Cancha de fútbol con grass sintético de última generación, ideal para partidos de fútbol 7 o fútbol 11. Cuenta con iluminación para partidos nocturnos.",
    type: "cancha-futbol-grass",
    location: "Parque Juan Pablo II",
    price: "S/. 120.00 por hora",
    features: [
      "Dimensiones: 90m x 45m",
      "Grass sintético de alta calidad",
      "Iluminación nocturna",
      "Vestuarios y duchas",
      "Estacionamiento cercano",
    ],
    amenities: [
      "Vestuarios con casilleros",
      "Duchas con agua caliente",
      "Área de calentamiento",
      "Tribunas para espectadores",
      "Alquiler de balones (costo adicional)",
    ],
    rules: [
      "Uso de zapatillas adecuadas (no tacos metálicos)",
      "No consumir alimentos dentro de la cancha",
      "Respetar el horario reservado",
      "Máximo 22 jugadores por reserva",
      "Prohibido el consumo de alcohol",
    ],
    schedule: "Lunes a Domingo: 8:00 - 22:00",
    capacity: "Máximo 22 jugadores",
    icon: <Users className="h-5 w-5" />,
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
      "20:00 - 21:00",
    ],
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "Gimnasio equipado con máquinas modernas y área de pesas. Ideal para entrenamiento de fuerza, cardio y clases grupales.",
    type: "gimnasio",
    location: "Complejo Deportivo Municipal",
    price: "S/. 20.00 por día",
    features: [
      "Área de cardio con 15 máquinas",
      "Área de pesas y máquinas de musculación",
      "Zona de entrenamiento funcional",
      "Salón para clases grupales",
      "Entrenadores certificados disponibles",
    ],
    amenities: [
      "Vestuarios con casilleros",
      "Duchas con agua caliente",
      "Dispensador de agua",
      "Toallas (costo adicional)",
      "Tienda de suplementos",
    ],
    rules: [
      "Uso de toalla obligatorio",
      "Limpiar las máquinas después de usarlas",
      "No reservar máquinas",
      "Uso de calzado deportivo limpio",
      "Prohibido el ingreso con alimentos",
    ],
    schedule: "Lunes a Viernes: 6:00 - 22:00, Sábados: 8:00 - 20:00, Domingos: 8:00 - 14:00",
    capacity: "Máximo 50 personas simultáneamente",
    icon: <Dumbbell className="h-5 w-5" />,
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
    ],
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "Cancha multifuncional de loza para fútbol y otros deportes. Superficie duradera y versátil para diferentes actividades deportivas.",
    type: "cancha-futbol-loza",
    location: "Parque Simón Bolívar",
    price: "S/. 80.00 por hora",
    features: [
      "Dimensiones: 40m x 20m",
      "Superficie de concreto pulido",
      "Iluminación nocturna",
      "Marcación para múltiples deportes",
      "Arcos de fútbol y tableros de básquet",
    ],
    amenities: ["Bancas para descanso", "Bebederos de agua", "Baños públicos cercanos", "Estacionamiento gratuito"],
    rules: [
      "Uso de zapatillas deportivas adecuadas",
      "No consumir alimentos dentro de la cancha",
      "Respetar el horario reservado",
      "Prohibido el consumo de alcohol",
      "Mantener limpia la instalación",
    ],
    schedule: "Lunes a Domingo: 8:00 - 21:00",
    capacity: "Máximo 14 jugadores",
    icon: <Users className="h-5 w-5" />,
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
    ],
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "Pista de atletismo profesional con 6 carriles. Ideal para corredores, entrenamientos de resistencia y competencias atléticas.",
    type: "pista-atletismo",
    location: "Complejo Deportivo Municipal",
    price: "S/. 10.00 por hora",
    features: [
      "Pista de 400m con 6 carriles",
      "Superficie sintética de alta calidad",
      "Áreas para salto largo y lanzamiento",
      "Iluminación para uso nocturno",
      "Cronometraje electrónico disponible",
    ],
    amenities: ["Vestuarios con duchas", "Bebederos de agua", "Área de calentamiento", "Gradas para espectadores"],
    rules: [
      "Uso exclusivo de zapatillas de atletismo o deportivas",
      "Respetar la dirección de carrera",
      "No cruzar por los carriles durante entrenamientos",
      "Ceder el paso a corredores más rápidos",
      "No consumir alimentos en la pista",
    ],
    schedule: "Lunes a Viernes: 6:00 - 21:00, Sábados y Domingos: 7:00 - 19:00",
    capacity: "Máximo 30 personas simultáneamente",
    icon: <Timer className="h-5 w-5" />,
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
    ],
  },
]

export default function InstalacionDetalle({ params }: { params: { id: string } }) {
  const { id: facilityId } = params; // Extraer id de params
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [facility, setFacility] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { isAuthenticated } = useAuth() // Obtener estado de autenticación

  useEffect(() => {
    // Simulación de carga de datos
    setLoading(true)
    setTimeout(() => {
      const foundFacility = facilitiesDB.find((f) => f.id === Number.parseInt(facilityId)) // Usar facilityId extraído
      setFacility(foundFacility || null)
      setLoading(false)
    }, 500)
  }, [facilityId]) // Usar facilityId en dependencias

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información de la instalación...</p>
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/instalaciones" className="text-primary hover:underline">
              &larr; Volver a instalaciones
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    {facility.icon}
                    <CardTitle className="text-2xl">{facility.name}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {facility.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />

                  <Tabs defaultValue="descripcion">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                      <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                      <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                      <TabsTrigger value="reglas">Reglas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="descripcion" className="mt-4">
                      <p className="text-gray-700 mb-4">{facility.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Horario</p>
                            <p className="text-sm text-gray-600">{facility.schedule}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Capacidad</p>
                            <p className="text-sm text-gray-600">{facility.capacity}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-primary font-bold mt-4">{facility.price}</p>
                    </TabsContent>
                    <TabsContent value="caracteristicas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="comodidades" className="mt-4">
                      <ul className="space-y-2">
                        {facility.amenities.map((amenity: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="reglas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.rules.map((rule: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Reservar</CardTitle>
                  <CardDescription>Selecciona fecha y hora disponible</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Selecciona una fecha</span>
                    </div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="border rounded-md p-2"
                      locale={es}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                  </div>

                  {date && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          Horarios disponibles para {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {facility.availableTimes.map((time: string) => {
                          // Lógica para deshabilitar horarios pasados en el día actual
                          let isDisabled = false;
                          if (date && isToday(date)) {
                            try {
                              // Extraer hora de inicio (ej. "08" de "08:00 - 09:00")
                              const startTimeString = time.split(" ")[0];
                              // Crear objeto Date para la hora de inicio en el día seleccionado
                              const startTime = parse(startTimeString, 'HH:mm', date);
                              // Comparar con la hora actual
                              if (isBefore(startTime, new Date())) {
                                isDisabled = true;
                              }
                            } catch (error) {
                               console.error("Error parsing time:", time, error);
                               // Opcional: deshabilitar si hay error de parseo
                               // isDisabled = true;
                            }
                          }

                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={selectedTime === time ? "bg-primary hover:bg-primary-light" : ""}
                              onClick={() => setSelectedTime(time)}
                              disabled={isDisabled} // Añadir atributo disabled
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary hover:bg-primary-light"
                    disabled={!date || !selectedTime}
                    onClick={() => {
                      if (!isAuthenticated) {
                        // Si no está autenticado, redirigir a login
                        router.push('/login');
                      } else if (date && selectedTime) {
                        // Si está autenticado y tiene fecha/hora, proceder a confirmar
                        const encodedTime = encodeURIComponent(selectedTime)
                        const encodedDate = encodeURIComponent(date.toISOString())
                        router.push(`/reserva/confirmar?id=${facilityId}&date=${encodedDate}&time=${encodedTime}`) // Usar facilityId extraído
                      }
                    }}
                  >
                    Continuar con la Reserva
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

