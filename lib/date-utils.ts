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
 */
export function formatBackendDateForDisplay(backendDateString: string, formatString: string = "EEEE d 'de' MMMM 'de' yyyy"): string {
  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const datePart = backendDateString.includes('T') ? backendDateString.split('T')[0] : backendDateString;

  // Parsear manualmente para evitar problemas de zona horaria
  const [year, month, day] = datePart.split('-').map(Number);

  // Crear fecha local usando el constructor que no aplica zona horaria
  const localDate = new Date(year, month - 1, day);

  return format(localDate, formatString, { locale: es });
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
 */
export function createDateFromBackend(backendDateString: string): Date {
  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const datePart = backendDateString.split('T')[0];
  return createLocalDate(datePart);
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
 * Convierte una fecha local a ISO string para enviar al backend
 * Mantiene la fecha exacta sin conversiones de zona horaria
 */
export function convertLocalDateToBackendFormat(date: Date): string {
  return formatDateToISO(date);
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
