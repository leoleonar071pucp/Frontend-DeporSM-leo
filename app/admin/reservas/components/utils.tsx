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
  // Normalizar el estado a minúsculas para hacer la comparación insensible a mayúsculas/minúsculas
  const normalizedStatus = status ? status.toLowerCase() : '';

  switch (normalizedStatus) {
    case "pagado":
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    case "pendiente de verificación":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente de verificación</Badge>
    case "reembolsado":
      return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
    case "cancelado":
      return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
    case "fallido":
      return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
    default:
      // Si no coincide con ninguno de los casos anteriores, mostrar el estado tal cual
      return status ? <Badge className="bg-gray-100 text-gray-800">{status}</Badge> : null
  }
}