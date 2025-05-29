"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import { ScheduledVisit } from "../types"
import { toast } from "@/components/ui/use-toast"
import { fetchProgrammedVisits } from "./fetchProgrammedVisits"
import { useAuth } from "@/context/AuthContext"

// La función fetchProgrammedVisits ha sido movida a un archivo separado para mayor claridad

// Función para formatear horarios (eliminar segundos si existen)
const formatTime = (time: string | undefined): string => {
  if (!time) return "";
  // Si el tiempo incluye segundos (HH:MM:SS), extraer solo HH:MM
  if (time.includes(":") && time.length > 5) {
    return time.substring(0, 5);
  }
  return time;
}

export default function ProgramadasPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // Usar la fecha actual del sistema en lugar de una fecha fija
  const today = new Date();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([]);
  const [error, setError] = useState<string | null>(null);  // Función para cargar los datos
  const loadData = async () => {
    try {
      // Verificar que el usuario esté autenticado y tenga rol de coordinador
      if (!isAuthenticated || !user) {
        console.error("Usuario no autenticado");
        setError("Usuario no autenticado");
        setIsLoading(false);
        return;
      }

      if (!user.rol || user.rol.nombre !== 'coordinador') {
        console.error("Usuario no es coordinador");
        setError("Acceso denegado: Solo coordinadores pueden ver esta página");
        setIsLoading(false);
        return;
      }

      // Obtener el ID del usuario autenticado
      const userId = parseInt(user.id);

      if (isNaN(userId) || userId <= 0) {
        console.error("ID de usuario inválido:", user.id);
        setError("ID de usuario inválido");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await fetchProgrammedVisits(userId);

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
  };  // Solo un useEffect para cargar datos al montar el componente
  useEffect(() => {
    // Indicador para saber si el componente está montado
    let isMounted = true;

    // Función que solo ejecuta loadData si el componente sigue montado
    const safeLoadData = () => {
      if (isMounted && !authLoading && isAuthenticated && user) {
        loadData();
      }
    };

    // Cargar datos una sola vez al montar el componente cuando el usuario esté cargado
    safeLoadData();

    // Limpiar al desmontar
    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, user]);
  useEffect(() => {
    let filtered = scheduledVisits;

    if (searchQuery) {
      filtered = filtered.filter(
        (visit) =>
          visit.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          format(createLocalDate(visit.date), "EEEE d 'de' MMMM", { locale: es }).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredVisits(filtered);
  }, [searchQuery, scheduledVisits]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Mostrar loading mientras se autentica o se cargan los datos
  if (authLoading || isLoading) {
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
        </CardContent>      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitas Programadas</CardTitle>
          <CardDescription>
            Visitas programadas para el día de hoy según tu horario asignado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVisits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisits.map((visit) => (                <div key={visit.id} className={`border rounded-lg p-4 transition-colors ${visit.isRegistered ? 'bg-gray-50 border-gray-300' : 'hover:border-primary'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {visit.facilityName || (isLoading ? "Cargando..." : `Instalación ${visit.facilityId}`)}
                      </h3>
                      {visit.isRegistered && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Ya registrada</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" /> {visit.location || "Sin ubicación especificada"}
                  </p><div className="flex items-center gap-2 mb-2">                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">
                        {format(createLocalDate(visit.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">{formatTime(visit.scheduledTime)} - {formatTime(visit.scheduledEndTime)}</p>
                    </div>
                  </div>                  <div className="flex flex-col gap-2 sm:flex-row w-full">
                    <Button asChild variant="outline" className="flex-1 min-w-0">
                      <Link href={`/coordinador/instalaciones/${visit.facilityId}`}>Ver Detalles</Link>
                    </Button>
                    {visit.isRegistered ? (
                      <Button
                        variant="secondary"
                        className="flex-1 min-w-0"
                        disabled
                      >
                        Asistencia Registrada
                      </Button>
                    ) : (
                      <Button asChild className="flex-1 min-w-0 bg-primary hover:bg-primary-light">
                        <Link href={`/coordinador/asistencia/registrar?id=${visit.id}&facilityId=${visit.facilityId}`}>
                          Registrar Asistencia
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>          ) : (            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay visitas programadas</h3>
              <p className="text-gray-500 mt-2">No tienes visitas programadas para el día de hoy.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}