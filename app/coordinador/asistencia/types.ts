export interface AttendanceRecord {
  id: number
  facilityId: number
  scheduleId?: number
  facilityName: string
  location: string
  date: string
  scheduledTime: string
  scheduledEndTime?: string
  arrivalTime: string | null
  departureTime: string | null // Añadiendo tiempo de salida
  status: "a-tiempo" | "tarde" | "no-asistio"
  departureStatus?: "a-tiempo" | "tarde" | "no-asistio" | "pendiente" // Actualizando opciones de estado de salida
  notes: string
  departureNotes?: string // Notas para la salida
}

export interface ScheduledVisit {
  id: number
  facilityId: number
  facilityName: string
  location: string
  date: string
  scheduledTime: string
  scheduledEndTime?: string
  image?: string
}