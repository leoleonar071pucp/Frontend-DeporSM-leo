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
    
    // Si no hay respuesta del backend, buscar la visita en datos de desarrollo
    console.warn("Usando datos de desarrollo para visita programada");
    
    // Primero intentamos recuperar todas las visitas programadas
    const allProgrammedVisits = await getScheduledVisits("4");  // ID de coordinador hardcodeado para demo
    
    // Buscamos la visita específica por su ID
    const foundVisit = allProgrammedVisits.find(visit => visit.id === visitId);
    
    // Si encontramos la visita, la devolvemos
    if (foundVisit) {
      console.log("Encontrada visita específica:", foundVisit);
      return foundVisit;
    }
    
    // Como plan B (si no encontramos la visita), generamos datos basados en facilityId
    console.warn("No se encontró la visita específica, generando datos básicos");
    
    // Mapeo de IDs de instalaciones para datos de desarrollo
    const facilityNames: Record<number, string> = {
      1: "Cancha de Fútbol (Grass)",
      2: "Piscina Municipal",
      3: "Gimnasio Municipal"
    };    // Usar la fecha actual ajustada a la zona horaria de Perú (GMT-5)
    const now = new Date();
    // Ajustar a la zona horaria de Perú (GMT-5)
    // 1. Obtener la diferencia entre la zona horaria local y UTC en minutos
    const localOffset = now.getTimezoneOffset();
    // 2. La zona horaria de Perú es UTC-5, que son -300 minutos
    const peruOffset = -300; // -5 horas * 60 minutos
    // 3. Calcular la diferencia total para ajustar
    const offsetDiff = localOffset + peruOffset; // Minutos para ajustar
    // 4. Crear una nueva fecha ajustada para Perú
    const peruDate = new Date(now.getTime() + offsetDiff * 60000);
    const today = peruDate;
    let dateToUse: Date;
    let scheduleTime: string;
    let scheduleEndTime: string;
    
    // Determinar fecha y horario según el ID de la instalación
    if (facilityId === 1) {
      dateToUse = new Date(today);
      scheduleTime = "08:00";
      scheduleEndTime = "12:00";
    } else if (facilityId === 2) {
      dateToUse = new Date(today);
      scheduleTime = "14:00";
      scheduleEndTime = "18:00";
    } else {
      dateToUse = new Date(today);
      scheduleTime = "09:00";
      scheduleEndTime = "13:00";
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
    }    // Si no hay respuesta del backend, devolver datos de desarrollo
    console.warn("Usando datos de desarrollo para visitas programadas");
      // Usar la fecha actual ajustada a la zona horaria de Perú (GMT-5)
    const now = new Date();
    // Ajustar a la zona horaria de Perú (GMT-5)
    // 1. Obtener la diferencia entre la zona horaria local y UTC en minutos
    const localOffset = now.getTimezoneOffset();
    // 2. La zona horaria de Perú es UTC-5, que son -300 minutos
    const peruOffset = -300; // -5 horas * 60 minutos
    // 3. Calcular la diferencia total para ajustar
    const offsetDiff = localOffset + peruOffset; // Minutos para ajustar
    // 4. Crear una nueva fecha ajustada para Perú
    const peruDate = new Date(now.getTime() + offsetDiff * 60000);
    const today = peruDate;
    
    // Generar un ID único basado en la fecha para evitar conflictos
    const generateIdFromDate = (date: Date, facilityId: number): number => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return parseInt(`${year}${month}${day}${facilityId}01`);
    };
      // Datos de ejemplo para desarrollo - solo para el día actual (domingo)
    return [
      {
        id: generateIdFromDate(today, 3),
        facilityId: 3,
        facilityName: "Gimnasio Municipal",
        location: "Sin ubicación registrada",
        date: today.toISOString().split('T')[0], // Hoy (domingo, 18 de mayo)
        scheduledTime: "09:00",
        scheduledEndTime: "13:00",
        image: "/placeholder.svg"
      },      {
        id: generateIdFromDate(today, 1),
        facilityId: 1,
        facilityName: "Cancha de Fútbol (Grass)",
        location: "Parque Juan Pablo II",
        date: today.toISOString().split('T')[0], // Hoy (domingo, 18 de mayo)
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
    
    let result;
    if (response.ok) {
      const data = await response.json();
      result = data;
    } else {
      // Si no hay respuesta del backend, simular una respuesta exitosa
      console.warn("Simulando registro de asistencia exitoso");
      result = {
        ...attendanceRecord,
        id: Math.floor(Math.random() * 10000) // Asignar ID aleatorio para desarrollo
      };
    }    // Guardar el ID de visita programada como registrada en localStorage
    const visitIdToSave = attendanceRecord.visitId;
    
    if (visitIdToSave) {
      try {        // Obtener las visitas ya registradas
        const registeredVisitsJson = localStorage.getItem('registeredVisits') || '[]';
        let registeredVisits = [];
        
        try {
          // Intentar parsear el contenido actual
          registeredVisits = JSON.parse(registeredVisitsJson);
          
          // Convertir formato antiguo (array de IDs) al nuevo formato (array de objetos)
          if (Array.isArray(registeredVisits) && (registeredVisits.length === 0 || typeof registeredVisits[0] === 'number')) {
            registeredVisits = registeredVisits.map(id => ({
              id,
              registeredDate: new Date().toISOString()
            }));
          }
        } catch (e) {
          console.error("Error parseando JSON de localStorage:", e);
          registeredVisits = [];
        }
        
        // Filtrar visitas expiradas (más de 2 días)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        registeredVisits = registeredVisits.filter(visit => {
          if (!visit.registeredDate) return false;
          const registeredDate = new Date(visit.registeredDate);
          return registeredDate > twoDaysAgo;
        });
        
        // Verificar si ya existe esta visita
        const existingVisitIndex = registeredVisits.findIndex(visit => visit.id === visitIdToSave);
        
        // Añadir la nueva visita registrada o actualizar la existente
        if (existingVisitIndex === -1) {
          // Nueva visita
          registeredVisits.push({
            id: visitIdToSave,
            registeredDate: new Date().toISOString()
          });        } else {
          // Actualizar la fecha de la visita existente
          registeredVisits[existingVisitIndex].registeredDate = new Date().toISOString();
        }
        
        // Guardar en localStorage
        localStorage.setItem('registeredVisits', JSON.stringify(registeredVisits));
      } catch (e) {
        console.error("Error al guardar en localStorage:", e);
        // Continuar el flujo aunque falle el localStorage
      }
    } else {
      console.warn("No se pudo guardar la visita como registrada: falta visitId");
    }
    
    return result;
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
