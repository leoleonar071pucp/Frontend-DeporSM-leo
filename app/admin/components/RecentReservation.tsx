import React from "react"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface RecentReservationData {
  id: number;
  userName: string;
  facilityName: string;
  status: "confirmada" | "pendiente" | "cancelada";
  date: string;
  time: string;
}

interface RecentReservationProps {
  reservation: RecentReservationData;
}

export const RecentReservation: React.FC<RecentReservationProps> = ({ reservation }) => {
  const getStatusBadge = (status: RecentReservationData['status']) => {
    switch (status) {
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex items-center p-3 border-b last:border-0">
      <div className="w-10 h-10 rounded-full bg-primary-background flex items-center justify-center mr-3 flex-shrink-0">
        <Clock className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{reservation.userName}</p>
            <p className="text-sm text-gray-500">{reservation.facilityName}</p>
          </div>
          <div className="flex flex-col items-end">
            {getStatusBadge(reservation.status)}
            <span className="text-xs text-gray-500 mt-1">
              {reservation.date}, {reservation.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}