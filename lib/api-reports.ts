import { apiGet, apiPost } from './api-client';

/**
 * Interfaces for report-related data
 */
export interface ReporteDTO {
  id: number;
  nombre: string;
  tipo: string;
  formato: string;
  rangoFechas: string;
  fechaCreacion: string;
  creadoPor: string;
  tamano: string;
  descripcion: string;
  rutaArchivo: string;
  instalacionId?: number;
}

export interface ReporteRequestDTO {
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  instalacionId?: number;
}

/**
 * Generates a new report
 */
export async function generarReporte(reporteRequest: ReporteRequestDTO): Promise<ReporteDTO> {
  try {
    console.log("Enviando solicitud a /api/reportes:", reporteRequest);

    // Usar apiPost directamente para evitar problemas con el manejo de la respuesta
    const response = await apiPost('reportes/generar', reporteRequest);

    if (!response.ok) {
      let errorMessage = 'Error al generar reporte';
      try {
        const errorData = await response.text();
        errorMessage = `Error al generar reporte: ${errorData}`;
      } catch (e) {
        // Si no podemos leer el texto del error, usamos el mensaje genérico
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en generarReporte:", error);
    throw error;
  }
}

/**
 * Gets all reports
 */
export async function obtenerTodosLosReportes(): Promise<ReporteDTO[]> {
  try {
    // Usar apiGet directamente para evitar problemas con el manejo de la respuesta
    const response = await apiGet('reportes');

    if (!response.ok) {
      let errorMessage = 'Error al obtener reportes';
      try {
        const errorData = await response.text();
        errorMessage = `Error al obtener reportes: ${errorData}`;
      } catch (e) {
        // Si no podemos leer el texto del error, usamos el mensaje genérico
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en obtenerTodosLosReportes:", error);
    throw error;
  }
}

/**
 * Gets recent reports
 */
export async function obtenerReportesRecientes(): Promise<ReporteDTO[]> {
  try {
    console.log("Solicitando reportes recientes...");

    // Usar apiGet directamente para evitar problemas con el manejo de la respuesta
    const response = await apiGet('reportes/recientes');

    if (!response.ok) {
      let errorMessage = 'Error al obtener reportes recientes';
      try {
        const errorData = await response.text();
        errorMessage = `Error al obtener reportes recientes: ${errorData}`;
      } catch (e) {
        // Si no podemos leer el texto del error, usamos el mensaje genérico
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Reportes recientes recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error en obtenerReportesRecientes:", error);
    throw error;
  }
}

/**
 * Searches for reports
 */
export async function buscarReportes(query: string): Promise<ReporteDTO[]> {
  try {
    // Usar apiGet directamente para evitar problemas con el manejo de la respuesta
    const response = await apiGet(`reportes/buscar?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      let errorMessage = 'Error al buscar reportes';
      try {
        const errorData = await response.text();
        errorMessage = `Error al buscar reportes: ${errorData}`;
      } catch (e) {
        // Si no podemos leer el texto del error, usamos el mensaje genérico
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en buscarReportes:", error);
    throw error;
  }
}

/**
 * Gets a report by ID
 */
export async function obtenerReportePorId(id: number): Promise<ReporteDTO> {
  try {
    // Usar apiGet directamente para evitar problemas con el manejo de la respuesta
    const response = await apiGet(`reportes/${id}`);

    if (!response.ok) {
      let errorMessage = 'Error al obtener reporte';
      try {
        const errorData = await response.text();
        errorMessage = `Error al obtener reporte: ${errorData}`;
      } catch (e) {
        // Si no podemos leer el texto del error, usamos el mensaje genérico
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en obtenerReportePorId:", error);
    throw error;
  }
}

/**
 * Gets the download URL for a report
 */
export function obtenerUrlDescargaReporte(id: number): string {
  return `/api/reportes/descargar/${id}`;
}
