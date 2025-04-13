"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Save, Upload, RefreshCw, Layout, Home } from "lucide-react"

export default function SitioWebPage() {
  const [homeSettings, setHomeSettings] = useState({
    heroTitle: "Bienvenido a DeporSM",
    heroSubtitle: "Reserva instalaciones deportivas de manera fácil y rápida",
    featuredInstallations: ["1", "3", "5"],
  })

  // Datos de ejemplo para las instalaciones destacadas
  const installationsData = [
    { id: "1", name: "Cancha de Fútbol Principal", type: "Fútbol" },
    { id: "2", name: "Piscina Olímpica", type: "Natación" },
    { id: "3", name: "Cancha de Tenis", type: "Tenis" },
    { id: "4", name: "Gimnasio Municipal", type: "Gimnasio" },
    { id: "5", name: "Cancha de Básquet", type: "Básquet" },
  ]

  const handleHomeSettingsChange = (e) => {
    const { name, value } = e.target
    setHomeSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleFeaturedInstallationsChange = (id, isChecked) => {
    setHomeSettings((prev) => ({
      ...prev,
      featuredInstallations: isChecked
        ? [...prev.featuredInstallations, id]
        : prev.featuredInstallations.filter((installationId) => installationId !== id),
    }))
  }

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log("Guardando configuración de inicio:", homeSettings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión del Sitio Web</h1>
        <p className="text-muted-foreground">Administra la configuración y contenido del sitio web público</p>
      </div>

      <Tabs defaultValue="home" className="space-y-4">
        <TabsList className="bg-[#bceeff]">
          <TabsTrigger value="home" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            <Home className="h-4 w-4 mr-2" />
            Página de Inicio
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#0cb7f2] data-[state=active]:text-white">
            <Layout className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Página de Inicio</CardTitle>
              <CardDescription>Personaliza la página principal del sitio web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título Principal</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    value={homeSettings.heroTitle}
                    onChange={handleHomeSettingsChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Input
                    id="heroSubtitle"
                    name="heroSubtitle"
                    value={homeSettings.heroSubtitle}
                    onChange={handleHomeSettingsChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImage">Imagen Principal</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-32 w-64 bg-gray-100 rounded-md flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Cambiar Imagen
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredInstallations">Instalaciones Destacadas</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {installationsData.map((installation) => (
                      <div key={installation.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`installation-${installation.id}`}
                          checked={homeSettings.featuredInstallations.includes(installation.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setHomeSettings((prev) => ({
                              ...prev,
                              featuredInstallations: isChecked
                                ? [...prev.featuredInstallations, installation.id]
                                : prev.featuredInstallations.filter((id) => id !== installation.id),
                            }))
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0cb7f2] focus:ring-[#0cb7f2]"
                        />
                        <Label htmlFor={`installation-${installation.id}`} className="text-sm font-normal">
                          {installation.name} ({installation.type})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]" onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia del Sitio</CardTitle>
              <CardDescription>Personaliza la apariencia del sitio web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo del Sitio</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-40 bg-gray-100 rounded-md flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Logo
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Favicon
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Principal</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-md bg-[#0cb7f2]"></div>
                      <Input id="primaryColor" defaultValue="#0cb7f2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-md bg-[#53d4ff]"></div>
                      <Input id="secondaryColor" defaultValue="#53d4ff" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de Acento</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-md bg-[#8fe3ff]"></div>
                      <Input id="accentColor" defaultValue="#8fe3ff" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Previsualizar
                </Button>
                <Button className="bg-[#0cb7f2] hover:bg-[#53d4ff] ml-2">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

