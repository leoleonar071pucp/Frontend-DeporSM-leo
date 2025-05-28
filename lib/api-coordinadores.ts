import { apiPost, apiPut, apiDelete, apiGet } from "@/lib/api-client";

export interface CoordinadorAsignacionDTO {
  coordinadorId: number;
  instalacionIds: number[];
  horarios: HorarioCoordinadorRequestDTO[];
}

export interface HorarioCoordinadorRequestDTO {
  instalacionId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

/**
 * Asigna instalaciones y horarios a un coordinador
 */
export async function asignarInstalacionesYHorarios(asignacion: CoordinadorAsignacionDTO): Promise<void> {
  try {
    const response = await apiPost('coordinador-instalaciones/asignar', asignacion);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al asignar instalaciones');
    }
  } catch (error) {
    console.error("Error en asignarInstalacionesYHorarios:", error);
    throw error;
  }
}

/**
 * Obtiene las asignaciones de un coordinador con sus horarios
 */
export async function obtenerAsignacionesCoordinador(coordinadorId: number): Promise<any[]> {
  try {
    console.log("Obteniendo asignaciones para coordinador:", coordinadorId);

    // PROBLEMA: El endpoint /coordinador-instalaciones/coordinador/{id} devuelve CoordinadorInstalacion
    // pero con @JsonIgnore en la instalacion, así que no tenemos los datos de la instalación.
    //
    // SOLUCIÓN: Usar el endpoint /instalaciones/coordinador/{id} que SÍ devuelve los datos de instalaciones

    // Obtener las instalaciones asignadas (con datos completos)
    const responseInstalaciones = await apiGet(`instalaciones/coordinador/${coordinadorId}`);

    if (!responseInstalaciones.ok) {
      console.warn("No se pudieron obtener instalaciones para el coordinador");
      return []; // Devolver array vacío si no hay instalaciones
    }

    const instalaciones = await responseInstalaciones.json();
    console.log("Instalaciones obtenidas:", instalaciones);

    // Obtener los horarios del coordinador
    const responseHorarios = await apiGet(`horarios-coordinador/coordinador/${coordinadorId}`);

    if (!responseHorarios.ok) {
      console.warn("No se pudieron obtener horarios para el coordinador");
      // Devolver instalaciones sin horarios
      return instalaciones.map((instalacion: any) => ({
        instalacion: instalacion,
        horarios: []
      }));
    }

    const horarios = await responseHorarios.json();
    console.log("Horarios obtenidos:", horarios);

    // Combinar instalaciones con horarios
    const asignacionesConHorarios = instalaciones.map((instalacion: any) => {
      const horariosInstalacion = horarios.filter((horario: any) =>
        horario.instalacionId === instalacion.id
      );

      return {
        instalacion: instalacion,
        horarios: horariosInstalacion
      };
    });

    console.log("Asignaciones con horarios combinadas:", asignacionesConHorarios);
    return asignacionesConHorarios;

  } catch (error) {
    console.error("Error en obtenerAsignacionesCoordinador:", error);
    throw error;
  }
}

/**
 * Elimina todas las asignaciones de un coordinador
 */
export async function eliminarAsignacionesCoordinador(coordinadorId: number): Promise<void> {
  try {
    const response = await apiDelete(`coordinador-instalaciones/coordinador/${coordinadorId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar asignaciones');
    }
  } catch (error) {
    console.error("Error en eliminarAsignacionesCoordinador:", error);
    throw error;
  }
}

/**
 * Desactiva un coordinador
 */
export async function desactivarCoordinador(coordinadorId: number): Promise<void> {
  try {
    const response = await apiPut(`usuarios/coordinadores/${coordinadorId}/desactivar`, {});

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al desactivar coordinador');
    }
  } catch (error) {
    console.error("Error en desactivarCoordinador:", error);
    throw error;
  }
}

/**
 * Activa un coordinador
 */
export async function activarCoordinador(coordinadorId: number): Promise<void> {
  try {
    const response = await apiPut(`usuarios/coordinadores/${coordinadorId}/activar`, {});

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al activar coordinador');
    }
  } catch (error) {
    console.error("Error en activarCoordinador:", error);
    throw error;
  }
}

/**
 * Obtiene la lista de coordinadores disponibles (sin asignaciones)
 */
export async function obtenerCoordinadoresDisponibles(): Promise<any[]> {
  try {
    const response = await apiGet('usuarios/allCoordinadores');

    if (!response.ok) {
      throw new Error('Error al obtener coordinadores');
    }

    const coordinadores = await response.json();

    // Filtrar coordinadores que no tienen instalaciones asignadas
    return coordinadores.filter((coord: any) =>
      !coord.instalacionesAsignadas || coord.instalacionesAsignadas.trim() === ''
    );
  } catch (error) {
    console.error("Error en obtenerCoordinadoresDisponibles:", error);
    throw error;
  }
}

/**
 * Obtiene los detalles de un coordinador específico
 */
export async function obtenerDetalleCoordinador(coordinadorId: number): Promise<any> {
  try {
    const response = await apiGet(`usuarios/coordinadores/${coordinadorId}`);

    if (!response.ok) {
      throw new Error('Error al obtener detalles del coordinador');
    }

    return await response.json();
  } catch (error) {
    console.error("Error en obtenerDetalleCoordinador:", error);
    throw error;
  }
}
