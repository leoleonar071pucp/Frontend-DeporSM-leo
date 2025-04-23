"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Trash2, MapPin, Briefcase, UserCheck, Pencil } from "lucide-react"
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

// Datos de ejemplo para los coordinadores
const coordinadoresData = [
  {
    id: 1,
    name: "Roberto Gómez",
    email: "roberto.gomez@munisanmiguel.gob.pe",
    phone: "987-654-326",
    facilities: ["Complejo Deportivo N°1", "Cancha de Fútbol Central"],
    status: "activo",
    lastLogin: "05/04/2025, 10:15",
    role: "Coordinador",
  },
  {
    id: 2,
    name: "Claudia Fuentes",
    email: "claudia.fuentes@munisanmiguel.gob.pe",
    phone: "987-654-327",
    facilities: ["Piscina Municipal", "Gimnasio Central"],
    status: "activo",
    lastLogin: "03/04/2025, 12:30",
    role: "Coordinador",
  },
  {
    id: 3,
    name: "Jorge Ramírez",
    email: "jorge.ramirez@munisanmiguel.gob.pe",
    phone: "987-654-328",
    facilities: ["Canchas de Tenis"],
    status: "inactivo",
    lastLogin: "27/03/2025, 15:45",
    role: "Coordinador",
  },
  {
    id: 4,
    name: "Patricia Medina",
    email: "patricia.medina@munisanmiguel.gob.pe",
    phone: "987-654-329",
    facilities: ["Complejo Deportivo N°2", "Canchas de Básquet"],
    status: "activo",
    lastLogin: "04/04/2025, 08:20",
    role: "Coordinador",
  },
]

export default function CoordinadoresPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedCoordinador, setSelectedCoordinador] = useState(null)
  const [coordinadores, setCoordinadores] = useState(coordinadoresData)

  const filteredCoordinadores = coordinadores.filter((coordinador) => {
    // Filtro de búsqueda
    const searchMatch =
      coordinador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinador.facilities.some(facility => facility.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro de estado
    const statusMatch = statusFilter === "all" || coordinador.status === statusFilter

    return searchMatch && statusMatch
  })

  const handleViewDetails = (coordinador) => {
    setSelectedCoordinador(coordinador)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteClick = (coordinador) => {
    setSelectedCoordinador(coordinador)
    setIsDeleteDialogOpen(true)
  }
  
  const handleRestoreClick = (coordinador) => {
    setSelectedCoordinador(coordinador)
    setIsRestoreDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Implementar soft delete: cambiar estado a inactivo
    setCoordinadores(
      coordinadores.map((coordinador) =>
        coordinador.id === selectedCoordinador.id ? { ...coordinador, status: "inactivo" } : coordinador
      )
    )
    
    toast({
      title: "Coordinador desactivado",
      description: `El coordinador ${selectedCoordinador.name} ha sido desactivado con éxito.`,
    })
    
    setIsDeleteDialogOpen(false)
  }
  
  const handleRestoreConfirm = () => {
    // Restaurar coordinador: cambiar estado a activo
    setCoordinadores(
      coordinadores.map((coordinador) =>
        coordinador.id === selectedCoordinador.id ? { ...coordinador, status: "activo" } : coordinador
      )
    )
    
    toast({
      title: "Coordinador activado",
      description: `El coordinador ${selectedCoordinador.name} ha sido activado nuevamente.`,
    })
    
    setIsRestoreDialogOpen(false)
  }

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
                            ? coordinador.facilities[0]
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
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleViewDetails(coordinador)}
                          >
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
      
      {/* Diálogo de detalles */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Coordinador</DialogTitle>
          </DialogHeader>
          {selectedCoordinador && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">{selectedCoordinador.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-4 w-4 mr-1 text-[#0cb7f2]" />
                    {selectedCoordinador.role}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{selectedCoordinador.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1">{selectedCoordinador.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    {selectedCoordinador.status === "activo" ? (
                      <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Último acceso</p>
                  <p className="mt-1">{selectedCoordinador.lastLogin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Instalaciones asignadas</p>
                  <ul className="mt-1 space-y-1">
                    {selectedCoordinador.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-[#0cb7f2]" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  className="text-blue-500"
                  asChild
                >
                  <Link href={`/superadmin/usuarios/coordinadores/editar/${selectedCoordinador.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                {selectedCoordinador.status === "activo" ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desactivar
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setIsRestoreDialogOpen(true)
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de desactivación (soft delete) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desactivación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar al coordinador{" "}
              <span className="font-medium">{selectedCoordinador?.name}</span>?
              Esta acción le impedirá acceder al sistema y gestionar las instalaciones asignadas.
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
      
      {/* Diálogo de reactivación */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar activación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas activar nuevamente al coordinador{" "}
              <span className="font-medium">{selectedCoordinador?.name}</span>?
              Esto le permitirá acceder al sistema y gestionar instalaciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleRestoreConfirm}
            >
              Activar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

