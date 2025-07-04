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
import { Search, Loader2, Info, MapPin } from "lucide-react"
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
  }, [])
  
  // Función para manejar la búsqueda
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
  }
  
  // Función para manejar el cambio de pestaña
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
    return `S/ ${price.toFixed(2)}`;
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <MetadataGenerator 
        baseTitle="Instalaciones"
        description="Nuestras instalaciones deportivas disponibles para reserva" 
      />
      
      <Navbar />
      <div className="bg-primary-background py-8 px-4">
        <div className="container mx-auto max-w-7xl">
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
          
          <div className="flex justify-center">
            <div className="w-full">
              <div className="mb-6">
                <div className="relative w-full max-w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Buscar instalaciones..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              
              <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={handleTabChange}
              >
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 rounded-md bg-muted p-1 h-auto">
                  <TabsTrigger value="todos" className="rounded-sm text-xs sm:text-sm px-2 py-2 min-h-[44px]">Todos</TabsTrigger>
                  <TabsTrigger value="canchas" className="rounded-sm text-xs sm:text-sm px-2 py-2 min-h-[44px]">Canchas</TabsTrigger>
                  <TabsTrigger value="gimnasios" className="rounded-sm text-xs sm:text-sm px-2 py-2 min-h-[44px]">Gimnasios</TabsTrigger>
                  <TabsTrigger value="piscinas" className="rounded-sm text-xs sm:text-sm px-2 py-2 min-h-[44px]">Piscinas</TabsTrigger>
                  <TabsTrigger value="otros" className="rounded-sm text-xs sm:text-sm px-2 py-2 min-h-[44px] col-span-2 sm:col-span-1">Otros</TabsTrigger>
                </TabsList>
                
                {/* Use a single TabsContent and render based on activeTab */}
                <TabsContent value={activeTab} className="mt-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {facilities.map((facility) => (
                        <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full border border-gray-100">
                          <img
                            src={facility.imagenUrl || "/placeholder.svg?height=200&width=300"}
                            alt={facility.nombre}
                            className="w-full h-52 object-cover transition-transform duration-300"
                          />
                          <CardContent className="p-5 flex flex-col flex-grow">
                            <div className="flex-grow">
                              <h3 className="font-bold text-xl mb-3 text-primary-dark">{facility.nombre}</h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">{facility.descripcion}</p>
                              <p className="text-gray-700 mb-2 flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{facility.ubicacion}</span>
                              </p>
                              <p className="text-gray-700 mb-4 font-medium">
                                <span className="text-primary-dark">{formatPrice(facility.precio)}</span> / hora
                              </p>
                            </div>
                            <div className="mt-auto pt-4">
                              <Button 
                                asChild={configSistema.reservasEstanHabilitadas()} 
                                disabled={!configSistema.reservasEstanHabilitadas()} 
                                className="w-full bg-primary hover:bg-primary-light hover:scale-105 transition-all font-medium"
                                size="lg"
                              >
                                {configSistema.reservasEstanHabilitadas() ? (
                                  <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
                                ) : (
                                  "Reservas deshabilitadas"
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-100">
                      <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No se encontraron instalaciones con los criterios especificados.</p>
                      <p className="text-gray-400 mt-1">Intenta con otros términos de búsqueda o selecciona otra categoría.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Notificación de mantenimiento */}
              {configSistema.estaCargando ? null : configSistema.tieneError ? null : configSistema.modoMantenimiento && (
                <div className="mt-6">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
