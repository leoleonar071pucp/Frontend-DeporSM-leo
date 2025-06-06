"use client"

import type React from "react"
import { API_BASE_URL } from "@/lib/config"; // Ajusta la ruta según tu estructura

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Search, Loader2, Info } from "lucide-react"
import { PoliticasReserva } from "@/components/politicas-reserva"
import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { MetadataGenerator } from "@/components/metadata-generator"

// Tipo para las instalaciones
interface Facility {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
}

export default function Instalaciones() {
  // Estados para la gestión de instalaciones
  const [allFacilities, setAllFacilities] = useState<Facility[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Obtener configuración del sistema
  const configSistema = useConfiguracionSistema();

  // Cargar instalaciones desde el backend al montar el componente
  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/instalaciones/disponibles`)
        if (!response.ok) {
          throw new Error(`Error al cargar instalaciones: ${response.status}`)
        }
        const data = await response.json()
        setAllFacilities(data)
        setFacilities(data)
        console.log("Instalaciones cargadas:", data);
      } catch (err) {
        setError("Error al cargar las instalaciones. Inténtelo de nuevo más tarde.")
        console.error("Error al cargar instalaciones:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFacilities()
  }, [])  // Función para manejar la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Primero filtramos por términos de búsqueda
    const filteredBySearch = allFacilities.filter(facility => 
      facility.nombre.toLowerCase().includes(query.toLowerCase()) ||
      facility.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      facility.ubicacion.toLowerCase().includes(query.toLowerCase())
    )
    
    // Aplicamos el mismo filtro por categoría que usa handleTabChange
    if (activeTab === "todos") {
      setFacilities(filteredBySearch);
    } else if (activeTab === "otros") {
      const filteredByType = filteredBySearch.filter(facility => {
        const facilityType = facility.tipo.toLowerCase();
        return !["cancha", "canchas", "gimnasio", "gimnasios", "piscina", "piscinas"].includes(facilityType);
      });
      setFacilities(filteredByType);
    } else {
      const filteredByType = filteredBySearch.filter(facility => {
        const facilityType = facility.tipo.toLowerCase();
        let matchesType = false;
        
        if (activeTab === "cancha" || activeTab === "canchas") {
          matchesType = facilityType === "cancha" || facilityType === "canchas";
        } else if (activeTab === "gimnasio" || activeTab === "gimnasios") {
          matchesType = facilityType === "gimnasio" || facilityType === "gimnasios";
        } else if (activeTab === "piscina" || activeTab === "piscinas") {
          matchesType = facilityType === "piscina" || facilityType === "piscinas";
        } else {
          matchesType = facilityType === activeTab.toLowerCase();
        }
        
        return matchesType;
      });
      setFacilities(filteredByType);
    }
  }// Función para manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Filtrar instalaciones por tipo seleccionado
    if (tab === "todos") {
      // Aplicar solo el filtro de búsqueda si existe
      const filteredBySearch = allFacilities.filter(facility => 
        !searchQuery || 
        facility.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFacilities(filteredBySearch)
    } else if (tab === "otros") {
      // Para la categoría "otros", mostrar todas las que no son canchas, gimnasios o piscinas
      const filtered = allFacilities.filter(facility => {
        const matchesSearch = !searchQuery || 
          facility.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
        
        // No pertenece a ninguna de las otras categorías específicas
        const facilityType = facility.tipo.toLowerCase();
        const isOther = !["cancha", "canchas", "gimnasio", "gimnasios", "piscina", "piscinas"].includes(facilityType);
        
        return matchesSearch && isOther;
      })
      
      setFacilities(filtered)
    } else {
      // Filtrar por tipo y búsqueda para las demás categorías
      const filtered = allFacilities.filter(facility => {
        const matchesSearch = !searchQuery || 
          facility.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Hacer la comparación más flexible para considerar singular/plural
        const facilityType = facility.tipo.toLowerCase();
        let matchesType = false;
        
        if (tab === "cancha" || tab === "canchas") {
          matchesType = facilityType === "cancha" || facilityType === "canchas";
        } else if (tab === "gimnasio" || tab === "gimnasios") {
          matchesType = facilityType === "gimnasio" || facilityType === "gimnasios";
        } else if (tab === "piscina" || tab === "piscinas") {
          matchesType = facilityType === "piscina" || facilityType === "piscinas";
        } else {
          // Para cualquier otra categoría específica
          matchesType = facilityType === tab.toLowerCase();
        }
        
        return matchesSearch && matchesType;
      })
      
      setFacilities(filtered)
    }
  }

  // Función para formatear precios
  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  return (
    <main className="min-h-screen bg-background">
      <MetadataGenerator 
        baseTitle="Instalaciones"
        description="Nuestras instalaciones deportivas disponibles para reserva" 
      />
      
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instalaciones Deportivas</h1>
          <p className="text-gray-600">
            Explora y reserva nuestras instalaciones deportivas. Para realizar una reserva,
            selecciona una instalación y verifica su disponibilidad.
            {!configSistema.reservasEstanHabilitadas() && (
              <span className="ml-2 text-amber-600 font-medium">
                (Reservas temporalmente suspendidas)
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar instalaciones..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>            <Tabs 
              value={activeTab} 
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="w-full md:w-auto flex flex-wrap justify-between md:justify-start gap-2">
                <TabsTrigger value="todos" className="flex-1 md:flex-none">Todos</TabsTrigger>
                <TabsTrigger value="canchas" className="flex-1 md:flex-none">Canchas</TabsTrigger>
                <TabsTrigger value="gimnasios" className="flex-1 md:flex-none">Gimnasios</TabsTrigger>
                <TabsTrigger value="piscinas" className="flex-1 md:flex-none">Piscinas</TabsTrigger>
                <TabsTrigger value="otros" className="flex-1 md:flex-none">Otros</TabsTrigger>
              </TabsList>
              
              {/* Use a single TabsContent and render based on activeTab */}
              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center p-8 bg-red-50 rounded-lg text-red-500">
                    <p>{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="mt-4"
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : facilities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility) => (
                      <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={facility.imagenUrl || "/placeholder.svg?height=200&width=300"}
                          alt={facility.nombre}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2">{facility.nombre}</h3>
                          <p className="text-gray-600 text-sm mb-2">{facility.descripcion}</p>
                          <p className="text-gray-700 text-sm mb-1">
                            <strong>Ubicación:</strong> {facility.ubicacion}
                          </p>
                          <p className="text-gray-700 text-sm mb-4">
                            <strong>Precio:</strong> {formatPrice(facility.precio)}
                          </p>
                          <Button 
                            asChild={configSistema.reservasEstanHabilitadas()} 
                            disabled={!configSistema.reservasEstanHabilitadas()} 
                            className="w-full"
                          >
                            {configSistema.reservasEstanHabilitadas() ? (
                              <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
                            ) : (
                              "Reservas deshabilitadas"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No se encontraron instalaciones con los criterios especificados.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar with policies */}
          <div className="space-y-6">
            <PoliticasReserva />
            
            {/* Sistema en mantenimiento */}
            {configSistema.estaCargando ? null : configSistema.tieneError ? null : (
              <>
                {configSistema.modoMantenimiento && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6 pb-4 px-4">
                      <div className="flex gap-3 items-start">
                        <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-amber-800">Sistema en mantenimiento</h3>
                          <p className="text-sm text-amber-700">
                            El sistema se encuentra en modo mantenimiento. Algunas funciones
                            podrían no estar disponibles.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {/* Contacto rápido */}
            <Card>
              <CardContent className="pt-6 pb-4 px-4">
                <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Si tienes dudas sobre cómo reservar o necesitas información adicional, contáctanos:
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {configSistema.getEmailContacto()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Teléfono:</span> {configSistema.getTelefonoContacto()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
