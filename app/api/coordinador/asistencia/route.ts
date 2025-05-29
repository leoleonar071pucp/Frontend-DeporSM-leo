import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * POST handler for /api/coordinador/asistencia
 * Proxies requests to the backend API for creating attendance records
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(`[API] Creando registro de asistencia:`, body);

    // Función para mapear estados del frontend al backend (base de datos usa formato con guiones)
    const mapStatusToBackend = (status: string) => {
      switch (status.toLowerCase()) {
        case 'a-tiempo':
          return 'a-tiempo';
        case 'tarde':
          return 'tarde';
        case 'no-asistio':
          return 'no-asistio';
        case 'pendiente':
          return 'pendiente';
        default:
          return 'pendiente';
      }
    };

    // Mapear los datos del frontend al formato esperado por el backend
    const entryStatus = mapStatusToBackend(body.estadoEntrada);

    // Si el estado de entrada es "no-asistio", el estado de salida también debe ser "no-asistio"
    const exitStatus = entryStatus === 'no-asistio' ? 'no-asistio' : 'pendiente';

    console.log(`[API] Datos recibidos en el endpoint:`, body);
    console.log(`[API] Tipos de datos recibidos:`, {
      coordinadorId: typeof body.coordinadorId,
      instalacionId: typeof body.instalacionId,
      fecha: typeof body.fecha,
      fechaVisita: typeof body.fechaVisita,
      fechaValue: body.fecha || body.fechaVisita,
      horaProgramadaInicio: typeof body.horaProgramadaInicio,
      horaInicio: typeof body.horaInicio,
      estadoEntrada: typeof body.estadoEntrada
    });

    // Validar que los campos requeridos estén presentes
    const missingFields = [];
    if (!body.coordinadorId) missingFields.push('coordinadorId');
    if (!body.instalacionId) missingFields.push('instalacionId');
    if (!body.fecha && !body.fechaVisita) missingFields.push('fecha/fechaVisita');
    if (!body.horaProgramadaInicio && !body.horaInicio) missingFields.push('horaProgramadaInicio/horaInicio');
    if (!body.horaProgramadaFin && !body.horaFin) missingFields.push('horaProgramadaFin/horaFin');
    if (!body.estadoEntrada) missingFields.push('estadoEntrada');

    if (missingFields.length > 0) {
      console.error(`[API] Campos faltantes:`, missingFields);
      console.error(`[API] Datos recibidos:`, body);
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tipos de datos
    const coordinadorIdNum = parseInt(body.coordinadorId);
    const instalacionIdNum = parseInt(body.instalacionId);

    if (isNaN(coordinadorIdNum) || isNaN(instalacionIdNum)) {
      console.error(`[API] IDs inválidos - coordinadorId: ${body.coordinadorId}, instalacionId: ${body.instalacionId}`);
      return NextResponse.json(
        { error: 'Los IDs de coordinador e instalación deben ser números válidos' },
        { status: 400 }
      );
    }

    // Validar formato de fecha (yyyy-MM-dd)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const fechaToValidate = body.fecha || body.fechaVisita;
    if (!dateRegex.test(fechaToValidate)) {
      console.error(`[API] Formato de fecha inválido: ${fechaToValidate}`);
      return NextResponse.json(
        { error: 'La fecha debe estar en formato yyyy-MM-dd' },
        { status: 400 }
      );
    }

    // Función auxiliar para asegurar formato HH:mm
    const formatTimeToHHMM = (timeStr: string): string => {
      if (!timeStr) return timeStr;
      // Si tiene segundos, quitarlos
      if (timeStr.length > 5) {
        return timeStr.substring(0, 5);
      }
      return timeStr;
    };

    const backendData = {
      coordinadorId: coordinadorIdNum,
      instalacionId: instalacionIdNum,
      fecha: body.fecha || body.fechaVisita, // Aceptar ambos nombres por compatibilidad
      horaProgramadaInicio: formatTimeToHHMM(body.horaProgramadaInicio || body.horaInicio), // Asegurar formato HH:mm
      horaProgramadaFin: formatTimeToHHMM(body.horaProgramadaFin || body.horaFin), // Asegurar formato HH:mm
      horaEntrada: formatTimeToHHMM(body.horaEntrada || body.horaProgramadaInicio || body.horaInicio), // Asegurar formato HH:mm
      estadoEntrada: entryStatus,
      horaSalida: null, // Inicialmente null
      estadoSalida: exitStatus, // NO_ASISTIO si no asistió, PENDIENTE en otros casos
      ubicacion: body.ubicacion || null, // Dejar que el backend obtenga la ubicación de la instalación
      notas: body.notas || body.observaciones || null // Usar 'notas' que coincide con la base de datos
    };

    console.log(`[API] Datos mapeados para backend:`, backendData);

    const response = await fetch(`${API_BASE_URL}/asistencias-coordinadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(backendData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error del backend:`, errorText);

      // Manejar errores específicos
      let errorMessage = errorText;
      if (errorText.includes("Ya existe un registro de asistencia")) {
        errorMessage = "Ya has registrado tu asistencia para este horario. No puedes registrar la misma visita dos veces.";
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Asistencia creada exitosamente:`, data);

    return NextResponse.json(data, {
      status: 201,
    });

  } catch (error) {
    console.error('[API] Error al crear asistencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
