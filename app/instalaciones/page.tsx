"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"

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

  // Cargar instalaciones desde el backend al montar el componente
  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("http://localhost:8080/api/instalaciones/disponibles")
        if (!response.ok) {
          throw new Error(`Error al cargar instalaciones: ${response.status}`)
        }
        const data = await response.json()
        setAllFacilities(data)
        setFacilities(data)
        console.log("Instalaciones cargadas:", data);
      } catch (err) {
        console.error("Error cargando instalaciones:", err)
        setError("No se pudieron cargar las instalaciones. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFacilities()
  }, [])
  // Función para filtrar instalaciones según la búsqueda y la pestaña activa
  const filterFacilities = () => {
    let filtered = [...allFacilities]
    
    console.log("Filtrando instalaciones. Total inicial:", filtered.length);
    console.log("Tab activa:", activeTab);
    console.log("Query de búsqueda:", searchQuery);

    // Filtrar por búsqueda si hay una consulta
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (facility) =>
          facility.nombre.toLowerCase().includes(query) ||
          facility.descripcion.toLowerCase().includes(query) ||
          facility.ubicacion.toLowerCase().includes(query)
      )
      console.log("Después de filtrar por búsqueda:", filtered.length);
    }    // Filtrar por tipo si no es la pestaña "todos"
    if (activeTab !== "todos") {
      // Mapeo entre los valores de las pestañas y los valores exactos de tipo en el backend
      // Ampliamos la lista para incluir más variaciones y asegurarnos de capturar todos los casos
      const tipoMappings: Record<string, string[]> = {
        "piscina": ["PISCINA", "piscina", "Piscina"],
        "cancha": [
          "CANCHA", "cancha", "Cancha", 
          "CANCHA_FUTBOL", "cancha_futbol", "Cancha Futbol", "Cancha de Futbol",
          "CANCHA_BASQUET", "cancha_basquet", "Cancha Basquet", "Cancha de Basquet",
          "CANCHA_VOLEY", "cancha_voley", "Cancha Voley", "Cancha de Voley",
          "CANCHA_TENIS", "cancha_tenis", "Cancha Tenis", "Cancha de Tenis"
        ],
        "gimnasio": ["GIMNASIO", "gimnasio", "Gimnasio"],
        "pista": ["PISTA", "pista", "Pista", "PISTA_ATLETISMO", "pista_atletismo", "Pista Atletismo", "Pista de Atletismo"],
        "otros": ["OTROS", "otros", "Otros"]
      };
      
      // Antes de filtrar, vamos a registrar qué tipos existen para facilitar la depuración
      const tiposUnicos = new Set(filtered.map(f => f.tipo));
      console.log("Tipos únicos encontrados:", [...tiposUnicos]);
      console.log("Filtrando por tipo:", activeTab);
      
      // Usamos una función más robusta para comparar tipos
      filtered = filtered.filter(facility => {
        if (!facility.tipo) return false;
        
        // Normalizar el tipo de la instalación (quitar espacios extras, pasar a minúsculas)
        const normalizedFacilityType = facility.tipo.trim().toLowerCase();
        
        // Verificar si el tipo normalizado coincide con alguno de los valores mapeados
        return tipoMappings[activeTab].some(tipo => {
          const normalizedTipo = tipo.trim().toLowerCase();
          return normalizedFacilityType === normalizedTipo || 
                 normalizedFacilityType.includes(normalizedTipo) ||
                 normalizedTipo.includes(normalizedFacilityType);
        });
      });
      
      console.log("Después de filtrar por tipo:", filtered.length);
      if (filtered.length > 0) {
        console.log("Primeras instalaciones filtradas:", 
          filtered.slice(0, Math.min(3, filtered.length))
            .map(f => `${f.nombre} (${f.tipo})`)
        );
      } else {
        console.log("No se encontraron instalaciones para este tipo");
      }
    }

    setFacilities(filtered)
  }
  // Actualizar los resultados cuando cambia la pestaña, la búsqueda o las instalaciones disponibles
  useEffect(() => {
    // Asegurarnos de que allFacilities tiene datos antes de filtrar
    if (allFacilities.length > 0) {
      console.log("Re-aplicando filtros debido a cambios en tab, búsqueda o datos");
      filterFacilities();
    }
  }, [activeTab, searchQuery, allFacilities]);
  // Manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La filtración ya ocurre automáticamente gracias al useEffect
    // Solo prevenimos el comportamiento del formulario
    console.log("Búsqueda manual activada con query:", searchQuery);
  }

  // Función para formatear el precio
  const formatPrice = (price: number, tipo: string) => {
    if (tipo.toLowerCase().includes('gimnasio')) {
      return `S/. ${price.toFixed(2)} por día`
    }
    return `S/. ${price.toFixed(2)} por hora`
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Instalaciones Deportivas</h1>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, descripción o ubicación..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary-light">
              Buscar
            </Button>
          </form>

          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="piscina">Piscinas</TabsTrigger>
              <TabsTrigger value="cancha">Canchas</TabsTrigger>
              <TabsTrigger value="gimnasio">Gimnasio</TabsTrigger>
              <TabsTrigger value="pista">Pista Atletismo</TabsTrigger>
              <TabsTrigger value="otros">Otros</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-0">
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
                          <strong>Precio:</strong> {formatPrice(facility.precio, facility.tipo)}
                        </p>
                        <Button asChild className="w-full bg-primary hover:bg-primary-light">
                          <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
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
            </TabsContent>            {/* Las demás pestañas muestran el mismo contenido filtrado */}
            {["piscina", "cancha", "gimnasio", "pista", "otros"].map(tab => (
              <TabsContent key={tab} value={tab} className="mt-0">
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
                            <strong>Precio:</strong> {formatPrice(facility.precio, facility.tipo)}
                          </p>
                          <Button asChild className="w-full bg-primary hover:bg-primary-light">
                            <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
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
            ))}
          </Tabs>
        </div>
      </div>
    </main>
  )
}
