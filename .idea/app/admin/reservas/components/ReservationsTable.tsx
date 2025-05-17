"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Eye, X } from "lucide-react"
import { getStatusBadge, getPaymentStatusBadge } from "./utils"

interface ReservationsTableProps {
  reservations: any[]
  handleViewDetails: (reservation: any) => void
  setSelectedReservation: (reservation: any) => void
  setShowApproveDialog: (show: boolean) => void
  setShowCancelDialog: (show: boolean) => void
  searchQuery: string
  selectedDate: Date | undefined
  setSearchQuery: (query: string) => void
  setSelectedDate: (date: Date | undefined) => void
  setReservations: (reservations: any[]) => void
  reservationsData: any[]
}

export default function ReservationsTable({
  reservations,
  handleViewDetails,
  setSelectedReservation,
  setShowApproveDialog,
  setShowCancelDialog,
  searchQuery,
  selectedDate,
  setSearchQuery,
  setSelectedDate,
  setReservations,
  reservationsData,
}: ReservationsTableProps) {
  return (
    <>
      {reservations.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Nº Reserva</th>
                <th className="text-left py-3 px-4 font-medium">Usuario</th>
                <th className="text-left py-3 px-4 font-medium">Instalación</th>
                <th className="text-left py-3 px-4 font-medium">Fecha</th>
                <th className="text-left py-3 px-4 font-medium">Hora</th>
                <th className="text-left py-3 px-4 font-medium">Estado</th>
                <th className="text-left py-3 px-4 font-medium">Pago</th>
                <th className="text-left py-3 px-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{reservation.reservationNumber}</td>
                  <td className="py-3 px-4">{reservation.userDetails.name}</td>
                  <td className="py-3 px-4">{reservation.facilityName}</td>
                  <td className="py-3 px-4">{new Date(reservation.date).toLocaleDateString("es-ES")}</td>
                  <td className="py-3 px-4">{reservation.time}</td>
                  <td className="py-3 px-4">{getStatusBadge(reservation.status)}</td>
                  <td className="py-3 px-4">{getPaymentStatusBadge(reservation.paymentStatus)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(reservation)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      {reservation.status === "pendiente" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setShowApproveDialog(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {(reservation.status === "pendiente" || reservation.status === "confirmada") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setShowCancelDialog(true)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron reservas</h3>
          <p className="text-gray-500 mt-2">No hay reservas que coincidan con los criterios de búsqueda.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("")
              setSelectedDate(undefined)
              setReservations(reservationsData)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </>
  )
}