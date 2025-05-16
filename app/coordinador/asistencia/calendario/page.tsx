"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { apiGet, handleApiResponse } from "@/lib/api-client"

// Interfaces
interface HorarioCoordinador {
  id: number
  coordinadorInstalacionId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
  instalacionNombre: string
  instalacionId: number
}

interface Facility {
  facilityId: number
  facilityName: string
  schedules: Schedule[]
}

interface Schedule {
  id: number
  day: string
  startTime: string
  endTime: string
}

interface AssignedSchedules {
  [key: string]: Facility
}

interface ScheduleInSlot {
  facilityId: number
  facilityName: string
  startTime: string
  endTime: string
}

// Días de la semana - Definición central para mejor consistencia
const weekDays = [
  { id: "lunes", name: "Lunes", variants: ["lun", "lunes"] },
  { id: "martes", name: "Martes", variants: ["mar", "martes"] },
  { id: "miercoles", name: "Miércoles", variants: ["mie", "miercoles", "miércoles"] },
  { id: "jueves", name: "Jueves", variants: ["jue", "jueves"] },
  { id: "viernes", name: "Viernes", variants: ["vie", "viernes"] },
  { id: "sabado", name: "Sábado", variants: ["sab", "sabado", "sábado"] },
  { id: "domingo", name: "Domingo", variants: ["dom", "domingo"] },
]

// Función helper para normalizar días y manejar variantes
const normalizeDayName = (dayString: string): string => {
  if (!dayString) return "lunes"; // Valor predeterminado
  
  const normalizedInput = dayString.trim().toLowerCase();
  
  // Buscar en las variantes de cada día
  const matchedDay = weekDays.find(day => 
    day.variants.some(variant => normalizedInput.includes(variant))
  );
  
  return matchedDay ? matchedDay.id : "lunes";
}

// Horarios disponibles
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
]

