import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

/**
 * GET handler for /api/reportes
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    let url = `${API_BASE_URL}/reportes`;

    // If query parameter is provided, use the search endpoint
    if (query) {
      url = `${API_BASE_URL}/reportes/buscar?query=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener reportes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/reportes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for /api/reportes
 * Proxies requests to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/reportes/generar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    // Clonar la respuesta para poder leerla múltiples veces
    const responseClone = response.clone();

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Error al generar reporte' },
        { status: response.status }
      );
    }

    const data = await responseClone.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/reportes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
