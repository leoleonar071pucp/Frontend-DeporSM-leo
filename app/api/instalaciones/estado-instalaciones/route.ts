import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * GET handler for /api/instalaciones/estado-instalaciones
 * Proxies requests to the backend API
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Obteniendo estado actual de instalaciones`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/instalaciones/estado-instalaciones`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`[API] Error al obtener estado de instalaciones: ${response.status}`);
      return NextResponse.json(
        { error: 'Error al obtener estado de instalaciones' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[API] Datos recibidos del backend:`, JSON.stringify(data));

    // Validar y transformar los datos para asegurar que no haya IDs nulos
    const validatedData = data
      .filter((item: any) => item !== null) // Filtrar elementos nulos
      .map((item: any, index: number) => {
        // Asegurar que cada elemento tenga un ID válido
        const processedItem = {
          idInstalacion: item.idInstalacion || `temp-id-${index}`,
          nombreInstalacion: item.nombreInstalacion || 'Instalación sin nombre',
          estado: item.estado || 'disponible',
          reservasHoy: item.reservasHoy || 0
        };
        return processedItem;
      });

    console.log(`[API] Estado de instalaciones obtenido correctamente: ${validatedData.length} registros`);
    console.log(`[API] Datos procesados:`, JSON.stringify(validatedData));
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Error en la ruta /api/instalaciones/estado-instalaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
