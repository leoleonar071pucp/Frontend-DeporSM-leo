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

// Interfaz para almacenar información de visitas registradas con fecha
interface RegisteredVisitInfo {
  id: number;
  registeredDate: string; // Fecha ISO string
}

// Función para procesar visitas expiradas
async function processExpiredVisits(expiredVisits: ScheduledVisit[], userId: number) {
  try {
    for (const visit of expiredVisits) {
      // Crear registro de asistencia con estado "no-asistio"
      const attendanceData = {
        coordinadorId: userId,
        instalacionId: visit.facilityId,
        fechaVisita: visit.date,
        horaInicio: visit.scheduledTime,
        horaFin: visit.scheduledEndTime,
        estadoEntrada: 'no-asistio',
        estadoSalida: 'no-asistio',
        observaciones: 'Visita expirada - No se registró asistencia a tiempo'
      };

      const response = await fetch('/api/coordinador/asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        console.error(`Error al registrar visita expirada ${visit.id}:`, await response.text());
      } else {
        console.log(`Visita expirada ${visit.id} registrada automáticamente como no-asistio`);

        // Marcar la visita como registrada en localStorage para evitar duplicados
        try {
          const registeredVisitsJson = localStorage.getItem('registeredVisits') || '[]';
          let registeredVisits = JSON.parse(registeredVisitsJson);

          // Convertir formato antiguo si es necesario
          if (Array.isArray(registeredVisits) && (registeredVisits.length === 0 || typeof registeredVisits[0] === 'number')) {
            registeredVisits = registeredVisits.map((id: number) => ({
              id,
              registeredDate: new Date().toISOString()
            }));
          }

          // Agregar la visita expirada como registrada
          registeredVisits.push({
            id: visit.id,
            registeredDate: new Date().toISOString()
          });

          localStorage.setItem('registeredVisits', JSON.stringify(registeredVisits));
        } catch (storageError) {
          console.error('Error al actualizar localStorage:', storageError);
        }
      }
    }
  } catch (error) {
    console.error('Error al procesar visitas expiradas:', error);
  }
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

export const fetchProgrammedVisits = async (userId: number): Promise<ScheduledVisit[]> => {
  try {
    // Validar que el userId sea válido
    if (!userId || userId <= 0) {
      throw new Error("ID de usuario inválido");
    }

    // Obtener los horarios del coordinador desde la API
    const response = await apiGet(`horarios-coordinador/coordinador/${userId}`);
    let horarios: HorarioCoordinador[] = [];

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        horarios = data;
      } else {
        console.warn("Formato de respuesta incorrecto");
      }
    } else {
      console.warn(`Error al cargar horarios: ${response.status}`);
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

        // Si no tenemos el nombre de la instalación pero sí su ID, intentar obtenerlo
        if ((!horario.instalacionNombre || horario.instalacionNombre.startsWith('Instalación ')) &&
            horario.instalacionId) {
          // Se hace la solicitud en segundo plano sin bloquear
          apiGet(`instalaciones/${horario.instalacionId}`)
            .then(facilityResponse => {
              if (facilityResponse.ok) {
                return facilityResponse.json();
              }
              throw new Error("No se pudo obtener la instalación");
            })
            .then(facilityData => {
              // Actualizar el nombre de la instalación si existe
              if (facilityData && facilityData.nombre && processedSchedules[facilityId]) {
                processedSchedules[facilityId].facilityName = facilityData.nombre;
              }
            })
            .catch(err => {
              console.warn(`Error al obtener detalles de instalación ${horario.instalacionId}:`, err);
            });
        }
      }

      // Manejo seguro de los formatos de hora
      let startTime = typeof horario.horaInicio === 'string' ? horario.horaInicio : '00:00';
      let endTime = typeof horario.horaFin === 'string' ? horario.horaFin : '00:00';

      // Asegurar formato HH:MM
      try {
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
    });

    // Generar visitas programadas para el día actual
    // Ajustar a la zona horaria de Perú (GMT-5)
    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const peruOffset = -300; // -5 horas * 60 minutos
    const offsetDiff = localOffset + peruOffset;
    const today = new Date(now.getTime() + offsetDiff * 60000);

    // Obtener el nombre del día actual en español
    const currentDayName = format(today, 'EEEE', { locale: es }).toLowerCase();

    const visits: ScheduledVisit[] = [];

    // Obtener información completa de todas las instalaciones
    const facilitiesDetails: Record<string, any> = {};

    // Primero, obtener detalles de todas las instalaciones
    const facilityIds = Object.keys(processedSchedules);
    await Promise.all(
      facilityIds.map(async (facilityId) => {
        try {
          const facilityResponse = await apiGet(`instalaciones/${facilityId}`);
          if (facilityResponse.ok) {
            const facilityData = await facilityResponse.json();
            facilitiesDetails[facilityId] = {
              nombre: facilityData.nombre,
              ubicacion: facilityData.ubicacion,
              latitud: facilityData.latitud,
              longitud: facilityData.longitud,
              radioValidacion: facilityData.radioValidacion,
              imagenUrl: facilityData.imagenUrl
            };
          }
        } catch (error) {
          console.error(`Error al obtener detalles de instalación ${facilityId}:`, error);
        }
      })
    );

    // Revisar cada instalación y sus horarios
    Object.entries(processedSchedules).forEach(([facilityId, facilityData]) => {
      // Filtrar horarios para el día actual
      const schedulesForDay = facilityData.schedules.filter(schedule => {
        // Comparamos con el día actual calculado
        // Normalizamos ambos días para asegurar la comparación correcta
        const normalizedScheduleDay = normalizeDayName(schedule.day);
        const normalizedCurrentDay = normalizeDayName(currentDayName);
        const matches = normalizedScheduleDay === normalizedCurrentDay;
        return matches;
      });

      schedulesForDay.forEach(schedule => {
        // Crear un ID único usando una combinación de fecha, facilityId y día
        const uniqueId = parseInt(`${today.getFullYear()}${today.getMonth()}${today.getDate()}${facilityId}${schedule.id}`);

        // Obtener detalles de la instalación
        const facilityDetails = facilitiesDetails[facilityId];

        // Usamos la fecha actual en Perú, ya calculada anteriormente
        const visit = {
          id: uniqueId,
          facilityId: parseInt(facilityId),
          facilityName: facilityDetails?.nombre || facilityData.facilityName,
          location: facilityDetails?.ubicacion || "Sin ubicación registrada",
          date: format(today, 'yyyy-MM-dd'), // Usar la fecha actual en Perú
          scheduledTime: schedule.startTime,
          scheduledEndTime: schedule.endTime,
          image: facilityDetails?.imagenUrl || "/placeholder.svg",
          // Agregar coordenadas para validación de ubicación
          latitud: facilityDetails?.latitud,
          longitud: facilityDetails?.longitud,
          radioValidacion: facilityDetails?.radioValidacion || 100
        };

        visits.push(visit);
      });
    });

    // Terminado proceso de crear visitas para el día actual
    // Usar la fecha en Perú para filtrado
    const todayStr = format(today, 'yyyy-MM-dd'); // Fecha actual en Perú

    // Filtrar visitas para asegurar que solo muestren las del día actual
    const filteredVisits = visits.filter(visit => visit.date === todayStr);

    // Obtener la hora actual en Perú
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Separar visitas futuras de las expiradas
    const futureVisits: ScheduledVisit[] = [];
    const expiredVisits: ScheduledVisit[] = [];

    filteredVisits.forEach(visit => {
      if (visit.scheduledEndTime) {
        const [endHour, endMinute] = visit.scheduledEndTime.split(':').map(Number);
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (currentTimeInMinutes >= endTimeInMinutes) {
          // La visita ya expiró
          expiredVisits.push(visit);
        } else {
          // La visita es futura
          futureVisits.push(visit);
        }
      } else {
        // Si no tiene hora de fin, asumimos que es futura
        futureVisits.push(visit);
      }
    });

    // Procesar visitas expiradas - registrarlas automáticamente como "no-asistio"
    if (expiredVisits.length > 0) {
      await processExpiredVisits(expiredVisits, userId);
    }

    // Ordenar las visitas futuras por fecha y hora
    futureVisits.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    // Obtener las visitas ya registradas
    // Aquí necesitamos la información completa incluyendo fechas
    const registeredVisitsRaw = localStorage.getItem('registeredVisits') || '[]';
    let registeredVisitsFull: RegisteredVisitInfo[] = [];

    try {
      registeredVisitsFull = JSON.parse(registeredVisitsRaw);
      // Convertir formato antiguo si es necesario
      if (Array.isArray(registeredVisitsFull) && (registeredVisitsFull.length === 0 || typeof registeredVisitsFull[0] === 'number')) {
        registeredVisitsFull = registeredVisitsFull.map((id: number) => ({
          id,
          registeredDate: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error("Error al parsear registeredVisits:", e);
      registeredVisitsFull = [];
    }

    // Filtrar para obtener solo los IDs de las visitas no expiradas
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const registeredVisits = registeredVisitsFull
      .filter(visit => {
        if (!visit.registeredDate) return false;
        const registeredDate = new Date(visit.registeredDate);
        return registeredDate > twoDaysAgo;
      })
      .map(visit => visit.id);

    // Marcar las visitas que ya han sido registradas en lugar de filtrarlas
    const allVisitsWithStatus = futureVisits.map(visit => {
      // Buscar información completa de registro si existe
      const registrationInfo = registeredVisitsFull.find(rv => rv.id === visit.id);
      const isRegistered = registeredVisits.includes(visit.id);

      // Si está registrada, añadir información de fechas
      if (isRegistered && registrationInfo) {
        const registrationDate = new Date(registrationInfo.registeredDate);
        const expirationDate = new Date(registrationDate);
        expirationDate.setDate(expirationDate.getDate() + 2);

        return {
          ...visit,
          isRegistered: true,
          registrationDate: registrationInfo.registeredDate,
          registrationExpires: expirationDate.toISOString()
        };
      }

      // Si no está registrada, mantener la estructura base
      return {
        ...visit,
        isRegistered: false
      };
    });

    return allVisitsWithStatus;

  } catch (error) {
    console.error("Error al obtener visitas programadas:", error);
    throw error;
  }
};
