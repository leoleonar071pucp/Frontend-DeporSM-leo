"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"
import { useAuth } from "@/context/AuthContext"

// Interfaz para las instalaciones
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

export default function Home() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Cargar instalaciones destacadas desde el backend
  useEffect(() => {
    const fetchFeaturedFacilities = async () => {
      try {
        // Obtener directamente las instalaciones más populares
        const response = await fetch(`${API_BASE_URL}/instalaciones/populares`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Error al cargar instalaciones populares: ${response.status}`);
        }

        const data = await response.json();
        console.log("Instalaciones populares obtenidas:", data.map((f: any) => f.nombre));

        // Tomar las 4 instalaciones más populares para mostrar en la página de inicio
        const topFacilities = data.slice(0, 4);
        console.log("Top 4 instalaciones:", topFacilities.map((f: any) => f.nombre));
        setFacilities(topFacilities);
        setIsLoading(false);
      } catch (error) {
        console.error("Error cargando instalaciones:", error);
        setError("No se pudieron cargar las instalaciones. Por favor, inténtalo de nuevo más tarde.");
        setIsLoading(false);
      }
    };

    fetchFeaturedFacilities();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-primary-background py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {isAuthenticated && user ? (
                <>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    ¡Bienvenido, {user.nombre.split(' ')[0]}!
                  </h1>
                  <p className="text-lg text-gray-700 mb-6">
                    Continúa explorando y reservando tus instalaciones deportivas favoritas en San Miguel.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Reserva tus instalaciones deportivas en San Miguel
                  </h1>
                  <p className="text-lg text-gray-700 mb-6">
                    Accede a todas las instalaciones deportivas del distrito de manera fácil y rápida. Reserva canchas,
                    piscina, gimnasio y más.
                  </p>
                </>
              )}
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary-light">
                  <Link href="/instalaciones">Ver Instalaciones</Link>
                </Button>
                {/* Botón Registrarme eliminado, ya está en la Navbar */}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              {/* Imagen destacada fija del estadio futurista */}
              <img
                src="/images/Instalacion_Principal_Inicio.png"
                alt="Estadio deportivo futurista"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Instalaciones Destacadas</h2>
          <p className="text-center text-gray-600 mb-8">Las instalaciones más populares entre nuestros usuarios</p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={facility.imagenUrl || "/placeholder.svg?height=200&width=300"}
                    alt={facility.nombre}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{facility.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-4">{facility.descripcion}</p>
                    <Button asChild className="w-full bg-primary hover:bg-primary-light">
                      <Link href={`/instalaciones/${facility.id}`}>Reservar</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron instalaciones disponibles.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/instalaciones">Ver Todas las Instalaciones</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary-pale py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Regístrate</h3>
              <p className="text-gray-600">Crea tu cuenta como vecino de San Miguel con tus datos personales.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Elige instalación</h3>
              <p className="text-gray-600">Selecciona la instalación deportiva que deseas utilizar.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Reserva</h3>
              <p className="text-gray-600">Elige fecha y hora disponible y completa tu reserva.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">4. Disfruta</h3>
              <p className="text-gray-600">Acude a la instalación en la fecha y hora reservada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer eliminado, se moverá al layout principal */}
    </main>
  )
}

