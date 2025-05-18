"use client";

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface ActivityFilters {
  role: string | null;
  action: string | null;
  date: Date | null;
  status: string | null;
}

interface ActivityEntry {
  id: number;
  user: string;
  name: string;
  role: string;
  action: string;
  resource: string | null;
  ip: string;
  device: string;
  date: string;
  status: string;
}

export default function ActividadUsuariosPage() {
  const { toast } = useToast()
  const [accessData, setAccessData] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    role: null,
    action: null,
    date: null,
    status: null
  });

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/logs/actividad`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los logs de actividad');
        }

        const data = await response.json();
        setAccessData(data.map((log: any) => ({
          id: log.id,
          user: log.usuario?.email,
          name: `${log.usuario?.nombre} ${log.usuario?.apellidos}`,
          role: log.usuario?.rol?.nombre,
          action: log.accion,
          resource: log.recurso,
          ip: log.ipAddress,
          device: log.device,
          date: new Date(log.createdAt).toLocaleString(),
          status: log.estado
        })));
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los logs de actividad",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Administrador":
        return <Badge className="bg-[#def7ff] text-[#0cb7f2]">Administrador</Badge>;
      case "Coordinador":
        return <Badge className="bg-green-100 text-green-800">Coordinador</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return "Inicio sesión";
      case "logout":
        return "Cerró sesión";
      default:
        return action;
    }
  };

  const filteredActivity = accessData.filter((entry) => {
    if (filters.role && entry.role !== filters.role) return false;
    if (filters.action && entry.action !== filters.action) return false;
    if (filters.status && entry.status !== filters.status) return false;
    if (filters.date) {
      const entryDate = new Date(entry.date).toDateString();
      const filterDate = filters.date.toDateString();
      if (entryDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitoreo de Actividad de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 flex gap-4 flex-wrap">
            {/* Filtro por rol */}
            <div>
              <select
                className="w-full rounded-lg border p-2"
                value={filters.role || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value || null }))}
              >
                <option value="">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Coordinador">Coordinador</option>
                <option value="Vecino">Vecino</option>
              </select>
            </div>

            {/* Filtro por acción */}
            <div>
              <select
                className="w-full rounded-lg border p-2"
                value={filters.action || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value || null }))}
              >
                <option value="">Todas las acciones</option>
                <option value="login">Inicio de sesión</option>
                <option value="logout">Cierre de sesión</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                className="w-full rounded-lg border p-2"
                value={filters.status || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value || null }))}
              >
                <option value="">Todos los estados</option>
                <option value="success">Exitoso</option>
                <option value="failed">Fallido</option>
              </select>
            </div>

            {/* Filtro por fecha */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {filters.date ? filters.date.toLocaleDateString() : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date || undefined}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, date: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {filters.date && (
                <Button variant="ghost" size="icon" onClick={() => setFilters((prev) => ({ ...prev, date: null }))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-gray-500">{entry.user}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(entry.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getActionIcon(entry.action)}
                          <span className="ml-2">{getActionLabel(entry.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.resource || "-"}</TableCell>
                      <TableCell>{entry.ip}</TableCell>
                      <TableCell>{entry.device}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                        {entry.status === "success" ? (
                          <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Fallido</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {filteredActivity.length} de {accessData.length} registros
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}