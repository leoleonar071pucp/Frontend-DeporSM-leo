"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock, Download, MapPin, User, CreditCard, CheckCircle, Info, Loader2 } from "lucide-react" // Añadir Loader2
import Link from "next/link"
import { useNotification } from "@/context/NotificationContext" // Importar useNotification
import { differenceInHours, parse } from 'date-fns' // Importar date-fns
import { API_BASE_URL,FRONTEND_URL } from "@/lib/config";
import { calculateTotalPrice, formatPrice } from "@/lib/price-utils";


// Definir interfaz para Reserva (mejor práctica)
interface ReservationDetails {
    id: number;
    reservationNumber: string;
    facilityId: number;
    facilityName: string;
    facilityImage: string;
    date: string;
    time: string;
    dateTime: Date; // Campo clave para comparación
    location: string;
    status: "confirmada" | "pendiente" | "completada" | "cancelada";
    canCancel: boolean; // Mantener por si se usa en otro lado, pero la lógica principal usará la función
    paymentMethod: string;
    paymentStatus: string;
    paymentAmount: string;
    paymentDate: string;
    paymentReceiptUrl?: string | null; // URL a la imagen del comprobante de pago (si existe)
    userDetails: {
      name: string;
      email: string;
      phone: string;
    };
    additionalInfo: string;
    createdAt: string;
}


// Datos de ejemplo para las reservas (con dateTime añadido)
const reservationsDB: ReservationDetails[] = [
  {
    id: 1,
    reservationNumber: "RES-12345",
    facilityId: 2,
    facilityName: "Cancha de Fútbol (Grass)",
    facilityImage: "/placeholder.svg?height=200&width=300",
    date: "Lunes 5 de abril de 2025",
    time: "18:00 - 19:00",
    dateTime: new Date(2025, 3, 5, 18, 0, 0), // Abril es mes 3
    location: "Parque Juan Pablo II",
    status: "confirmada",
    canCancel: true,
    paymentMethod: "Tarjeta de crédito",
    paymentStatus: "Pagado",
    paymentAmount: "S/. 120.00",
    paymentDate: "2 de abril de 2025, 15:30",
    userDetails: { name: "Juan Pérez García", email: "juan.perez@example.com", phone: "987654321" },
    additionalInfo: "Traer balón propio. Se solicita puntualidad.",
    createdAt: "2 de abril de 2025, 15:25",
  },
  {
    id: 2,
    reservationNumber: "RES-12346",
    facilityId: 1,
    facilityName: "Piscina Municipal",
    facilityImage: "/placeholder.svg?height=200&width=300",
    date: "Miércoles 7 de abril de 2025",
    time: "10:00 - 11:00",
    dateTime: new Date(2025, 3, 7, 10, 0, 0),
    location: "Complejo Deportivo Municipal",
    status: "pendiente",
    canCancel: true,
    paymentMethod: "Depósito bancario",
    paymentStatus: "Pendiente de verificación",
    paymentAmount: "S/. 15.00",
    paymentDate: "Pendiente",
    userDetails: { name: "Juan Pérez García", email: "juan.perez@example.com", phone: "987654321" },
    additionalInfo: "Traer gorro de baño obligatorio.",
    createdAt: "3 de abril de 2025, 09:15",
  },
    {
    id: 3,
    reservationNumber: "RES-12347",
    facilityId: 3,
    facilityName: "Gimnasio Municipal",
    facilityImage: "/placeholder.svg?height=200&width=300",
    date: "Viernes 2 de abril de 2025", // Fecha pasada para probar lógica
    time: "16:00 - 17:00",
    dateTime: new Date(2025, 3, 2, 16, 0, 0),
    location: "Complejo Deportivo Municipal",
    status: "completada",
    canCancel: false,
    paymentMethod: "Tarjeta de crédito",
    paymentStatus: "Pagado",
    paymentAmount: "S/. 20.00",
    paymentDate: "1 de abril de 2025, 14:20",
    userDetails: { name: "Juan Pérez García", email: "juan.perez@example.com", phone: "987654321" },
    additionalInfo: "Traer toalla personal.",
    createdAt: "1 de abril de 2025, 14:15",
  },
]

// Importar el hook useParams de next/navigation

