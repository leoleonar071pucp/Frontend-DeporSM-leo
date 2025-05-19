import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

/**
 * GET handler for /api/reportes/recientes
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/reportes/recientes`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener reportes recientes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/reportes/recientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
