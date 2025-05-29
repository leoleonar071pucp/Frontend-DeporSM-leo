import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * PATCH handler for /api/coordinador/asistencias-coordinadores/[id]/salida
 * Proxies requests to the backend API for registering coordinator departure
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    console.log(`[API] Registrando salida para asistencia ID: ${id}`);
    console.log(`[API] Datos recibidos:`, body);
    console.log(`[API] URL base de la API: ${API_BASE_URL}`);

    // Mapear los datos del frontend al formato esperado por el backend
    // No enviamos las coordenadas como ubicación para mantener la ubicación descriptiva de la instalación
    const backendData = {
      horaSalida: body.horaSalida,
      estadoSalida: body.estadoSalida,
      ubicacion: null, // No sobrescribir la ubicación descriptiva con coordenadas
      notas: body.notas || null
    };

    console.log(`[API] Datos mapeados para backend:`, backendData);

    const response = await fetch(`${API_BASE_URL}/asistencias-coordinadores/${id}/salida`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(backendData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error del backend: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: `Error del servidor: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Salida registrada correctamente:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en la ruta /api/coordinador/asistencias-coordinadores/${params.id}/salida:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
