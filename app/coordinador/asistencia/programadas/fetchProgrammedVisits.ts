// Función para obtener datos reales de visitas programadas desde el backend
import { format, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from "date-fns";
import { es } from "date-fns/locale";
import { ScheduledVisit } from "../types";
import { apiGet } from "@/lib/api-client";

// Interfaces
interface HorarioCoordinador {
  id: number;
  coordinadorInstalacionId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  instalacionNombre: string;
  instalacionId: number;
}

interface AssignedSchedules {
  [key: string]: {
    facilityId: number;
    facilityName: string;
    schedules: Array<{
      id: number;
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

// Función para normalizar nombres de días
const normalizeDayName = (dayString: string): string => {
  if (!dayString) return "lunes"; // Valor predeterminado
  
  const normalizedInput = dayString.trim().toLowerCase();
  
  // Mapeando variantes de nombres de días
  const dayVariants = {
    "lunes": ["lun", "lunes"],
    "martes": ["mar", "martes"],
    "miercoles": ["mie", "miercoles", "miércoles"],
    "jueves": ["jue", "jueves"],
    "viernes": ["vie", "viernes"],
    "sabado": ["sab", "sabado", "sábado"],
    "domingo": ["dom", "domingo"]
  };
  
  // Buscar en las variantes de cada día
  for (const [day, variants] of Object.entries(dayVariants)) {
    if (variants.some(variant => normalizedInput.includes(variant))) {
      return day;
    }
  }
  
  return "lunes";
};

// Función auxiliar para verificar si una fecha corresponde al día de la semana
const isDayOfWeek = (date: Date, day: string): boolean => {
  // Direct day of week checks using date-fns functions for more reliability
  const normalizedDay = day.toLowerCase().trim();
  
  if (normalizedDay.includes('lun') && isMonday(date)) return true;
  if (normalizedDay.includes('mart') && isTuesday(date)) return true;
  if (normalizedDay.includes('mier') && isWednesday(date)) return true;
  if (normalizedDay.includes('juev') && isThursday(date)) return true;
  if (normalizedDay.includes('vier') && isFriday(date)) return true;
  if (normalizedDay.includes('sab') && isSaturday(date)) return true;
  if (normalizedDay.includes('dom') && isSunday(date)) return true;
  
  // If direct check fails, use the string-based approach as backup
  const dayOfWeekString = format(date, 'EEEE', { locale: es }).toLowerCase();
  
  // Mapa de conversión de días de la semana
  const dayMap: Record<string, string[]> = {
    'lunes': ['lunes'],
    'martes': ['martes'],
    'miercoles': ['miércoles', 'miercoles'],
    'jueves': ['jueves'],
    'viernes': ['viernes'],
    'sabado': ['sábado', 'sabado'],
    'domingo': ['domingo']
  };
  
  // Buscar en el mapa de días
  for (const [dayKey, variants] of Object.entries(dayMap)) {
    if (normalizedDay === dayKey || variants.includes(normalizedDay)) {
      // El día proporcionado es uno de los días válidos
      return variants.includes(dayOfWeekString) || dayOfWeekString === dayKey;
    }
  }
    
  return false;
};

export const fetchProgrammedVisits = async (): Promise<ScheduledVisit[]> => {
  try {
    // ID de coordinador (fijo para desarrollo y pruebas)
    const userId = 4;
    
    // Obtener los horarios del coordinador
    const response = await apiGet(`horarios-coordinador/coordinador/${userId}`);
    let horarios: HorarioCoordinador[] = [];
    
    if (response.ok) {
      horarios = await response.json();
      if (!Array.isArray(horarios)) {
        console.warn("Formato de respuesta incorrecto, usando datos de desarrollo");
        horarios = [];
      }
    } else {
      console.warn(`Error al cargar horarios: ${response.status}, usando datos de desarrollo`);
    }
    
    // Si no hay horarios del backend o hubo un error, usamos datos de desarrollo
    if (horarios.length === 0) {
      // Añadir manualmente un horario para el domingo (día 18 de mayo de 2025)
      horarios = [
        {
          id: 301,
          coordinadorInstalacionId: 4,
          diaSemana: "domingo",
          horaInicio: "09:00",
          horaFin: "13:00",
          instalacionNombre: "Gimnasio Municipal",
          instalacionId: 3
        },
        {
          id: 401,
          coordinadorInstalacionId: 4,
          diaSemana: "domingo",
          horaInicio: "14:00",
          horaFin: "18:00",
          instalacionNombre: "Cancha de Fútbol (Grass)",
          instalacionId: 1
        }
      ];
    }
    
    // Procesar los horarios y convertirlos al formato requerido
    const processedSchedules: AssignedSchedules = {};
    
    horarios.forEach((horario: HorarioCoordinador) => {
      // Validar que el horario tenga los campos necesarios
      if (!horario.instalacionId || !horario.diaSemana || !horario.horaInicio || !horario.horaFin) {
        return; // Saltar este horario
      }
      
      const facilityId = horario.instalacionId.toString();
      const dia = normalizeDayName(horario.diaSemana);
      
      if (!processedSchedules[facilityId]) {
        processedSchedules[facilityId] = {
          facilityId: horario.instalacionId,
          facilityName: horario.instalacionNombre || `Instalación ${horario.instalacionId}`,
          schedules: []
        };
      }
      
      // Manejo seguro de los formatos de hora
      let startTime = typeof horario.horaInicio === 'string' ? horario.horaInicio : '00:00';
      let endTime = typeof horario.horaFin === 'string' ? horario.horaFin : '00:00';
      
      // Asegurar formato HH:MM y manejo de casos especiales
      try {
        // Si viene en formato HH:MM:SS, extraer solo HH:MM
        if (startTime.includes(':') && startTime.length >= 5) {
          startTime = startTime.substring(0, 5);
        }
        
        if (endTime.includes(':') && endTime.length >= 5) {
          endTime = endTime.substring(0, 5);
        }
      } catch (error) {
        startTime = '00:00';
        endTime = '00:00';
      }
      
      processedSchedules[facilityId].schedules.push({
        id: horario.id,
        day: dia,
        startTime: startTime,
        endTime: endTime
      });
    });      // Generar visitas programadas solo para el día actual
    // Usar la fecha actual del sistema, forzando a que sea el 18 de mayo de 2025 para desarrollo
    // Crear fecha en zona horaria de Perú (GMT-5)
    const today = new Date(Date.UTC(2025, 4, 18, 12, 0, 0)); // Mayo es el mes 4 (0-indexado) y 18 es el día (domingo)
    // Ajustar para la zona horaria de Perú (GMT-5)
    today.setHours(today.getHours() - 5);
    console.log(`Día de la semana actual en Perú: ${format(today, 'EEEE', { locale: es })}`);
    
    // Crear solo el día de hoy
    const dayOne = today; // Hoy en Perú
    
    // Verificar que la fecha generada sea correcta
    console.log("Fecha generada para las visitas:");
    console.log(`Hoy: ${format(dayOne, 'yyyy-MM-dd')} (${format(dayOne, 'EEEE', { locale: es })})`);
    
    // Generar visitas programadas solo para hoy
    const visits: ScheduledVisit[] = [];
    
    // Obtener el nombre del día actual
    const currentDayName = format(dayOne, 'EEEE', { locale: es }).toLowerCase();
    console.log(`Generando visitas solo para ${currentDayName} (${format(dayOne, 'yyyy-MM-dd')})`);
    
    // Revisar cada instalación y sus horarios
    Object.entries(processedSchedules).forEach(([facilityId, facilityData]) => {
      // Filtrar horarios para este día específico
      const schedulesForDay = facilityData.schedules.filter(schedule => {
        const matches = isDayOfWeek(dayOne, schedule.day);
        if (matches) {
          console.log(`  - Coincidencia: Horario (${schedule.day}) coincide con ${currentDayName} para instalación ${facilityData.facilityName}`);
        }
        return matches;
      });
      
      schedulesForDay.forEach(schedule => {
        // Crear un ID único usando una combinación de fecha, facilityId y día
        const uniqueId = parseInt(`${dayOne.getFullYear()}${dayOne.getMonth()}${dayOne.getDate()}${facilityId}${schedule.id}`);
        
        const visit = {
          id: uniqueId,
          facilityId: parseInt(facilityId),
          facilityName: facilityData.facilityName,
          location: "Sin ubicación registrada", // La API actual no devuelve ubicación
          date: format(dayOne, 'yyyy-MM-dd'),
          scheduledTime: schedule.startTime,
          scheduledEndTime: schedule.endTime,
          image: "/placeholder.svg" // La API actual no devuelve imagen
        };
        
        visits.push(visit);
        console.log(`    + Visita creada para ${currentDayName} en ${facilityData.facilityName}`);
      });
    });
    
    // Terminado proceso de crear visitas para el día actual
    const firstDate = dayOne;  // Hoy
    
    // Formatear la fecha que queremos filtrar
    const firstDateStr = format(firstDate, 'yyyy-MM-dd'); // Hoy
    
    // Registrar los días para depuración
    console.log(`Fecha de filtrado específica:`);
    console.log(`- Hoy: ${firstDateStr} (${format(firstDate, 'EEEE', { locale: es })})`);
    
    // Imprimir todas las fechas en las visitas para debugging
    console.log("Todas las fechas de visitas generadas:", visits.map(v => v.date));
    
    // Filtrar visitas para asegurar que solo muestren las del día actual
    // Si no hay visitas para el día actual, esto puede indicar un problema con la generación
    if (!visits.some(visit => visit.date === firstDateStr)) {
      console.warn(`ADVERTENCIA: No se encontraron visitas para hoy (${firstDateStr})`);
    }
    
    // Forzar la inclusión explícita de solo el día actual
    const filteredVisits = visits.filter(visit => {
      // Compara directamente con la cadena de fecha generada para hoy
      const isMatch = visit.date === firstDateStr;
      
      // Registrar fechas descartadas para debugging
      if (!isMatch) {
        console.log(`Descartando visita que no es de hoy: ${visit.date}`);
      }
      
      return isMatch;
    });
    
    // Log de las visitas filtradas por día
    console.log("Visitas filtradas para hoy:", filteredVisits.filter(v => v.date === firstDateStr).length);
    
    // Ordenar las visitas por fecha y hora
    filteredVisits.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
    
    return filteredVisits;
    
  } catch (error) {
    console.error("Error al obtener visitas programadas:", error);
    throw error;
  }
};
