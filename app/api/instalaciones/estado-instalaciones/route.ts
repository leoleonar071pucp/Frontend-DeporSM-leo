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

    let data;
    try {
      data = await response.json();
      console.log(`[API] Datos recibidos del backend:`, JSON.stringify(data));
    } catch (parseError) {
      console.error(`[API] Error al parsear la respuesta JSON:`, parseError);
      return NextResponse.json(
        { error: 'Error al parsear la respuesta del servidor' },
        { status: 500 }
      );
    }

    // Verificar si los datos son un array
    if (!Array.isArray(data)) {
      console.error(`[API] Los datos recibidos no son un array:`, data);

      // Si es un objeto con un campo de error, devolver ese error
      if (data && data.error) {
        return NextResponse.json(
          { error: data.error },
          { status: 400 }
        );
      }

      // Si es un objeto que podría contener los datos en algún campo, intentar extraerlos
      if (data && typeof data === 'object') {
        // Buscar algún campo que sea un array
        for (const key in data) {
          if (Array.isArray(data[key])) {
            data = data[key];
            console.log(`[API] Usando datos del campo '${key}'`);
            break;
          }
        }
      }

      // Si aún no es un array, devolver un array vacío
      if (!Array.isArray(data)) {
        console.log(`[API] Devolviendo array vacío porque los datos no son un array`);
        return NextResponse.json([]);
      }
    }

    // Validar y transformar los datos para asegurar que no haya IDs nulos
    const validatedData = data
      .filter((item: any) => item !== null) // Filtrar elementos nulos
      .map((item: any, index: number) => {
        // Verificar si tenemos datos nulos o incompletos
        if (!item.idInstalacion || !item.nombreInstalacion) {
          console.warn(`[API] Datos incompletos detectados en el elemento ${index}:`, item);

          // Si hay datos nulos, intentar obtener datos de respaldo
          return null; // Marcar para filtrar después
        }

        // Asegurar que cada elemento tenga valores válidos
        const processedItem = {
          idInstalacion: item.idInstalacion,
          nombreInstalacion: item.nombreInstalacion,
          estado: item.estado || 'disponible',
          reservasHoy: item.reservasHoy !== null ? item.reservasHoy : 0
        };
        return processedItem;
      })
      .filter((item: any) => item !== null); // Filtrar elementos marcados como nulos

    // Si no hay datos válidos después del procesamiento, intentar obtener datos alternativos
    if (validatedData.length === 0) {
      console.warn(`[API] No se obtuvieron datos válidos, intentando obtener datos alternativos...`);
      try {
        // Intentar obtener datos de la ruta alternativa
        const alternativeResponse = await fetch(`/api/instalaciones/estado-alternativo`);
        if (alternativeResponse.ok) {
          const alternativeData = await alternativeResponse.json();
          console.log(`[API] Datos alternativos obtenidos:`, JSON.stringify(alternativeData));
          return NextResponse.json(alternativeData);
        }
      } catch (fallbackError) {
        console.error(`[API] Error al obtener datos alternativos:`, fallbackError);
      }
    }

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
