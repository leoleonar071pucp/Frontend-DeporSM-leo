"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Trash2 } from "lucide-react"
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

// Datos de ejemplo para los vecinos
const vecinosData = [
  {
    id: 1,
    name: "Juan Pérez García",
    email: "juan.perez@example.com",
    phone: "987-654-321",
    dni: "12345678",
    status: "activo",
    lastLogin: "05/04/2025, 09:15",
    reservations: 3,
  },
  {
    id: 2,
    name: "María López Rodríguez",
    email: "maria.lopez@example.com",
    phone: "987-654-322",
    dni: "87654321",
    status: "activo",
    lastLogin: "04/04/2025, 14:30",
    reservations: 1,
  },
  {
    id: 3,
    name: "Carlos Rodríguez Martínez",
    email: "carlos.rodriguez@example.com",
    phone: "987-654-323",
    dni: "23456789",
    status: "inactivo",
    lastLogin: "01/04/2025, 10:45",
    reservations: 0,
  },
  {
    id: 4,
    name: "Ana Martínez López",
    email: "ana.martinez@example.com",
    phone: "987-654-324",
    dni: "34567890",
    status: "activo",
    lastLogin: "03/04/2025, 16:20",
    reservations: 2,
  },
  {
    id: 5,
    name: "Pedro Sánchez García",
    email: "pedro.sanchez@example.com",
    phone: "987-654-325",
    dni: "45678901",
    status: "activo",
    lastLogin: "02/04/2025, 11:10",
    reservations: 5,
  },
]

export default function VecinosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedVecino, setSelectedVecino] = useState(null)

  const filteredVecinos = vecinosData.filter((vecino) => {
    // Filtro de búsqueda
    const searchMatch =
      vecino.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecino.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vecino.dni.includes(searchTerm)

    // Filtro de estado
    const statusMatch = statusFilter === "all" || vecino.status === statusFilter

    return searchMatch && statusMatch
  })

  const handleDeleteClick = (vecino) => {
    setSelectedVecino(vecino)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (vecino) => {
    setSelectedVecino(vecino)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Aquí iría la lógica para eliminar el vecino
    console.log("Eliminando vecino:", selectedVecino.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vecinos</h1>
          <p className="text-muted-foreground">Gestiona los usuarios vecinos registrados en el sistema</p>
        </div>
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
                {filteredVecinos.length > 0 ? (
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
                            className="text-red-500"
                            onClick={() => handleDeleteClick(vecino)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">{selectedVecino.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">DNI</p>
                  <p className="mt-1">{selectedVecino.dni}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{selectedVecino.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1">{selectedVecino.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    {selectedVecino.status === "activo" ? (
                      <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Último acceso</p>
                  <p className="mt-1">{selectedVecino.lastLogin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reservas</p>
                  <p className="mt-1">{selectedVecino.reservations}</p>
                </div>
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

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al vecino <span className="font-medium">{selectedVecino?.name}</span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

