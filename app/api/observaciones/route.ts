import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * POST handler for /api/observaciones
 * Proxies requests to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(`[API] Creando nueva observación`);

    const response = await fetch(`${API_BASE_URL}/observaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    // Clonar la respuesta para poder leerla múltiples veces
    const responseClone = response.clone();

    if (!response.ok) {
      console.error(`[API] Error al crear observación: ${response.status} ${response.statusText}`);

      // Intentar leer el cuerpo del error para depuración
      try {
        const errorText = await response.text();
        console.error(`[API] Respuesta de error: ${errorText}`);
        return NextResponse.json(
          { error: errorText || 'Error al crear observación' },
          { status: response.status }
        );
      } catch (e) {
        console.error(`[API] No se pudo leer el cuerpo del error: ${e}`);
        return NextResponse.json(
          { error: 'Error al crear observación' },
          { status: response.status }
        );
      }
    }

    const data = await responseClone.json();
    console.log(`[API] Observación creada correctamente`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/observaciones:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
