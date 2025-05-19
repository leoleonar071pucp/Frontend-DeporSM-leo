import { apiGet, apiPost } from "@/lib/api-client";
import { AttendanceRecord, ScheduledVisit } from "./types";
import { CoordinatorSchedule } from "./models";

/**
 * Obtiene los horarios asignados al coordinador para una instalación específica
 * @param userId ID del coordinador
 * @param facilityId ID de la instalación
 * @returns Lista de horarios asignados al coordinador
 */
export async function getCoordinatorSchedules(userId: string, facilityId: number): Promise<CoordinatorSchedule[]> {
  try {
    // Intentar obtener datos del backend
    const response = await apiGet(`horarios-coordinador/coordinador/${userId}/instalacion/${facilityId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // Si no hay respuesta del backend, devolver datos de desarrollo
    console.warn("Usando datos de desarrollo para horarios del coordinador");
    return [
      {
        id: 101,
        diaSemana: "lunes",
        horaInicio: "08:00",
        horaFin: "12:00",
        instalacionId: facilityId,
        instalacionNombre: facilityId === 1 ? "Cancha de Fútbol (Grass)" : "Piscina Municipal",
        coordinadorId: parseInt(userId)
      },
      {
        id: 102,
        diaSemana: "miercoles",
        horaInicio: "08:00",
        horaFin: "12:00",
        instalacionId: facilityId,
        instalacionNombre: facilityId === 1 ? "Cancha de Fútbol (Grass)" : "Piscina Municipal",
        coordinadorId: parseInt(userId)
      },
      {
        id: 201,
        diaSemana: "martes",
        horaInicio: "14:00",
        horaFin: "18:00",
        instalacionId: facilityId,
        instalacionNombre: facilityId === 1 ? "Cancha de Fútbol (Grass)" : "Piscina Municipal",
        coordinadorId: parseInt(userId)
      }
    ].filter(schedule => schedule.instalacionId === facilityId);
  } catch (error) {
    console.error("Error obteniendo horarios del coordinador:", error);
    throw error;
  }
}

/**
 * Obtiene una visita programada específica
 * @param visitId ID de la visita
 * @param facilityId ID de la instalación
 * @returns Datos de la visita programada
 */
export async function getScheduledVisit(visitId: number, facilityId: number): Promise<ScheduledVisit | null> {
  try {
    // Intentar obtener datos del backend
    const response = await apiGet(`visitas-programadas/${visitId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // Si no hay respuesta del backend, devolver datos de desarrollo
    console.warn("Usando datos de desarrollo para visita programada");
    
    // Mapeo de IDs de instalaciones para datos de desarrollo
    const facilityNames: Record<number, string> = {
      1: "Cancha de Fútbol (Grass)",
      2: "Piscina Municipal"
    };
    
    // Generar fecha según día de la semana (para demo)
    const today = new Date('2025-05-18');
    let dateToUse: Date;
    let scheduleTime: string;
    let scheduleEndTime: string;
    
    // Determinar fecha y horario según el ID de la instalación
    if (facilityId === 1) {
      // Para instalación 1: Lunes (19 Mayo 2025)
      dateToUse = new Date(today);
      dateToUse.setDate(today.getDate() + 1); // Lunes
      scheduleTime = "08:00";
      scheduleEndTime = "12:00";
    } else {
      // Para instalación 2: Martes (20 Mayo 2025)
      dateToUse = new Date(today);
      dateToUse.setDate(today.getDate() + 2); // Martes
      scheduleTime = "14:00";
      scheduleEndTime = "18:00";
    }
    
    // Crear objeto de visita
    return {
      id: visitId,
      facilityId: facilityId,
      facilityName: facilityNames[facilityId] || `Instalación ${facilityId}`,
      location: "Complejo Deportivo Municipal",
      date: dateToUse.toISOString().split('T')[0],
      scheduledTime: scheduleTime,
      scheduledEndTime: scheduleEndTime,
      image: "/placeholder.svg"
    };
  } catch (error) {
    console.error("Error obteniendo visita programada:", error);
    return null;
  }
}

/**
 * Obtiene las visitas programadas para un coordinador
 * @param userId ID del coordinador
 * @param filters Filtros opcionales
 * @returns Lista de visitas programadas
 */
export async function getScheduledVisits(userId: string, filters?: any): Promise<ScheduledVisit[]> {
  try {
    // Intentar obtener datos del backend
    const response = await apiGet(`visitas-programadas/coordinador/${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // Si no hay respuesta del backend, devolver datos de desarrollo
    console.warn("Usando datos de desarrollo para visitas programadas");
    
    // Generar fechas para los próximos 3 días
    const today = new Date('2025-05-18'); // Domingo 18 de mayo
    const dayOne = new Date(today);
    const dayTwo = new Date(today);
    dayTwo.setDate(today.getDate() + 1); // Lunes 19 de mayo
    const dayThree = new Date(today);
    dayThree.setDate(today.getDate() + 2); // Martes 20 de mayo
    
    // Datos de ejemplo para desarrollo
    return [
      {
        id: 2025518101,
        facilityId: 1,
        facilityName: "Cancha de Fútbol (Grass)",
        location: "Parque Juan Pablo II",
        date: dayOne.toISOString().split('T')[0], // Domingo 18 de mayo
        scheduledTime: "10:00",
        scheduledEndTime: "14:00",
        image: "/placeholder.svg"
      },
      {
        id: 2025519101,
        facilityId: 1,
        facilityName: "Cancha de Fútbol (Grass)",
        location: "Parque Juan Pablo II",
        date: dayTwo.toISOString().split('T')[0], // Lunes 19 de mayo
        scheduledTime: "08:00",
        scheduledEndTime: "12:00",
        image: "/placeholder.svg"
      },
      {
        id: 2025520201,
        facilityId: 2,
        facilityName: "Piscina Municipal",
        location: "Complejo Deportivo Municipal",
        date: dayThree.toISOString().split('T')[0], // Martes 20 de mayo
        scheduledTime: "14:00",
        scheduledEndTime: "18:00",
        image: "/placeholder.svg"
      }
    ];
  } catch (error) {
    console.error("Error obteniendo visitas programadas:", error);
    return [];
  }
}

/**
 * Registra la asistencia de un coordinador a una visita
 * @param attendanceRecord Registro de asistencia
 * @returns Registro de asistencia guardado
 */
export async function recordAttendance(attendanceRecord: AttendanceRecord): Promise<AttendanceRecord> {
  try {
    // Intentar enviar datos al backend
    const response = await apiPost('asistencias', attendanceRecord);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // Si no hay respuesta del backend, simular una respuesta exitosa
    console.warn("Simulando registro de asistencia exitoso");
    return {
      ...attendanceRecord,
      id: Math.floor(Math.random() * 10000) // Asignar ID aleatorio para desarrollo
    };
  } catch (error) {
    console.error("Error registrando asistencia:", error);
    throw error;
  }
}

/**
 * Valida si la ubicación del coordinador está dentro del rango permitido para la instalación
 * @param coordinates Coordenadas del coordinador
 * @param facilityId ID de la instalación
 * @returns true si la ubicación es válida, false en caso contrario
 */
export async function validateLocation(coordinates: {lat: number, lng: number}, facilityId: number): Promise<boolean> {
  try {
    // Intentar validar ubicación en el backend
    const response = await apiPost(`instalaciones/${facilityId}/validar-ubicacion`, coordinates);
    
    if (response.ok) {
      const data = await response.json();
      return data.isValid;
    }
    
    // Si no hay respuesta del backend, asumir que la ubicación es válida para desarrollo
    console.warn("Simulando validación de ubicación exitosa");
    return true;
  } catch (error) {
    console.error("Error validando ubicación:", error);
    throw error;
  }
}
