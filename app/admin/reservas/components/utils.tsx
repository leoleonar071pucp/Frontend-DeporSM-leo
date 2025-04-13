import { Badge } from "@/components/ui/badge"

// Función para generar el badge de estado de reserva
export const getStatusBadge = (status) => {
  switch (status) {
    case "confirmada":
      return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    case "completada":
      return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
    case "cancelada":
      return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
    default:
      return null
  }
}

// Función para generar el badge de estado de pago
export const getPaymentStatusBadge = (status) => {
  switch (status) {
    case "Pagado":
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
    case "Pendiente de verificación":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente de verificación</Badge>
    case "Reembolsado":
      return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
    case "Cancelado":
      return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
    default:
      return null
  }
}