export default function ReservaDetalle() {
  // Usar el hook useParams para obtener los parámetros de la ruta de forma segura
  const params = useParams();
  const reservaId = params.id as string;
  const router = useRouter(); // Importar useRouter para redireccionar

  // Usar tipo específico y estado para cancelación
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { addNotification } = useNotification(); // Obtener función del contexto
  useEffect(() => {
    // No cargar nada si el ID no está disponible aún
    if (!reservaId) return;

    // Cargar datos reales del backend
    const fetchReservationDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
          method: 'GET',
          credentials: 'include', // Para enviar cookies de sesión
          headers: {
            'Accept': 'application/json',
            'Origin': FRONTEND_URL
          }
        });

        if (!response.ok) {
          throw new Error(`Error al obtener detalles de la reserva: ${response.status}`);
        }

        const reservaData = await response.json();
        console.log('Datos de reserva obtenidos:', reservaData);

        // Verificar si tenemos la información de precio de la instalación
        if (reservaData.instalacion && reservaData.instalacion.precio) {
          console.log('Precio por hora de la instalación:', reservaData.instalacion.precio);
        } else {
          console.warn('No se encontró el precio de la instalación en la respuesta. Intentando cargar la instalación...');

          // Si no tenemos la información completa de la instalación, intentamos cargarla
          if (reservaData.instalacionId) {
            try {
              const instalacionResponse = await fetch(`${API_BASE_URL}/instalaciones/${reservaData.instalacionId}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Origin': FRONTEND_URL
                }
              });

              if (instalacionResponse.ok) {
                const instalacionData = await instalacionResponse.json();
                console.log('Datos de instalación cargados:', instalacionData);

                // Añadir la información de la instalación a los datos de la reserva
                reservaData.instalacion = instalacionData;
              } else {
                console.error('No se pudo cargar la información de la instalación');
              }
            } catch (error) {
              console.error('Error al cargar la información de la instalación:', error);
            }
          }
        }

        // También obtener detalles de pago si existe
        let pagoData = null;        try {
          const pagoResponse = await fetch(`${API_BASE_URL}/pagos/reserva/${reservaId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Origin': FRONTEND_URL
            }
          });

          if (pagoResponse.ok) {
            pagoData = await pagoResponse.json();
            console.log('Datos de pago obtenidos:', pagoData);
            console.log('URL del comprobante:', pagoData.urlComprobante || pagoData.url_comprobante);
          } else if (reservaData.metodoPago === 'deposito') {
            // Si no hay datos de pago pero es depósito bancario, podría ser que no se haya creado el registro correctamente
            console.log('Reserva con depósito bancario sin registro de pago. Verificando comprobante...');
            console.log('Estado de pago en reserva:', reservaData.estadoPago);
            console.log('Método de pago en reserva:', reservaData.metodoPago);
          }
        } catch (error) {
          console.warn('No se pudieron obtener datos de pago:', error);
        }

        // Formatear los datos obtenidos al formato que necesita la interfaz
        // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
        const datePart = reservaData.fecha.split('T')[0];
        // Crear la fecha con la hora a mediodía para evitar problemas de zona horaria
        const fechaReserva = new Date(`${datePart}T12:00:00`);
        const horaInicio = reservaData.horaInicio.substring(0, 5);
        const horaFin = reservaData.horaFin.substring(0, 5);

        // Crear el objeto dateTime para cálculos
        const [horaI, minI] = horaInicio.split(':').map(Number);
        const dateTime = new Date(fechaReserva);
        dateTime.setHours(horaI, minI, 0);

        const formattedReservation: ReservationDetails = {
          id: reservaData.id,
          reservationNumber: `RES-${reservaData.id}`,
          facilityId: reservaData.instalacion?.id || reservaData.instalacionId,
          facilityName: reservaData.instalacionNombre,
          facilityImage: reservaData.instalacionImagenUrl || "/placeholder.svg?height=200&width=300",
          date: new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(fechaReserva),
          time: `${horaInicio} - ${horaFin}`,
          dateTime: dateTime,
          location: reservaData.instalacionUbicacion || "Instalación Deportiva Municipal",
          status: reservaData.estado as ReservationDetails['status'],
          canCancel: false, // Se calculará con la función checkCancellationEligibility
          paymentMethod: pagoData
            ? (pagoData.metodo === 'deposito' ? 'Depósito bancario' : 'Tarjeta de crédito')
            : reservaData.metodoPago
              ? (reservaData.metodoPago === 'deposito' ? 'Depósito bancario' : 'Tarjeta de crédito')
              : 'Pendiente',
          paymentStatus: pagoData ? pagoData.estado.charAt(0).toUpperCase() + pagoData.estado.slice(1).toLowerCase() : (reservaData.estadoPago ? reservaData.estadoPago.charAt(0).toUpperCase() + reservaData.estadoPago.slice(1).toLowerCase() : 'Pendiente'),
          // Siempre calcular el precio basado en la duración de la reserva
          paymentAmount: (() => {
            // Siempre calcular el precio basado en la duración si tenemos los datos necesarios
            if (horaInicio && horaFin && reservaData.instalacion?.precio) {
              const totalPrice = calculateTotalPrice(
                reservaData.instalacion.precio,
                horaInicio,
                horaFin
              );
              console.log(`Calculando precio para ${horaInicio} - ${horaFin} con precio por hora ${reservaData.instalacion.precio}: ${totalPrice}`);
              return formatPrice(totalPrice);
            }

            // Si no podemos calcular con la duración pero tenemos datos de pago, usar el monto del pago
            if (pagoData && pagoData.monto) {
              return `S/. ${pagoData.monto}`;
            }

            // Si no podemos calcular de ninguna forma, mostrar pendiente
            return 'Pendiente';
          })(),          paymentDate: pagoData && pagoData.createdAt
                        ? new Intl.DateTimeFormat('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(new Date(pagoData.createdAt))
                        : reservaData.createdAt
                          ? new Intl.DateTimeFormat('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(new Date(reservaData.createdAt))
                          : 'Pendiente',
          // Asegurarse de que la URL del comprobante sea válida
          paymentReceiptUrl: pagoData && (pagoData.urlComprobante || pagoData.url_comprobante)
                            ? (pagoData.urlComprobante || pagoData.url_comprobante)
                            : null,
          userDetails: {
            name: reservaData.usuarioNombre || 'Usuario',
            email: reservaData.usuario?.email || '',
            phone: reservaData.usuario?.telefono || '',
          },
          additionalInfo: reservaData.comentarios || 'Sin comentarios adicionales',
          createdAt: new Date(reservaData.createdAt || Date.now()).toLocaleString('es-ES'),
        };

        setReservation(formattedReservation);
      } catch (error) {
        console.error('Error al cargar los detalles de la reserva:', error);
        // Si tenemos reservas de ejemplo cargadas, podríamos mostrar una como fallback
        const fallbackReservation = reservationsDB.find(r => r.id === Number.parseInt(reservaId));
        if (fallbackReservation) {
          console.log('Usando reserva de fallback');
          setReservation(fallbackReservation);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();  }, [reservaId])

  const getStatusBadge = (status: ReservationDetails['status']) => {
    if (status === "confirmada") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>;
    } else if (status === "pendiente") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
    } else if (status === "completada") {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completada</Badge>;
    } else if (status === "cancelada") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Desconocido</Badge>;
    }
  }

  // --- Función para verificar elegibilidad de cancelación (Regla 48h) ---
  const checkCancellationEligibility = (res: ReservationDetails | null): boolean => {
    if (!res || res.status === 'completada' || res.status === 'cancelada' || !res.dateTime) {
      return false;
    }
    const now = new Date();
    // Asegurarse que dateTime es un objeto Date
    const reservationDate = res.dateTime instanceof Date ? res.dateTime : new Date(res.dateTime);
     if (isNaN(reservationDate.getTime())) {
        console.error("Fecha de reserva inválida:", res.dateTime);
        return false; // No se puede cancelar si la fecha es inválida
    }
    const hoursDifference = differenceInHours(reservationDate, now);
    return hoursDifference >= 48;
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;

    setIsCancelling(true);
    console.log("Cancelando reserva ID:", reservation.id);

    try {
      // Llamar al backend para cancelar la reserva
      const motivo = "Cancelada por el usuario";
      const response = await fetch(`${API_BASE_URL}/reservas/${reservation.id}/cancelar?motivo=${encodeURIComponent(motivo)}`, {
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

      // Actualizar el estado local de la reserva
      setReservation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'cancelada',
          canCancel: false // Actualizar también canCancel si se usa en otro lado
        }
      });

      // Añadir notificación de cancelación usando los detalles de la reserva actual
      await addNotification({
        title: reservation.status === "pendiente" ? "Solicitud Cancelada" : "Reserva Cancelada",
        message: `Tu ${reservation.status === "pendiente" ? "solicitud de reserva" : "reserva"} para ${reservation.facilityName} (${reservation.time} el ${reservation.date}) ha sido cancelada.`,
        type: "reserva",
      });

      console.log("Cancelación completada con éxito");

      // Esperar un momento para que el usuario vea la notificación
      setTimeout(() => {
        // Redirigir a la lista de reservas
        router.push('/mis-reservas');
      }, 1000);
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);

      // Notificar al usuario sobre el error
      await addNotification({
        title: "Error al cancelar",
        message: "No se pudo cancelar la reserva. Por favor, intenta de nuevo más tarde.",
        type: "reserva",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false); // Cerrar el diálogo
    }
  }


  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando detalles de la reserva...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!reservation) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Reserva no encontrada</CardTitle>
              <CardDescription>La reserva que estás buscando no existe o ha sido eliminada.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-primary hover:bg-primary-light">
                <Link href="/mis-reservas">Ver mis reservas</Link>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/mis-reservas" className="text-primary hover:underline">
              &larr; Volver a mis reservas
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Reserva #{reservation.reservationNumber}
                    {getStatusBadge(reservation.status)}
                  </CardTitle>
                  <CardDescription>Creada el {reservation.createdAt}</CardDescription>
                </div>                <div className="flex gap-2">
                  {/* Botones de acción en orden:
                      1. Descargar comprobante (izquierda) - Aparece solo cuando hay comprobante
                      2. Cancelar reserva (derecha) - Aparece solo cuando es elegible para cancelar */}

                  {/* Primer botón: "Descargar comprobante" */}
                  {reservation.paymentReceiptUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {                        // Iniciar la descarga del archivo usando la API de descarga del navegador
                        const url = `${API_BASE_URL.replace('/api', '')}${reservation.paymentReceiptUrl}`;
                        const fileName = reservation.paymentReceiptUrl?.split('/').pop() || 'comprobante.jpg';

                        // Usar fetch para obtener el archivo como blob
                        fetch(url)
                          .then(response => response.blob())
                          .then(blob => {
                            // Crear una URL para el blob
                            const blobUrl = window.URL.createObjectURL(blob);

                            // Crear un enlace temporal para la descarga
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = fileName;

                            // Simular clic para iniciar la descarga
                            document.body.appendChild(link);
                            link.click();

                            // Limpiar después de la descarga
                            window.URL.revokeObjectURL(blobUrl);
                            document.body.removeChild(link);
                          })
                          .catch(error => {
                            console.error('Error al descargar el archivo:', error);
                            alert('Hubo un problema al descargar el comprobante. Por favor, intenta de nuevo.');
                          });
                      }}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Descargar comprobante
                    </Button>
                  )}

                  {/* Segundo botón: "Cancelar Reserva" o "Cancelar Solicitud" según el estado */}
                  {checkCancellationEligibility(reservation) && (
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          {reservation.status === "pendiente" ? "Cancelar Solicitud" : "Cancelar Reserva"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {reservation.status === "pendiente" ? "Cancelar Solicitud de Reserva" : "Cancelar Reserva"}
                          </DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas cancelar esta {reservation.status === "pendiente" ? "solicitud de reserva" : "reserva"}?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-4 py-4">
                          <div className="bg-red-100 p-3 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium">Política de cancelación</p>
                            <p className="text-sm text-gray-500">
                              Recuerda que solo puedes cancelar hasta 48 horas antes de la fecha reservada. Pasado este
                              tiempo, no habrá reembolso.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Volver
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelReservation}
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={reservation.facilityImage || "/placeholder.svg"}
                    alt={reservation.facilityName}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold mb-4">{reservation.facilityName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p>{reservation.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Horario</p>
                        <p>{reservation.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">                      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p>{reservation.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Reservado por</p>
                        <p>{reservation.userDetails.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Detalles del pago</h3>

                {/* Mensaje informativo sobre el cálculo del precio */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-700">
                        El precio se calcula multiplicando el precio por hora de la instalación por la duración de la reserva.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">                      <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Método de pago</p>
                        <p>{reservation.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-gray-500">Estado del pago</p>
                        <p>{reservation.paymentStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monto</p>
                      <p className="font-medium">{reservation.paymentAmount}</p>
                      {reservation.time && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Calculado según duración: {reservation.time}
                          </p>
                          {reservation.facilityId && (
                            <p className="text-xs text-gray-500 italic">
                              Precio calculado por hora × duración en horas
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de pago</p>
                      <p>{reservation.paymentDate}</p>
                    </div>

                    </div>
                </div>
              </div>              {/* Mostrar comprobante de pago si es método depósito y tiene URL de comprobante (en cualquier estado) */}
              {(reservation.paymentMethod === "Depósito bancario" || reservation.paymentMethod === "deposito") && (                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Comprobante de pago</h3>
                  {reservation.paymentReceiptUrl ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex flex-col items-center">                        <img
                          src={`${API_BASE_URL.replace('/api', '')}${reservation.paymentReceiptUrl}`}
                          alt="Comprobante de depósito bancario"
                          className="max-w-full max-h-96 object-contain rounded-md mb-4"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg?text=Comprobante+no+disponible";
                            target.alt = "Comprobante no disponible";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">                      <p className="text-yellow-700 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        No se encontró el comprobante de pago. Contacta a soporte si realizaste el depósito.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium mb-4">Información adicional</h3>
                <p className="text-gray-700">{reservation.additionalInfo}</p>
              </div>

              <div className="bg-primary-pale p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Información importante</h3>
                <ul className="space-y-2 text-gray-700">                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Presenta tu comprobante de reserva al llegar a la instalación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Llega con al menos 10 minutos de anticipación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Respeta las normas de uso de la instalación.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4">
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href={`/instalaciones/${reservation.facilityId}`}>Ver instalación</Link>
              </Button>
              <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary-light">
                <Link href="/contacto">¿Necesitas ayuda?</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
