/**
 * Utilidades para formatear números de teléfono
 */

/**
 * Formatea un número de teléfono con espacios cada 3 dígitos
 * Ejemplo: "987654321" -> "987 654 321"
 * @param phoneNumber - Número de teléfono como string
 * @returns Número formateado con espacios
 */
export function formatPhoneWithSpaces(phoneNumber: string): string {
  // Eliminar cualquier caracter que no sea un número
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Si está vacío, devolver vacío
  if (!cleaned) return '';
  
  // Formatear con espacios cada 3 dígitos para números de 9 dígitos (formato peruano)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Para otros números de dígitos, formatear de manera básica
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return cleaned.replace(/(\d{3})(\d+)/, '$1 $2');
  } else {
    return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
  }
}

/**
 * Filtra solo números de un string y limita a 9 dígitos máximo
 * @param value - Valor de entrada
 * @returns Solo números, máximo 9 dígitos
 */
export function filterPhoneNumbers(value: string): string {
  return value.replace(/\D/g, '').substring(0, 9);
}

/**
 * Maneja el cambio de input para campos de teléfono
 * Filtra números y aplica formato automáticamente
 * @param value - Valor del input
 * @returns Valor formateado
 */
export function handlePhoneInputChange(value: string): string {
  const numbersOnly = filterPhoneNumbers(value);
  return formatPhoneWithSpaces(numbersOnly);
}

/**
 * Valida si un número de teléfono es válido (9 dígitos)
 * @param phoneNumber - Número a validar
 * @returns true si es válido, false si no
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 9;
}

/**
 * Convierte un número con espacios a formato sin espacios para envío al backend
 * @param formattedPhone - Número formateado con espacios
 * @returns Número sin espacios
 */
export function phoneToBackendFormat(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}
