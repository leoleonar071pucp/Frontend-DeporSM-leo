// Servicio para API de configuración general
import { apiClient } from './api-client';
import { configCache } from './config-cache';

// Interfaz para los datos de configuración general
export interface ConfiguracionGeneral {
  id?: number;
  nombreSitio: string;
  descripcionSitio: string;
  telefonoContacto: string;
  emailContacto: string;
  maxReservasPorUsuario: number;
  limiteTiempoCancelacion: number;
  modoMantenimiento: boolean;
  registroHabilitado: boolean;
  reservasHabilitadas: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene la configuración general del sistema
 * @param forceRefresh Si es true, fuerza la recarga de la configuración desde el servidor
 * @returns Configuración general
 */
export const obtenerConfiguracionGeneral = async (forceRefresh = false): Promise<ConfiguracionGeneral> => {
  try {
    // Comprobar si tenemos datos en caché y si son válidos
    const cachedConfig = configCache.get();
    if (!forceRefresh && cachedConfig) {
      return cachedConfig;
    }
      // Si no hay datos en caché o se fuerza la recarga, obtener desde el servidor
    const response = await apiClient.get('/configuracion/general');
    
    // Guardar en caché
    configCache.set(response.data);
    
    return response.data;  } catch (error) {
    console.error('Error al obtener la configuración general:', error);
    
    // If we have cached data, return it even if the refresh failed
    const cachedConfig = configCache.get();
    if (cachedConfig) {
      console.warn('Error al obtener configuración fresca, usando caché');
      return cachedConfig;
    }
    
    // Return default values if no cache is available
    return {
      nombreSitio: 'DeporSM',
      descripcionSitio: 'Sistema de Reservas Deportivas',
      telefonoContacto: '555-1234',
      emailContacto: 'contacto@deporsm.com',
      maxReservasPorUsuario: 3,
      limiteTiempoCancelacion: 48,
      modoMantenimiento: false,
      registroHabilitado: true,
      reservasHabilitadas: true
    };
  }
};

/**
 * Actualiza la configuración general del sistema
 * @param config Configuración general a actualizar
 * @returns Configuración general actualizada
 */
export const actualizarConfiguracionGeneral = async (config: ConfiguracionGeneral): Promise<ConfiguracionGeneral> => {
  try {
    const response = await apiClient.put('/configuracion/general', config);
    
    // Actualizar la caché con los nuevos datos
    configCache.set(response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la configuración general:', error);
    throw error;
  }
};
