"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from "date-fns"
import { es } from "date-fns/locale"
import { ScheduledVisit } from "../types"
import { toast } from "@/components/ui/use-toast"
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

interface AssignedSchedules {
  [key: string]: {
    facilityId: number
    facilityName: string
    schedules: Array<{
      id: number
      day: string
      startTime: string
      endTime: string
    }>
  }
}

// Función para normalizar nombres de días
const normalizeDayName = (dayString: string): string => {
  if (!dayString) return "lunes"; // Valor predeterminado
  
  const normalizedInput = dayString.trim().toLowerCase();
  
  // Mapeando variantes de nombres de días
  const dayVariants = {
    "lunes": ["lun", "lunes"],
    "martes": ["mar", "martes"],
    "miercoles": ["mie", "miercoles", "miércoles"],
    "jueves": ["jue", "jueves"],
    "viernes": ["vie", "viernes"],
    "sabado": ["sab", "sabado", "sábado"],
    "domingo": ["dom", "domingo"]
  };
  
  // Buscar en las variantes de cada día
  for (const [day, variants] of Object.entries(dayVariants)) {
    if (variants.some(variant => normalizedInput.includes(variant))) {
      return day;
    }
  }
  
  return "lunes";
}

// Función para obtener datos reales de visitas programadas desde el backend
const fetchProgrammedVisits = async (): Promise<ScheduledVisit[]> => {
  try {
    // ID de coordinador (fijo para desarrollo y pruebas)
    const userId = 4;
    
    // Obtener los horarios del coordinador
    const response = await apiGet(`horarios-coordinador/coordinador/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error al cargar horarios: ${response.status}`);
    }
    
    const horarios: HorarioCoordinador[] = await response.json();
    
    if (!Array.isArray(horarios)) {
      throw new Error("Formato de datos incorrecto");
    }
    
    // Procesar los horarios y convertirlos al formato requerido
    const processedSchedules: AssignedSchedules = {};
    
    horarios.forEach((horario: HorarioCoordinador) => {
      // Validar que el horario tenga los campos necesarios
      if (!horario.instalacionId || !horario.diaSemana || !horario.horaInicio || !horario.horaFin) {
        return; // Saltar este horario
      }
      
      const facilityId = horario.instalacionId.toString();
      const dia = normalizeDayName(horario.diaSemana);
      
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
      } catch (error) {
        startTime = '00:00';
        endTime = '00:00';
      }
      
      processedSchedules[facilityId].schedules.push({
        id: horario.id,
        day: dia,
        startTime: startTime,
        endTime: endTime
      });
    });
    
    // Generar visitas programadas para la semana actual
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Comenzar semana en lunes
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Función auxiliar para verificar si una fecha corresponde al día de la semana
    const isDayOfWeek = (date: Date, day: string): boolean => {
      switch (day) {
        case 'lunes': return isMonday(date);
        case 'martes': return isTuesday(date);
        case 'miercoles': return isWednesday(date);
        case 'jueves': return isThursday(date);
        case 'viernes': return isFriday(date);
        case 'sabado': return isSaturday(date);
        case 'domingo': return isSunday(date);
        default: return false;
      }
    };
    
    // Generar visitas programadas para la semana basadas en los horarios asignados
    const visits: ScheduledVisit[] = [];
    
    weekDays.forEach(date => {
      // Revisar cada instalación y sus horarios
      Object.entries(processedSchedules).forEach(([facilityId, facilityData]) => {
        const schedulesForDay = facilityData.schedules.filter(schedule => 
          isDayOfWeek(date, schedule.day)
        );
        
        schedulesForDay.forEach(schedule => {
          // Crear un ID único usando una combinación de fecha, facilityId y día
          const uniqueId = parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}${facilityId}${schedule.id}`);
          
          visits.push({
            id: uniqueId,
            facilityId: parseInt(facilityId),
            facilityName: facilityData.facilityName,
            location: "Sin ubicación registrada", // La API actual no devuelve ubicación
            date: format(date, 'yyyy-MM-dd'),
            scheduledTime: schedule.startTime,
            scheduledEndTime: schedule.endTime,
            image: "/placeholder.svg" // La API actual no devuelve imagen
          });
        });
      });
    });
    
    // Ordenar las visitas por fecha y hora
    visits.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
    
    return visits;
    
  } catch (error) {
    console.error("Error al obtener visitas programadas:", error);
    throw error;
  }
};

export default function ProgramadasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const data = await fetchProgrammedVisits();
        
        setScheduledVisits(data);
        setFilteredVisits(data);
      } catch (error) {
        console.error("Error al cargar visitas programadas:", error);
        setError("No se pudieron cargar las visitas programadas");
        toast({
          title: "Error",
          description: "No se pudieron cargar las visitas programadas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    let filtered = scheduledVisits;

    if (searchQuery) {
      filtered = filtered.filter(
        (visit) =>
          visit.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          format(new Date(visit.date), "EEEE d 'de' MMMM", { locale: es }).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredVisits(filtered);
  }, [searchQuery, scheduledVisits]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/coordinador/asistencia">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Visitas Programadas</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-lg text-red-500 font-medium mb-2">Error</h2>
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
        <h1 className="text-2xl font-bold tracking-tight">Visitas Programadas</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary-light">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Visitas</CardTitle>
          <CardDescription>Visitas programadas para esta semana según tu horario asignado</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVisits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{visit.facilityName}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" /> {visit.location}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">{format(new Date(visit.date), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{visit.scheduledTime} - {visit.scheduledEndTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/coordinador/instalaciones/${visit.facilityId}`}>Ver Detalles</Link>
                    </Button>
                    <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                      <Link href={`/coordinador/asistencia/registrar?id=${visit.id}&facilityId=${visit.facilityId}`}>
                        Registrar Asistencia
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay visitas programadas</h3>
              <p className="text-gray-500 mt-2">No tienes visitas programadas para esta semana.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}