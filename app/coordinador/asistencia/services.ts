import { apiGet, apiPost } from "@/lib/api-client";
import { AttendanceRecord, ScheduledVisit } from "./types";
import { CoordinatorSchedule } from "./models";

/**
 * Mapea los estados del backend al formato esperado por el frontend
 * @param estado Estado del backend (a-tiempo, tarde, no-asistio, pendiente) - ya en formato correcto
 * @returns Estado en formato frontend (a-tiempo, tarde, no-asistio, pendiente)
 */
function mapEstadoFromBackend(estado: string): string {
  if (!estado) return "pendiente";

  // La base de datos ya devuelve los estados en formato con guiones
  // Solo necesitamos validar que sea un estado válido
  const validStates = ["a-tiempo", "tarde", "no-asistio", "pendiente"];
  const normalizedState = estado.toLowerCase();

  if (validStates.includes(normalizedState)) {
    return normalizedState;
  }

  return "pendiente";
}



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

      // Si tenemos horarios pero falta el nombre de la instalación, intentar obtenerlo
      if (Array.isArray(data) && data.length > 0) {
        for (const schedule of data) {
          if (!schedule.instalacionNombre && schedule.instalacionId) {
            try {
              const facilityResponse = await apiGet(`instalaciones/${schedule.instalacionId}`);
              if (facilityResponse.ok) {
                const facilityData = await facilityResponse.json();
                schedule.instalacionNombre = facilityData.nombre || `Instalación ${schedule.instalacionId}`;
              }
            } catch (facilityError) {
              console.warn("Error al obtener datos de la instalación para horario:", facilityError);
            }
          }
        }
      }

      return data;
    }

    // Si no hay respuesta del backend, intentar obtener al menos el nombre real de la instalación
    let instalacionNombre = `Instalación ${facilityId}`;

    try {
      // Intentar obtener datos de la instalación para mostrar el nombre correcto
      const facilityResponse = await apiGet(`instalaciones/${facilityId}`);
      if (facilityResponse.ok) {
        const facilityData = await facilityResponse.json();
        instalacionNombre = facilityData.nombre || instalacionNombre;
      }
    } catch (facilityError) {
      console.warn("Error al obtener datos de la instalación para horarios:", facilityError);
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
        instalacionNombre: instalacionNombre,
        coordinadorId: parseInt(userId)
      },
      {
        id: 102,
        diaSemana: "miercoles",
        horaInicio: "08:00",
        horaFin: "12:00",
        instalacionId: facilityId,
        instalacionNombre: instalacionNombre,
        coordinadorId: parseInt(userId)
      },
      {
        id: 201,
        diaSemana: "martes",
        horaInicio: "14:00",
        horaFin: "18:00",
        instalacionId: facilityId,
        instalacionNombre: instalacionNombre,
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
 * @param userId ID del coordinador
 * @returns Datos de la visita programada
 */
export async function getScheduledVisit(visitId: number, facilityId: number, userId: string): Promise<ScheduledVisit | null> {
  try {
    // Intentar obtener datos del backend
    const response = await apiGet(`visitas-programadas/${visitId}`);

    if (response.ok) {
      const data = await response.json();

      // Si tenemos la visita pero no el nombre de la instalación,
      // intentamos obtener los datos de la instalación
      if (data && !data.facilityName && data.facilityId) {
        try {
          const facilityResponse = await apiGet(`instalaciones/${data.facilityId}`);
          if (facilityResponse.ok) {
            const facilityData = await facilityResponse.json();
            // Actualizar el nombre de la instalación con el valor dinámico
            data.facilityName = facilityData.nombre || `Instalación ${data.facilityId}`;
            data.location = facilityData.ubicacion || "Complejo Deportivo Municipal";
            // Agregar coordenadas para validación de ubicación
            data.latitud = facilityData.latitud;
            data.longitud = facilityData.longitud;
            data.radioValidacion = facilityData.radioValidacion || 100;
          }
        } catch (facilityError) {
          console.warn("Error al obtener datos de la instalación:", facilityError);
        }
      }

      return data;
    }

    // Si no hay respuesta del backend, buscar la visita en datos de desarrollo
    console.warn("Usando datos de desarrollo para visita programada");

    // Primero intentamos recuperar todas las visitas programadas usando fetchProgrammedVisits
    // que tiene la lógica correcta para extraer horarios específicos
    const { fetchProgrammedVisits } = await import('./programadas/fetchProgrammedVisits');
    const allProgrammedVisits = await fetchProgrammedVisits(parseInt(userId));

    // Buscamos la visita específica por su ID
    const foundVisit = allProgrammedVisits.find(visit => visit.id === visitId);

    // Si encontramos la visita, la devolvemos
    if (foundVisit) {
      console.log(`[DEBUG] Visita encontrada con horario correcto: ${foundVisit.scheduledTime} - ${foundVisit.scheduledEndTime} para visitId ${visitId}`);

      // Intentar obtener datos actualizados de la instalación
      if (foundVisit.facilityId) {
        try {
          const facilityResponse = await apiGet(`instalaciones/${foundVisit.facilityId}`);
          if (facilityResponse.ok) {
            const facilityData = await facilityResponse.json();
            // Actualizar el nombre de la instalación con el valor dinámico
            foundVisit.facilityName = facilityData.nombre || foundVisit.facilityName;
            foundVisit.location = facilityData.ubicacion || foundVisit.location;
            // Agregar coordenadas para validación de ubicación
            foundVisit.latitud = facilityData.latitud;
            foundVisit.longitud = facilityData.longitud;
            foundVisit.radioValidacion = facilityData.radioValidacion || 100;
          }
        } catch (facilityError) {
          console.warn("Error al obtener datos de la instalación:", facilityError);
        }
      }

      return foundVisit;
    }

    // Como plan B (si no encontramos la visita), generamos datos basados en facilityId
    console.warn("No se encontró la visita específica, generando datos básicos");

    // Intentar obtener datos dinámicos de la instalación
    try {
      const facilityResponse = await apiGet(`instalaciones/${facilityId}`);
      if (facilityResponse.ok) {
        const facilityData = await facilityResponse.json();

        // Usar la fecha actual ajustada a la zona horaria de Perú (GMT-5)
        const now = new Date();
        // Ajustar a la zona horaria de Perú (GMT-5)
        const localOffset = now.getTimezoneOffset();
        const peruOffset = -300; // -5 horas * 60 minutos
        const offsetDiff = localOffset + peruOffset;
        const peruDate = new Date(now.getTime() + offsetDiff * 60000);
        const today = peruDate;
        const dateToUse = new Date(today);

        // Intentar obtener el horario real del coordinador para esta instalación
        let scheduleTime = "09:00";
        let scheduleEndTime = "13:00";

        try {
          const coordinatorSchedules = await getCoordinatorSchedules(userId.toString(), facilityId);
          if (coordinatorSchedules.length > 0) {
            // Usar el primer horario encontrado para esta instalación
            const schedule = coordinatorSchedules[0];
            scheduleTime = schedule.horaInicio;
            scheduleEndTime = schedule.horaFin;
          }
        } catch (scheduleError) {
          console.warn("Error al obtener horarios del coordinador, usando horarios por defecto:", scheduleError);
        }

        // Crear objeto de visita con datos dinámicos de la instalación
        return {
          id: visitId,
          facilityId: facilityId,
          facilityName: facilityData.nombre || `Instalación ${facilityId}`,
          location: facilityData.ubicacion || "Complejo Deportivo Municipal",
          date: dateToUse.toISOString().split('T')[0],
          scheduledTime: scheduleTime,
          scheduledEndTime: scheduleEndTime,
          image: facilityData.imagenUrl || "/placeholder.svg",
          // Agregar coordenadas para validación de ubicación
          latitud: facilityData.latitud,
          longitud: facilityData.longitud,
          radioValidacion: facilityData.radioValidacion || 100
        };
      }
    } catch (facilityError) {
      console.warn("Error al obtener datos de la instalación:", facilityError);
    }

    // Mapeo de IDs de instalaciones para datos de desarrollo (solo como último recurso)
    const facilityNames: Record<number, string> = {
      1: "Cancha de Fútbol (Grass)",
      2: "Piscina Municipal",
      3: "Gimnasio Municipal"
    };
    // Usar la fecha actual ajustada a la zona horaria de Perú (GMT-5)
    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const peruOffset = -300; // -5 horas * 60 minutos
    const offsetDiff = localOffset + peruOffset;
    const peruDate = new Date(now.getTime() + offsetDiff * 60000);
    const today = peruDate;
    let dateToUse = new Date(today);
    let scheduleTime;
    let scheduleEndTime;

    // Intentar obtener el horario real del coordinador para esta instalación
    try {
      const coordinatorSchedules = await getCoordinatorSchedules(userId.toString(), facilityId);
      if (coordinatorSchedules.length > 0) {
        // Extraer el schedule.id del visitId para encontrar el horario correcto
        // El visitId tiene formato: ${year}${month}${day}${facilityId}${scheduleId}
        const visitIdStr = visitId.toString();
        const facilityIdStr = facilityId.toString();

        // Encontrar donde termina el facilityId en el visitId para extraer el scheduleId
        const facilityIdIndex = visitIdStr.lastIndexOf(facilityIdStr);
        if (facilityIdIndex !== -1) {
          const scheduleIdStr = visitIdStr.substring(facilityIdIndex + facilityIdStr.length);
          const scheduleId = parseInt(scheduleIdStr);

          // Buscar el horario específico por su ID
          const specificSchedule = coordinatorSchedules.find(schedule => schedule.id === scheduleId);

          if (specificSchedule) {
            scheduleTime = specificSchedule.horaInicio;
            scheduleEndTime = specificSchedule.horaFin;
            console.log(`[DEBUG] Horario específico encontrado para visitId ${visitId}: ${scheduleTime} - ${scheduleEndTime}`);
          } else {
            // Si no se encuentra el horario específico, usar el primer horario
            const schedule = coordinatorSchedules[0];
            scheduleTime = schedule.horaInicio;
            scheduleEndTime = schedule.horaFin;
            console.warn(`[DEBUG] No se encontró horario específico para scheduleId ${scheduleId}, usando primer horario disponible`);
          }
        } else {
          // Si no se puede extraer el scheduleId, usar el primer horario
          const schedule = coordinatorSchedules[0];
          scheduleTime = schedule.horaInicio;
          scheduleEndTime = schedule.horaFin;
          console.warn(`[DEBUG] No se pudo extraer scheduleId del visitId ${visitId}, usando primer horario disponible`);
        }
      } else {
        // Horarios por defecto si no se encuentran horarios del coordinador
        scheduleTime = "09:00";
        scheduleEndTime = "13:00";
      }
    } catch (scheduleError) {
      console.warn("Error al obtener horarios del coordinador, usando horarios por defecto:", scheduleError);
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
 * @param coordinadorId ID del coordinador (opcional, se puede obtener del contexto)
 * @returns Registro de asistencia guardado
 */
export async function recordAttendance(attendanceRecord: AttendanceRecord, coordinadorId?: number): Promise<AttendanceRecord> {
  try {
    // Si no tenemos el nombre de la instalación pero sí su ID, intentar obtenerlo
    if ((!attendanceRecord.facilityName || attendanceRecord.facilityName.startsWith('Instalación ')) &&
        attendanceRecord.facilityId) {
      try {
        const facilityResponse = await apiGet(`instalaciones/${attendanceRecord.facilityId}`);
        if (facilityResponse.ok) {
          const facilityData = await facilityResponse.json();
          // Actualizar el registro con los datos dinámicos de la instalación
          attendanceRecord.facilityName = facilityData.nombre || attendanceRecord.facilityName;
          attendanceRecord.location = facilityData.ubicacion || attendanceRecord.location;
        }
      } catch (facilityError) {
        console.warn("Error al obtener datos de instalación para registro de asistencia:", facilityError);
      }
    }

    // Mapear los datos al formato esperado por el endpoint proxy
    // La base de datos usa formato con guiones, no el enum Java
    const entryStatus = attendanceRecord.status; // Ya está en formato correcto (a-tiempo, tarde, no-asistio, pendiente)

    // Si el estado de entrada es "no-asistio", el estado de salida también debe ser "no-asistio"
    const exitStatus = entryStatus === 'no-asistio' ? 'no-asistio' : 'pendiente';

    // Validar que tenemos un coordinadorId válido
    if (!coordinadorId) {
      throw new Error("ID de coordinador no proporcionado");
    }

    // Función auxiliar para asegurar formato HH:mm
    const formatTimeToHHMM = (timeStr: string | null): string | null => {
      if (!timeStr) return null;
      // Si tiene segundos, quitarlos
      if (timeStr.length > 5) {
        return timeStr.substring(0, 5);
      }
      return timeStr;
    };

    console.log(`[DEBUG] AttendanceRecord recibido:`, attendanceRecord);
    console.log(`[DEBUG] Fecha original:`, attendanceRecord.date);
    console.log(`[DEBUG] Tipo de fecha:`, typeof attendanceRecord.date);

    // Asegurar que la fecha esté en formato yyyy-MM-dd
    let fechaFormateada = attendanceRecord.date;
    if (!fechaFormateada || typeof fechaFormateada !== 'string') {
      // Si no hay fecha o no es string, usar fecha actual
      const now = new Date();
      fechaFormateada = now.toISOString().split('T')[0];
      console.log(`[DEBUG] Fecha corregida a fecha actual:`, fechaFormateada);
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFormateada)) {
      // Si la fecha no está en formato correcto, intentar corregirla
      try {
        const date = new Date(fechaFormateada);
        fechaFormateada = date.toISOString().split('T')[0];
        console.log(`[DEBUG] Fecha reformateada:`, fechaFormateada);
      } catch (e) {
        // Si falla, usar fecha actual
        const now = new Date();
        fechaFormateada = now.toISOString().split('T')[0];
        console.log(`[DEBUG] Error al formatear fecha, usando fecha actual:`, fechaFormateada);
      }
    }

    const attendanceData = {
      coordinadorId: coordinadorId,
      instalacionId: attendanceRecord.facilityId,
      fecha: fechaFormateada, // Usar fecha formateada
      horaProgramadaInicio: formatTimeToHHMM(attendanceRecord.scheduledTime), // Asegurar formato HH:mm
      horaProgramadaFin: formatTimeToHHMM(attendanceRecord.scheduledEndTime), // Asegurar formato HH:mm
      horaEntrada: formatTimeToHHMM(attendanceRecord.arrivalTime), // Hora real de entrada en formato HH:mm
      estadoEntrada: entryStatus,
      estadoSalida: exitStatus, // NO_ASISTIO si no asistió, PENDIENTE en otros casos
      notas: attendanceRecord.notes || null // Usar 'notas' que coincide con la base de datos
    };

    console.log(`[DEBUG] Datos de asistencia preparados:`, {
      ...attendanceData,
      coordinadorIdType: typeof coordinadorId,
      instalacionIdType: typeof attendanceRecord.facilityId,
      fechaFormat: attendanceRecord.date,
      horaFormat: attendanceRecord.scheduledTime,
      estadoEntradaFormat: entryStatus,
      estadoSalidaFormat: exitStatus
    });

    console.log(`[DEBUG] Enviando datos de asistencia:`, attendanceData);

    // Intentar enviar datos al backend usando el endpoint proxy
    const response = await fetch('/api/coordinador/asistencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });

    let result;
    if (response.ok) {
      const data = await response.json();
      console.log(`[DEBUG] Respuesta exitosa del backend:`, data);
      result = data;
    } else {
      const errorText = await response.text();
      console.error(`[DEBUG] Error del backend (${response.status}):`, errorText);
      throw new Error(`Error del servidor: ${errorText}`);
    }// Guardar el ID de visita programada como registrada en localStorage
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
 * Obtiene el historial de asistencias de un coordinador
 * @param coordinadorId ID del coordinador
 * @returns Lista de registros de asistencia
 */
export async function getAttendanceHistory(coordinadorId: string): Promise<AttendanceRecord[]> {
  try {
    console.log(`[DEBUG] Obteniendo historial de asistencias para coordinador: ${coordinadorId}`);

    // Intentar obtener datos del backend
    const response = await apiGet(`asistencias-coordinadores/coordinador/${coordinadorId}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[DEBUG] Datos recibidos del backend:`, data);

      // Mapear los datos del backend al formato esperado por el frontend
      const mappedData = data.map((item: any) => {
        const entryStatus = mapEstadoFromBackend(item.estadoEntrada) || "pendiente";
        const exitStatus = mapEstadoFromBackend(item.estadoSalida) || "pendiente";

        // Si el estado de entrada es "no-asistio", el estado de salida también debe ser "no-asistio"
        const finalExitStatus = entryStatus === "no-asistio" ? "no-asistio" : exitStatus;

        return {
          id: item.id,
          facilityId: item.instalacionId,
          scheduleId: null, // No disponible en el backend actual
          facilityName: item.nombreInstalacion,
          location: item.ubicacion || "Complejo Deportivo Municipal",
          date: item.fecha,
          scheduledTime: item.horaProgramadaInicio || "00:00",
          scheduledEndTime: item.horaProgramadaFin || "00:00",
          arrivalTime: item.horaEntrada || null,
          departureTime: item.horaSalida || null,
          status: entryStatus,
          departureStatus: finalExitStatus,
          notes: item.notas || "",
          departureNotes: "",
        };
      });

      console.log(`[DEBUG] Datos mapeados para frontend:`, mappedData);
      return mappedData;
    }

    // Si no hay respuesta del backend, devolver array vacío
    console.warn("No se pudieron obtener datos del historial de asistencias del backend");
    return [];
  } catch (error) {
    console.error("Error obteniendo historial de asistencias:", error);
    return [];
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

/**
 * Registra la salida de un coordinador
 * @param attendanceId ID del registro de asistencia
 * @param departureTime Hora de salida
 * @param departureStatus Estado de la salida (a-tiempo o tarde)
 * @param coordinates Coordenadas de la ubicación
 * @param notes Notas adicionales
 * @returns Resultado del registro
 */
export async function recordDeparture(
  attendanceId: number,
  departureTime: string,
  departureStatus: "a-tiempo" | "tarde",
  coordinates: {lat: number, lng: number},
  notes: string
): Promise<any> {
  try {
    console.log(`[DEBUG] Registrando salida para asistencia ID: ${attendanceId}`);
    console.log(`[DEBUG] Datos de salida:`, {
      horaSalida: departureTime,
      estadoSalida: departureStatus,
      ubicacion: coordinates,
      notas: notes
    });

    // Usar el endpoint proxy del frontend
    const response = await fetch(`/api/coordinador/asistencias-coordinadores/${attendanceId}/salida`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        horaSalida: departureTime,
        estadoSalida: departureStatus,
        ubicacion: coordinates,
        notas: notes
      }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[DEBUG] Salida registrada exitosamente:`, data);
      return { success: true, data, message: "Salida registrada correctamente" };
    } else {
      const errorText = await response.text();
      console.error(`[DEBUG] Error al registrar salida (${response.status}):`, errorText);
      throw new Error(`Error del servidor: ${errorText}`);
    }
  } catch (error) {
    console.error("Error registrando salida:", error);
    throw error;
  }
}
