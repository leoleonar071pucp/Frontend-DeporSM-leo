"use client"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Trash2, Plus, UserCheck, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Definición de tipos
interface Vecino {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  status: string;
  lastLogin: string;
  reservations: number;
  address: string;
}

export default function VecinosPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedVecino, setSelectedVecino] = useState<Vecino | null>(null)
  const [vecinos, setVecinos] = useState<Vecino[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch vecinos from the API when the component mounts
  useEffect(() => {
    const fetchVecinos = async () => {
      try {
        const response = await fetch('${API_BASE_URL}/usuarios/allVecinos');
        const data = await response.json();
        console.log("🔍 DATA RECIBIDA DEL BACKEND:", data);
        
        // Process the data to format it as expected
        const processedData = data.map((vecino: any) => ({
          id: vecino.id,
          name: vecino.nombre,
          email: vecino.email,
          phone: vecino.telefono,
          dni: vecino.dni || '',
          status: vecino.estado || "activo",
          lastLogin: vecino.ultimoAcceso || "-",
          reservations: vecino.reservas || 0,
          address: vecino.direccion || ''
        }));
        setVecinos(processedData);
      } catch (error) {
        console.error("Error fetching vecinos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los vecinos. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVecinos();
  }, [toast]);

  const filteredVecinos = vecinos.filter((vecino) => {
    // Filtro de búsqueda
    const searchMatch =
      vecino.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecino.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecino.dni.includes(searchTerm)

    // Filtro de estado
    const statusMatch = statusFilter === "all" || vecino.status === statusFilter

    return searchMatch && statusMatch
  })

  const handleDeleteClick = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsDeleteDialogOpen(true)
  }

  const handleRestoreClick = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsRestoreDialogOpen(true)
  }

  const handleViewDetails = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedVecino) {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${selectedVecino.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setVecinos(
            vecinos.map((vecino) =>
              vecino.id === selectedVecino.id ? { ...vecino, status: "inactivo", reservations: 0 } : vecino
            )
          );
          
          toast({
            title: "Usuario desactivado",
            description: `El vecino ${selectedVecino.name} ha sido desactivado y sus reservas canceladas.`,
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo desactivar el vecino. Por favor, intente nuevamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al desactivar vecino:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al intentar desactivar el vecino.",
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false)
  }

  const handleRestoreConfirm = async () => {
    if (selectedVecino) {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${selectedVecino.id}/restore`, {
          method: 'POST',
        });

        if (response.ok) {
          setVecinos(
            vecinos.map((vecino) =>
              vecino.id === selectedVecino.id ? { ...vecino, status: "activo" } : vecino
            )
          );
          
          toast({
            title: "Usuario activado",
            description: `El vecino ${selectedVecino.name} ha sido activado nuevamente.`,
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo activar el vecino. Por favor, intente nuevamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al activar vecino:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al intentar activar el vecino.",
          variant: "destructive",
        });
      }
    }
    setIsRestoreDialogOpen(false)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vecinos</h1>
          <p className="text-muted-foreground">Gestiona los usuarios vecinos registrados en el sistema</p>
        </div>
        <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
          <Link href="/superadmin/usuarios/vecinos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Vecino
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Vecinos</CardTitle>
          <CardDescription>Administra los usuarios con rol de vecino en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email o DNI..."
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
                  <TableHead>DNI</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Cargando vecinos...
                    </TableCell>
                  </TableRow>
                ) : filteredVecinos.length > 0 ? (
                  filteredVecinos.map((vecino) => (
                    <TableRow key={vecino.id}>
                      <TableCell className="font-medium">{vecino.name}</TableCell>
                      <TableCell>{vecino.email}</TableCell>
                      <TableCell>{vecino.dni}</TableCell>
                      <TableCell>
                        {vecino.status === "activo" ? (
                          <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{vecino.reservations}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewDetails(vecino)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-500"
                            asChild
                          >
                            <Link href={`/superadmin/usuarios/vecinos/editar/${vecino.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          {vecino.status === "activo" ? (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(vecino)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Desactivar</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-green-500"
                              onClick={() => handleRestoreClick(vecino)}
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
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No se encontraron vecinos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Vecino</DialogTitle>
          </DialogHeader>
          {selectedVecino && (
            <div className="grid gap-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Nombre completo</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.name}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Email</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.email}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">DNI</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.dni}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Teléfono</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.phone}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Dirección</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.address}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Último acceso</h4>
                <p className="text-sm text-muted-foreground">{selectedVecino.lastLogin}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Estado</h4>
                <Badge className={selectedVecino.status === "activo" ? "bg-[#def7ff] text-[#0cb7f2]" : "bg-gray-100 text-gray-800"}>
                  {selectedVecino.status === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Vecino</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar a {selectedVecino?.name}? Esta acción también cancelará sus reservas activas.
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

      {/* Diálogo de confirmación de restauración */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activar Vecino</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas activar a {selectedVecino?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Activar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

