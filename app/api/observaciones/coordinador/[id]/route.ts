import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/observaciones/coordinador/[id]
 * Proxies requests to the backend API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`[API] Obteniendo observaciones para coordinador ID: ${id}`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/observaciones/coordinador/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error al obtener observaciones del coordinador: ${response.status} ${response.statusText}`);

      // Intentar leer el cuerpo del error para depuración
      try {
        const errorText = await response.text();
        console.error(`[API] Respuesta de error: ${errorText}`);
      } catch (e) {
        console.error(`[API] No se pudo leer el cuerpo del error: ${e}`);
      }

      return NextResponse.json(
        { error: 'Error al obtener observaciones del coordinador' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Observaciones del coordinador obtenidas correctamente: ${data.length} registros`);

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en la ruta /api/observaciones/coordinador/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
