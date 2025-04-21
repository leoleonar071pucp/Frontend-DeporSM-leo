"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar } from "lucide-react"
import { format } from "date-fns"
import { AttendanceRecord } from "../types"

interface AttendanceDetailsDialogProps {
  open: boolean
  onClose: () => void
  attendance: AttendanceRecord | null
}

export function AttendanceDetailsDialog({ open, onClose, attendance }: AttendanceDetailsDialogProps) {
  if (!attendance) return null
  
  const getStatusBadge = (status: AttendanceRecord["status"] | AttendanceRecord["departureStatus"]) => {
    switch (status) {
      case "a-tiempo":
        return <Badge className="bg-green-100 text-green-800">A tiempo</Badge>
      case "tarde":
        return <Badge className="bg-yellow-100 text-yellow-800">Tarde</Badge>
      case "no-asistio":
        return <Badge className="bg-red-100 text-red-800">No asistió</Badge>
      case "pendiente":
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles de Asistencia</DialogTitle>
          <DialogDescription>
            Información completa del registro de asistencia
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información de la instalación */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{attendance.facilityName}</h3>
                  <p className="text-sm text-muted-foreground">{attendance.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Fecha y hora programada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Fecha</h4>
                    <p className="text-sm">{format(new Date(attendance.date), "dd/MM/yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Horario Programado</h4>
                    <p className="text-sm">
                      {attendance.scheduledTime} - {attendance.scheduledEndTime || "No definido"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Registro de entrada */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium">Registro de Entrada</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Hora de Entrada</h4>
                  <p className="text-sm">{attendance.arrivalTime || "No registrada"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Estado</h4>
                  <div className="text-sm">{getStatusBadge(attendance.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Registro de salida */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium">Registro de Salida</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Hora de Salida</h4>
                  <p className="text-sm">{attendance.departureTime || "No registrada"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Estado</h4>
                  <div className="text-sm">
                    {attendance.departureStatus ? getStatusBadge(attendance.departureStatus) : getStatusBadge("pendiente")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}