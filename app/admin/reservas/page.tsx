"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { createDateFromBackend, formatDateShort } from "@/lib/date-utils"
import { useToast } from "@/components/ui/use-toast"
import { useNotification } from "@/context/NotificationContext"
import { FormEvent } from "react"
import { API_BASE_URL } from "@/lib/config"
import { Search, Calendar, CheckCircle, Eye, X, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Importación de componentes
import {
  ReservationDetails,
  ActionDialogs,
} from "./components"
import { getStatusBadge, getPaymentStatusBadge } from "./components/utils"

// Tipos
interface Reservation {
  id: number
  reservationNumber: string
  facilityId: number
  facilityName: string
  facilityImage: string
  date: string
  time: string
  location: string
  status: "pendiente" | "confirmada" | "completada" | "cancelada"
  paymentMethod: string
  paymentStatus: string
  paymentAmount: string
  paymentDate: string
  paymentReference?: string
  urlComprobante?: string
  userDetails: {
    name: string
    dni: string
    email: string
    phone: string
  }
  createdAt: string
  additionalInfo?: string
}

// Interfaz para los datos que vienen del backend
interface ReservaBackend {
  id: number
  usuarioNombre: string
  instalacionNombre: string
  instalacionUbicacion: string
  metodoPago: string
  instalacionImagenUrl: string
  fecha: string // Formato: YYYY-MM-DD
  horaInicio: string // Formato: HH:MM:SS
  horaFin: string // Formato: HH:MM:SS
  estado: string
  estadoPago: string
}

// Función para determinar si el usuario actual es el propietario de la reserva
// En el contexto de administración, siempre devuelve false porque el admin no es el propietario
const esPropietario = (reservation: Reservation): boolean => {
  return false; // En la vista de admin, nunca somos el propietario de la reserva
}

export default function ReservasAdmin() {
  const { toast } = useToast()
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [allReservations, setAllReservations] = useState<Reservation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    // Cargar datos reales del backend
    const loadData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/reservas/admin`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error al cargar reservas: ${response.status}`);
        }

        const data: ReservaBackend[] = await response.json();

        // Transformar los datos del backend al formato que espera el frontend
        const transformedData: Reservation[] = data.map(reserva => {
          // Formatear la fecha usando utilidad
          const formattedDate = formatDateShort(reserva.fecha);

          // Formatear la hora
          const horaInicio = reserva.horaInicio.substring(0, 5); // HH:MM
          const horaFin = reserva.horaFin.substring(0, 5); // HH:MM
          const timeRange = `${horaInicio} - ${horaFin}`;

          // Calcular el precio (simulado por ahora)
          const precio = Math.floor(Math.random() * 100) + 20;

          return {
            id: reserva.id,
            reservationNumber: `RES-${reserva.id}`,
            facilityId: 0, // No tenemos este dato directamente
            facilityName: reserva.instalacionNombre,
            facilityImage: reserva.instalacionImagenUrl || "/placeholder.svg?height=200&width=300",
            date: formattedDate,
            time: timeRange,
            location: reserva.instalacionUbicacion,
            status: reserva.estado as "pendiente" | "confirmada" | "completada" | "cancelada",
            paymentMethod: reserva.metodoPago || "No especificado",
            paymentStatus: reserva.estadoPago || 'Pendiente',
            paymentAmount: `S/. ${precio.toFixed(2)}`,
            paymentDate: formattedDate, // Usamos la misma fecha por ahora
            userDetails: {
              name: reserva.usuarioNombre,
              dni: "No disponible", // No tenemos este dato directamente
              email: "No disponible", // No tenemos este dato directamente
              phone: "No disponible", // No tenemos este dato directamente
            },
            createdAt: formattedDate,
          };
        });

        // Ordenar las reservas de mayor a menor número de reserva (ID)
        const sortedData = transformedData.sort((a, b) => b.id - a.id);
        setReservations(sortedData);

        // Guardar todas las reservas para filtrado posterior
        setAllReservations(sortedData);
      } catch (error) {
        console.error("Error al cargar reservas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las reservas. Intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [])

  const handleSearch = async (e: FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsLoading(true)
    try {
      // Construir la URL con los parámetros de búsqueda
      let url = `${API_BASE_URL}/reservas/admin/filtrar?`;
      if (searchQuery) {
        url += `texto=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        url += `${searchQuery ? '&' : ''}fecha=${formattedDate}`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al filtrar reservas: ${response.status}`);
      }

      const data: ReservaBackend[] = await response.json();

      // Transformar los datos del backend al formato que espera el frontend
      const transformedData: Reservation[] = data.map(reserva => {
        // Formatear la fecha usando utilidad
        const formattedDate = formatDateShort(reserva.fecha);

        // Formatear la hora
        const horaInicio = reserva.horaInicio.substring(0, 5); // HH:MM
        const horaFin = reserva.horaFin.substring(0, 5); // HH:MM
        const timeRange = `${horaInicio} - ${horaFin}`;

        // Calcular el precio (simulado por ahora)
        const precio = Math.floor(Math.random() * 100) + 20;

        return {
          id: reserva.id,
          reservationNumber: `RES-${reserva.id}`,
          facilityId: 0, // No tenemos este dato directamente
          facilityName: reserva.instalacionNombre,
          facilityImage: reserva.instalacionImagenUrl || "/placeholder.svg?height=200&width=300",
          date: formattedDate,
          time: timeRange,
          location: reserva.instalacionUbicacion,
          status: reserva.estado as "pendiente" | "confirmada" | "completada" | "cancelada",
          paymentMethod: reserva.metodoPago || "No especificado",
          paymentStatus: reserva.estadoPago || 'Pendiente',
          paymentAmount: `S/. ${precio.toFixed(2)}`,
          paymentDate: formattedDate, // Usamos la misma fecha por ahora
          userDetails: {
            name: reserva.usuarioNombre,
            dni: "No disponible", // No tenemos este dato directamente
            email: "No disponible", // No tenemos este dato directamente
            phone: "No disponible", // No tenemos este dato directamente
          },
          createdAt: formattedDate,
        };
      });

      // Ordenar las reservas de mayor a menor número de reserva (ID)
      const sortedData = transformedData.sort((a, b) => b.id - a.id);
      setReservations(sortedData);
    } catch (error) {
      console.error("Error al filtrar reservas:", error);
      toast({
        title: "Error",
        description: "No se pudieron filtrar las reservas. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Modificar useEffect para guardar todas las reservas
  useEffect(() => {
    if (reservations.length > 0 && activeTab === "todas") {
      setAllReservations(reservations);
    }
  }, [reservations, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Si no tenemos datos almacenados, no podemos filtrar
    if (allReservations.length === 0) return;

    // Filtrar según la pestaña seleccionada usando los datos almacenados
    if (value === "todas") {
      setReservations(allReservations);
    } else {
      const filteredReservations = allReservations.filter(reservation => {
        if (value === "confirmadas") return reservation.status === "confirmada";
        if (value === "pendientes") return reservation.status === "pendiente";
        if (value === "completadas") return reservation.status === "completada";
        if (value === "canceladas") return reservation.status === "cancelada";
        return true; // Por defecto, mostrar todas
      });

      // Mantener el orden de mayor a menor número de reserva
      setReservations(filteredReservations);
    }
  }

  const handleDateFilter = async (date: Date | undefined) => {
    setSelectedDate(date)

    // Si se selecciona una fecha, realizar la búsqueda automáticamente
    if (date) {
      setIsLoading(true)
      try {
        // Construir la URL con el parámetro de fecha
        const formattedDate = format(date, "yyyy-MM-dd");
        const url = `${API_BASE_URL}/reservas/admin/filtrar?fecha=${formattedDate}`;

        console.log("Filtrando por fecha:", formattedDate);

        const response = await fetch(url, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error al filtrar reservas por fecha: ${response.status}`);
        }

        const data: ReservaBackend[] = await response.json();

        // Transformar los datos del backend al formato que espera el frontend
        const transformedData: Reservation[] = data.map(reserva => {
          // Formatear la fecha usando utilidad
          const formattedDate = formatDateShort(reserva.fecha);

          // Formatear la hora
          const horaInicio = reserva.horaInicio.substring(0, 5); // HH:MM
          const horaFin = reserva.horaFin.substring(0, 5); // HH:MM
          const timeRange = `${horaInicio} - ${horaFin}`;

          // Calcular el precio (simulado por ahora)
          const precio = Math.floor(Math.random() * 100) + 20;

          return {
            id: reserva.id,
            reservationNumber: `RES-${reserva.id}`,
            facilityId: 0,
            facilityName: reserva.instalacionNombre,
            facilityImage: reserva.instalacionImagenUrl || "/placeholder.svg?height=200&width=300",
            date: formattedDate,
            time: timeRange,
            location: reserva.instalacionUbicacion,
            status: reserva.estado as "pendiente" | "confirmada" | "completada" | "cancelada",
            paymentMethod: reserva.metodoPago || "No especificado",
            paymentStatus: reserva.estadoPago || 'Pendiente',
            paymentAmount: `S/. ${precio.toFixed(2)}`,
            paymentDate: formattedDate,
            userDetails: {
              name: reserva.usuarioNombre,
              dni: "No disponible",
              email: "No disponible",
              phone: "No disponible",
            },
            createdAt: formattedDate,
          };
        });

        setReservations(transformedData);

        // Actualizar la pestaña activa a "todas" para mostrar todos los resultados filtrados
        setActiveTab("todas");
      } catch (error) {
        console.error("Error al filtrar por fecha:", error);
        toast({
          title: "Error",
          description: "No se pudieron filtrar las reservas por fecha. Intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Si se limpia la fecha, cargar todas las reservas nuevamente
      try {
        const response = await fetch(`${API_BASE_URL}/reservas/admin`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();

          // Transformar los datos como en handleTabChange
          const transformedData = data.map((reserva: ReservaBackend) => {
            const formattedDate = formatDateShort(reserva.fecha);

            const horaInicio = reserva.horaInicio.substring(0, 5);
            const horaFin = reserva.horaFin.substring(0, 5);
            const timeRange = `${horaInicio} - ${horaFin}`;

            const precio = Math.floor(Math.random() * 100) + 20;

            return {
              id: reserva.id,
              reservationNumber: `RES-${reserva.id}`,
              facilityId: 0,
              facilityName: reserva.instalacionNombre,
              facilityImage: reserva.instalacionImagenUrl || "/placeholder.svg?height=200&width=300",
              date: formattedDate,
              time: timeRange,
              location: reserva.instalacionUbicacion,
              status: reserva.estado as "pendiente" | "confirmada" | "completada" | "cancelada",
              paymentMethod: reserva.metodoPago || "No especificado",
              paymentStatus: reserva.estadoPago || 'Pendiente',
              paymentAmount: `S/. ${precio.toFixed(2)}`,
              paymentDate: formattedDate,
              userDetails: {
                name: reserva.usuarioNombre,
                dni: "No disponible",
                email: "No disponible",
                phone: "No disponible",
              },
              createdAt: formattedDate,
            };
          });

          // Ordenar las reservas de mayor a menor número de reserva (ID)
          const sortedData = transformedData.sort((a: Reservation, b: Reservation) => b.id - a.id);
          setReservations(sortedData);
        }
      } catch (error) {
        console.error("Error al cargar todas las reservas:", error);
      }
    }
  }

  const handleViewDetails = async (reservation: Reservation) => {
    setIsLoading(true)
    try {
      console.log('Obteniendo detalles de reserva ID:', reservation.id);

      // Obtener detalles completos de la reserva
      const response = await fetch(`${API_BASE_URL}/reservas/${reservation.id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al obtener detalles de la reserva: ${response.status}`);
      }

      const reservaData = await response.json();
      console.log('Datos completos de reserva:', reservaData);

      // Obtener datos del usuario de forma más completa
      let userData = null;
      try {
        // Verificar si tenemos el ID del usuario
        if (!reservaData.usuarioId) {
          console.warn('No se encontró usuarioId en los datos de la reserva');
        } else {
          console.log('Obteniendo datos del usuario ID:', reservaData.usuarioId);

          // Intentar obtener el usuario por su ID directamente
          try {
            const userResponse = await fetch(`${API_BASE_URL}/usuarios/${reservaData.usuarioId}`, {
              credentials: 'include'
            });

            if (userResponse.ok) {
              userData = await userResponse.json();
              console.log('Datos del usuario obtenidos directamente:', userData);
            } else {
              console.warn(`No se pudo obtener el usuario por ID: ${userResponse.status}`);
            }
          } catch (userError) {
            console.error('Error al obtener usuario por ID:', userError);
          }

          // Si no se pudo obtener por ID, intentar con la lista de vecinos
          if (!userData) {
            try {
              console.log('Intentando obtener usuario de la lista de vecinos');
              const vecinosResponse = await fetch(`${API_BASE_URL}/usuarios/allVecinos`, {
                credentials: 'include'
              });

              if (vecinosResponse.ok) {
                const vecinos = await vecinosResponse.json();
                console.log('Total de vecinos obtenidos:', vecinos.length);

                // Buscar el usuario por ID en la lista de vecinos
                const foundVecino = vecinos.find((v: any) => v.id === reservaData.usuarioId);
                if (foundVecino) {
                  console.log('Usuario encontrado en la lista de vecinos:', foundVecino);
                  userData = foundVecino;
                }
              }
            } catch (vecinosError) {
              console.error('Error al obtener lista de vecinos:', vecinosError);
            }
          }

          // Si aún no tenemos datos, intentar con la lista general de usuarios
          if (!userData) {
            try {
              console.log('Intentando obtener de la lista general de usuarios');
              const allUsersResponse = await fetch(`${API_BASE_URL}/usuarios`, {
                credentials: 'include'
              });

              if (allUsersResponse.ok) {
                const allUsers = await allUsersResponse.json();
                console.log('Total de usuarios obtenidos:', allUsers.length);

                // Buscar el usuario por ID
                const foundUser = allUsers.find((u: any) => u.id === reservaData.usuarioId);
                if (foundUser) {
                  console.log('Usuario encontrado en la lista general:', foundUser);
                  userData = foundUser;
                }
              }
            } catch (allUsersError) {
              console.error('Error al obtener lista general de usuarios:', allUsersError);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }

      // Obtener datos del pago
      let pagoData = null;
      try {
        console.log('Obteniendo datos del pago para reserva ID:', reservation.id);

        const pagoResponse = await fetch(`${API_BASE_URL}/pagos/reserva/${reservation.id}`, {
          credentials: 'include'
        });

        console.log('Respuesta de pago:', {
          status: pagoResponse.status,
          statusText: pagoResponse.statusText
        });

        if (pagoResponse.ok) {
          pagoData = await pagoResponse.json();
          console.log('Datos del pago:', pagoData);
        }
      } catch (error) {
        console.error('Error al obtener datos del pago:', error);
      }

      // Obtener datos de la instalación para calcular el precio correcto
      let instalacionData = null;
      try {
        if (reservaData.instalacionId) {
          const instalacionResponse = await fetch(`${API_BASE_URL}/instalaciones/${reservaData.instalacionId}`, {
            credentials: 'include'
          });

          if (instalacionResponse.ok) {
            instalacionData = await instalacionResponse.json();
            console.log('Datos de la instalación:', instalacionData);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de la instalación:', error);
      }

      // Formatear fechas correctamente
      const datePart = reservaData.fecha.split('T')[0];
      const fechaObj = new Date(`${datePart}T12:00:00`);
      const formattedDate = fechaObj.toLocaleDateString("es-ES");

      // Formatear la hora
      const horaInicio = reservaData.horaInicio.substring(0, 5); // HH:MM
      const horaFin = reservaData.horaFin.substring(0, 5); // HH:MM
      const timeRange = `${horaInicio} - ${horaFin}`;

      // Calcular el precio basado en la duración y el precio por hora
      let calculatedAmount = '';
      if (instalacionData?.precio && horaInicio && horaFin) {
        // Importar las funciones de cálculo de precio
        const { calculateTotalPrice, formatPrice } = await import('@/lib/price-utils');

        const totalPrice = calculateTotalPrice(
          instalacionData.precio,
          horaInicio,
          horaFin
        );
        calculatedAmount = formatPrice(totalPrice);
        console.log(`Precio calculado para ${horaInicio}-${horaFin} con tarifa ${instalacionData.precio}: ${calculatedAmount}`);
      }

      // Extraer datos del usuario de la reserva si están disponibles
      const usuarioData = reservaData.usuario || {};

      // Crear objeto de reserva con datos completos
      const detailedReservation = {
        ...reservation,
        date: formattedDate,
        time: timeRange,
        createdAt: new Date(reservaData.createdAt || Date.now()).toLocaleDateString("es-ES", {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        paymentDate: pagoData?.createdAt
          ? new Date(pagoData.createdAt).toLocaleDateString("es-ES", {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : formattedDate,
        // Priorizar el monto calculado, luego el del pago, y finalmente el de la reserva
        paymentAmount: calculatedAmount || (pagoData?.monto ? `S/. ${pagoData.monto}` : reservation.paymentAmount),
        paymentMethod: pagoData?.metodo
          ? (pagoData.metodo === 'deposito' ? 'Depósito bancario' : 'Tarjeta de crédito')
          : reservaData.metodoPago
            ? (reservaData.metodoPago === 'deposito' ? 'Depósito bancario' : 'online')
            : reservation.paymentMethod,
        paymentStatus: pagoData?.estado
          ? pagoData.estado.charAt(0).toUpperCase() + pagoData.estado.slice(1).toLowerCase()
          : reservaData.estadoPago
            ? reservaData.estadoPago.charAt(0).toUpperCase() + reservaData.estadoPago.slice(1).toLowerCase()
            : reservation.paymentStatus,
        userDetails: {
          name: userData?.nombre || usuarioData.nombre || reservaData.usuarioNombre || reservation.userDetails.name,
          dni: userData?.dni || usuarioData.dni || "No disponible",
          email: userData?.email || usuarioData.email || "No disponible",
          phone: userData?.telefono || usuarioData.telefono || "No disponible",
        },
        urlComprobante: pagoData?.urlComprobante || null,
        facilityImage: reservaData.instalacionImagenUrl || reservation.facilityImage || "/placeholder.svg"
      };

      console.log('Datos de reserva procesados:', detailedReservation);

      setSelectedReservation(detailedReservation);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error al obtener detalles completos:', error);
      // Si falla, usar los datos básicos que ya tenemos
      setSelectedReservation(reservation);
      setShowDetailsDialog(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApproveReservation = async () => {
    if (!selectedReservation) return

    setIsLoading(true)
    try {
      console.log("Aprobando reserva ID:", selectedReservation.id);

      // Llamada a la API para aprobar la reserva
      const response = await fetch(`${API_BASE_URL}/reservas/${selectedReservation.id}/aprobar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log de la respuesta completa para depuración
      console.log("Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });

      // Intentar obtener el cuerpo de la respuesta como texto
      const responseText = await response.text();
      console.log("Cuerpo de la respuesta:", responseText);

      if (!response.ok) {
        throw new Error(`Error al aprobar reserva: ${response.status} - ${responseText}`);
      }

      // Actualizar la reserva en el estado local
      const updatedReservations = reservations.map((reservation): Reservation =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              status: "confirmada",
              paymentStatus: "pagado",
            }
          : reservation,
      );

      // Ordenar las reservas de mayor a menor número de reserva (ID)
      const sortedReservations = updatedReservations.sort((a, b) => b.id - a.id);
      setReservations(sortedReservations);
      setShowApproveDialog(false);

      // Mostrar toast de éxito
      toast({
        title: "Pago aprobado",
        description: `Se ha confirmado el pago de la reserva #${selectedReservation.reservationNumber}.`,
      });

      // Agregar notificación al contexto
      addNotification({
        title: "Pago confirmado",
        message: `Se ha confirmado el pago de la reserva #${selectedReservation.reservationNumber}.`,
        type: "reserva"
      });

      setSelectedReservation(null);
    } catch (error) {
      console.error("Error al aprobar reserva:", error);
      toast({
        title: "Error",
        description: `No se pudo aprobar la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    setIsLoading(true)
    try {
      console.log("Cancelando reserva ID:", selectedReservation.id);

      // Llamada a la API para cancelar la reserva sin motivo
      const response = await fetch(`${API_BASE_URL}/reservas/${selectedReservation.id}/cancelar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log de la respuesta completa para depuración
      console.log("Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });

      // Intentar obtener el cuerpo de la respuesta como texto
      const responseText = await response.text();
      console.log("Cuerpo de la respuesta:", responseText);

      if (!response.ok) {
        throw new Error(`Error al cancelar reserva: ${response.status} - ${responseText}`);
      }

      // Actualizar la reserva en el estado local
      const updatedReservations = reservations.map((reservation): Reservation =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              status: "cancelada",
              paymentStatus: esPropietario(selectedReservation) ? "reembolsado" : "fallido",
            }
          : reservation,
      );

      // Ordenar las reservas de mayor a menor número de reserva (ID)
      const sortedReservations = updatedReservations.sort((a, b) => b.id - a.id);
      setReservations(sortedReservations);
      setShowCancelDialog(false);

      // Mostrar toast de cancelación
      toast({
        title: "Reserva cancelada",
        description: `La reserva #${selectedReservation.reservationNumber} ha sido cancelada.`,
        variant: "destructive"
      });

      // Agregar notificación al contexto
      addNotification({
        title: "Reserva cancelada",
        message: `La reserva #${selectedReservation.reservationNumber} ha sido cancelada.`,
        type: "reserva"
      });

      setSelectedReservation(null);
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      toast({
        title: "Error",
        description: `No se pudo cancelar la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Reservas</CardTitle>
          <CardDescription>Administra todas las reservas de instalaciones deportivas</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por número, usuario, instalación o DNI..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-light"
              >
                Buscar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDate
                      ? format(selectedDate, "dd/MM/yyyy", { locale: es })
                      : "Fecha"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-0">
                  <div className="p-2">
                    <CalendarComponent mode="single" selected={selectedDate} onSelect={handleDateFilter} locale={es} />
                    {selectedDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleDateFilter(undefined)}
                      >
                        Limpiar filtro
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </form>

          {/* Pestañas */}
          <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="confirmadas">Confirmadas</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
              <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Reserva</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Instalación</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.length > 0 ? (
                      reservations.map((reservation) => (
                        <TableRow key={reservation.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{reservation.reservationNumber}</TableCell>
                          <TableCell className="font-medium">{reservation.userDetails.name}</TableCell>
                          <TableCell className="font-medium">{reservation.facilityName}</TableCell>
                          <TableCell>
                            {reservation.date ?
                              (() => {
                                try {
                                  if (/^\d{2}\/\d{2}\/\d{4}$/.test(reservation.date)) {
                                    return reservation.date;
                                  }
                                  return new Date(reservation.date).toLocaleDateString("es-ES");
                                } catch (e) {
                                  return reservation.date;
                                }
                              })()
                              : "Fecha no disponible"
                            }
                          </TableCell>
                          <TableCell>{reservation.time}</TableCell>
                          <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(reservation.paymentStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleViewDetails(reservation)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver detalles</span>
                              </Button>
                              {reservation.status === "pendiente" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-green-500"
                                    onClick={() => {
                                      setSelectedReservation(reservation)
                                      setShowApproveDialog(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Aprobar</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedReservation(reservation)
                                      setShowCancelDialog(true)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Rechazar</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                          <div className="text-center py-6">
                            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No se encontraron reservas</h3>
                            <p className="text-gray-500 mt-2">No hay reservas que coincidan con los criterios de búsqueda.</p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => {
                                setSearchQuery("")
                                setSelectedDate(undefined)
                                window.location.reload()
                              }}
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo de detalles de reserva */}
      <ReservationDetails
        showDetailsDialog={showDetailsDialog}
        setShowDetailsDialog={setShowDetailsDialog}
        selectedReservation={selectedReservation}
        setShowApproveDialog={setShowApproveDialog}
        setShowCancelDialog={setShowCancelDialog}
      />

      {/* Diálogos de acción (aprobar/cancelar) */}
      <ActionDialogs
        showApproveDialog={showApproveDialog}
        setShowApproveDialog={setShowApproveDialog}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        selectedReservation={selectedReservation}
        handleApproveReservation={handleApproveReservation}
        handleCancelReservation={handleCancelReservation}
      />
    </div>
  )
}

