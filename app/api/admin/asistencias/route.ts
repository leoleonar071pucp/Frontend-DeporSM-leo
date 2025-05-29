import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/admin/asistencias
 * Proxies requests to the backend API for admin attendance history
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo historial de asistencias para admin`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const coordinadorNombre = searchParams.get('coordinadorNombre');
    const instalacionNombre = searchParams.get('instalacionNombre');
    const estadoEntrada = searchParams.get('estadoEntrada');
    const estadoSalida = searchParams.get('estadoSalida');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (coordinadorNombre) params.append('coordinadorNombre', coordinadorNombre);
    if (instalacionNombre) params.append('instalacionNombre', instalacionNombre);
    if (estadoEntrada) params.append('estadoEntrada', estadoEntrada);
    if (estadoSalida) params.append('estadoSalida', estadoSalida);
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);

    const url = `${API_BASE_URL}/asistencias-coordinadores/admin/historial${params.toString() ? '?' + params.toString() : ''}`;
    console.log(`[API] URL completa: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error en la respuesta: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Error del servidor: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Historial de asistencias obtenido correctamente: ${data.length} registros`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/admin/asistencias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
