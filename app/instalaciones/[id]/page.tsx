"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isBefore, parse, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, Info, MapPin, Users, Droplets, Dumbbell, Timer, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

// Definir mapeo de tipos a iconos
const getIconForType = (type: string) => {
  const typeToLower = type.toLowerCase();
  if (typeToLower.includes('piscina')) return <Droplets className="h-5 w-5" />;
  if (typeToLower.includes('gimnasio')) return <Dumbbell className="h-5 w-5" />;
  if (typeToLower.includes('pista')) return <Timer className="h-5 w-5" />;
  // Para canchas y otros tipos
  return <Users className="h-5 w-5" />;
};

interface Facility {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  imagenUrl: string;
  caracteristicas: string[];
  comodidades: string[];
  reglas: string[];
  horario: string;
  capacidad: string;
  horariosDisponibles: string[];
  activo: boolean;
}

export default function InstalacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params) as { id: string }
  const [isLoading, setIsLoading] = useState(true)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Función para formatear el precio
  const formatPrice = (price: number, tipo: string) => {
    if (tipo.toLowerCase().includes('gimnasio')) {
      return `S/. ${price.toFixed(2)} por día`
    }
    return `S/. ${price.toFixed(2)} por hora`
  }

  // Cargar datos de la instalación
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/instalaciones/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error(`Error al cargar la instalación: ${response.status}`)
        }
        const data = await response.json()
        setFacility(data)
        
        // Consultar horarios disponibles para esta instalación
        if (date) {
          await fetchAvailableTimes(resolvedParams.id, date)
        }
      } catch (err) {
        console.error("Error cargando la instalación:", err)
        setError("No se pudo cargar la información de la instalación. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id])

  // Función para obtener horarios disponibles según la fecha seleccionada
  const fetchAvailableTimes = async (facilityId: string, selectedDate: Date) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`${API_BASE_URL}/instalaciones/${facilityId}/disponibilidad?fecha=${formattedDate}`)
      
      if (!response.ok) {
        throw new Error(`Error al cargar horarios disponibles: ${response.status}`)
      }
      
      const data = await response.json()      
      // Transformar el formato de la respuesta del backend al formato que espera el frontend
      // El backend devuelve un objeto con un array de rangos de horas, pero el frontend espera un array de strings
      if (data.horariosDisponibles && Array.isArray(data.horariosDisponibles)) {
        const horariosFormateados = data.horariosDisponibles.map((horario: any) => {
          // Formatear las horas de inicio y fin (vienen como "HH:mm:ss")
          const horaInicio = horario.horaInicio.substring(0, 5); // Obtener solo "HH:mm"
          const horaFin = horario.horaFin.substring(0, 5); // Obtener solo "HH:mm"
          return `${horaInicio} - ${horaFin}`;
        });
        
        setAvailableTimes(horariosFormateados);
      } else {
        // Si no hay horarios disponibles o el formato no es el esperado
        setAvailableTimes([]);
      }
      setSelectedTime(null) // Resetear la selección cuando cambian los horarios
    } catch (err) {
      console.error("Error cargando horarios disponibles:", err)
      setAvailableTimes([])
    }
  }

  // Actualizar horarios cuando cambia la fecha
  useEffect(() => {
    if (date && facility) {
      fetchAvailableTimes(String(facility.id), date)
    }
  }, [date])

  if (isLoading) {
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

  if (error || !facility) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Instalación no encontrada</CardTitle>
              <CardDescription>
                {error || "La instalación que estás buscando no existe o ha sido eliminada."}
              </CardDescription>
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
                    {getIconForType(facility.tipo)}
                    <CardTitle className="text-2xl">{facility.nombre}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {facility.ubicacion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={facility.imagenUrl || "/placeholder.svg?height=400&width=800"}
                    alt={facility.nombre}
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
                      <p className="text-gray-700 mb-4">{facility.descripcion}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Horario</p>
                            <p className="text-sm text-gray-600">{facility.horario}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Capacidad</p>
                            <p className="text-sm text-gray-600">{facility.capacidad}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-primary font-bold mt-4">{formatPrice(facility.precio, facility.tipo)}</p>
                    </TabsContent>
                    <TabsContent value="caracteristicas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.caracteristicas && facility.caracteristicas.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="comodidades" className="mt-4">
                      <ul className="space-y-2">
                        {facility.comodidades && facility.comodidades.map((amenity: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="reglas" className="mt-4">
                      <ul className="space-y-2">
                        {facility.reglas && facility.reglas.map((rule: string, index: number) => (
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
                        {availableTimes.length > 0 ? (
                          availableTimes.map((time: string) => {
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
                              }
                            }

                            return (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                className={selectedTime === time ? "bg-primary hover:bg-primary-light" : ""}
                                onClick={() => setSelectedTime(time)}
                                disabled={isDisabled}
                              >
                                {time}
                              </Button>
                            );
                          })
                        ) : (
                          <p className="col-span-2 text-center text-gray-500 py-4">
                            No hay horarios disponibles para esta fecha
                          </p>
                        )}
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
                        router.push(`/reserva/confirmar?id=${resolvedParams.id}&date=${encodedDate}&time=${encodedTime}`)
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