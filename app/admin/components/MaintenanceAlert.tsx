import React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface MaintenanceAlertData {
  id: number;
  facilityName: string;
  description: string;
  priority: "alta" | "media" | "baja";
  status: "pendiente" | "en_proceso" | "resuelta" | "cancelada";
  date: string;
}

interface MaintenanceAlertProps {
  alert: MaintenanceAlertData;
}

export const MaintenanceAlert: React.FC<MaintenanceAlertProps> = ({ alert }) => {
  const getAlertIcon = (status: MaintenanceAlertData['status']) => {
    switch (status) {
      case "pendiente":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "en_proceso":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case "resuelta":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelada":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: MaintenanceAlertData['status']) => {
    switch (status) {
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "en_proceso":
        return <Badge className="bg-blue-100 text-blue-800">En Proceso</Badge>
      case "resuelta":
        return <Badge className="bg-green-100 text-green-800">Resuelta</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="flex items-center p-3 border-b last:border-0">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
        {getAlertIcon(alert.status)}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{alert.facilityName}</p>
            <p className="text-sm text-gray-500">{alert.description}</p>
          </div>
          <div className="flex flex-col items-end">
            {getStatusBadge(alert.status)}
            <span className="text-xs text-gray-500 mt-1">{alert.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}