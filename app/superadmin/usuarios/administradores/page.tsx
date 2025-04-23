"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Trash2, Shield, UserCheck, Pencil } from "lucide-react"
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

// Datos de ejemplo para los administradores
const administradoresData = [
  {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos.mendoza@munisanmiguel.gob.pe",
    phone: "987-654-321",
    status: "activo",
    lastLogin: "05/04/2025, 09:15",
    role: "Administrador",
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    email: "ana.rodriguez@munisanmiguel.gob.pe",
    phone: "987-654-322",
    status: "activo",
    lastLogin: "04/04/2025, 14:30",
    role: "Administrador",
  },
  {
    id: 3,
    name: "Luis Torres",
    email: "luis.torres@munisanmiguel.gob.pe",
    phone: "987-654-323",
    status: "inactivo",
    lastLogin: "01/04/2025, 10:45",
    role: "Administrador",
  },
  {
    id: 4,
    name: "Sofía Cárdenas",
    email: "sofia.cardenas@munisanmiguel.gob.pe",
    phone: "987-654-324",
    status: "activo",
    lastLogin: "03/04/2025, 16:20",
    role: "Administrador",
  },
]

// Definición de tipos
interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastLogin: string;
  role: string;
}

export default function AdministradoresPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>(administradoresData)

  const filteredAdmins = admins.filter((admin) => {
    // Filtro de búsqueda
    const searchMatch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de estado
    const statusMatch = statusFilter === "all" || admin.status === statusFilter

    return searchMatch && statusMatch
  })

  const handleViewDetails = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsDeleteDialogOpen(true)
  }
  
  const handleRestoreClick = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsRestoreDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Implementar soft delete: cambiar estado a inactivo
    if (selectedAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin.id === selectedAdmin.id ? { ...admin, status: "inactivo" } : admin
        )
      )
      
      toast({
        title: "Administrador desactivado",
        description: `El administrador ${selectedAdmin.name} ha sido desactivado con éxito.`,
      })
    }
    
    setIsDeleteDialogOpen(false)
  }
  
  const handleRestoreConfirm = () => {
    // Restaurar administrador: cambiar estado a activo
    if (selectedAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin.id === selectedAdmin.id ? { ...admin, status: "activo" } : admin
        )
      )
      
      toast({
        title: "Administrador activado",
        description: `El administrador ${selectedAdmin.name} ha sido activado nuevamente.`,
      })
    }
    
    setIsRestoreDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">Gestiona los administradores del sistema</p>
        </div>
        <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" asChild>
          <Link href="/superadmin/usuarios/administradores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Administrador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Administradores</CardTitle>
          <CardDescription>Administra los usuarios con rol de administrador en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar administrador..."
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone}</TableCell>
                      <TableCell>
                        {admin.status === "activo" ? (
                          <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{admin.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleViewDetails(admin)}
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
                            <Link href={`/superadmin/usuarios/administradores/editar/${admin.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          {admin.status === "activo" ? (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(admin)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Desactivar</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-green-500"
                              onClick={() => handleRestoreClick(admin)}
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
                      No se encontraron administradores
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
            <DialogTitle>Detalles del Administrador</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">{selectedAdmin.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <div className="flex items-center mt-1">
                    <Shield className="h-4 w-4 mr-1 text-[#0cb7f2]" />
                    {selectedAdmin.role}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{selectedAdmin.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1">{selectedAdmin.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    {selectedAdmin.status === "activo" ? (
                      <Badge className="bg-[#def7ff] text-[#0cb7f2]">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Último acceso</p>
                  <p className="mt-1">{selectedAdmin.lastLogin}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  className="text-blue-500"
                  asChild
                >
                  <Link href={`/superadmin/usuarios/administradores/editar/${selectedAdmin.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                {selectedAdmin.status === "activo" ? (
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
              ¿Estás seguro de que deseas desactivar al administrador{" "}
              <span className="font-medium">{selectedAdmin?.name}</span>?
              Esta acción le impedirá acceder al sistema y gestionar instalaciones.
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
              ¿Estás seguro de que deseas activar nuevamente al administrador{" "}
              <span className="font-medium">{selectedAdmin?.name}</span>?
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

