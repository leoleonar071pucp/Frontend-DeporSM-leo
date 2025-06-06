"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { obtenerConfiguracionGeneral, actualizarConfiguracionGeneral, ConfiguracionGeneral } from '@/lib/api-configuracion';

// Definir una interfaz para la configuración del sistema que se usará en el frontend
export interface SistemaConfig {
  nombreSitio: string;
  descripcionSitio: string;
  telefonoContacto: string;
  emailContacto: string;
  maxReservasPorUsuario: number;
  limiteTiempoCancelacion: number;
  modoMantenimiento: boolean;
  registroHabilitado: boolean;
  reservasHabilitadas: boolean;
  isLoading: boolean;
  error: string | null;
}

// Definir la interfaz para el contexto
interface ConfiguracionContextType {
  config: SistemaConfig;
  actualizarConfig: (nuevaConfig: Partial<ConfiguracionGeneral>) => Promise<void>;
  recargarConfig: () => Promise<void>;
}

// Valores por defecto para el contexto
const defaultConfig: SistemaConfig = {
  nombreSitio: 'DeporSM',
  descripcionSitio: 'Sistema de Reservas Deportivas',
  telefonoContacto: '',
  emailContacto: '',
  maxReservasPorUsuario: 3,
  limiteTiempoCancelacion: 48,
  modoMantenimiento: false,
  registroHabilitado: true,
  reservasHabilitadas: true,
  isLoading: true,
  error: null,
};

// Crear el contexto
const ConfiguracionContext = createContext<ConfiguracionContextType>({
  config: defaultConfig,
  actualizarConfig: async () => {},
  recargarConfig: async () => {},
});

// Hook para usar el contexto
export const useConfiguracion = () => useContext(ConfiguracionContext);

// Proveedor del contexto
export const ConfiguracionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [config, setConfig] = useState<SistemaConfig>(defaultConfig);
  // Función para cargar la configuración desde el API
  const cargarConfiguracion = async (forceRefresh = false) => {
    setConfig((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const configData = await obtenerConfiguracionGeneral(forceRefresh);
      setConfig({
        nombreSitio: configData.nombreSitio,
        descripcionSitio: configData.descripcionSitio,
        telefonoContacto: configData.telefonoContacto,
        emailContacto: configData.emailContacto,
        maxReservasPorUsuario: configData.maxReservasPorUsuario,
        limiteTiempoCancelacion: configData.limiteTiempoCancelacion,
        modoMantenimiento: configData.modoMantenimiento,
        registroHabilitado: configData.registroHabilitado,
        reservasHabilitadas: configData.reservasHabilitadas,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
      setConfig((prev) => ({
        ...prev,
        isLoading: false,
        error: 'No se pudo cargar la configuración del sistema',
      }));
    }
  };

  // Función para actualizar la configuración
  const actualizarConfig = async (nuevaConfig: Partial<ConfiguracionGeneral>) => {
    try {
      // Obtener la configuración actual del servidor
      const configActual = await obtenerConfiguracionGeneral();
      
      // Combinar la configuración actual con los nuevos valores
      const configActualizada: ConfiguracionGeneral = {
        ...configActual,
        ...nuevaConfig,
      };
      
      // Enviar la configuración actualizada al servidor
      await actualizarConfiguracionGeneral(configActualizada);
      
      // Recargar la configuración
      await cargarConfiguracion();
    } catch (error) {
      console.error('Error al actualizar la configuración:', error);
      throw error;
    }
  };

  // Cargar la configuración al montar el componente
  useEffect(() => {
    cargarConfiguracion();
  }, []);
  return (
    <ConfiguracionContext.Provider value={{
      config, 
      actualizarConfig, 
      recargarConfig: () => cargarConfiguracion(true) 
    }}>
      {children}
    </ConfiguracionContext.Provider>
  );
};
