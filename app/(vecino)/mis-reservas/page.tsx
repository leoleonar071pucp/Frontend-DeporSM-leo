"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { useNotification } from "@/context/NotificationContext" // Import useNotification
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Calendar, Clock, MapPin, Loader2, RefreshCw } from "lucide-react" // Add Loader2 and RefreshCw
import Link from "next/link"
import { differenceInHours } from 'date-fns' // Importar date-fns
import { API_BASE_URL, FRONTEND_URL } from "@/lib/config";
import { formatDateForDisplay, createDateFromBackend } from "@/lib/date-utils";

// Define la interfaz para una reserva adaptada al formato del backend
interface Reservation {
  id: number;
  facilityName: string; // Mapeado desde instalacionNombre del backend
  facilityImage: string; // Se obtiene de otro endpoint o usa un placeholder
  date: string; // Formateado desde el campo fecha del backend
  time: string; // Generado a partir de horaInicio y horaFin
  dateTime: Date; // Convertido a partir del campo fecha para cálculos
  location: string; // Se obtiene de los datos de la instalación (ubicación)
  status: "confirmada" | "pendiente" | "completada" | "cancelada"; // Mapeado desde estado
  estadoPago: string; // Estado del pago de la reserva
  metodoPago?: string; // Método de pago (online, deposito)
  canCancel: boolean; // Calculado basado en reglas de negocio
}

