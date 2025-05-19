import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/observaciones/all
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo todas las observaciones`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // URL completa para depuración
    const url = `${API_BASE_URL}/observaciones/all`;
    console.log(`[API] URL completa: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    // Información detallada sobre la respuesta
    console.log(`[API] Respuesta status: ${response.status} ${response.statusText}`);
    console.log(`[API] Respuesta headers:`, Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      console.error(`[API] Error al obtener observaciones: ${response.status} ${response.statusText}`);

      // Intentar leer el cuerpo del error para depuración
      try {
        const errorText = await response.text();
        console.error(`[API] Respuesta de error: ${errorText}`);
      } catch (e) {
        console.error(`[API] No se pudo leer el cuerpo del error: ${e}`);
      }

      return NextResponse.json(
        { error: 'Error al obtener observaciones' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Depurar la estructura de la respuesta
    console.log(`[API] Tipo de respuesta: ${typeof data}`);
    console.log(`[API] Estructura de la respuesta:`, JSON.stringify(data).substring(0, 200) + '...');

    // Verificar si data es un array
    if (Array.isArray(data)) {
      console.log(`[API] Observaciones obtenidas correctamente: ${data.length} registros`);
      return NextResponse.json(data);
    }
    // Si data no es un array pero tiene una propiedad que es un array (común en APIs)
    else if (data && typeof data === 'object') {
      // Buscar propiedades que podrían contener los datos
      const possibleArrayProps = ['data', 'items', 'results', 'observaciones', 'content'];

      for (const prop of possibleArrayProps) {
        if (Array.isArray(data[prop])) {
          console.log(`[API] Observaciones encontradas en data.${prop}: ${data[prop].length} registros`);
          return NextResponse.json(data[prop]);
        }
      }

      // Si llegamos aquí, no encontramos un array en las propiedades comunes
      console.log('[API] La respuesta no contiene un array en las propiedades esperadas');

      // Devolver un array vacío para evitar errores en el cliente
      return NextResponse.json([]);
    }
    else {
      console.log('[API] La respuesta no es un objeto ni un array');
      // Devolver un array vacío para evitar errores en el cliente
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error en la ruta /api/observaciones/all:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
