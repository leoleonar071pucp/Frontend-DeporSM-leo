"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, FileSpreadsheet, FileIcon as FilePdf, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createLocalDate } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { obtenerTodosLosReportes, buscarReportes, ReporteDTO } from "@/lib/api-reports"
import { useNotification } from "@/context/NotificationContext"
import { TablePagination, useTablePagination } from "@/components/ui/table-pagination"

// Mapeo de tipos de reportes para las pestañas
const reportTypes = {
  reservas: "Reservas",
  ingresos: "Ingresos",
  instalaciones: "Instalaciones",
  mantenimiento: "Mantenimiento",
  asistencias: "Asistencias"
}

export default function TodosLosReportes() {
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<ReporteDTO[]>([])
  const [allReports, setAllReports] = useState<ReporteDTO[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  // Paginación
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedReports,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems
  } = useTablePagination(reports, 12)

  useEffect(() => {
    // Cargar datos reales
    const loadData = async () => {
      try {
        const reportesData = await obtenerTodosLosReportes()
        // Ordenar reportes del más actual al más antiguo
        const reportesOrdenados = reportesData.sort((a, b) => {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        })
        setReports(reportesOrdenados)
        setAllReports(reportesOrdenados)
        setIsLoading(false)
      } catch (error) {
        console.error("Error al cargar reportes:", error)
        addNotification({
          title: "Error",
          message: "No se pudieron cargar los reportes. Intente nuevamente.",
          type: "warning"
        })
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      // Si la búsqueda está vacía, mostrar todos los reportes
      setReports(allReports)
      return
    }

    try {
      // Buscar reportes en el backend
      const resultados = await buscarReportes(searchQuery)
      // Ordenar resultados del más actual al más antiguo
      const resultadosOrdenados = resultados.sort((a, b) => {
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      })
      setReports(resultadosOrdenados)
    } catch (error) {
      console.error("Error al buscar reportes:", error)
      addNotification({
        title: "Error",
        message: "No se pudo realizar la búsqueda. Intente nuevamente.",
        type: "error"
      })
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todos") {
      setReports(allReports)
    } else {
      // Filtrar por tipo y mantener orden del más actual al más antiguo
      const reportesFiltrados = allReports.filter((r) => r.tipo === value)
      setReports(reportesFiltrados)
    }
  }

  const getReportIcon = (format) => {
    switch (format) {
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-blue-600" />
    }
  }

  const getReportTypeBadge = (type) => {
    switch (type) {
      case "reservas":
        return <Badge className="bg-blue-100 text-blue-800">Reservas</Badge>
      case "ingresos":
        return <Badge className="bg-green-100 text-green-800">Ingresos</Badge>
      case "instalaciones":
        return <Badge className="bg-purple-100 text-purple-800">Instalaciones</Badge>
      case "mantenimiento":
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento</Badge>
      case "asistencias":
        return <Badge className="bg-orange-100 text-orange-800">Asistencias</Badge>
      default:
        return null
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      // Si la fecha incluye timestamp, usar createLocalDate para fechas simples
      if (dateString.includes('T') && dateString.length === 10) {
        return format(createLocalDate(dateString), "dd/MM/yyyy", { locale: es })
      }
      // Para fechas con timestamp completo, usar Date directamente
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/reportes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Todos los Reportes</h1>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o tipo..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary-light">
                Buscar
              </Button>
            </form>
            <Button variant="outline" asChild>
              <Link href="/admin/reportes">
                <FileText className="h-4 w-4 mr-2" />
                Generar nuevo reporte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todos" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="reservas">Reservas</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="instalaciones">Instalaciones</TabsTrigger>
          <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {reports.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full p-3">{getReportIcon(report.formato)}</div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{report.nombre}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getReportTypeBadge(report.tipo)}
                          <span className="text-xs text-gray-500">
                            {report.formato.toUpperCase()} • {report.tamano}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{report.rangoFechas}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Generado el {formatDate(report.fechaCreacion)} por {report.creadoPor}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{report.descripcion}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => {
                            // Descargar el reporte al hacer clic
                            console.log("Descargando reporte con ID:", report.id)

                            // Usar fetch para obtener la URL de descarga
                            fetch(`/api/reportes/descargar/${report.id}`, {
                              credentials: 'include',
                              headers: {
                                'Accept': 'application/json',
                              },
                            })
                              .then(async response => {
                                // Verificar si la respuesta es exitosa
                                if (!response.ok) {
                                  throw new Error(`Error al obtener URL de descarga: ${response.status} ${response.statusText}`)
                                }

                                // Obtener la respuesta JSON con la URL
                                const data = await response.json()
                                console.log("Datos de descarga recibidos:", data)

                                // Verificar que tenemos la URL
                                if (!data.url) {
                                  throw new Error("No se recibió la URL de descarga del servidor")
                                }

                                // Abrir la URL de Supabase para descarga directa
                                console.log("Abriendo URL de descarga:", data.url)

                                // Crear un enlace temporal para forzar la descarga
                                const link = document.createElement('a')
                                link.href = data.url
                                link.target = '_blank'
                                link.download = data.nombre || report.nombre
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              })
                              .catch(error => {
                                console.error("Error al descargar el reporte:", error)
                                addNotification({
                                  title: "Error",
                                  message: "No se pudo descargar el reporte. Intente nuevamente.",
                                  type: "warning"
                                })
                              })
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>

              {/* Paginación */}
              {reports.length > 0 && (
                <div className="mt-6">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No se encontraron reportes</h3>
                <p className="text-gray-500 mt-2">No hay reportes que coincidan con los criterios de búsqueda.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setReports(allReports)
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

