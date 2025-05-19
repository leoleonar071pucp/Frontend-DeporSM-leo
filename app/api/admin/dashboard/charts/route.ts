import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/admin/dashboard/charts
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/charts`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener datos de gráficos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/admin/dashboard/charts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
