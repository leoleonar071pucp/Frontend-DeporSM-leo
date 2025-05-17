import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export default function Home() {
  const facilities = [
    {
      id: 1,
      name: "Piscina Municipal",
      image: "/placeholder.svg?height=200&width=300",
      description: "Piscina semiolímpica con carriles para natación y área recreativa",
    },
    {
      id: 2,
      name: "Cancha de Fútbol (Grass)",
      image: "/placeholder.svg?height=200&width=300",
      description: "Cancha de fútbol con grass sintético de última generación",
    },
    {
      id: 3,
      name: "Gimnasio Municipal",
      image: "/placeholder.svg?height=200&width=300",
      description: "Gimnasio equipado con máquinas modernas y área de pesas",
    },
    {
      id: 4,
      name: "Cancha de Fútbol (Loza)",
      image: "/placeholder.svg?height=200&width=300",
      description: "Cancha multifuncional de loza para fútbol y otros deportes",
    },
  ]

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-primary-background py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Reserva tus instalaciones deportivas en San Miguel
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Accede a todas las instalaciones deportivas del distrito de manera fácil y rápida. Reserva canchas,
                piscina, gimnasio y más.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary-light">
                  <Link href="/instalaciones">Ver Instalaciones</Link>
                </Button>
                {/* Botón Registrarme eliminado, ya está en la Navbar */}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Instalaciones deportivas"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Nuestras Instalaciones Deportivas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={facility.image || "/placeholder.svg"}
                  alt={facility.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{facility.description}</p>
                  <Button asChild className="w-full bg-primary hover:bg-primary-light">
                    <Link href={`/instalaciones/${facility.id}`}>Reservar</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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

