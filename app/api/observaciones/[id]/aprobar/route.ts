import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

/**
 * PUT handler for /api/observaciones/[id]/aprobar
 * Proxies requests to the backend API
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    console.log(`[API] Aprobando observación ID: ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/observaciones/${id}/aprobar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('[API] Error al aprobar observación:', error);
    return NextResponse.json(
      { error: 'Error al aprobar la observación' },
      { status: 500 }
    );
  }
}
