import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/observaciones/recientes
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo observaciones recientes`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/observaciones/recientes`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error al obtener observaciones recientes: ${response.status} ${response.statusText}`);

      // Intentar leer el cuerpo del error para depuración
      try {
        const errorText = await response.text();
        console.error(`[API] Respuesta de error: ${errorText}`);
      } catch (e) {
        console.error(`[API] No se pudo leer el cuerpo del error: ${e}`);
      }

      return NextResponse.json(
        { error: 'Error al obtener observaciones recientes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Observaciones recientes obtenidas correctamente: ${data.length} registros`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/observaciones/recientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
