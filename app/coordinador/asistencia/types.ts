export interface AttendanceRecord {
  id: number
  visitId?: number // ID de la visita programada (para tracking)
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
  isRegistered?: boolean // Flag to indicate if attendance has already been registered
  registrationDate?: string // Date when attendance was registered
  registrationExpires?: string // Date when registration expires (2 days after registration)
}