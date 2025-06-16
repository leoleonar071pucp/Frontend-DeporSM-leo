"use client"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus, Eye, Trash2, MapPin, Briefcase, UserCheck, Pencil, Loader2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TablePagination, useTablePagination } from "@/components/ui/table-pagination"

// Definición de tipos
interface Coordinador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  instalacionesAsignadas?: string[];
  activo: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const fetchCoordinadores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/allCoordinadores`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los coordinadores')
      }

      const data = await response.json();
      const processedData = data.map((coordinador: any) => ({
        ...coordinador,
        instalacionesAsignadas: coordinador.instalacionesAsignadas
          ? typeof coordinador.instalacionesAsignadas === 'string'
            ? coordinador.instalacionesAsignadas.split(',').map((s: string) => s.trim())
            : Array.isArray(coordinador.instalacionesAsignadas)
              ? coordinador.instalacionesAsignadas
              : []
          : []
      }));
      setCoordinadores(processedData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los coordinadores. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinadores();
  }, []);

  const filteredCoordinadores = coordinadores.filter((coordinador) => {
    // Filtro de búsqueda
    const searchMatch =
      coordinador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coordinador.instalacionesAsignadas || []).some(facility =>
        facility.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtro de estado
    const statusMatch = statusFilter === "all" ||
      (statusFilter === "activo" ? coordinador.activo : !coordinador.activo);

    return searchMatch && statusMatch;
  });

  // Paginación
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedCoordinadores,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems
  } = useTablePagination(filteredCoordinadores, 10)

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

  const handleDeleteConfirm = async () => {
    if (!selectedCoordinador) return;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/coordinadores/${selectedCoordinador.id}/desactivar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al desactivar el coordinador');
      }

      await fetchCoordinadores(); // Recargar la lista después de desactivar

      toast({
        title: "Coordinador desactivado",
        description: `El coordinador ${selectedCoordinador.nombre} ha sido desactivado con éxito.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el coordinador",
        variant: "destructive",
      });
    }

    setIsDeleteDialogOpen(false);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedCoordinador) return;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/coordinadores/${selectedCoordinador.id}/activar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al activar el coordinador');
      }

      await fetchCoordinadores(); // Recargar la lista después de activar

      toast({
        title: "Coordinador activado",
        description: `El coordinador ${selectedCoordinador.nombre} ha sido activado nuevamente.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo activar el coordinador",
        variant: "destructive",
      });
    }

    setIsRestoreDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando coordinadores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coordinadores</h1>
          <p className="text-muted-foreground">Gestiona los coordinadores del sistema</p>
        </div>
        <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
          <Link href="/superadmin/usuarios/coordinadores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Coordinador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Coordinadores</CardTitle>
          <CardDescription>Lista de coordinadores registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nombre, email o instalación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Instalaciones Asignadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCoordinadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-32">
                      No se encontraron coordinadores
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCoordinadores.map((coordinador) => (
                    <TableRow key={coordinador.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{coordinador.nombre}</div>
                          <div className="text-sm text-muted-foreground">{coordinador.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {coordinador.instalacionesAsignadas && coordinador.instalacionesAsignadas.length > 0 ? (
                            coordinador.instalacionesAsignadas.map((facility, index) => (
                              <Badge key={index} variant="outline" className="flex items-center bg-[#0cb7f2] text-white border-[#0cb7f2]">
                                <MapPin className="h-3 w-3 mr-1" />
                                {facility}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin instalaciones asignadas</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coordinador.activo ? (
                          <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-[#0cb7f2]"
                            onClick={() => handleViewDetails(coordinador)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-[#0cb7f2]"
                            asChild
                          >
                            <Link href={`/superadmin/usuarios/coordinadores/editar/${coordinador.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={coordinador.activo ? "hover:text-red-500" : "hover:text-green-500"}
                            onClick={() => coordinador.activo ? handleDeleteClick(coordinador) : handleRestoreClick(coordinador)}
                          >
                            {coordinador.activo ? (
                              <Trash2 className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {filteredCoordinadores.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Coordinador</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres desactivar a {selectedCoordinador?.nombre}?
              Esta acción impedirá que el coordinador acceda al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activar Coordinador</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres activar a {selectedCoordinador?.nombre}?
              Esta acción permitirá que el coordinador vuelva a acceder al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleRestoreConfirm}>
              Activar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Coordinador</DialogTitle>
          </DialogHeader>
          {selectedCoordinador && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nombre</Label>
                <div className="col-span-3">{selectedCoordinador.nombre}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{selectedCoordinador.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Teléfono</Label>
                <div className="col-span-3">{selectedCoordinador.telefono || "-"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado</Label>                <div className="col-span-3">
                  {selectedCoordinador.activo ? (
                    <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Instalaciones</Label>
                <div className="col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {selectedCoordinador.instalacionesAsignadas && selectedCoordinador.instalacionesAsignadas.length > 0 ? (
                      selectedCoordinador.instalacionesAsignadas.map((facility, index) => (
                        <Badge key={index} variant="outline" className="flex items-center bg-[#0cb7f2] text-white border-[#0cb7f2]">
                          <MapPin className="h-3 w-3 mr-1" />
                          {facility}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin instalaciones asignadas</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
