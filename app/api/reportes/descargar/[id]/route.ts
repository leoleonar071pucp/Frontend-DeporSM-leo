import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

/**
 * GET handler for /api/reportes/descargar/[id]
 * Proxies requests to the backend API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`[API] Iniciando descarga del reporte ID: ${id}`);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // First, get the report metadata to determine the content type
    console.log(`[API] Obteniendo metadatos del reporte ID: ${id}`);
    const metadataResponse = await fetch(`${API_BASE_URL}/reportes/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    console.log(`[API] Respuesta de metadatos: ${metadataResponse.status} ${metadataResponse.statusText}`);

    if (!metadataResponse.ok) {
      console.error(`[API] Error al obtener metadatos: ${metadataResponse.status} ${metadataResponse.statusText}`);

      let errorMessage = 'Error al obtener metadatos del reporte';
      try {
        const errorText = await metadataResponse.text();
        console.error(`[API] Texto de error de metadatos: ${errorText}`);
        errorMessage = errorText || errorMessage;
      } catch (e) {
        console.error(`[API] No se pudo leer el cuerpo del error de metadatos:`, e);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: metadataResponse.status }
      );
    }

    const metadata = await metadataResponse.json();
    console.log(`[API] Metadatos obtenidos:`, metadata);

    // Now, get the actual file
    console.log(`[API] Solicitando archivo de reporte con ID ${id} desde ${API_BASE_URL}/reportes/descargar/${id}`);

    try {
      const fileResponse = await fetch(`${API_BASE_URL}/reportes/descargar/${id}`, {
        credentials: 'include',
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      console.log(`[API] Respuesta del servidor: ${fileResponse.status} ${fileResponse.statusText}`);
      console.log(`[API] Headers de respuesta:`, Object.fromEntries([...fileResponse.headers.entries()]));

      if (!fileResponse.ok) {
        // Intentar leer el cuerpo del error
        let errorMessage = `Error al descargar reporte: ${fileResponse.status} ${fileResponse.statusText}`;
        let errorDetails = "";

        try {
          const contentType = fileResponse.headers.get('content-type');
          console.log(`[API] Tipo de contenido de error:`, contentType);

          if (contentType && contentType.includes('application/json')) {
            const errorData = await fileResponse.json();
            console.error(`[API] Error JSON:`, errorData);
            errorMessage = errorData.error || errorMessage;
            errorDetails = JSON.stringify(errorData);
          } else {
            const errorText = await fileResponse.text();
            console.error(`[API] Error texto:`, errorText);
            errorDetails = errorText;
          }
        } catch (e) {
          console.error(`[API] No se pudo leer el cuerpo del error:`, e);
        }

        console.error(`[API] Error completo: ${errorMessage} - ${errorDetails}`);

        return NextResponse.json(
          {
            error: errorMessage,
            details: errorDetails,
            status: fileResponse.status,
            statusText: fileResponse.statusText
          },
          { status: fileResponse.status }
        );
      }

      // Verificar el tipo de contenido de la respuesta
      const responseContentType = fileResponse.headers.get('content-type');
      console.log(`[API] Tipo de contenido de la respuesta:`, responseContentType);

      // Si la respuesta es JSON, es la nueva respuesta con URL de Supabase
      if (responseContentType && responseContentType.includes('application/json')) {
        const data = await fileResponse.json();
        console.log(`[API] Datos de descarga recibidos:`, data);

        // Verificar que tenemos la URL
        if (!data.url) {
          console.error(`[API] No se recibió URL de descarga`);
          return NextResponse.json(
            { error: 'No se recibió la URL de descarga del servidor' },
            { status: 500 }
          );
        }

        // Retornar la respuesta JSON directamente al frontend
        console.log(`[API] Enviando URL de descarga: ${data.url}`);
        return NextResponse.json(data);
      }

      // Si llegamos aquí, la respuesta no es JSON (caso legacy)
      console.error(`[API] Respuesta inesperada del servidor - no es JSON`);
      return NextResponse.json(
        { error: 'Respuesta inesperada del servidor' },
        { status: 500 }
      );

    } catch (error: any) {
      console.error(`[API] Error al solicitar el archivo:`, error);
      return NextResponse.json(
        {
          error: `Error al solicitar el archivo: ${error.message || 'Error desconocido'}`,
          stack: error.stack
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`[API] Error general en la ruta /api/reportes/descargar/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error.message || 'Error desconocido',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
