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
import { AlertTriangle, Calendar, Clock, MapPin, Loader2 } from "lucide-react" // Add Loader2
import Link from "next/link"
import { differenceInHours } from 'date-fns' // Importar date-fns

// Define la interfaz para una reserva (buena práctica)
interface Reservation {
  id: number;
  facilityName: string;
  facilityImage: string;
  date: string;
  time: string;
  dateTime: Date;
  location: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  canCancel: boolean;
}

export default function MisReservas() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotification() // Obtener función del contexto
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false) // Estado para la carga de cancelación

  // --- Datos de ejemplo movidos a useState ---
  const [reservations, setReservations] = useState<Reservation[]>([
     {
      id: 1,
      facilityName: "Cancha de Fútbol (Grass)",
      facilityImage: "/placeholder.svg?height=100&width=150",
      date: "Lunes 5 de abril de 2025",
      time: "18:00 - 19:00",
      dateTime: new Date(2025, 3, 5, 18, 0, 0), // Mes es 0-indexado (Abril=3)
      location: "Parque Juan Pablo II",
      status: "confirmada",
      canCancel: true,
    },
    {
      id: 2,
      facilityName: "Piscina Municipal",
      facilityImage: "/placeholder.svg?height=100&width=150",
      date: "Miércoles 7 de abril de 2025",
      time: "10:00 - 11:00",
      dateTime: new Date(2025, 3, 7, 10, 0, 0),
      location: "Complejo Deportivo Municipal",
      status: "pendiente",
      canCancel: true,
    },
    {
      id: 3,
      facilityName: "Gimnasio Municipal",
      facilityImage: "/placeholder.svg?height=100&width=150",
      date: "Viernes 2 de abril de 2025",
      time: "16:00 - 17:00",
      dateTime: new Date(2025, 3, 2, 16, 0, 0),
      location: "Complejo Deportivo Municipal",
      status: "completada",
      canCancel: false,
    },
     {
      id: 4, // Reserva cancelada de ejemplo
      facilityName: "Pista de Atletismo",
      facilityImage: "/placeholder.svg?height=100&width=150",
      date: "Domingo 4 de abril de 2025",
      time: "08:00 - 09:00",
      dateTime: new Date(2025, 3, 4, 8, 0, 0),
      location: "Complejo Deportivo Municipal",
      status: "cancelada",
      canCancel: false,
    },
  ])

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

  // --- Lógica de Cancelación ---
  // --- Lógica de Cancelación ---
  const handleConfirmCancel = () => {
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
    console.log("Simulando cancelación para reserva ID:", reservationToCancel);

    // 3. Simular llamada a API (setTimeout)
    setTimeout(() => {
      // 4. Actualizar el estado de las reservas
      setReservations(prevReservations =>
        prevReservations.map((res: Reservation) => // Añadir tipo explícito a res
          res.id === reservationToCancel
            ? { ...res, status: 'cancelada', canCancel: false } // Actualizar estado y canCancel
            : res
        )
      );

      // 5. Finalizar estado de carga y cerrar diálogo
      setIsCancelling(false);
      setReservationToCancel(null);
      console.log("Cancelación simulada completada.");

      // 6. Añadir notificación usando los detalles guardados ANTES del setTimeout
      addNotification({
          title: "Reserva Cancelada",
          message: `Tu reserva para ${reservationDetails.facilityName} (${reservationDetails.time} el ${reservationDetails.date}) ha sido cancelada.`,
          type: "reserva",
      });
      // Aquí podrías mostrar un toast de éxito

    }, 1500); // Simular delay de red
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
                              <Dialog open={reservationToCancel === reservation.id} onOpenChange={(isOpen) => !isOpen && setReservationToCancel(null)}>
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
            </TabsContent>

            {/* Tab Pendientes */}
            <TabsContent value="pendientes" className="space-y-4">
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
                               <Dialog open={reservationToCancel === reservation.id} onOpenChange={(isOpen) => !isOpen && setReservationToCancel(null)}>
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
            </TabsContent>

             {/* Tab Historial */}
            <TabsContent value="historial" className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
} // Fin del componente MisReservas
