/**
 * Utilidades para el cálculo de precios de reservas
 */

/**
 * Calcula el precio total basado en la duración de la reserva
 * @param pricePerHour Precio por hora de la instalación
 * @param startTime Hora de inicio en formato "HH:MM" o "HH:MM:SS"
 * @param endTime Hora de fin en formato "HH:MM" o "HH:MM:SS"
 * @returns Precio total calculado
 */
export function calculateTotalPrice(pricePerHour: number, startTime: string, endTime: string): number {
  // Extraer solo las horas y minutos si viene en formato "HH:MM:SS"
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');

  // Convertir a minutos para facilitar el cálculo
  const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

  // Calcular la duración en minutos
  let durationMinutes = endMinutes - startMinutes;

  // Si el tiempo final es menor que el inicial, asumimos que cruza la medianoche
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60; // Añadir un día completo en minutos
  }

  // Convertir la duración a horas (con decimales)
  const durationHours = durationMinutes / 60;

  // Calcular el precio total
  const totalPrice = pricePerHour * durationHours;

  // Redondear a 2 decimales
  return Math.round(totalPrice * 100) / 100;
}

/**
 * Formatea un precio como string con formato monetario
 * @param price Precio a formatear
 * @returns String formateado (ej: "S/. 55.00")
 */
export function formatPrice(price: number): string {
  return `S/. ${price.toFixed(2)}`;
}

/**
 * Formatea un precio según el tipo de instalación
 * @param price Precio a formatear
 * @param tipo Tipo de instalación
 * @returns String formateado con unidad (ej: "S/. 55.00 por hora")
 */
export function formatPriceWithUnit(price: number, tipo: string): string {
  // Todos los precios se muestran por hora
  return `${formatPrice(price)} por hora`;
}

/**
 * Calcula y formatea el precio total de una reserva
 * @param pricePerHour Precio por hora de la instalación
 * @param timeRange Rango de tiempo en formato "HH:MM - HH:MM"
 * @returns Precio total formateado
 */
export function calculateAndFormatPrice(pricePerHour: number, timeRange: string): string {
  const [startTime, endTime] = timeRange.split(' - ');
  const totalPrice = calculateTotalPrice(pricePerHour, startTime, endTime);
  return formatPrice(totalPrice);
}
