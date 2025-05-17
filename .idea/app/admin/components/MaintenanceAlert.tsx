import React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface MaintenanceAlertData {
  id: number;
  facilityName: string;
  description: string;
  priority: "alta" | "media" | "baja" | "completada";
  date: string;
}

interface MaintenanceAlertProps {
  alert: MaintenanceAlertData;
}

export const MaintenanceAlert: React.FC<MaintenanceAlertProps> = ({ alert }) => {
  const getAlertIcon = (priority: MaintenanceAlertData['priority']) => {
    switch (priority) {
      case "alta":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "media":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "baja":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case "completada":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center p-3 border-b last:border-0">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
        {getAlertIcon(alert.priority)}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{alert.facilityName}</p>
            <p className="text-sm text-gray-500">{alert.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              className={`
                ${alert.priority === "alta" ? "bg-red-100 text-red-800" : ""}
                ${alert.priority === "media" ? "bg-yellow-100 text-yellow-800" : ""}
                ${alert.priority === "baja" ? "bg-blue-100 text-blue-800" : ""}
                ${alert.priority === "completada" ? "bg-green-100 text-green-800" : ""}
              `}
            >
              {alert.priority === "completada" ? "Completada" : `Prioridad ${alert.priority}`}
            </Badge>
            <span className="text-xs text-gray-500 mt-1">{alert.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}