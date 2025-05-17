"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ActionDialogsProps {
  showApproveDialog: boolean
  setShowApproveDialog: (show: boolean) => void
  showCancelDialog: boolean
  setShowCancelDialog: (show: boolean) => void
  selectedReservation: any
  handleApproveReservation: () => void
  handleCancelReservation: () => void
}

export default function ActionDialogs({
  showApproveDialog,
  setShowApproveDialog,
  showCancelDialog,
  setShowCancelDialog,
  selectedReservation,
  handleApproveReservation,
  handleCancelReservation,
}: ActionDialogsProps) {
  return (
    <>
      {/* Diálogo para aprobar reserva */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aprobar la reserva #{selectedReservation?.reservationNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Esta acción confirmará la reserva y actualizará el estado del pago a "Pagado".</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary-light" onClick={handleApproveReservation}>
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cancelar reserva */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la reserva #{selectedReservation?.reservationNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Esta acción cancelará la reserva y, si ya está pagada, marcará el pago como "Reembolsado".</p>
            <p className="text-red-500 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancelReservation}>
              Cancelar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}