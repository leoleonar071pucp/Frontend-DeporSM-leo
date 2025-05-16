"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Building } from "lucide-react"
import Link from "next/link"

interface HorarioCoordinador {
  id: number
  coordinadorInstalacionId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
  instalacionNombre: string
  instalacionId: number
}

export default function HorarioSemanal() {
  // Esta página ha sido reemplazada por /coordinador/asistencia/calendario
  
  // Redirigir automáticamente a la nueva ubicación
  useEffect(() => {
    window.location.href = '/coordinador/asistencia/calendario';
  }, []);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redireccionando a la nueva página de horarios...</p>
      </div>
    </div>
  );
  
  /* Código anterior comentado para referencia
  const [isLoading, setIsLoading] = useState(true)
  const [horarios, setHorarios] = useState<HorarioCoordinador[]>([])
  const [error, setError] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<number | null>(null)

  useEffect(() => {
    // Verificar si hay un usuario logueado y obtener su ID
    const checkAuth = async () => {
      try {
        // Obtener los datos del usuario logueado desde sessionStorage
        const authDataStr = sessionStorage.getItem('authData');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          if (authData && authData.usuario && authData.usuario.id) {
            setUsuarioId(authData.usuario.id);
            return authData.usuario.id;
          }
        }
        return null;
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        return null;
      }
    };
  */

    const loadHorarios = async () => {
      try {
        const userId = await checkAuth();
        if (!userId) {
          setError("Usuario no autenticado");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/horarios-coordinador/coordinador/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar horarios: ${response.status}`);
        }
        
        const data = await response.json();
        setHorarios(data);
      } catch (error) {
        console.error("Error al cargar los horarios:", error);
        setError("No se pudieron cargar los horarios. Por favor, intente nuevamente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHorarios();
  }, []);

  const getDiaSemanaFormatted = (diaSemana: string): string => {
    const dias: {[key: string]: string} = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miercoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };
    return dias[diaSemana] || diaSemana;
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    // Si el formato es HH:MM:SS, cortamos para mostrar solo HH:MM
    if (time.length >= 5) {
      return time.substring(0, 5);
    }
    return time;
  };

  // Agrupamos los horarios por día de la semana
  const horariosPorDia: { [key: string]: HorarioCoordinador[] } = {};
  const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  horarios.forEach(horario => {
    if (!horariosPorDia[horario.diaSemana]) {
      horariosPorDia[horario.diaSemana] = [];
    }
    horariosPorDia[horario.diaSemana].push(horario);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Horario Semanal</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Error al cargar el horario</h3>
            <p className="text-gray-500 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (horarios.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Horario Semanal</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">Sin horarios asignados</h3>
            <p className="text-gray-500 mt-2">No tienes horarios asignados actualmente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Horario Semanal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mi Horario de Trabajo</CardTitle>
          <CardDescription>Horarios asignados para la supervisión de instalaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {ordenDias.map(dia => (
              <div key={dia} className="p-2 rounded-lg border">
                <h3 className="font-semibold text-center mb-3 bg-primary text-white py-1 rounded-md">
                  {getDiaSemanaFormatted(dia)}
                </h3>
                <div className="space-y-2">
                  {horariosPorDia[dia] ? (
                    horariosPorDia[dia].map(horario => (
                      <div key={horario.id} className="p-2 bg-gray-50 rounded-md border">
                        <p className="font-medium text-sm">{horario.instalacionNombre}</p>
                        <div className="flex items-center text-xs mt-1 text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(horario.horaInicio)} - {formatTime(horario.horaFin)}
                        </div>
                        <div className="mt-1">
                          <Link href={`/coordinador/instalaciones/${horario.instalacionId}`}>
                            <Badge variant="outline" className="text-xs cursor-pointer">
                              Ver instalación
                            </Badge>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-4">
                      Sin horario
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/coordinador">Volver al Dashboard</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary-light" asChild>
            <Link href="/coordinador/instalaciones">
              <Building className="h-4 w-4 mr-2" />
              Ver Instalaciones
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
