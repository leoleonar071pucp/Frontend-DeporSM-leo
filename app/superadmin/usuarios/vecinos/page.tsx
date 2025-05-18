"use client"
import { API_BASE_URL } from "@/lib/config"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Plus, Eye, Trash2, UserCheck, Pencil, Loader2, User } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Definición de tipos
interface Vecino {
  id: number
  nombre: string
  apellidos: string
  email: string
  telefono: string
  direccion: string
  dni: string
  activo: boolean
  lastLogin?: string
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

  const fetchVecinos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/allVecinos`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 204) {
        setVecinos([])
        return
      }

      if (!response.ok) {
        throw new Error(await response.text() || 'Error al cargar los vecinos')
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      }

      const processedData = data.map((vecino: any) => ({
        id: vecino.id,
        nombre: vecino.nombre,
        apellidos: vecino.apellidos,
        email: vecino.email,
        telefono: vecino.telefono,
        direccion: vecino.direccion,
        dni: vecino.dni,
        activo: vecino.activo,
        lastLogin: vecino.lastLogin || '-'
      }))

      setVecinos(processedData)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar los vecinos. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVecinos();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
        <span className="ml-2">Cargando vecinos...</span>
      </div>
    )
  }

  const filteredVecinos = vecinos.filter((vecino) => {    // Filtro de búsqueda
    const searchMatch =
      (vecino.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vecino.apellidos?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vecino.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vecino.dni?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    // Filtro de estado
    const statusMatch = statusFilter === "all" || 
      (statusFilter === "activo" ? vecino.activo : !vecino.activo)

    return searchMatch && statusMatch
  })

  const handleViewDetails = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteClick = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsDeleteDialogOpen(true)
  }

  const handleRestoreClick = (vecino: Vecino) => {
    setSelectedVecino(vecino)
    setIsRestoreDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedVecino) return

    try {      const response = await fetch(`${API_BASE_URL}/usuarios/${selectedVecino.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error al desactivar el vecino')
      }

      await fetchVecinos()

      toast({
        title: "Vecino desactivado",
        description: `El vecino ${selectedVecino.nombre} ${selectedVecino.apellidos} ha sido desactivado con éxito.`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo desactivar el vecino",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
  }

  const handleRestoreConfirm = async () => {
    if (!selectedVecino) return

    try {      const response = await fetch(`${API_BASE_URL}/usuarios/${selectedVecino.id}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error al activar el vecino')
      }

      await fetchVecinos()

      toast({
        title: "Vecino activado",
        description: `El vecino ${selectedVecino.nombre} ${selectedVecino.apellidos} ha sido activado nuevamente.`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo activar el vecino",
        variant: "destructive",
      })
    }

    setIsRestoreDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vecinos</h1>
          <p className="text-muted-foreground">Gestiona los vecinos registrados en el sistema</p>
        </div>
        <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
          <Link href="/superadmin/usuarios/vecinos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Vecino
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Vecinos</CardTitle>
          <CardDescription>Lista de vecinos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nombre, email o DNI..."
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
                  <TableHead>Vecino</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVecinos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No se encontraron vecinos
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVecinos.map((vecino) => (
                    <TableRow key={vecino.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vecino.nombre} {vecino.apellidos}</div>
                          <div className="text-sm text-muted-foreground">{vecino.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{vecino.dni}</TableCell>
                      <TableCell>
                        <div>
                          <div>{vecino.telefono}</div>
                          <div className="text-sm text-muted-foreground">{vecino.direccion}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vecino.activo ? (
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
                            onClick={() => handleViewDetails(vecino)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-[#0cb7f2]"
                            asChild
                          >
                            <Link href={`/superadmin/usuarios/vecinos/editar/${vecino.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={vecino.activo ? "hover:text-red-500" : "hover:text-green-500"}
                            onClick={() => vecino.activo ? handleDeleteClick(vecino) : handleRestoreClick(vecino)}
                          >
                            {vecino.activo ? (
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
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Vecino</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres desactivar a {selectedVecino?.nombre} {selectedVecino?.apellidos}? 
              Esta acción le impedirá acceder al sistema y realizar reservas.
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
            <DialogTitle>Activar Vecino</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres activar a {selectedVecino?.nombre} {selectedVecino?.apellidos}? 
              Esta acción le permitirá acceder al sistema y realizar reservas nuevamente.
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
            <DialogTitle>Detalles del Vecino</DialogTitle>
          </DialogHeader>
          {selectedVecino && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right">Nombre completo</Label>
                  <div className="mt-1 font-medium">
                    {selectedVecino.nombre} {selectedVecino.apellidos}
                  </div>
                </div>
                <div>
                  <Label className="text-right">DNI</Label>
                  <div className="mt-1 font-medium">{selectedVecino.dni}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right">Email</Label>
                  <div className="mt-1">{selectedVecino.email}</div>
                </div>
                <div>
                  <Label className="text-right">Teléfono</Label>
                  <div className="mt-1">{selectedVecino.telefono || "-"}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right">Dirección</Label>
                  <div className="mt-1">{selectedVecino.direccion || "-"}</div>
                </div>
                <div>
                  <Label className="text-right">Estado</Label>
                  <div className="mt-1">
                    {selectedVecino.activo ? (
                      <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right">Último acceso</Label>
                  <div className="mt-1">{selectedVecino.lastLogin}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

