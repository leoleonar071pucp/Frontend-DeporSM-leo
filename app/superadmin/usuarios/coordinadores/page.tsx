"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Trash2, MapPin } from "lucide-react"
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
const coordinadoresData = [
  {
    id: 1,
    name: "Roberto Gómez",
    email: "roberto.gomez@munisanmiguel.gob.pe",
    phone: "987-654-325",
    zone: "Zona Norte",
    facilities: 3,
    status: "activo",
    lastLogin: "05/04/2025, 08:30",
  },
  {
    id: 2,
    name: "Laura Sánchez",
    email: "laura.sanchez@munisanmiguel.gob.pe",
    phone: "987-654-326",
    zone: "Zona Sur",
    facilities: 4,
    status: "activo",
    lastLogin: "04/04/2025, 15:45",
  },
  {
    id: 3,
    name: "Miguel Torres",
    email: "miguel.torres@munisanmiguel.gob.pe",
    phone: "987-654-327",
    zone: "Zona Este",
    facilities: 2,
    status: "inactivo",
    lastLogin: "01/04/2025, 09:20",
  },
  {
    id: 4,
    name: "Patricia Flores",
    email: "patricia.flores@munisanmiguel.gob.pe",
    phone: "987-654-328",
    zone: "Zona Oeste",
    facilities: 5,
    status: "activo",
    lastLogin: "03/04/2025, 14:10",
  },
]

export default function CoordinadoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoordinador, setSelectedCoordinador] = useState(null)

  const filteredCoordinadores = coordinadoresData.filter(
    (coordinador) =>
      coordinador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinador.zone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (coordinador) => {
    setSelectedCoordinador(coordinador)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Aquí iría la lógica para eliminar el coordinador
    console.log("Eliminando coordinador:", selectedCoordinador.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coordinadores</h1>
          <p className="text-muted-foreground">Gestiona los coordinadores del sistema</p>
        </div>
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
                  <TableHead>Zona</TableHead>
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
                          {coordinador.zone}
                        </div>
                      </TableCell>
                      <TableCell>{coordinador.facilities}</TableCell>
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
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/superadmin/usuarios/coordinadores/${coordinador.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalles</span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteClick(coordinador)}
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
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
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
              <span className="font-medium">{selectedCoordinador?.name}</span>? Esta acción no se puede deshacer.
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

