/**
 * Utilidades para manejo consistente de fechas en la aplicación
 * Evita problemas de zona horaria y conversiones incorrectas
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Crea una fecha local a partir de un string de fecha (YYYY-MM-DD) o ISO string
 * Evita problemas de zona horaria al interpretar la fecha como local
 */
export function createLocalDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }

  // Si es un ISO string, extraer solo la parte de la fecha
  let dateOnly = dateString;
  if (dateString.includes('T')) {
    dateOnly = dateString.split('T')[0];
  }

  // Crear fecha usando el constructor que interpreta como local
  // Formato: new Date(year, month-1, day) - month es 0-indexed
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Convierte una fecha a string en formato YYYY-MM-DD sin problemas de zona horaria
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para mostrar en la interfaz de usuario
 */
export function formatDateForDisplay(dateString: string, formatString: string = "EEEE d 'de' MMMM 'de' yyyy"): string {
  const localDate = createLocalDate(dateString);
  return format(localDate, formatString, { locale: es });
}

/**
 * Formatea una fecha del backend de manera robusta para evitar problemas de zona horaria
 * Específicamente diseñada para fechas que vienen del backend en formato YYYY-MM-DD
 * Compensa el día adicional que se añadió al crear la reserva
 */
export function formatBackendDateForDisplay(backendDateString: string, formatString: string = "EEEE d 'de' MMMM 'de' yyyy"): string {
  // Crear una fecha corregida usando createDateFromBackend que ya resta un día
  const correctedDate = createDateFromBackend(backendDateString);
  
  // Log para depuración
  console.log('=== FORMATEO DE FECHA DEL BACKEND CON CORRECCIÓN ===');
  console.log('Fecha original:', backendDateString);
  console.log('Fecha corregida:', correctedDate);
  console.log('Fecha formateada:', format(correctedDate, formatString, { locale: es }));
  console.log('========================');

  return format(correctedDate, formatString, { locale: es });
}

/**
 * Formatea una fecha para mostrar en formato corto (dd/MM/yyyy)
 */
export function formatDateShort(dateString: string): string {
  const localDate = createLocalDate(dateString);
  return format(localDate, "dd/MM/yyyy", { locale: es });
}

/**
 * Crea una fecha a partir de datos del backend que pueden venir con timestamp
 * Extrae solo la parte de fecha y crea una fecha local
 * Compensa el día adicional que se añadió al crear la reserva
 */
export function createDateFromBackend(backendDateString: string): Date {
  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const datePart = backendDateString.split('T')[0];
  const date = createLocalDate(datePart);
  
  // Restar un día para compensar el +1 que se añadió al crear la reserva
  const correctedDate = new Date(date);
  correctedDate.setDate(correctedDate.getDate() - 1);
  
  // Log para depuración
  console.log('=== FECHA DESDE BACKEND CON CORRECCIÓN ===');
  console.log('Fecha original del backend:', backendDateString);
  console.log('Fecha después de createLocalDate:', date);
  console.log('Fecha corregida (restando 1 día):', correctedDate);
  console.log('========================');
  
  return correctedDate;
}

/**
 * Obtiene la fecha actual en la zona horaria de Perú (GMT-5)
 */
export function getCurrentDateInPeru(): Date {
  const now = new Date();
  const localOffset = now.getTimezoneOffset();
  const peruOffset = -300; // -5 horas * 60 minutos
  const offsetDiff = localOffset + peruOffset;
  return new Date(now.getTime() + offsetDiff * 60000);
}

/**
 * Convierte una fecha local a formato ISO para el backend SIN corrección de día
 * Usar para verificaciones de disponibilidad y bloqueos temporales
 */
export function convertLocalDateToBackendFormat(date: Date): string {
  // Log para depuración
  console.log('=== FECHA SIN CORRECCIÓN ===');
  console.log('Fecha original:', date);
  console.log('========================');
  
  return formatDateToISO(date);
}

/**
 * Convierte una fecha local a formato ISO para el backend CON corrección de día
 * Usar SOLO para la creación de reservas definitivas
 */
export function convertLocalDateToReservationFormat(date: Date): string {
  // Añadir un día para corregir el desfase en la zona horaria
  const correctedDate = new Date(date);
  correctedDate.setDate(correctedDate.getDate() + 1);
  
  // Log para depuración
  console.log('=== CORRECCIÓN DE FECHA PARA RESERVA ===');
  console.log('Fecha original:', date);
  console.log('Fecha corregida:', correctedDate);
  console.log('========================');
  
  return formatDateToISO(correctedDate);
}

/**
 * Verifica si una fecha es hoy (en zona horaria local)
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Normaliza una fecha para comparaciones
 * Retorna string en formato YYYY-MM-DD
 */
export function normalizeDateForComparison(dateInput: string | Date): string {
  if (typeof dateInput === 'string') {
    return createLocalDate(dateInput).toISOString().split('T')[0];
  }
  return formatDateToISO(dateInput);
}
