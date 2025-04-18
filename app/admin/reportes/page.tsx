"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Download, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function ReportesAdmin() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("reservas")
  const [dateRange, setDateRange] = useState<"day" | "week" | "month" | "year" | "custom">("month")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [facility, setFacility] = useState("all")
  const [fileFormat, setFileFormat] = useState("excel")
  const [isGenerating, setIsGenerating] = useState(false)

  // Datos de ejemplo para las instalaciones
  const facilities = [
    { id: "all", name: "Todas las instalaciones" },
    { id: "1", name: "Piscina Municipal" },
    { id: "2", name: "Cancha de Fútbol (Grass)" },
    { id: "3", name: "Gimnasio Municipal" },
    { id: "4", name: "Cancha de Fútbol (Loza)" },
    { id: "5", name: "Pista de Atletismo" },
  ]

  // Datos de ejemplo para los reportes
  const reportTypes = [
    { id: "reservas", name: "Reservas", description: "Información detallada de reservas: usuarios, horarios, estados de pago" },
    { id: "ingresos", name: "Ingresos", description: "Resumen de ingresos por reservas y servicios" },
    { id: "instalaciones", name: "Uso de instalaciones", description: "Métricas de utilización: frecuencia, horarios más solicitados, capacidad" },
    { id: "mantenimiento", name: "Mantenimiento", description: "Registro de mantenimientos realizados y programados" },
  ]

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      const today = new Date()
      let start = new Date(today)
      start.setMonth(today.getMonth() - 1)
      setStartDate(start)
      setEndDate(today)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleDateRangeChange = (value: "day" | "week" | "month" | "year" | "custom") => {
    setDateRange(value)

    const today = new Date()
    let start = new Date()

    switch (value) {
      case "day":
        start = today
        break
      case "week":
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        break
      case "month":
        start = new Date(today)
        start.setMonth(today.getMonth() - 1)
        break
      case "year":
        start = new Date(today)
        start.setFullYear(today.getFullYear() - 1)
        break
      case "custom":
        // No cambiamos las fechas, el usuario las seleccionará
        break
    }

    setStartDate(start)
    setEndDate(today)
  }

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Generar el nombre del archivo
    const fileName = `reporte_${reportType}_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}`
    
    // Crear contenido de ejemplo según el tipo de reporte
    let content = ''
    if (fileFormat === 'excel') {
      // Contenido CSV para Excel
      content = 'Fecha,Tipo,Instalación,Detalle\n'
      content += `${format(new Date(), 'dd/MM/yyyy')},${reportType},${facility},Reporte generado\n`
    } else {
      // Contenido texto plano para PDF
      content = `Reporte de ${reportType}\n`
      content += `Fecha: ${format(new Date(), 'dd/MM/yyyy')}\n`
      content += `Instalación: ${facility}\n`
      content += `Período: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}\n`
    }

    // Crear el blob según el formato
    const blob = new Blob(
      [content],
      { type: fileFormat === 'excel' ? 'text/csv;charset=utf-8;' : 'application/pdf' }
    )

    // Crear URL del blob
    const url = window.URL.createObjectURL(blob)

    // Crear enlace de descarga
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fileName}.${fileFormat === 'excel' ? 'csv' : 'pdf'}`)
    document.body.appendChild(link)

    // Simular tiempo de generación
    setTimeout(() => {
      setIsGenerating(false)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Mostrar notificación de éxito con más detalles
      toast({
        title: "Reporte generado exitosamente",
        description: `El reporte "${fileName}.${fileFormat === 'excel' ? 'csv' : 'pdf'}" ha sido generado y descargado.`,
        variant: "default",
      })
    }, 2000)
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generación de Reportes</h1>
        <p className="text-muted-foreground">Genera reportes personalizados en Excel o PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Reporte</CardTitle>
              <CardDescription>Selecciona los parámetros para generar tu reporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de reporte */}
              <div className="space-y-2">
                <Label>Tipo de reporte</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        reportType === type.id ? "border-primary bg-primary-background" : "hover:border-primary"
                      }`}
                      onClick={() => setReportType(type.id)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{type.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Rango de fechas */}
              <div className="space-y-4">
                <Label>Rango de fechas</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateRange === "day" ? "default" : "outline"}
                    className={dateRange === "day" ? "bg-primary hover:bg-primary-light" : ""}
                    onClick={() => handleDateRangeChange("day")}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant={dateRange === "week" ? "default" : "outline"}
                    className={dateRange === "week" ? "bg-primary hover:bg-primary-light" : ""}
                    onClick={() => handleDateRangeChange("week")}
                  >
                    Última semana
                  </Button>
                  <Button
                    variant={dateRange === "month" ? "default" : "outline"}
                    className={dateRange === "month" ? "bg-primary hover:bg-primary-light" : ""}
                    onClick={() => handleDateRangeChange("month")}
                  >
                    Último mes
                  </Button>
                  <Button
                    variant={dateRange === "year" ? "default" : "outline"}
                    className={dateRange === "year" ? "bg-primary hover:bg-primary-light" : ""}
                    onClick={() => handleDateRangeChange("year")}
                  >
                    Último año
                  </Button>
                  <Button
                    variant={dateRange === "custom" ? "default" : "outline"}
                    className={dateRange === "custom" ? "bg-primary hover:bg-primary-light" : ""}
                    onClick={() => handleDateRangeChange("custom")}
                  >
                    Personalizado
                  </Button>
                </div>

                {dateRange === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Fecha de inicio</Label>
                      <div className="border rounded-md">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          disabled={(date) => date > endDate}
                          locale={es}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de fin</Label>
                      <div className="border rounded-md">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          disabled={(date) => date < startDate}
                          locale={es}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <p className="text-sm">
                    Periodo seleccionado:{" "}
                    <strong>
                      {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                    </strong>
                  </p>
                </div>
              </div>

              <Separator />

              {/* Instalación */}
              <div className="space-y-2">
                <Label htmlFor="facility">Instalación</Label>
                <Select value={facility} onValueChange={setFacility}>
                  <SelectTrigger id="facility">
                    <SelectValue placeholder="Selecciona una instalación" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formato */}
              <div className="space-y-2">
                <Label>Formato de salida</Label>
                <div className="flex gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors flex-1 ${
                      fileFormat === "excel" ? "border-primary bg-primary-background" : "hover:border-primary"
                    }`}
                    onClick={() => setFileFormat("excel")}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <h3 className="font-medium">Excel</h3>
                    </div>
                  </div>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors flex-1 ${
                      fileFormat === "pdf" ? "border-primary bg-primary-background" : "hover:border-primary"
                    }`}
                    onClick={() => setFileFormat("pdf")}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FilePdf className="h-8 w-8 text-red-600" />
                      <h3 className="font-medium">PDF</h3>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-primary hover:bg-primary-light"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando reporte...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>Tus últimos reportes generados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Reporte de Reservas</h3>
                  </div>
                  <p className="text-sm text-gray-500">01/04/2025 - 30/04/2025</p>
                  <p className="text-xs text-gray-400 mt-1">Generado el 30/04/2025</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FilePdf className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">Reporte de Ingresos</h3>
                  </div>
                  <p className="text-sm text-gray-500">01/03/2025 - 31/03/2025</p>
                  <p className="text-xs text-gray-400 mt-1">Generado el 01/04/2025</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Uso de Instalaciones</h3>
                  </div>
                  <p className="text-sm text-gray-500">01/01/2025 - 31/03/2025</p>
                  <p className="text-xs text-gray-400 mt-1">Generado el 01/04/2025</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FilePdf className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">Reporte de Mantenimiento</h3>
                  </div>
                  <p className="text-sm text-gray-500">01/02/2025 - 28/02/2025</p>
                  <p className="text-xs text-gray-400 mt-1">Generado el 01/03/2025</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/reportes/todos">
                  Ver todos los reportes
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

