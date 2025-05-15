"use client"

import { useState, useEffect } from "react"
import { use } from "react"
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
    paymentReference: string;
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
    paymentReference: "PAY-987654321",
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
    paymentReference: "Pendiente",
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
    paymentReference: "PAY-987654322",
    userDetails: { name: "Juan Pérez García", email: "juan.perez@example.com", phone: "987654321" },
    additionalInfo: "Traer toalla personal.",
    createdAt: "1 de abril de 2025, 14:15",
  },
]

export default function ReservaDetalle({ params }: { params: { id: string } }) {
  // Usar React.use() para desenvolver params y obtener id de manera segura
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  // Usar tipo específico y estado para cancelación
  const [reservation, setReservation] = useState<ReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { addNotification } = useNotification() // Obtener función del contexto

  useEffect(() => {
    // Cargar datos reales del backend
    const fetchReservationDetails = async () => {
      setLoading(true)
      // Usar el id que ya fue extraído con React.use()
      const reservaId = id;
      try {
        const response = await fetch(`http://localhost:8080/api/reservas/${reservaId}`, {
          method: 'GET',
          credentials: 'include', // Para enviar cookies de sesión
          headers: {
            'Accept': 'application/json',
            'Origin': 'http://localhost:3000'
          }
        });

        if (!response.ok) {
          throw new Error(`Error al obtener detalles de la reserva: ${response.status}`);
        }

        const reservaData = await response.json();
        console.log('Datos de reserva obtenidos:', reservaData);
        
        // También obtener detalles de pago si existe
        let pagoData = null;
        try {
          const pagoResponse = await fetch(`http://localhost:8080/api/pagos/reserva/${reservaId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Origin': 'http://localhost:3000'
            }
          });
          
          if (pagoResponse.ok) {
            pagoData = await pagoResponse.json();
            console.log('Datos de pago obtenidos:', pagoData);
          }
        } catch (error) {
          console.warn('No se pudieron obtener datos de pago:', error);
        }
        
        // Formatear los datos obtenidos al formato que necesita la interfaz
        const fechaReserva = new Date(reservaData.fecha);
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
          paymentMethod: pagoData ? (pagoData.metodo === 'deposito' ? 'Depósito bancario' : 'Tarjeta de crédito') : reservaData.metodoPago || 'Pendiente',
          paymentStatus: pagoData ? pagoData.estado : reservaData.estadoPago || 'Pendiente',
          paymentAmount: pagoData ? `S/. ${pagoData.monto}` : 'Pendiente',
          paymentDate: pagoData && pagoData.createdAt ? new Intl.DateTimeFormat('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(pagoData.createdAt)) : 'Pendiente',
          paymentReference: pagoData ? pagoData.referencia_transaccion || 'No disponible' : 'Pendiente',
          paymentReceiptUrl: pagoData?.url_comprobante || null,
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

    fetchReservationDetails();
  }, [id])

  const getStatusBadge = (status: ReservationDetails['status']) => {
    switch (status) {
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case "completada":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completada</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
      default:
        return null
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

  const handleCancelReservation = () => {
    if (!reservation) return;

    setIsCancelling(true);
    console.log("Simulando cancelación para reserva ID:", reservation.id);

    // Simular llamada a API
    setTimeout(() => {
      // Actualizar el estado local de la reserva
      setReservation((prev) => {
          if (!prev) return null;
          return {
              ...prev,
              status: 'cancelada',
              canCancel: false // Actualizar también canCancel si se usa en otro lado
          }
      });
      setIsCancelling(false);
      setShowCancelDialog(false); // Cerrar el diálogo
      console.log("Cancelación simulada completada.");
      // Añadir notificación de cancelación usando los detalles de la reserva actual
      addNotification({
          title: "Reserva Cancelada",
          message: `Tu reserva para ${reservation.facilityName} (${reservation.time} el ${reservation.date}) ha sido cancelada.`,
          type: "reserva",
      });
      // Aquí podrías mostrar un toast de éxito
    }, 1500);
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
                </div>
                <div className="flex gap-2">
                  {/* Mostrar botón de descargar comprobante para todos los pagos con depósito bancario, independientemente del estado */}
                  {reservation.paymentMethod === "Depósito bancario" && reservation.paymentReceiptUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => window.open(reservation.paymentReceiptUrl || '', '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Descargar comprobante
                    </Button>
                  )}
                  {/* Usar la función de elegibilidad */}
                  {checkCancellationEligibility(reservation) && (
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Cancelar Reserva
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancelar Reserva</DialogTitle>
                          <DialogDescription>¿Estás seguro de que deseas cancelar esta reserva?</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-4 py-4">
                          <div className="bg-red-100 p-3 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
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
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p>{reservation.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Horario</p>
                        <p>{reservation.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p>{reservation.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Método de pago</p>
                        <p>{reservation.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Estado del pago</p>
                        <p>{reservation.paymentStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monto</p>
                      <p className="font-medium">{reservation.paymentAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de pago</p>
                      <p>{reservation.paymentDate}</p>
                    </div>
                    {reservation.paymentReference !== "Pendiente" && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Referencia de pago</p>
                        <p>{reservation.paymentReference}</p>
                      </div>
                    )}
                    
                    {/* Mostrar comprobante de pago si es método depósito y tiene URL de comprobante (en cualquier estado) */}
                    {reservation.paymentMethod === "Depósito bancario" && reservation.paymentReceiptUrl && (
                      <div className="md:col-span-2 mt-4">
                        <p className="text-sm text-gray-500 mb-2">Comprobante de pago</p>
                        <div className="border rounded-md p-2 bg-white">
                          <img 
                            src={reservation.paymentReceiptUrl} 
                            alt="Comprobante de pago" 
                            className="w-full max-h-80 object-contain"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?text=Comprobante+no+disponible";
                              target.alt = "Comprobante no disponible";
                            }}
                          />
                          <div className="mt-2 text-center">
                            <a 
                              href={reservation.paymentReceiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Ver comprobante completo
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Información adicional</h3>
                <p className="text-gray-700">{reservation.additionalInfo}</p>
              </div>

              <div className="bg-primary-pale p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Información importante</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Presenta tu comprobante de reserva al llegar a la instalación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Llega con al menos 10 minutos de anticipación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
