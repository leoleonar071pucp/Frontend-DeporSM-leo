"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Search } from "lucide-react"

// Datos de ejemplo para las instalaciones
const allFacilities = [
  {
    id: 1,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=200&width=300",
    description: "Piscina semiolímpica con carriles para natación y área recreativa",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
    price: "S/. 15.00 por hora",
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    image: "/placeholder.svg?height=200&width=300",
    description: "Cancha de fútbol con grass sintético de última generación",
    type: "cancha-futbol-grass",
    location: "Parque Juan Pablo II",
    price: "S/. 120.00 por hora",
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    image: "/placeholder.svg?height=200&width=300",
    description: "Gimnasio equipado con máquinas modernas y área de pesas",
    type: "gimnasio",
    location: "Complejo Deportivo Municipal",
    price: "S/. 20.00 por día",
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    image: "/placeholder.svg?height=200&width=300",
    description: "Cancha multifuncional de loza para fútbol y otros deportes",
    type: "cancha-futbol-loza",
    location: "Parque Simón Bolívar",
    price: "S/. 80.00 por hora",
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    image: "/placeholder.svg?height=200&width=300",
    description: "Pista de atletismo profesional con 6 carriles",
    type: "pista-atletismo",
    location: "Complejo Deportivo Municipal",
    price: "S/. 10.00 por hora",
  },
  {
    id: 6,
    name: "Piscina Recreativa",
    image: "/placeholder.svg?height=200&width=300",
    description: "Piscina recreativa para niños y familias",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
    price: "S/. 12.00 por hora",
  },
]

export default function Instalaciones() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [facilities, setFacilities] = useState(allFacilities)

  // Función para filtrar instalaciones según la búsqueda y la pestaña activa
  const filterFacilities = () => {
    let filtered = allFacilities

    // Filtrar por búsqueda si hay una consulta
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (facility) =>
          facility.name.toLowerCase().includes(query) ||
          facility.description.toLowerCase().includes(query) ||
          facility.location.toLowerCase().includes(query),
      )
    }

    // Filtrar por tipo si no es la pestaña "todos"
    if (activeTab !== "todos") {
      filtered = filtered.filter((facility) => facility.type.includes(activeTab))
    }

    setFacilities(filtered)
  }

  // Actualizar los resultados cuando cambia la pestaña
  useEffect(() => {
    filterFacilities()
  }, [activeTab])

  // Manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterFacilities()
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
              <TabsTrigger value="cancha-futbol">Canchas</TabsTrigger>
              <TabsTrigger value="gimnasio">Gimnasio</TabsTrigger>
              <TabsTrigger value="pista-atletismo">Pista Atletismo</TabsTrigger>
              <TabsTrigger value="otros">Otros</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-0">
              {facilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilities.map((facility) => (
                    <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={facility.image || "/placeholder.svg"}
                        alt={facility.name}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{facility.description}</p>
                        <p className="text-gray-700 text-sm mb-1">
                          <strong>Ubicación:</strong> {facility.location}
                        </p>
                        <p className="text-gray-700 text-sm mb-4">
                          <strong>Precio:</strong> {facility.price}
                        </p>
                        <Button asChild className="w-full bg-primary hover:bg-primary-light">
                          <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No se encontraron instalaciones que coincidan con tu búsqueda.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setFacilities(allFacilities)
                    }}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </TabsContent>

            {["piscina", "cancha-futbol", "gimnasio", "pista-atletismo", "otros"].map((type) => (
              <TabsContent key={type} value={type} className="mt-0">
                {facilities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility) => (
                      <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={facility.image || "/placeholder.svg"}
                          alt={facility.name}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{facility.description}</p>
                          <p className="text-gray-700 text-sm mb-1">
                            <strong>Ubicación:</strong> {facility.location}
                          </p>
                          <p className="text-gray-700 text-sm mb-4">
                            <strong>Precio:</strong> {facility.price}
                          </p>
                          <Button asChild className="w-full bg-primary hover:bg-primary-light">
                            <Link href={`/instalaciones/${facility.id}`}>Ver Disponibilidad</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No se encontraron instalaciones que coincidan con tu búsqueda.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setFacilities(allFacilities.filter((f) => f.type.includes(type)))
                      }}
                    >
                      Limpiar búsqueda
                    </Button>
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

