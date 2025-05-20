import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/instalaciones/estado-alternativo
 * Endpoint alternativo que obtiene todas las instalaciones activas y construye el estado
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo estado alternativo de instalaciones`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // Obtener todas las instalaciones activas
    const response = await fetch(`${API_BASE_URL}/instalaciones?activo=true`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error al obtener instalaciones activas: ${response.status}`);
      return NextResponse.json(
        { error: 'Error al obtener instalaciones activas' },
        { status: response.status }
      );
    }

    let instalaciones;
    try {
      instalaciones = await response.json();
      console.log(`[API] Instalaciones activas recibidas: ${instalaciones.length}`);
    } catch (parseError) {
      console.error(`[API] Error al parsear la respuesta JSON:`, parseError);
      return NextResponse.json(
        { error: 'Error al parsear la respuesta del servidor' },
        { status: 500 }
      );
    }

    // Verificar si los datos son un array
    if (!Array.isArray(instalaciones)) {
      console.error(`[API] Los datos recibidos no son un array:`, instalaciones);
      return NextResponse.json([]);
    }

    // Obtener mantenimientos activos
    const resMantenimientos = await fetch(`${API_BASE_URL}/mantenimientos/activos`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    let mantenimientosActivos = [];
    if (resMantenimientos.ok) {
      try {
        mantenimientosActivos = await resMantenimientos.json();
        console.log(`[API] Mantenimientos activos recibidos: ${mantenimientosActivos.length}`);
      } catch (error) {
        console.error(`[API] Error al parsear mantenimientos:`, error);
      }
    }

    // Crear un mapa de instalaciones en mantenimiento
    const instalacionesEnMantenimiento = new Set();
    if (Array.isArray(mantenimientosActivos)) {
      mantenimientosActivos.forEach((m: any) => {
        if (m.instalacion && m.instalacion.id) {
          instalacionesEnMantenimiento.add(m.instalacion.id);
        } else if (m.instalacionId) {
          instalacionesEnMantenimiento.add(m.instalacionId);
        }
      });
    }

    // Transformar los datos al formato esperado
    const estadoInstalaciones = instalaciones.map((instalacion: any, index: number) => {
      const enMantenimiento = instalacionesEnMantenimiento.has(instalacion.id);
      return {
        idInstalacion: instalacion.id,
        nombreInstalacion: instalacion.nombre || 'Instalación sin nombre',
        estado: enMantenimiento ? 'mantenimiento' : 'disponible',
        reservasHoy: 0 // No tenemos esta información en este endpoint
      };
    });

    console.log(`[API] Estado alternativo de instalaciones generado: ${estadoInstalaciones.length} registros`);
    return NextResponse.json(estadoInstalaciones);
  } catch (error) {
    console.error('Error en la ruta /api/instalaciones/estado-alternativo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
