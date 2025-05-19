"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { useNotification } from "@/context/NotificationContext"
import { FormEvent } from "react"
import { API_BASE_URL } from "@/lib/config"

// Importación de componentes
import {
  SearchFilters,
  ReservationTabs,
  ReservationDetails,
  ActionDialogs,
} from "./components"

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
          // Formatear la fecha - Corregir problema de zona horaria
          // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
          const datePart = reserva.fecha.split('T')[0];
          // Crear la fecha con la hora a mediodía para evitar problemas de zona horaria
          const fechaObj = new Date(`${datePart}T12:00:00`);
          const formattedDate = format(fechaObj, "dd/MM/yyyy", { locale: es });

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

        setReservations(transformedData);
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

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

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
        // Formatear la fecha - Corregir problema de zona horaria
        // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
        const datePart = reserva.fecha.split('T')[0];
        // Crear la fecha con la hora a mediodía para evitar problemas de zona horaria
        const fechaObj = new Date(`${datePart}T12:00:00`);
        const formattedDate = format(fechaObj, "dd/MM/yyyy", { locale: es });

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

      setReservations(transformedData);
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

  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    setIsLoading(true)

    try {
      // Cargar todas las reservas
      const response = await fetch(`${API_BASE_URL}/reservas/admin`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error al cargar reservas: ${response.status}`);
      }

      const data: ReservaBackend[] = await response.json();

      // Transformar los datos del backend al formato que espera el frontend
      const transformedData: Reservation[] = data.map(reserva => {
        // Formatear la fecha - Corregir problema de zona horaria
        // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
        const datePart = reserva.fecha.split('T')[0];
        // Crear la fecha con la hora a mediodía para evitar problemas de zona horaria
        const fechaObj = new Date(`${datePart}T12:00:00`);
        const formattedDate = format(fechaObj, "dd/MM/yyyy", { locale: es });

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

      // Filtrar según la pestaña seleccionada
      if (value === "todas") {
        setReservations(transformedData);
      } else if (value === "confirmadas") {
        setReservations(transformedData.filter(r => r.status === "confirmada"));
      } else if (value === "pendientes") {
        setReservations(transformedData.filter(r => r.status === "pendiente"));
      } else if (value === "completadas") {
        setReservations(transformedData.filter(r => r.status === "completada"));
      } else if (value === "canceladas") {
        setReservations(transformedData.filter(r => r.status === "cancelada"));
      }
    } catch (error) {
      console.error("Error al cambiar pestaña:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          // Formatear la fecha - Corregir problema de zona horaria
          const datePart = reserva.fecha.split('T')[0];
          const fechaObj = new Date(`${datePart}T12:00:00`);
          const formattedDate = format(fechaObj, "dd/MM/yyyy", { locale: es });

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
          const transformedData = data.map(reserva => {
            const datePart = reserva.fecha.split('T')[0];
            const fechaObj = new Date(`${datePart}T12:00:00`);
            const formattedDate = format(fechaObj, "dd/MM/yyyy", { locale: es });

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

          setReservations(transformedData);
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
                const foundVecino = vecinos.find(v => v.id === reservaData.usuarioId);
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
                const foundUser = allUsers.find(u => u.id === reservaData.usuarioId);
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

      setReservations(updatedReservations);
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
        description: `No se pudo aprobar la reserva: ${error.message}`,
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

      setReservations(updatedReservations);
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
        description: `No se pudo cancelar la reserva: ${error.message}`,
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Reservas</h1>
        <p className="text-muted-foreground">Administra todas las reservas de instalaciones deportivas</p>
      </div>

      {/* Filtros y búsqueda */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        selectedDate={selectedDate}
        handleDateFilter={handleDateFilter}
        setReservations={setReservations}
      />

      {/* Pestañas y tabla de reservas */}
      <ReservationTabs
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        reservations={reservations}
        handleViewDetails={handleViewDetails}
        setSelectedReservation={setSelectedReservation}
        setShowApproveDialog={setShowApproveDialog}
        setShowCancelDialog={setShowCancelDialog}
        searchQuery={searchQuery}
        selectedDate={selectedDate}
        setSearchQuery={setSearchQuery}
        setSelectedDate={setSelectedDate}
        setReservations={setReservations}
        // Eliminamos la prop reservationsData
      />

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

