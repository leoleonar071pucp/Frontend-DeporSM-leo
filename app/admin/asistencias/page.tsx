"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Search, Filter, Download, Eye, Loader2, FileSpreadsheet, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import { generarReporteAsistencias, ReporteAsistenciasRequestDTO } from "@/lib/api-reports"
import { useNotification } from "@/context/NotificationContext"
import { TablePagination, useTablePagination } from "@/components/ui/table-pagination"

// Tipos de datos
interface AttendanceRecord {
  id: number
  coordinadorId: number
  nombreCoordinador: string
  instalacionId: number
  nombreInstalacion: string
  fecha: string
  horaProgramadaInicio: string
  horaProgramadaFin: string
  horaEntrada?: string
  estadoEntrada: "a-tiempo" | "tarde" | "no-asistio" | "pendiente"
  horaSalida?: string
  estadoSalida: "a-tiempo" | "tarde" | "no-asistio" | "pendiente"
  ubicacion?: string
  notas?: string
}

interface Filters {
  coordinadorNombre: string
  instalacionNombre: string
  estadoEntrada: string
  estadoSalida: string
  fechaInicio: string
  fechaFin: string
}

export default function AdminAsistenciasPage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    coordinadorNombre: "",
    instalacionNombre: "",
    estadoEntrada: "",
    estadoSalida: "",
    fechaInicio: "",
    fechaFin: ""
  })
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel")
  const { addNotification } = useNotification()

  // Paginación
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedAttendance,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems
  } = useTablePagination(filteredData, 10)

  // Obtener listas únicas para los selectores
  const uniqueInstalaciones = Array.from(new Set(attendanceData.map(item => item.nombreInstalacion))).sort()
  const uniqueCoordinadores = Array.from(new Set(attendanceData.map(item => item.nombreCoordinador))).sort()

  // Calcular estadísticas basadas en los datos filtrados
  const stats = {
    total: filteredData.length,
    onTime: filteredData.filter(item => item.estadoEntrada === "a-tiempo").length,
    late: filteredData.filter(item => item.estadoEntrada === "tarde").length,
    missed: filteredData.filter(item => item.estadoEntrada === "no-asistio").length,
    coordinadores: new Set(filteredData.map(item => item.coordinadorId)).size,
    // Para instalaciones, contar las instalaciones únicas de los datos filtrados
    instalaciones: new Set(filteredData.map(item => item.instalacionId)).size,
  }

  // Cargar datos de asistencia (solo una vez al inicio)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/admin/asistencias`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`Error al cargar asistencias: ${response.status}`)
        }

        const data = await response.json()
        setAttendanceData(data)
        setFilteredData(data)
      } catch (error) {
        console.error("Error al cargar datos de asistencia:", error)
        addNotification({
          title: 'Error al cargar datos',
          message: 'No se pudieron cargar los datos de asistencia',
          type: 'warning'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [addNotification])

  // Aplicar filtros localmente
  useEffect(() => {
    let filtered = [...attendanceData]

    // Filtro por coordinador
    if (filters.coordinadorNombre) {
      filtered = filtered.filter(item =>
        item.nombreCoordinador === filters.coordinadorNombre
      )
    }

    // Filtro por instalación
    if (filters.instalacionNombre) {
      filtered = filtered.filter(item =>
        item.nombreInstalacion.toLowerCase().includes(filters.instalacionNombre.toLowerCase())
      )
    }

    // Filtro por estado de entrada
    if (filters.estadoEntrada) {
      filtered = filtered.filter(item => item.estadoEntrada === filters.estadoEntrada)
    }

    // Filtro por estado de salida
    if (filters.estadoSalida) {
      filtered = filtered.filter(item => item.estadoSalida === filters.estadoSalida)
    }

    // Filtro por fecha inicio
    if (filters.fechaInicio) {
      filtered = filtered.filter(item => item.fecha >= filters.fechaInicio)
    }

    // Filtro por fecha fin
    if (filters.fechaFin) {
      filtered = filtered.filter(item => item.fecha <= filters.fechaFin)
    }

    setFilteredData(filtered)
  }, [attendanceData, filters])

  // Función para formatear hora sin segundos
  const formatTime = (time: string | undefined | null) => {
    if (!time) return null
    // Si la hora viene en formato HH:MM:SS, extraer solo HH:MM
    if (time.includes(':')) {
      const parts = time.split(':')
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`
      }
    }
    return time
  }

  // Función para obtener el badge del estado
  const getStatusBadge = (estado: string | null | undefined) => {
    if (!estado) {
      return <Badge className="bg-gray-100 text-gray-800">-</Badge>
    }

    switch (estado) {
      case "a-tiempo":
        return <Badge className="bg-green-100 text-green-800">A tiempo</Badge>
      case "tarde":
        return <Badge className="bg-yellow-100 text-yellow-800">Tarde</Badge>
      case "no-asistio":
        return <Badge className="bg-red-100 text-red-800">No asistió</Badge>
      case "pendiente":
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{estado}</Badge>
    }
  }

  // Función para aplicar filtros
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      coordinadorNombre: "",
      instalacionNombre: "",
      estadoEntrada: "",
      estadoSalida: "",
      fechaInicio: "",
      fechaFin: ""
    })
  }

  // Función para exportar datos a Excel
  const exportData = async () => {
    try {
      setIsLoading(true);

      // Usar las fechas de los filtros o valores por defecto (rango amplio para incluir todos los registros)
      const fechaInicio = filters.fechaInicio || format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // 1 año atrás
      const fechaFin = filters.fechaFin || format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // 1 año adelante

      // Crear descripción de filtros para el nombre del archivo (más corta y clara)
      const filtrosAplicados = [];
      if (filters.coordinadorNombre) filtrosAplicados.push(filters.coordinadorNombre.replace(/\s+/g, '_'));
      if (filters.instalacionNombre) filtrosAplicados.push(filters.instalacionNombre.replace(/\s+/g, '_'));
      if (filters.estadoEntrada) filtrosAplicados.push(`entrada_${filters.estadoEntrada}`);
      if (filters.estadoSalida) filtrosAplicados.push(`salida_${filters.estadoSalida}`);

      // Solo agregar fechas si se están usando filtros de fecha específicos
      const usandoFiltrosFecha = filters.fechaInicio || filters.fechaFin;
      let fechasTexto = '';
      if (usandoFiltrosFecha) {
        if (filters.fechaInicio && filters.fechaFin) {
          fechasTexto = `_desde_${filters.fechaInicio}_hasta_${filters.fechaFin}`;
        } else if (filters.fechaInicio) {
          fechasTexto = `_desde_${filters.fechaInicio}`;
        } else if (filters.fechaFin) {
          fechasTexto = `_hasta_${filters.fechaFin}`;
        }
      }

      const filtrosTexto = filtrosAplicados.length > 0 ? `_${filtrosAplicados.join('_')}` : '';

      // Preparar los datos para el reporte con los filtros aplicados
      const reporteData: ReporteAsistenciasRequestDTO = {
        tipo: 'asistencias',
        formato: exportFormat, // Usar el formato seleccionado
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        ...(filters.coordinadorNombre && { coordinadorNombre: filters.coordinadorNombre }),
        ...(filters.instalacionNombre && { instalacionNombre: filters.instalacionNombre }),
        ...(filters.estadoEntrada && { estadoEntrada: filters.estadoEntrada }),
        ...(filters.estadoSalida && { estadoSalida: filters.estadoSalida }),
        ...(filtrosTexto && { filtrosTexto: filtrosTexto }),
        ...(fechasTexto && { fechasTexto: fechasTexto })
      };

      console.log("Generando reporte de asistencias con datos:", reporteData);

      // Usar la función de la librería api-reports
      const reporte = await generarReporteAsistencias(reporteData);
      console.log('Reporte generado y guardado en Supabase:', reporte);

      // Abrir la URL de Supabase en una nueva pestaña para descarga directa
      console.log("Abriendo URL de descarga:", reporte.urlArchivo);

      // Crear un enlace temporal para forzar la descarga
      const link = document.createElement('a');
      link.href = reporte.urlArchivo;
      link.target = '_blank';
      link.download = reporte.nombre || 'reporte_asistencias';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification({
        title: "Exportación exitosa",
        message: `Historial de asistencias exportado y guardado correctamente en formato ${exportFormat === 'excel' ? 'Excel' : 'PDF'}`,
        type: "reporte"
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      addNotification({
        title: "Error en la exportación",
        message: error instanceof Error ? error.message : "No se pudo exportar el historial de asistencias. Inténtalo de nuevo.",
        type: "reporte"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Función para ver detalles de una asistencia
  const viewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando historial de asistencias...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial de Asistencias</h1>
        <p className="text-muted-foreground">
          Registro completo de asistencias de todos los coordinadores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">A Tiempo</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarde</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">No Asistió</p>
                <p className="text-2xl font-bold text-red-600">{stats.missed}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coordinadores</p>
                <p className="text-2xl font-bold">{stats.coordinadores}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Instalaciones</p>
                <p className="text-2xl font-bold">{stats.instalaciones}</p>
              </div>
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription>
            Utiliza los filtros para encontrar registros específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coordinador">Coordinador</Label>
              <Select value={filters.coordinadorNombre || "todos"} onValueChange={(value) => handleFilterChange("coordinadorNombre", value === "todos" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los coordinadores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los coordinadores</SelectItem>
                  {uniqueCoordinadores.map((coordinador) => (
                    <SelectItem key={coordinador} value={coordinador}>
                      {coordinador}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instalacion">Instalación</Label>
              <Select value={filters.instalacionNombre || "todas"} onValueChange={(value) => handleFilterChange("instalacionNombre", value === "todas" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las instalaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las instalaciones</SelectItem>
                  {uniqueInstalaciones.map((instalacion) => (
                    <SelectItem key={instalacion} value={instalacion}>
                      {instalacion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoEntrada">Estado de Entrada</Label>
              <Select value={filters.estadoEntrada || "todos"} onValueChange={(value) => handleFilterChange("estadoEntrada", value === "todos" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="a-tiempo">A tiempo</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="no-asistio">No asistió</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoSalida">Estado de Salida</Label>
              <Select value={filters.estadoSalida || "todos"} onValueChange={(value) => handleFilterChange("estadoSalida", value === "todos" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="a-tiempo">A tiempo</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="no-asistio">No asistió</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Limpiar filtros
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={exportFormat} onValueChange={(value: "excel" | "pdf") => setExportFormat(value)}>
                <SelectTrigger className="w-full sm:w-32 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={exportData}
                className="min-h-[44px] w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar {exportFormat === 'excel' ? 'Excel' : 'PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Asistencia</CardTitle>
          <CardDescription>
            {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Instalación</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora Programada</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Estado Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Estado Salida</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nombreCoordinador}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nombreInstalacion}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(createLocalDate(item.fecha), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{formatTime(item.horaProgramadaInicio)} - {formatTime(item.horaProgramadaFin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.horaEntrada ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatTime(item.horaEntrada)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.estadoEntrada)}
                      </TableCell>
                      <TableCell>
                        {item.horaSalida ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatTime(item.horaSalida)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.estadoSalida)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => viewDetails(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron registros</p>
                        <p className="text-sm text-gray-400">
                          Intenta ajustar los filtros de búsqueda
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {filteredData.length > 0 && (
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

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Asistencia</DialogTitle>
            <DialogDescription>
              Información completa del registro de asistencia
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Coordinador</Label>
                  <p className="text-sm">{selectedRecord.nombreCoordinador}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Instalación</Label>
                  <p className="text-sm">{selectedRecord.nombreInstalacion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                  <p className="text-sm">{format(createLocalDate(selectedRecord.fecha), "dd/MM/yyyy", { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hora Programada</Label>
                  <p className="text-sm">{formatTime(selectedRecord.horaProgramadaInicio)} - {formatTime(selectedRecord.horaProgramadaFin)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hora de Entrada</Label>
                  <p className="text-sm">{formatTime(selectedRecord.horaEntrada) || "Sin registro"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado de Entrada</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecord.estadoEntrada)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hora de Salida</Label>
                  <p className="text-sm">{formatTime(selectedRecord.horaSalida) || "Sin registro"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado de Salida</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecord.estadoSalida)}
                  </div>
                </div>
              </div>

              {selectedRecord.ubicacion && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ubicación</Label>
                  <p className="text-sm">{selectedRecord.ubicacion}</p>
                </div>
              )}

              {selectedRecord.notas && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notas</Label>
                  <p className="text-sm">{selectedRecord.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
