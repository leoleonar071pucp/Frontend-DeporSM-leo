"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Image } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getStatusBadge, getPaymentStatusBadge } from "./utils"

interface ReservationDetailsProps {
  showDetailsDialog: boolean
  setShowDetailsDialog: (show: boolean) => void
  selectedReservation: any
  setShowApproveDialog: (show: boolean) => void
  setShowCancelDialog: (show: boolean) => void
}

export default function ReservationDetails({
  showDetailsDialog,
  setShowDetailsDialog,
  selectedReservation,
  setShowApproveDialog,
  setShowCancelDialog,
}: ReservationDetailsProps) {
  return (
    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Reserva</DialogTitle>
          <DialogDescription>
            Información completa de la reserva #{selectedReservation?.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        {selectedReservation && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={selectedReservation.facilityImage || "/placeholder.svg"}
                  alt={selectedReservation.facilityName}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{selectedReservation.facilityName}</h3>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedReservation.status)}
                    {getPaymentStatusBadge(selectedReservation.paymentStatus)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p>{new Date(selectedReservation.date).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p>{selectedReservation.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p>{selectedReservation.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de creación</p>
                    <p>{new Date(selectedReservation.createdAt).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Datos del Usuario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p>{selectedReservation.userDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p>{selectedReservation.userDetails.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p>{selectedReservation.userDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p>{selectedReservation.userDetails.phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Detalles del Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Método de pago</p>
                  <p>{selectedReservation.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado del pago</p>
                  <p>{selectedReservation.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="font-medium">{selectedReservation.paymentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de pago</p>
                  <p>
                    {selectedReservation.paymentDate !== "Pendiente"
                      ? new Date(selectedReservation.paymentDate).toLocaleDateString("es-ES")
                      : "Pendiente"}
                  </p>
                </div>
                {selectedReservation.paymentReference !== "Pendiente" && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Referencia de pago</p>
                    <p>{selectedReservation.paymentReference}</p>
                  </div>
                )}
                {selectedReservation.paymentStatus === "Pendiente de verificación" && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-2">Comprobante de pago</p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400 mr-2" />
                        <img
                          src="/placeholder.svg"
                          alt="Comprobante de pago"
                          className="max-w-full h-auto rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedReservation.additionalInfo && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Información adicional</h3>
                  <p className="text-gray-700">{selectedReservation.additionalInfo}</p>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
            Cerrar
          </Button>
          {selectedReservation?.status === "pendiente" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setShowDetailsDialog(false)
                setShowApproveDialog(true)
              }}
            >
              Aprobar Reserva
            </Button>
          )}
          {(selectedReservation?.status === "pendiente" || selectedReservation?.status === "confirmada") && (
            <Button
              variant="destructive"
              onClick={() => {
                setShowDetailsDialog(false)
                setShowCancelDialog(true)
              }}
            >
              Cancelar Reserva
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}