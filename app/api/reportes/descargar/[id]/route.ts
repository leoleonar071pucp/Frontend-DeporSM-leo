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

      // Si la respuesta es JSON, probablemente sea un error
      if (responseContentType && responseContentType.includes('application/json')) {
        const errorData = await fileResponse.json();
        console.error(`[API] Error JSON recibido:`, errorData);
        return NextResponse.json(
          {
            error: errorData.error || 'El servidor devolvió un error en formato JSON',
            details: errorData
          },
          { status: 500 }
        );
      }

      // Get the file content as a blob
      const fileBlob = await fileResponse.blob();
      console.log(`[API] Tamaño del blob: ${fileBlob.size} bytes`);
      console.log(`[API] Tipo MIME del blob: ${fileBlob.type}`);

      // Verificar que el blob no esté vacío
      if (fileBlob.size === 0) {
        console.error(`[API] El archivo descargado está vacío`);
        return NextResponse.json(
          { error: "El archivo descargado está vacío" },
          { status: 500 }
        );
      }

      // Determine the content type based on the format
      let contentType;
      if (responseContentType && responseContentType !== 'application/octet-stream') {
        // Usar el tipo de contenido de la respuesta si está disponible y no es genérico
        contentType = responseContentType;
      } else {
        // Determinar el tipo de contenido basado en el formato del reporte
        contentType = metadata.formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
      }

      console.log(`[API] Usando tipo de contenido: ${contentType}`);

      // Create a filename
      const contentDisposition = fileResponse.headers.get('content-disposition');
      let filename;

      if (contentDisposition && contentDisposition.includes('filename=')) {
        // Extraer el nombre del archivo del header Content-Disposition
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        filename = filenameMatch ? filenameMatch[1] : null;
      }

      // Si no se pudo extraer el nombre del archivo, usar uno basado en los metadatos
      if (!filename) {
        filename = `${metadata.nombre}.${metadata.formato === 'excel' ? 'xlsx' : 'pdf'}`;
      }

      console.log(`[API] Nombre del archivo para descarga: ${filename}`);

      // Create a new response with the correct content type
      const response = new NextResponse(fileBlob, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      console.log(`[API] Enviando respuesta con headers:`, Object.fromEntries([...response.headers.entries()]));
      return response;

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