export default function MisReservas() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotification() // Obtener función del contexto
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false) // Estado para la carga de cancelación
  const [isLoadingReservations, setIsLoadingReservations] = useState(false) // Estado para la carga de reservas
  const [reservations, setReservations] = useState<Reservation[]>([])

  // Función para formatear la fecha de la base de datos a un formato más amigable
  const formatDate = (dateStr: string): string => {
    return formatDateForDisplay(dateStr, "EEEE d 'de' MMMM 'de' yyyy");
  }

  // Función para cargar las reservas del usuario desde el backend
  const fetchReservations = async () => {
    if (!isAuthenticated) return;

    setIsLoadingReservations(true);
    try {
      console.log("Obteniendo reservas del usuario...");

      // Llamada al endpoint del backend para obtener las reservas
      const response = await fetch(`${API_BASE_URL}/reservas/historial`, {
        method: 'GET',
        credentials: 'include', // Importante para enviar cookies de sesión
        headers: {
          'Accept': 'application/json',
          'Origin': FRONTEND_URL // Asegurar que se envíe el origen correcto
        }
      });

      if (!response.ok) {
        console.error(`Error al obtener las reservas. Código: ${response.status}, Mensaje: ${await response.text()}`);
        throw new Error(`Error al obtener las reservas: ${response.status}`);
      }

      // Obtener los datos del backend
      const reservasFromBackend = await response.json();
      console.log('Reservas obtenidas del backend:', reservasFromBackend);

      // Transformar los datos para adaptarlos a nuestra interfaz
      const formattedReservations = reservasFromBackend.map((reserva: any) => {
        // Crear un objeto Date usando la función de utilidad para evitar problemas de zona horaria
        const fechaReserva = createDateFromBackend(reserva.fecha);
        // Formatear la hora como "HH:MM - HH:MM"
        const horaInicio = reserva.horaInicio.substring(0, 5); // Tomar solo HH:MM
        const horaFin = reserva.horaFin.substring(0, 5); // Tomar solo HH:MM
        const hora = `${horaInicio} - ${horaFin}`;

        // Crear el objeto dateTime para cálculos de cancelación
        const [horaI, minI] = horaInicio.split(':').map(Number);
        const dateTime = new Date(fechaReserva);
        dateTime.setHours(horaI, minI, 0);

        return {
          id: reserva.id,
          facilityName: reserva.instalacionNombre,
          facilityImage: reserva.instalacionImagenUrl || "/placeholder.svg?height=100&width=150", // Usar imagen real de la instalación
          date: formatDate(reserva.fecha),
          time: hora,
          dateTime: dateTime,
          location: reserva.instalacionUbicacion, // Usar la ubicación real de la instalación
          status: reserva.estado as "confirmada" | "pendiente" | "completada" | "cancelada",
          estadoPago: reserva.estadoPago,
          metodoPago: reserva.metodoPago, // Incluir método de pago para mostrar comprobante si es necesario
          canCancel: false // Se calculará después
        };
      });

      // Aplicar reglas de negocio para determinar si se puede cancelar
      const reservationsWithCancelStatus = formattedReservations.map((res: Reservation) => {
        // Calcular si se puede cancelar según nuestras reglas de negocio
        const canCancel = checkCancellationEligibility({
          ...res,
          canCancel: false // Valor temporal que será sobrescrito
        });

        return {
          ...res,
          canCancel
        };
      });

      setReservations(reservationsWithCancelStatus);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);

      // Notificar al usuario sobre el problema
      await addNotification({
        title: "Error de conexión",
        message: "No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.",
        type: "info", // Cambiado de "error" a uno de los tipos válidos
      });

      // En caso de error, al menos mostrar un array vacío para no romper la interfaz
      setReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case "confirmada":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Confirmada</span>
        )
      case "pendiente":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendiente</span>
        )
      case "completada":
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Completada</span>
      case "cancelada":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelada</span>
      default:
        return null
    }
  }

  // --- Protección de Ruta ---
  useEffect(() => {
    // Solo redirigir si la carga de autenticación terminó y el usuario NO está autenticado
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // --- Cargar Reservas desde el Backend ---
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchReservations();
    }
  }, [isAuthenticated, isAuthLoading]); // El linter puede quejarse, pero esto es suficiente

  // --- Lógica de Cancelación ---
  const handleConfirmCancel = async () => {
    if (reservationToCancel === null) return;

    // 1. Buscar detalles de la reserva ANTES de cualquier operación asíncrona
    const reservationDetails = reservations.find((res: Reservation) => res.id === reservationToCancel);

    // 2. Validar si se encontró la reserva
    if (!reservationDetails) {
        console.error("Error: No se encontró la reserva a cancelar:", reservationToCancel);
        setReservationToCancel(null); // Limpiar estado si no se encontró
        return; // Salir si no hay detalles
    }

    setIsCancelling(true); // Iniciar estado de carga
    console.log("Cancelando reserva ID:", reservationToCancel);

    try {
      // 3. Llamar al backend para cancelar la reserva
      const motivo = "Cancelada por el usuario"; // Opcional: podríamos agregar un campo para que el usuario ingrese un motivo
      const response = await fetch(`${API_BASE_URL}/reservas/${reservationToCancel}/cancelar?motivo=${encodeURIComponent(motivo)}`, {
        method: 'PUT',
        credentials: 'include', // Para enviar las cookies de sesión
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': FRONTEND_URL // Asegurar que se envíe el origen correcto
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cancelar la reserva: ${response.status}`);
      }

      // 4. Actualizar el estado de las reservas localmente sin tener que hacer otra llamada
      setReservations(prevReservations =>
        prevReservations.map((res: Reservation) => // Añadir tipo explícito a res
          res.id === reservationToCancel
            ? {
                ...res,
                status: 'cancelada',
                estadoPago: 'reembolsado', // Actualizar el estado de pago a reembolsado
                canCancel: false
              } // Actualizar estado, estado de pago y canCancel
            : res
        )
      );

      // 5. Añadir notificación
      await addNotification({
        title: "Reserva Cancelada",
        message: `Tu reserva para ${reservationDetails.facilityName} (${reservationDetails.time} el ${reservationDetails.date}) ha sido cancelada.`,
        type: "reserva",
      });

    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      // Opcional: Mostrar un mensaje de error al usuario
    } finally {
      // 6. Finalizar estado de carga y cerrar diálogo
      setIsCancelling(false);
      setReservationToCancel(null);
    }
  }; // Fin de handleConfirmCancel

  // --- Función para verificar elegibilidad de cancelación (Regla 48h) ---
  const checkCancellationEligibility = (reservation: Reservation): boolean => {
    // No se puede cancelar si ya está completada o cancelada
    if (reservation.status === 'completada' || reservation.status === 'cancelada') {
      return false;
    }
    // Calcular diferencia en horas
    const now = new Date();
    const hoursDifference = differenceInHours(reservation.dateTime, now);
    // Se puede cancelar si faltan 48 horas o más
    return hoursDifference >= 48;
  };
  // --- Renderizado Condicional por Carga/Autenticación ---
   if (isAuthLoading || !isAuthenticated) {
    // Muestra un estado de carga o nada mientras redirige
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // --- Renderizado Principal (Solo si está autenticado) ---
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mis Reservas</h1>

          <Tabs defaultValue="activas">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="activas">Activas</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            {/* Tab Activas */}
            <TabsContent value="activas" className="space-y-4">
              {isLoadingReservations ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center min-h-[100px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {reservations
                    .filter((r) => r.status === "confirmada")
                    .map((reservation) => (
                      <Card key={reservation.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={reservation.facilityImage || "/placeholder.svg"}
                              alt={reservation.facilityName}
                              className="w-full md:w-32 h-24 object-cover rounded-md"
                            />
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{reservation.facilityName}</h3>
                                {getStatusBadge(reservation.status)}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>{reservation.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{reservation.time}</span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span>{reservation.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row gap-2">
                                <Button asChild variant="outline" size="sm">
                                  {/* El enlace a detalles podría necesitar ajuste si la ruta no existe */}
                                  <Link href={`/reserva/${reservation.id}`}>Ver Detalles</Link>
                                </Button>
                                {/* Usar la función de elegibilidad */}
                                {checkCancellationEligibility(reservation) && (
                                  <Dialog open={reservationToCancel === reservation.id} onOpenChange={(isOpen: boolean) => !isOpen && setReservationToCancel(null)}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setReservationToCancel(reservation.id)}
                                      >
                                        Cancelar Reserva
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Cancelar Reserva</DialogTitle>
                                        <DialogDescription>
                                          ¿Estás seguro de que deseas cancelar esta reserva?
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex items-center gap-4 py-4">
                                        <div className="bg-red-100 p-3 rounded-full">
                                          <AlertTriangle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium">Política de cancelación</p>
                                          <p className="text-sm text-gray-500">
                                            Recuerda que solo puedes cancelar hasta 48 horas antes de la fecha reservada.
                                            Pasado este tiempo, no habrá reembolso.
                                          </p>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setReservationToCancel(null)}>
                                          Volver
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={handleConfirmCancel}
                                          disabled={isCancelling}
                                        >
                                          {isCancelling ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Cancelando...
                                            </>
                                          ) : (
                                            "Confirmar Cancelación"
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {reservations.filter((r) => r.status === "confirmada").length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No tienes reservas activas en este momento.</p>
                        <Button asChild className="mt-4 bg-primary hover:bg-primary-light">
                          <Link href="/instalaciones">Explorar Instalaciones</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Tab Pendientes */}
            <TabsContent value="pendientes" className="space-y-4">
              {isLoadingReservations ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center min-h-[100px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {reservations
                    .filter((r) => r.status === "pendiente")
                    .map((reservation) => (
                      <Card key={reservation.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                             <img
                              src={reservation.facilityImage || "/placeholder.svg"}
                              alt={reservation.facilityName}
                              className="w-full md:w-32 h-24 object-cover rounded-md"
                            />
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{reservation.facilityName}</h3>
                                {getStatusBadge(reservation.status)}
                              </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>{reservation.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{reservation.time}</span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span>{reservation.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row gap-2">
                                <Button asChild variant="outline" size="sm">
                                   <Link href={`/reserva/${reservation.id}`}>Ver Detalles</Link>
                                </Button>
                                {/* Ajuste: Usar el mismo diálogo para cancelar pendientes */}
                                {/* Usar la función de elegibilidad */}
                                {checkCancellationEligibility(reservation) && (
                                   <Dialog open={reservationToCancel === reservation.id} onOpenChange={(isOpen: boolean) => !isOpen && setReservationToCancel(null)}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setReservationToCancel(reservation.id)}
                                      >
                                        Cancelar Solicitud
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Cancelar Solicitud de Reserva</DialogTitle>
                                        <DialogDescription>
                                          ¿Estás seguro de que deseas cancelar esta solicitud de reserva pendiente?
                                        </DialogDescription>
                                      </DialogHeader>
                                      {/* Podrías añadir info relevante aquí si es necesario */}
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setReservationToCancel(null)}>
                                          Volver
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={handleConfirmCancel}
                                          disabled={isCancelling}
                                        >
                                          {isCancelling ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Cancelando...
                                            </>
                                          ) : (
                                            "Confirmar Cancelación"
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {reservations.filter((r) => r.status === "pendiente").length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No tienes reservas pendientes en este momento.</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

             {/* Tab Historial */}
            <TabsContent value="historial" className="space-y-4">
              {isLoadingReservations ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center min-h-[100px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {reservations
                    .filter((r) => r.status === "completada" || r.status === "cancelada")
                    .map((reservation) => (
                      <Card key={reservation.id}>
                        <CardContent className="p-6">
                           <div className="flex flex-col md:flex-row gap-4">
                             <img
                              src={reservation.facilityImage || "/placeholder.svg"}
                              alt={reservation.facilityName}
                              className="w-full md:w-32 h-24 object-cover rounded-md"
                            />
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{reservation.facilityName}</h3>
                                {getStatusBadge(reservation.status)}
                              </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>{reservation.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{reservation.time}</span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span>{reservation.location}</span>
                                </div>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/reserva/${reservation.id}`}>Ver Detalles</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {reservations.filter((r) => r.status === "completada" || r.status === "cancelada").length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No tienes historial de reservas.</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
} // Fin del componente MisReservas
