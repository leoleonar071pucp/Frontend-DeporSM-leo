import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/coordinador/dashboard/[id]
 * Proxies requests to the backend API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`[API] Obteniendo dashboard para coordinador ID: ${id}`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/coordinador/dashboard/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error del backend: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Error del servidor: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Dashboard del coordinador obtenido correctamente`);

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en la ruta /api/coordinador/dashboard/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
