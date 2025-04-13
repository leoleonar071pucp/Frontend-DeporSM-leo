"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, MapPin } from "lucide-react"
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

// Datos de ejemplo para los coordinadores
const coordinatorsData = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "987-654-321",
    assignedFacilities: [
      { id: 1, name: "Cancha de Fútbol (Grass)" },
      { id: 2, name: "Piscina Municipal" },
    ],
    status: "activo",
    lastLogin: "05/04/2025, 09:15",
  },
  {
    id: 2,
    name: "María López",
    email: "maria.lopez@example.com",
    phone: "987-654-322",
    assignedFacilities: [
      { id: 3, name: "Gimnasio Municipal" },
      { id: 4, name: "Pista de Atletismo" },
    ],
    status: "activo",
    lastLogin: "04/04/2025, 14:30",
  },
  {
    id: 3,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "987-654-323",
    assignedFacilities: [{ id: 5, name: "Cancha de Tenis" }],
    status: "inactivo",
    lastLogin: "01/04/2025, 10:45",
  },
]

export default function CoordinadoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)

  const filteredCoordinators = coordinatorsData.filter(
    (coordinator) =>
      coordinator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (coordinator) => {
    setSelectedCoordinator(coordinator)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Aquí iría la lógica para eliminar el coordinador
    console.log("Eliminando coordinador:", selectedCoordinator.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Coordinadores</h1>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/admin/coordinadores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Coordinador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Coordinadores</CardTitle>
          <CardDescription>Administra los coordinadores que supervisan las instalaciones deportivas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar coordinador..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Instalaciones Asignadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoordinators.length > 0 ? (
                  filteredCoordinators.map((coordinator) => (
                    <TableRow key={coordinator.id}>
                      <TableCell className="font-medium">{coordinator.name}</TableCell>
                      <TableCell>{coordinator.email}</TableCell>
                      <TableCell>{coordinator.phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {coordinator.assignedFacilities.map((facility) => (
                            <Badge key={facility.id} variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {facility.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coordinator.status === "activo" ? (
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{coordinator.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/coordinadores/${coordinator.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteClick(coordinator)}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al coordinador{" "}
              <span className="font-medium">{selectedCoordinator?.name}</span>? Esta acción no se puede deshacer.
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

