"use client"

import { useEffect, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"

export default function CoordinadoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)
  const [coordinators, setCoordinators] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/usuarios/allCoordinadores")
        const data = await response.json()

        // Procesar instalacionesAsignadas separadas por comas
        const processedData = data.map((coordinator) => ({
          ...coordinator,
          assignedFacilities: coordinator.instalacionesAsignadas
            ? coordinator.instalacionesAsignadas.split(",").map((name, index) => ({
                id: index,
                name: name.trim(),
              }))
            : [],
          status: "activo", // Asumimos que todos están activos inicialmente
          lastLogin: "-",   // Puedes reemplazar esto cuando tengas lastLogin real
        }))
        setCoordinators(processedData)
      } catch (error) {
        console.error("Error fetching coordinators:", error)
      }
    }

    fetchCoordinators()
  }, [])

  const filteredCoordinators = coordinators.filter(
    (coordinator) =>
      coordinator.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeactivateClick = (coordinator) => {
    setSelectedCoordinator(coordinator)
    setIsDeleteDialogOpen(true)
  }

  const handleDeactivateConfirm = () => {
    setCoordinators(prev => prev.map(c => {
      if (c.id === selectedCoordinator.id) {
        return {
          ...c,
          status: "inactivo",
          assignedFacilities: [] // Vaciar instalaciones
        }
      }
      return c
    }))

    toast({
      title: "Coordinador desactivado",
      description: `El coordinador ${selectedCoordinator.nombre} ha sido desactivado exitosamente.`,
    })

    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Coordinadores</h1>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/admin/coordinadores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Asignar Coordinador
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
                      <TableCell className="font-medium">{coordinator.nombre}</TableCell>
                      <TableCell>{coordinator.email}</TableCell>
                      <TableCell>{coordinator.telefono}</TableCell>
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
                          {coordinator.status === "activo" && (
                            <>
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
                                onClick={() => handleDeactivateClick(coordinator)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Desactivar</span>
                              </Button>
                            </>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desactivación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar al coordinador{" "}
              <span className="font-medium">{selectedCoordinator?.nombre}</span>? Al desactivarlo, se eliminarán todas sus instalaciones asignadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeactivateConfirm}>
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
