"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Trash2, MapPin, Briefcase, UserCheck, Pencil } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definición de tipos
interface Coordinador {
  id: number;
  name: string;
  email: string;
  phone: string;
  facilities: string[];
  status: string;
  lastLogin: string;
  role: string;
}

export default function CoordinadoresPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedCoordinador, setSelectedCoordinador] = useState<Coordinador | null>(null);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);

  // Fetch coordinators from the API when the component mounts
  useEffect(() => {
    const fetchCoordinadores = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/usuarios/allCoordinadores");
        const data = await response.json();

        // Process the data to format it as expected
        const processedData = data.map((coordinator: any) => ({
          id: coordinator.id,
          name: coordinator.nombre,
          email: coordinator.email,
          phone: coordinator.telefono,
          facilities: coordinator.instalacionesAsignadas
              ? coordinator.instalacionesAsignadas.split(",").map((name: string) => name.trim())
              : [],
          status: "activo", // You can adjust this if the API provides status
          lastLogin: "-",   // Replace with real last login data if available
          role: "Coordinador",
        }));

        setCoordinadores(processedData);
      } catch (error) {
        console.error("Error fetching coordinators:", error);
      }
    };

    fetchCoordinadores();
  }, []);

  const filteredCoordinadores = coordinadores.filter((coordinador) => {
    // Filter by search term
    const searchMatch =
        coordinador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coordinador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coordinador.facilities.some(facility => facility.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const statusMatch = statusFilter === "all" || coordinador.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const handleViewDetails = (coordinador: Coordinador) => {
    setSelectedCoordinador(coordinador);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (coordinador: Coordinador) => {
    setSelectedCoordinador(coordinador);
    setIsDeleteDialogOpen(true);
  };

  const handleRestoreClick = (coordinador: Coordinador) => {
    setSelectedCoordinador(coordinador);
    setIsRestoreDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCoordinador) {
      setCoordinadores(
          coordinadores.map((coordinador) =>
              coordinador.id === selectedCoordinador.id ? { ...coordinador, status: "inactivo" } : coordinador
          )
      );

      toast({
        title: "Coordinador desactivado",
        description: `El coordinador ${selectedCoordinador.name} ha sido desactivado con éxito.`,
      });
    }

    setIsDeleteDialogOpen(false);
  };

  const handleRestoreConfirm = () => {
    if (selectedCoordinador) {
      setCoordinadores(
          coordinadores.map((coordinador) =>
              coordinador.id === selectedCoordinador.id ? { ...coordinador, status: "activo" } : coordinador
          )
      );

      toast({
        title: "Coordinador activado",
        description: `El coordinador ${selectedCoordinador.name} ha sido activado nuevamente.`,
      });
    }

    setIsRestoreDialogOpen(false);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coordinadores</h1>
            <p className="text-muted-foreground">Gestiona los coordinadores de instalaciones del sistema</p>
          </div>
          <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
            <Link href="/superadmin/usuarios/coordinadores/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Coordinador
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Coordinadores</CardTitle>
            <CardDescription>Administra los usuarios con rol de coordinador en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    type="search"
                    placeholder="Buscar coordinador o instalación..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activos</SelectItem>
                    <SelectItem value="inactivo">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Instalaciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoordinadores.length > 0 ? (
                      filteredCoordinadores.map((coordinador) => (
                          <TableRow key={coordinador.id}>
                            <TableCell className="font-medium">{coordinador.name}</TableCell>
                            <TableCell>{coordinador.email}</TableCell>
                            <TableCell>{coordinador.phone}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-[#0cb7f2]" />
                                {coordinador.facilities.length === 1
                                    ? "1 instalación"
                                    : `${coordinador.facilities.length} instalaciones`}
                              </div>

                            </TableCell>
                            <TableCell>
                              {coordinador.status === "activo" ? (
                                  <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                              ) : (
                                  <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                              )}
                            </TableCell>
                            <TableCell>{coordinador.lastLogin}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleViewDetails(coordinador)}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Ver detalles</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-blue-500"
                                    asChild
                                >
                                  <Link href={`/superadmin/usuarios/coordinadores/editar/${coordinador.id}`}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Link>
                                </Button>
                                {coordinador.status === "activo" ? (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-500"
                                        onClick={() => handleDeleteClick(coordinador)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Desactivar</span>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-green-500"
                                        onClick={() => handleRestoreClick(coordinador)}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                      <span className="sr-only">Activar</span>
                                    </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No se encontraron coordinadores
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
