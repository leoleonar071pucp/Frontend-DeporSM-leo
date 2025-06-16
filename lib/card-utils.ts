/**
 * Utilidades para formatear números de tarjeta de crédito y CVV
 */

/**
 * Formatea un número de tarjeta de crédito con espacios cada 4 dígitos
 * Ejemplo: "1234567890123456" -> "1234 5678 9012 3456"
 * @param cardNumber - Número de tarjeta como string
 * @returns Número formateado con espacios
 */
export function formatCardWithSpaces(cardNumber: string): string {
  // Eliminar cualquier caracter que no sea un número
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Si está vacío, devolver vacío
  if (!cleaned) return '';
  
  // Formatear con espacios cada 4 dígitos
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  
  return formatted;
}

/**
 * Filtra solo números de un string y limita a 16 dígitos máximo
 * @param value - Valor de entrada
 * @returns Solo números, máximo 16 dígitos
 */
export function filterCardNumbers(value: string): string {
  return value.replace(/\D/g, '').substring(0, 16);
}

/**
 * Maneja el cambio de input para campos de número de tarjeta
 * Filtra números y aplica formato automáticamente
 * @param value - Valor del input
 * @returns Valor formateado
 */
export function handleCardInputChange(value: string): string {
  const numbersOnly = filterCardNumbers(value);
  return formatCardWithSpaces(numbersOnly);
}

/**
 * Filtra solo números de un string y limita a 3 dígitos máximo para CVV
 * @param value - Valor de entrada
 * @returns Solo números, máximo 3 dígitos
 */
export function filterCvvNumbers(value: string): string {
  return value.replace(/\D/g, '').substring(0, 3);
}

/**
 * Maneja el cambio de input para campos de CVV
 * Filtra números y limita a 3 dígitos
 * @param value - Valor del input
 * @returns Valor filtrado
 */
export function handleCvvInputChange(value: string): string {
  return filterCvvNumbers(value);
}

/**
 * Valida si un número de tarjeta es válido (16 dígitos)
 * @param cardNumber - Número a validar
 * @returns true si es válido, false si no
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 16;
}

/**
 * Valida si un CVV es válido (3 dígitos)
 * @param cvv - CVV a validar
 * @returns true si es válido, false si no
 */
export function isValidCvv(cvv: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  return cleaned.length === 3;
}

/**
 * Convierte un número de tarjeta con espacios a formato sin espacios para envío al backend
 * @param formattedCard - Número formateado con espacios
 * @returns Número sin espacios
 */
export function cardToBackendFormat(formattedCard: string): string {
  return formattedCard.replace(/\D/g, '');
}

/**
 * Convierte un CVV a formato para envío al backend (sin cambios, solo números)
 * @param cvv - CVV
 * @returns CVV sin caracteres no numéricos
 */
export function cvvToBackendFormat(cvv: string): string {
  return cvv.replace(/\D/g, '');
}
