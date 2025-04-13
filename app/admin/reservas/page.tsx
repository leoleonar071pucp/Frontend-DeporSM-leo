"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

// Importación de componentes
import {
  SearchFilters,
  ReservationTabs,
  ReservationDetails,
  ActionDialogs,
} from "./components"

// Importación de datos
import { reservationsData } from "./components/data"

export default function ReservasAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState(undefined)

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setReservations(reservationsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Filtrar reservas por número, nombre de usuario, instalación o DNI
    const filtered = reservationsData.filter(
      (reservation) =>
        reservation.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.userDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.userDetails.dni.includes(searchQuery),
    )
    setReservations(filtered)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todas") {
      setReservations(reservationsData)
    } else if (value === "confirmadas") {
      setReservations(reservationsData.filter((r) => r.status === "confirmada"))
    } else if (value === "pendientes") {
      setReservations(reservationsData.filter((r) => r.status === "pendiente"))
    } else if (value === "completadas") {
      setReservations(reservationsData.filter((r) => r.status === "completada"))
    } else if (value === "canceladas") {
      setReservations(reservationsData.filter((r) => r.status === "cancelada"))
    }
  }

  const handleDateFilter = (date) => {
    setSelectedDate(date)

    if (!date) {
      setReservations(reservationsData)
      return
    }

    const dateString = format(date, "yyyy-MM-dd")
    const filtered = reservationsData.filter((r) => r.date === dateString)
    setReservations(filtered)
  }

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation)
    setShowDetailsDialog(true)
  }

  const handleApproveReservation = () => {
    if (!selectedReservation) return

    // En un caso real, aquí se haría la llamada a la API para aprobar la reserva
    const updatedReservations = reservations.map((reservation) =>
      reservation.id === selectedReservation.id
        ? {
            ...reservation,
            status: "confirmada",
            paymentStatus: "Pagado",
            paymentDate: format(new Date(), "yyyy-MM-dd"),
          }
        : reservation,
    )

    setReservations(updatedReservations)
    setShowApproveDialog(false)
    setSelectedReservation(null)
  }

  const handleCancelReservation = () => {
    if (!selectedReservation) return

    // En un caso real, aquí se haría la llamada a la API para cancelar la reserva
    const updatedReservations = reservations.map((reservation) =>
      reservation.id === selectedReservation.id
        ? {
            ...reservation,
            status: "cancelada",
            paymentStatus: selectedReservation.paymentStatus === "Pagado" ? "Reembolsado" : "Cancelado",
          }
        : reservation,
    )

    setReservations(updatedReservations)
    setShowCancelDialog(false)
    setSelectedReservation(null)
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
        reservationsData={reservationsData}
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

