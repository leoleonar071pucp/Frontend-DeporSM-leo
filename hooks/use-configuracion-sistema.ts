// Utilidad para acceder a la configuración con tipado mejorado
import { useConfiguracion } from "@/context/ConfiguracionContext";
import { useState, useEffect } from "react";

// Interfaz extendida de la configuración para incluir métodos útiles
export interface SistemaConfigExtendido {
  /**
   * Devuelve el nombre del sitio, con un valor por defecto si no está disponible
   */
  getNombreSitio: (fallback?: string) => string;
  
  /**
   * Devuelve la descripción del sitio, con un valor por defecto si no está disponible
   */
  getDescripcion: (fallback?: string) => string;
  
  /**
   * Devuelve el email de contacto, con un valor por defecto si no está disponible
   */
  getEmailContacto: (fallback?: string) => string;
  
  /**
   * Devuelve el teléfono de contacto, con un valor por defecto si no está disponible
   */
  getTelefonoContacto: (fallback?: string) => string;
  
  /**
   * Devuelve si las reservas están habilitadas
   */
  reservasEstanHabilitadas: () => boolean;
  
  /**
   * Devuelve si el registro está habilitado
   */
  registroEstaHabilitado: () => boolean;
  
  /**
   * Devuelve el límite de tiempo para cancelar reservas en horas
   */
  getLimiteCancelacionHoras: (fallback?: number) => number;
  
  /**
   * Devuelve el límite máximo de reservas por usuario
   */
  getMaxReservasPorUsuario: (fallback?: number) => number;
  
  /**
   * Indica si el sistema está en modo mantenimiento
   */
  modoMantenimiento: boolean;
  
  /**
   * Indica si hay algún error en la configuración
   */
  tieneError: boolean;
  
  /**
   * Indica si la configuración está cargando
   */
  estaCargando: boolean;
}

/**
 * Hook personalizado para acceder a la configuración del sistema con funciones helper
 */
export function useConfiguracionSistema(): SistemaConfigExtendido {
  const { config, recargarConfig } = useConfiguracion();
  const [extendido, setExtendido] = useState<SistemaConfigExtendido | null>(null);
    useEffect(() => {
    // Crear un objeto extendido con métodos helper
    const configExtendida: SistemaConfigExtendido = {
      getNombreSitio: (fallback = "DeporSM") => config.nombreSitio || fallback,
      
      getDescripcion: (fallback = "Sistema de Reservas Deportivas") => 
        config.descripcionSitio || fallback,
      
      getEmailContacto: (fallback = "contacto@deporsm.com") => 
        config.emailContacto || fallback,
      
      getTelefonoContacto: (fallback = "(01) 123-4567") => 
        config.telefonoContacto || fallback,
      
      reservasEstanHabilitadas: () => config.reservasHabilitadas,
      
      registroEstaHabilitado: () => config.registroHabilitado,
      
      getLimiteCancelacionHoras: (fallback = 48) => 
        config.limiteTiempoCancelacion || fallback,
      
      getMaxReservasPorUsuario: (fallback = 3) => 
        config.maxReservasPorUsuario || fallback,
      
      modoMantenimiento: config.modoMantenimiento,
      
      tieneError: config.error !== null,
      
      estaCargando: config.isLoading
    };
    
    setExtendido(configExtendida);
  }, [config]);
    // Si no se ha inicializado, devolver un objeto temporal
  if (!extendido) {
    return {
      getNombreSitio: () => "DeporSM",
      getDescripcion: () => "Sistema de Reservas Deportivas",
      getEmailContacto: () => "contacto@deporsm.com",
      getTelefonoContacto: () => "(01) 123-4567",
      reservasEstanHabilitadas: () => true,
      registroEstaHabilitado: () => true,
      getLimiteCancelacionHoras: () => 48,
      getMaxReservasPorUsuario: () => 3,
      modoMantenimiento: false,
      tieneError: false,
      estaCargando: true
    };
  }
  
  return extendido;
}