export default function CalendarioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorarioCoordinador[]>([]);
  const [assignedSchedules, setAssignedSchedules] = useState<AssignedSchedules>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHorarios = async () => {      try {        // ID de coordinador (Fijo para desarrollo y pruebas)
        // Para una implementación en producción, se deberá obtener dinámicamente
        // Usando ID 4 ya que en la base de datos este es el ID correcto del coordinador según la tabla coordinadores_instalaciones
        const userId = 4;
        
        console.log("IMPORTANTE: Usando ID de coordinador hardcoded para desarrollo:", userId);
        
        // Para depuración, confirmamos si hay datos de autenticación en sessionStorage
        const authDataStr = sessionStorage.getItem('authData');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            console.log("Datos de autenticación encontrados en sessionStorage:", authData);
          } catch (e) {
            console.log("Error al parsear datos de autenticación:", e);
          }
        } else {
          console.log("No se encontraron datos de autenticación en sessionStorage");
        }        console.log("Obteniendo horarios para el coordinador con ID:", userId);
        
        // Obtener los horarios del coordinador usando el nuevo API client
        const response = await apiGet(`horarios-coordinador/coordinador/${userId}`);
        
        if (!response.ok) {
          console.error("Error HTTP:", response.status, response.statusText);
          throw new Error(`Error al cargar horarios: ${response.status}`);
        }
        
        const horariosData = await response.json();
        console.log("Datos recibidos del servidor:", horariosData);
        
        if (!Array.isArray(horariosData)) {
          console.error("Los datos recibidos no son un array:", horariosData);
          setError("Formato de datos incorrecto");
          setIsLoading(false);
          return;
        }
        
        setHorarios(horariosData);
        
        // Convertir los datos al formato requerido por la tabla
        const processedSchedules: AssignedSchedules = {};
        
        if (horariosData.length > 0) {
          horariosData.forEach((horario: HorarioCoordinador) => {
            // Validar que el horario tenga los campos necesarios
            if (!horario.instalacionId || !horario.diaSemana || !horario.horaInicio || !horario.horaFin) {
              console.warn("Horario con datos incompletos:", horario);
              return; // Saltar este horario
            }
              const facilityId = horario.instalacionId.toString();
            // Normalizar el nombre del día usando nuestra función helper
            const dia = normalizeDayName(horario.diaSemana);
            console.log(`Día normalizado: "${horario.diaSemana}" -> "${dia}"`);
            if (!processedSchedules[facilityId]) {
              processedSchedules[facilityId] = {
                facilityId: horario.instalacionId,
                facilityName: horario.instalacionNombre || `Instalación ${horario.instalacionId}`,
                schedules: []
              };
            }
              // Manejo seguro de los formatos de hora
            let startTime = typeof horario.horaInicio === 'string' ? horario.horaInicio : '00:00';
            let endTime = typeof horario.horaFin === 'string' ? horario.horaFin : '00:00';
            
            // Asegurar formato HH:MM y manejo de casos especiales
            try {
              // Si viene en formato HH:MM:SS, extraer solo HH:MM
              if (startTime.includes(':') && startTime.length >= 5) {
                startTime = startTime.substring(0, 5);
              }
              
              if (endTime.includes(':') && endTime.length >= 5) {
                endTime = endTime.substring(0, 5);
              }
                // Validar que sean horas válidas
              const validateTime = (time: string): string => {
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                  return '00:00';
                }
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              };
              
              startTime = validateTime(startTime);
              endTime = validateTime(endTime);
            } catch (error) {
              console.error("Error procesando formato de hora:", error);
              startTime = '00:00';
              endTime = '00:00';
            }
            
            processedSchedules[facilityId].schedules.push({
              id: horario.id,
              day: dia,
              startTime: startTime,
              endTime: endTime
            });
            
            console.log(`Procesado: ${horario.instalacionNombre}, ${dia}, ${startTime}-${endTime}`);
          });
          
          console.log("Horarios procesados correctamente:", processedSchedules);
        } else {
          console.log("No se encontraron horarios asignados para el coordinador");
        }
        
        setAssignedSchedules(processedSchedules);      } catch (error) {
        console.error("Error al cargar los horarios:", error);
        // Información adicional para depurar problemas de conexión
        try {
          // Verificar la conectividad con el backend
          apiGet('health')
            .then(response => {
              if (response.ok) {
                console.log("API backend está respondiendo correctamente");
              } else {
                console.error("API backend no responde correctamente:", response.status);
              }
            })
            .catch(e => console.error("Error verificando estado del backend:", e));
            
          // Verificar datos de autenticación
          const authDataStr = sessionStorage.getItem('authData');
          if (authDataStr) {
            console.log("Existe información de autenticación en sessionStorage");
          } else {
            console.warn("No hay información de autenticación en sessionStorage");
          }
        } catch (e) {
          console.error("Error durante la verificación de depuración:", e);
        }
        
        setError("No se pudieron cargar los horarios. Por favor, intente nuevamente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorarios();
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/asistencia">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Calendario de Asistencias</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Error al cargar los horarios</h3>
            <p className="text-gray-500 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/coordinador/asistencia">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Calendario de Asistencias</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horario Semanal</CardTitle>
          <CardDescription>Vista general de tus horarios asignados</CardDescription>
        </CardHeader>
        <CardContent>
          {horarios.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-lg font-medium">Sin horarios asignados</h3>
              <p className="text-gray-500 mt-2">No tienes horarios asignados actualmente.</p>
            </div>
          ) : (
            <div className="border rounded-md p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50 w-20">Hora</th>
                      {weekDays.map(day => (
                        <th key={day.id} className="border p-2 bg-gray-50">{day.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, index) => {
                      // Saltamos la última hora porque solo la usamos como hora de fin
                      if (index === timeSlots.length - 1) return null;
                      
                      const startHour = parseInt(time.split(':')[0]);
                      const endHour = parseInt(timeSlots[index + 1].split(':')[0]);
                      
                      return (
                        <tr key={time}>
                          <td className="border p-2 text-center text-sm font-medium">
                            {time} - {timeSlots[index + 1]}
                          </td>
                            {weekDays.map(day => {
                            // Buscar los horarios que coinciden con este día y hora
                            const schedulesInThisSlot: ScheduleInSlot[] = [];
                            
                            Object.values(assignedSchedules).forEach(facility => {
                              facility.schedules.forEach(schedule => {
                                // Normalizar el día para comparación                                // Normalizamos el día del horario usando nuestra función helper
                                const normalizedScheduleDay = normalizeDayName(schedule.day);
                                const normalizedDayId = day.id;
                                
                                console.log(`Comparando día: "${schedule.day}" -> "${normalizedScheduleDay}" con "${normalizedDayId}"`);
                                
                                // Ahora la comparación es directa ya que ambos están normalizados
                                if (normalizedScheduleDay === normalizedDayId) {
                                  try {
                                    const scheduleStartParts = schedule.startTime.split(':');
                                    const scheduleEndParts = schedule.endTime.split(':');
                                    
                                    if (scheduleStartParts.length >= 1 && scheduleEndParts.length >= 1) {
                                      const scheduleStart = parseInt(scheduleStartParts[0]);
                                      const scheduleEnd = parseInt(scheduleEndParts[0]);
                                      
                                      // Verificar si este horario cae en el slot actual
                                      if (scheduleStart <= startHour && scheduleEnd > startHour) {
                                        schedulesInThisSlot.push({
                                          facilityId: facility.facilityId,
                                          facilityName: facility.facilityName,
                                          startTime: schedule.startTime,
                                          endTime: schedule.endTime
                                        });
                                        console.log(`Horario encontrado: ${facility.facilityName}, ${schedule.day}, ${schedule.startTime}-${schedule.endTime}`);
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Error al procesar horario:", schedule, error);
                                  }
                                }
                              });
                            });
                            
                            return (
                              <td key={`${day.id}-${time}`} className="border p-1 align-top">
                                {schedulesInThisSlot.map((schedule, idx) => (
                                  <div 
                                    key={idx} 
                                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 mb-1"
                                  >
                                    <Link href={`/coordinador/instalaciones/${schedule.facilityId}`} className="hover:underline">
                                      {schedule.facilityName}
                                    </Link>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span>Horario asignado</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}