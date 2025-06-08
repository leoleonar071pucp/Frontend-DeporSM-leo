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
import { useNotification } from "@/context/NotificationContext"
import { generarReporte, obtenerReportesRecientes, ReporteDTO } from "@/lib/api-reports"

export default function ReportesAdmin() {
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("reservas")
  const [dateRange, setDateRange] = useState<"day" | "week" | "month" | "year" | "custom">("month")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [facility, setFacility] = useState("all")
  const [fileFormat, setFileFormat] = useState("excel")
  const [isGenerating, setIsGenerating] = useState(false)

  // Estado para las instalaciones
  const [facilities, setFacilities] = useState([
    { id: "all", name: "Todas las instalaciones" }
  ])

  // Función mejorada para descargar el archivo
  const descargarReporte = async (reporteId: number | string) => {
    console.log(`Iniciando descarga del reporte ID: ${reporteId}`);

    try {
      // Primero obtenemos los metadatos del reporte para verificar que existe
      console.log(`Obteniendo metadatos del reporte ID: ${reporteId}`);
      const metadataResponse = await fetch(`/api/reportes/${reporteId}`);

      if (!metadataResponse.ok) {
        console.error(`Error al obtener metadatos: ${metadataResponse.status} ${metadataResponse.statusText}`);
        throw new Error(`No se pudo obtener información del reporte: ${metadataResponse.statusText}`);
      }

      const metadata = await metadataResponse.json();
      console.log("Metadatos del reporte:", metadata);

      // Ahora solicitamos la URL de descarga
      console.log(`Solicitando URL de descarga del reporte ID: ${reporteId}`);
      const fileResponse = await fetch(`/api/reportes/descargar/${reporteId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      console.log(`Respuesta recibida: ${fileResponse.status} ${fileResponse.statusText}`);

      // Verificar si la respuesta es exitosa
      if (!fileResponse.ok) {
        let errorMessage = `Error al obtener URL de descarga: ${fileResponse.status} ${fileResponse.statusText}`;

        try {
          const errorData = await fileResponse.json();
          console.error("Error JSON:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("No se pudo leer el cuerpo del error:", e);
        }

        throw new Error(errorMessage);
      }

      // Obtener la respuesta JSON con la URL
      const data = await fileResponse.json();
      console.log("Datos de descarga recibidos:", data);

      // Verificar que tenemos la URL
      if (!data.url) {
        throw new Error("No se recibió la URL de descarga del servidor");
      }

      // Abrir la URL de Supabase en una nueva pestaña para descarga directa
      console.log("Abriendo URL de descarga:", data.url);

      // Crear un enlace temporal para forzar la descarga
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.download = data.nombre || 'reporte';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Descarga iniciada exitosamente");

      return true;
    } catch (error: any) {
      console.error("Error en la función descargarReporte:", error);
      addNotification({
        title: "Error al descargar",
        message: error.message || "No se pudo descargar el reporte. Intente nuevamente.",
        type: "warning"
      });
      return false;
    }
  };

  // Estado para los reportes recientes
  const [recentReports, setRecentReports] = useState<ReporteDTO[]>([])

  // Datos de ejemplo para los reportes
  const reportTypes = [
    {
      id: "reservas",
      name: "Reservas",
      description: "Información detallada de reservas: usuarios, horarios, estados de pago",
      dateInfo: "Filtra por fecha programada de la reserva (para qué día se hizo la reserva)"
    },
    {
      id: "ingresos",
      name: "Ingresos",
      description: "Resumen de ingresos por reservas y servicios",
      dateInfo: "Filtra por fecha de transacción de pago (cuándo se realizó el pago)"
    },
    {
      id: "instalaciones",
      name: "Uso de instalaciones",
      description: "Métricas de utilización: frecuencia, horarios más solicitados",
      dateInfo: "Filtra por fecha de creación de la reserva (cuándo se hizo la reserva)"
    },
    {
      id: "mantenimiento",
      name: "Mantenimiento",
      description: "Registro de mantenimientos realizados y programados",
      dateInfo: "Filtra por fecha de inicio del mantenimiento"
    },
  ]

  // Función para obtener la información de fechas del tipo de reporte seleccionado
  const getSelectedReportDateInfo = () => {
    const selectedReport = reportTypes.find(type => type.id === reportType)
    return selectedReport?.dateInfo || ""
  }

  useEffect(() => {
    // Cargar datos reales
    const loadData = async () => {
      try {
        // Configurar fechas iniciales
        const today = new Date()
        let start = new Date(today)
        start.setMonth(today.getMonth() - 1)
        setStartDate(start)
        setEndDate(today)

        // Cargar instalaciones desde la API
        const response = await fetch('/api/instalaciones')
        if (response.ok) {
          const data = await response.json()
          setFacilities([
            { id: "all", name: "Todas las instalaciones" },
            ...data.map((instalacion: any) => ({
              id: instalacion.id.toString(),
              name: instalacion.nombre
            }))
          ])
        }

        // Cargar reportes recientes
        try {
          console.log("Intentando cargar reportes recientes...")
          const recentReportsData = await obtenerReportesRecientes()
          console.log("Reportes recientes cargados:", recentReportsData)
          setRecentReports(recentReportsData)
        } catch (error) {
          console.error("Error al cargar reportes recientes:", error)
          // No interrumpir el flujo si falla la carga de reportes recientes
          setRecentReports([])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        addNotification({
          title: "Error",
          message: "No se pudieron cargar los datos. Intente nuevamente.",
          type: "warning"
        })
        setIsLoading(false)
      }
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

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    try {
      // Validar que las fechas sean válidas
      if (!startDate || !endDate) {
        addNotification({
          title: "Error",
          message: "Debe seleccionar fechas de inicio y fin para el reporte",
          type: "warning"
        })
        setIsGenerating(false)
        return
      }

      // Preparar la solicitud para generar el reporte
      const reporteRequest = {
        tipo: reportType,
        formato: fileFormat,
        fechaInicio: format(startDate, "yyyy-MM-dd"),
        fechaFin: format(endDate, "yyyy-MM-dd"),
        instalacionId: facility !== "all" ? parseInt(facility) : undefined
      }

      console.log("Enviando solicitud de reporte:", reporteRequest)

      try {
        // Llamar a la API para generar el reporte
        console.log("Llamando a generarReporte con:", reporteRequest)
        const reporte = await generarReporte(reporteRequest)
        console.log("Reporte generado:", reporte)

        // Obtener el nombre legible del tipo de reporte
        const reportTypeName = reportTypes.find(type => type.id === reportType)?.name || reportType

        // Actualizar la lista de reportes recientes
        try {
          const updatedReports = await obtenerReportesRecientes()
          setRecentReports(updatedReports)
        } catch (error) {
          console.error("Error al actualizar reportes recientes:", error)
          // No interrumpir el flujo si falla la actualización de reportes recientes
        }

        // Crear enlace de descarga
        console.log("Descargando reporte con ID:", reporte.id)
        console.log("Formato del reporte:", fileFormat)

        // Llamar a la función de descarga
        await descargarReporte(reporte.id);

        // Mostrar notificación de éxito
        addNotification({
          title: "Reporte generado exitosamente",
          message: `Se ha generado el reporte de ${reportTypeName} para el período del ${format(startDate, "dd/MM/yyyy")} al ${format(endDate, "dd/MM/yyyy")}`,
          type: "reporte"
        })
      } catch (error) {
        console.error("Error específico al generar reporte:", error)
        addNotification({
          title: "Error",
          message: error instanceof Error ? error.message : "No se pudo generar el reporte. Intente nuevamente.",
          type: "warning"
        })
      }
    } catch (error) {
      console.error("Error al generar reporte:", error)
      addNotification({
        title: "Error",
        message: "No se pudo generar el reporte. Intente nuevamente.",
        type: "warning"
      })
    } finally {
      setIsGenerating(false)
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

                {/* Información sobre las fechas utilizadas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">Criterio de fechas para este reporte</h4>
                      <p className="text-blue-700 text-sm mt-1">{getSelectedReportDateInfo()}</p>
                    </div>
                  </div>
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
                {recentReports.length > 0 ? (
                  recentReports.slice(0, 4).map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // Descargar el reporte al hacer clic
                        console.log("Descargando reporte reciente con ID:", report.id);

                        // Reutilizar la función de descarga que definimos anteriormente
                        descargarReporte(report.id);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {report.formato === 'excel' ? (
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        ) : (
                          <FilePdf className="h-5 w-5 text-red-600" />
                        )}
                        <h3 className="font-medium">{report.nombre}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{report.rangoFechas}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Generado el {new Date(report.fechaCreacion).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay reportes recientes
                  </div>
                )}
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

