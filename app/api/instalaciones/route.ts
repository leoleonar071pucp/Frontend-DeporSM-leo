import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/instalaciones
 * Proxies requests to the backend API to get all installations
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo todas las instalaciones`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Build the backend URL with query parameters
    let backendUrl = `${API_BASE_URL}/instalaciones`;
    if (queryString) {
      backendUrl += `?${queryString}`;
    }

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error al obtener instalaciones: ${response.status}`);
      return NextResponse.json(
        { error: 'Error al obtener instalaciones' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Instalaciones obtenidas correctamente: ${data.length} registros`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en la ruta /api/instalaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
