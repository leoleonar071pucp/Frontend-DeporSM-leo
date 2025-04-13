"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, FileSpreadsheet, FileIcon as FilePdf, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para los reportes
const reportsData = [
  {
    id: 1,
    name: "Reporte de Reservas",
    type: "reservas",
    format: "excel",
    dateRange: "01/04/2025 - 30/04/2025",
    createdAt: "2025-04-30",
    createdBy: "Admin",
    size: "1.2 MB",
  },
  {
    id: 2,
    name: "Reporte de Ingresos",
    type: "ingresos",
    format: "pdf",
    dateRange: "01/03/2025 - 31/03/2025",
    createdAt: "2025-04-01",
    createdBy: "Admin",
    size: "850 KB",
  },
  {
    id: 3,
    name: "Uso de Instalaciones",
    type: "instalaciones",
    format: "excel",
    dateRange: "01/01/2025 - 31/03/2025",
    createdAt: "2025-04-01",
    createdBy: "Admin",
    size: "1.5 MB",
  },
  {
    id: 4,
    name: "Reporte de Mantenimiento",
    type: "mantenimiento",
    format: "pdf",
    dateRange: "01/02/2025 - 28/02/2025",
    createdAt: "2025-03-01",
    createdBy: "Admin",
    size: "950 KB",
  },
  {
    id: 5,
    name: "Reporte de Reservas por Instalación",
    type: "reservas",
    format: "excel",
    dateRange: "01/01/2025 - 31/03/2025",
    createdAt: "2025-04-02",
    createdBy: "Admin",
    size: "1.8 MB",
  },
  {
    id: 6,
    name: "Reporte de Ingresos Anual",
    type: "ingresos",
    format: "pdf",
    dateRange: "01/01/2024 - 31/12/2024",
    createdAt: "2025-01-05",
    createdBy: "Admin",
    size: "2.1 MB",
  },
  {
    id: 7,
    name: "Reporte de Usuarios",
    type: "usuarios",
    format: "excel",
    dateRange: "01/01/2025 - 31/03/2025",
    createdAt: "2025-04-03",
    createdBy: "Admin",
    size: "1.3 MB",
  },
  {
    id: 8,
    name: "Reporte de Mantenimiento Anual",
    type: "mantenimiento",
    format: "pdf",
    dateRange: "01/01/2024 - 31/12/2024",
    createdAt: "2025-01-10",
    createdBy: "Admin",
    size: "1.7 MB",
  },
]

export default function TodosLosReportes() {
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setReports(reportsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Filtrar reportes por nombre o tipo
    const filtered = reportsData.filter(
      (report) =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setReports(filtered)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todos") {
      setReports(reportsData)
    } else if (value === "reservas") {
      setReports(reportsData.filter((r) => r.type === "reservas"))
    } else if (value === "ingresos") {
      setReports(reportsData.filter((r) => r.type === "ingresos"))
    } else if (value === "instalaciones") {
      setReports(reportsData.filter((r) => r.type === "instalaciones"))
    } else if (value === "mantenimiento") {
      setReports(reportsData.filter((r) => r.type === "mantenimiento"))
    } else if (value === "usuarios") {
      setReports(reportsData.filter((r) => r.type === "usuarios"))
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
      case "usuarios":
        return <Badge className="bg-indigo-100 text-indigo-800">Usuarios</Badge>
      default:
        return null
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
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full p-3">{getReportIcon(report.format)}</div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{report.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getReportTypeBadge(report.type)}
                          <span className="text-xs text-gray-500">
                            {report.format.toUpperCase()} • {report.size}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{report.dateRange}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Generado el {format(new Date(report.createdAt), "dd/MM/yyyy", { locale: es })}
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                          <a href="#" download>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    setReports(reportsData)
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

