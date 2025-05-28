/**
 * Utilidades para manejo de storage en Supabase
 * Centraliza la lógica de subida de archivos para diferentes tipos
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://goajrdpkfhunnfuqtoub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYWpyZHBrZmh1bm5mdXF0b3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTU1NTQsImV4cCI6MjA2MjI5MTU1NH0.-_GxSWv-1UZNsXcSwIcFUKlprJ5LMX_0iz5VbesGgPQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos de archivos permitidos
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOCUMENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// Tamaños máximos
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Valida un archivo según tipo y tamaño
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map(type => {
      if (type.includes('jpeg') || type.includes('png') || type.includes('webp')) return 'imagen';
      if (type.includes('pdf')) return 'PDF';
      return type;
    }).join(', ');
    return { isValid: false, error: `Solo se permiten archivos de tipo: ${typeNames}` };
  }

  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `El archivo no debe superar los ${sizeMB}MB` };
  }

  return { isValid: true };
}

/**
 * Sube una imagen de instalación a Supabase
 */
export async function uploadInstallationImage(file: File): Promise<string | null> {
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
  if (!validation.isValid) {
    console.error("Validación de archivo falló:", validation.error);
    return null;
  }

  const filePath = `instalaciones/${Date.now()}_${file.name}`;

  const { error } = await supabase
    .storage
    .from('instalaciones')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error("Error al subir imagen de instalación:", error.message);
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('instalaciones')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Sube una imagen de observación a Supabase
 */
export async function uploadObservationImage(file: File): Promise<string | null> {
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
  if (!validation.isValid) {
    console.error("Validación de archivo falló:", validation.error);
    return null;
  }

  const filePath = `instalaciones/observaciones/${Date.now()}_${file.name}`;

  const { error } = await supabase
    .storage
    .from('instalaciones')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error("Error al subir imagen de observación:", error.message);
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('instalaciones')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Sube un comprobante de pago a Supabase
 */
export async function uploadPaymentVoucher(file: File, reservationId: number): Promise<string | null> {
  const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE);
  if (!validation.isValid) {
    console.error("Validación de archivo falló:", validation.error);
    return null;
  }

  // Crear un nombre de archivo único con el ID de la reserva
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `comprobante_reserva_${reservationId}_${timestamp}.${fileExtension}`;

  console.log("Subiendo comprobante a Supabase:", {
    fileName,
    fileSize: file.size,
    fileType: file.type,
    reservationId,
    bucket: 'comprobantes'
  });

  const { error } = await supabase
    .storage
    .from('comprobantes')  // Usar el bucket específico para comprobantes
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error("Error al subir comprobante de pago:", error.message);
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('comprobantes')  // Usar el bucket específico para comprobantes
    .getPublicUrl(fileName);

  console.log("Comprobante subido exitosamente:", publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
}

/**
 * Sube múltiples imágenes de observación a Supabase
 */
export async function uploadMultipleObservationImages(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const url = await uploadObservationImage(file);
    if (url) {
      uploadedUrls.push(url);
    }
  }

  return uploadedUrls;
}

/**
 * Elimina un archivo de Supabase
 */
export async function deleteFile(filePath: string, bucket: string = 'instalaciones'): Promise<boolean> {
  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error("Error al eliminar archivo:", error.message);
    return false;
  }

  return true;
}

/**
 * Obtiene la URL pública de un archivo
 */
export function getPublicUrl(filePath: string, bucket: string = 'instalaciones'): string {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Elimina un comprobante de pago específico
 */
export async function deletePaymentVoucher(fileName: string): Promise<boolean> {
  return await deleteFile(fileName, 'comprobantes');
}

/**
 * Obtiene la URL pública de un comprobante
 */
export function getPaymentVoucherUrl(fileName: string): string {
  return getPublicUrl(fileName, 'comprobantes');
}
