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
import { API_BASE_URL } from "@/lib/config";


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
  const [bloqueoToken, setBloqueoToken] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
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

        // Depurar el contenido de sessionStorage
        const reservaCompletadaStr = sessionStorage.getItem('reservaCompletada');
        if (reservaCompletadaStr) {
          try {
            const reservaCompletada = JSON.parse(reservaCompletadaStr);
            console.log("Reserva completada encontrada en sessionStorage:", reservaCompletada);
            console.log("ID de instalación actual:", resolvedParams.id);
            console.log("¿Es la misma instalación?", reservaCompletada.instalacionId === resolvedParams.id);
          } catch (error) {
            console.error("Error al parsear reserva completada:", error);
          }
        } else {
          console.log("No hay reserva completada en sessionStorage");
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
      console.log("Obteniendo horarios disponibles para fecha:", format(selectedDate, 'yyyy-MM-dd'));
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')

      // Añadir parámetros para evitar caché y obtener datos frescos
      const timestamp = Date.now(); // Timestamp único para evitar caché
      const response = await fetch(`${API_BASE_URL}/instalaciones/${facilityId}/disponibilidad?fecha=${formattedDate}&_=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include' // Incluir cookies para autenticación
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la respuesta:", errorText);
        throw new Error(`Error al cargar horarios disponibles: ${response.status}`)
      }

      const data = await response.json()
      console.log("Datos recibidos:", data);

      // Transformar el formato de la respuesta del backend al formato que espera el frontend
      // El backend devuelve un objeto con un array de rangos de horas, pero el frontend espera un array de strings
      if (data.horariosDisponibles && Array.isArray(data.horariosDisponibles)) {
        // Crear dos arrays: uno para horarios disponibles y otro para bloqueados
        const horariosDisponibles: string[] = [];
        const horariosBloqueados: string[] = [];

        // Limpiar los arrays actuales para evitar duplicados
        setAvailableTimes([]);
        setBlockedTimes([]);

        data.horariosDisponibles.forEach((horario: any) => {
          // Formatear las horas de inicio y fin (vienen como "HH:mm:ss")
          const horaInicio = horario.horaInicio.substring(0, 5); // Obtener solo "HH:mm"
          const horaFin = horario.horaFin.substring(0, 5); // Obtener solo "HH:mm"
          const timeString = `${horaInicio} - ${horaFin}`;

          // Verificar si el horario está bloqueado temporalmente
          if (horario.bloqueadoTemporalmente) {
            // IMPORTANTE: Los horarios bloqueados temporalmente se muestran como no disponibles
            // pero con un estilo diferente que muestra el horario
            console.log(`Horario ${timeString} está bloqueado temporalmente, se mostrará como bloqueado`);

            // Verificar si el bloqueo es del usuario actual
            const bloqueoTemporalStr = sessionStorage.getItem('bloqueoTemporal');
            let esBloqueoPropio = false;

            if (bloqueoTemporalStr) {
              try {
                const bloqueoTemporal = JSON.parse(bloqueoTemporalStr);
                // Verificar si el bloqueo es para este mismo horario y fecha
                if (bloqueoTemporal.instalacionId === String(resolvedParams.id) &&
                    bloqueoTemporal.fecha === (date ? format(date, 'yyyy-MM-dd') : '') &&
                    bloqueoTemporal.horario === timeString) {
                  console.log(`El horario ${timeString} está bloqueado por el usuario actual`);
                  esBloqueoPropio = true;
                  // Si es bloqueo propio, lo añadimos a disponibles para que pueda seguir con su reserva
                  horariosDisponibles.push(timeString);
                }
              } catch (error) {
                console.error("Error al verificar bloqueo temporal propio:", error);
              }
            }

            // Si no es bloqueo propio, lo añadimos a bloqueados
            if (!esBloqueoPropio) {
              horariosBloqueados.push(timeString);
            }
          } else {
            // Si no está bloqueado, lo añadimos a la lista de disponibles
            horariosDisponibles.push(timeString);
          }
        });

        console.log("Horarios disponibles:", horariosDisponibles);
        console.log("Horarios bloqueados:", horariosBloqueados);

        // Guardar tanto los horarios disponibles como los bloqueados
        setAvailableTimes(horariosDisponibles);

        // Guardar los horarios bloqueados en un estado separado para mostrarlos como deshabilitados
        setBlockedTimes(horariosBloqueados);
      } else {
        // Si no hay horarios disponibles o el formato no es el esperado
        console.log("No se encontraron horarios disponibles");
        setAvailableTimes([]);
        setBlockedTimes([]);
      }

      // Verificar si el horario seleccionado sigue disponible
      if (selectedTime) {
        const isStillAvailable = availableTimes.includes(selectedTime);
        const isBlockedByOthers = blockedTimes.includes(selectedTime);

        // Si el horario ya no está disponible y no está bloqueado por el usuario actual
        if (!isStillAvailable && !isBlockedByOthers) {
          console.log("El horario seleccionado ya no está disponible, reseteando selección");
          setSelectedTime(null);

          // Liberar el bloqueo temporal si existe
          if (bloqueoToken) {
            fetch(`${API_BASE_URL}/bloqueos-temporales/${bloqueoToken}`, {
              method: 'DELETE',
              credentials: 'include'
            }).catch(error => console.error('Error al liberar bloqueo:', error));
            setBloqueoToken(null);
          }

          // Mostrar mensaje al usuario
          setError("El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.");
          setTimeout(() => setError(null), 5000); // Limpiar el mensaje después de 5 segundos
        }
      }
    } catch (err) {
      console.error("Error cargando horarios disponibles:", err)
      setAvailableTimes([])
      setError("Error al cargar horarios disponibles. Por favor, intenta de nuevo más tarde.")
    }
  }



  // Actualizar horarios cuando cambia la fecha
  useEffect(() => {
    if (date && facility) {
      fetchAvailableTimes(String(facility.id), date)
    }
  }, [date])

  // Verificar periódicamente si hay cambios en la disponibilidad
  useEffect(() => {
    // Solo si hay una fecha seleccionada y hay una instalación
    if (date && facility) {
      console.log("Configurando intervalo de actualización de horarios...");

      // Función para actualizar horarios
      const updateTimes = async () => {
        console.log("Actualizando horarios disponibles automáticamente...");
        try {
          await fetchAvailableTimes(String(facility.id), date);
        } catch (error) {
          console.error("Error al actualizar horarios:", error);
        }
      };

      // Actualizar inmediatamente al montar el componente
      updateTimes();

      // Crear un intervalo para verificar cada 1 segundo para una actualización más rápida
      const intervalId = setInterval(updateTimes, 1000);

      // Limpiar el intervalo cuando el componente se desmonte
      return () => {
        console.log("Limpiando intervalo de actualización de horarios");
        clearInterval(intervalId);
      };
    }
  }, [date, facility])

  // Limpiar el bloqueo temporal cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Liberar el bloqueo temporal al desmontar el componente
      if (bloqueoToken) {
        fetch(`${API_BASE_URL}/bloqueos-temporales/${bloqueoToken}`, {
          method: 'DELETE',
          credentials: 'include'
        }).catch(error => console.error('Error al liberar bloqueo:', error));
      }
    };
  }, [bloqueoToken]);

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
            <button
              onClick={() => router.back()}
              className="text-primary hover:underline cursor-pointer border-none bg-transparent p-0 flex items-center"
            >
              &larr; Volver
            </button>
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
                      <div className="flex items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium">
                            Horarios disponibles para {format(date, "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {error ? (
                          <p className="col-span-2 text-center text-red-500 py-4">
                            {error}
                          </p>
                        ) : availableTimes.length > 0 || blockedTimes.length > 0 ? (
                          <>
                            {/* Mostrar horarios disponibles */}
                            {availableTimes.map((time: string) => {
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
                                  onClick={() => {
                                    // Si ya estaba seleccionado, deseleccionar
                                    if (selectedTime === time) {
                                      setSelectedTime(null);
                                      // Liberar el bloqueo temporal si existe
                                      if (bloqueoToken) {
                                        fetch(`${API_BASE_URL}/bloqueos-temporales/${bloqueoToken}`, {
                                          method: 'DELETE',
                                          credentials: 'include'
                                        }).catch(error => console.error('Error al liberar bloqueo:', error));
                                        setBloqueoToken(null);
                                      }
                                    } else {
                                      // Solo seleccionar el horario, sin bloquear temporalmente
                                      setSelectedTime(time);
                                      // Ya no llamamos a bloquearHorarioTemporal aquí
                                      // El bloqueo se realizará cuando el usuario vaya a la página de confirmación
                                    }
                                  }}
                                  disabled={isDisabled}
                                >
                                  {time}
                                </Button>
                              );
                            })}

                            {/* Mostrar horarios temporalmente bloqueados (en proceso de reserva por otros usuarios) */}
                            {blockedTimes.map((time: string) => (
                              <div
                                key={`blocked-${time}`}
                                className="h-10 rounded-md border border-gray-300 bg-gray-200 flex items-center justify-center text-gray-500 cursor-not-allowed pointer-events-none select-none opacity-60"
                                title="Este horario está temporalmente bloqueado mientras se completa una reserva (disponible en 10 minutos)"
                                aria-disabled="true"
                                onClick={(e) => e.preventDefault()}
                                onKeyDown={(e) => e.preventDefault()}
                                tabIndex={-1}
                              >
                                <span className="text-sm font-medium">{time}</span>
                              </div>
                            ))}
                          </>
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
                        // Verificar si hay una reserva completada recientemente
                        const reservaCompletadaStr = sessionStorage.getItem('reservaCompletada');
                        if (reservaCompletadaStr) {
                          try {
                            const reservaCompletada = JSON.parse(reservaCompletadaStr);
                            const tiempoTranscurrido = Date.now() - reservaCompletada.timestamp;

                            // Si la reserva se completó hace menos de 30 minutos
                            if (tiempoTranscurrido < 30 * 60 * 1000) {
                              // Normalizar las fechas para comparar solo la parte de la fecha (YYYY-MM-DD)
                              const fechaActual = date.toISOString().split('T')[0];

                              // Usar la fecha normalizada si está disponible, o calcularla si no
                              const fechaCompletada = reservaCompletada.fechaNormalizada ||
                                                     (reservaCompletada.fecha ?
                                                      new Date(reservaCompletada.fecha).toISOString().split('T')[0] :
                                                      null);

                              // Verificar si es exactamente la misma reserva (misma instalación, fecha y horario)
                              const mismaInstalacion = reservaCompletada.instalacionId === resolvedParams.id;
                              const mismaFecha = fechaCompletada && fechaActual === fechaCompletada;
                              const mismoHorario = reservaCompletada.horario && reservaCompletada.horario === selectedTime;

                              // Solo consideramos que es la misma reserva si coinciden los tres criterios
                              const mismaReserva = mismaInstalacion && mismaFecha && mismoHorario;

                              console.log("Comparando reserva actual con reserva completada:", {
                                actual: {
                                  instalacionId: resolvedParams.id,
                                  fecha: date.toISOString(),
                                  fechaNormalizada: fechaActual,
                                  horario: selectedTime
                                },
                                completada: {
                                  instalacionId: reservaCompletada.instalacionId,
                                  fecha: reservaCompletada.fecha,
                                  fechaNormalizada: fechaCompletada,
                                  horario: reservaCompletada.horario
                                },
                                comparacion: {
                                  mismaInstalacion,
                                  mismaFecha,
                                  mismoHorario,
                                  mismaReserva
                                }
                              });

                              // Solo redirigir si es exactamente la misma reserva (misma instalación, fecha y horario)
                              if (mismaReserva) {
                                console.log("Intentando reservar el mismo horario que ya fue reservado. Redirigiendo a mis reservas...");
                                router.push('/mis-reservas');
                                return;
                              } else {
                                console.log("Permitiendo continuar con la nueva reserva aunque sea en la misma instalación.");
                              }
                            } else {
                              // Si pasó más tiempo, limpiar el storage
                              console.log("Reserva antigua encontrada. Limpiando sessionStorage.");
                              sessionStorage.removeItem('reservaCompletada');
                            }
                          } catch (error) {
                            console.error("Error al verificar reserva completada:", error);
                            sessionStorage.removeItem('reservaCompletada');
                          }
                        }

                        // Si no hay reserva completada reciente, proceder a confirmar
                        const encodedTime = encodeURIComponent(selectedTime)
                        const encodedDate = encodeURIComponent(date.toISOString())

                        // Ya no guardamos el token de bloqueo porque no lo estamos usando en esta etapa
                        // El bloqueo se realizará cuando el usuario llegue a la página de confirmación

                        // Liberar cualquier bloqueo temporal existente antes de navegar
                        if (bloqueoToken) {
                          fetch(`${API_BASE_URL}/bloqueos-temporales/${bloqueoToken}`, {
                            method: 'DELETE',
                            credentials: 'include'
                          }).catch(error => console.error('Error al liberar bloqueo:', error));
                          setBloqueoToken(null);
                        }

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