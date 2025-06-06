"use client"

import React from "react"
import { Navbar } from "@/components/navbar"
import { EstadoSistema } from "@/components/estado-sistema"
import { PoliticasReserva } from "@/components/politicas-reserva"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoCircle, HelpCircle, Calendar, BookOpen } from "lucide-react"
import { useConfiguracionSistema } from "@/hooks/use-configuracion-sistema"
import { MetadataGenerator } from "@/components/metadata-generator"

export default function InfoSistemaPage() {
  const configSistema = useConfiguracionSistema()
  
  return (
    <main className="min-h-screen bg-background">
      <MetadataGenerator 
        baseTitle="Información del Sistema" 
        description="Consulta el estado actual del sistema de reservas"
      />
      
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Información del Sistema</h1>
          <p className="text-gray-600">
            Consulta el estado actual del sistema y políticas de reserva
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="estado" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3">
                <TabsTrigger value="estado" className="flex items-center">
                  <InfoCircle className="h-4 w-4 mr-2" />
                  <span>Estado</span>
                </TabsTrigger>
                <TabsTrigger value="politicas" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Políticas</span>
                </TabsTrigger>
                <TabsTrigger value="ayuda" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Ayuda</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="estado">
                <EstadoSistema />
              </TabsContent>
              
              <TabsContent value="politicas">
                <PoliticasReserva />
                
                <div className="mt-6 bg-white p-6 rounded-lg border">
                  <h2 className="font-semibold text-lg mb-3">Política de Uso</h2>
                  <div className="prose text-sm text-gray-700">
                    <p>
                      El sistema de reservas deportivas {configSistema.getNombreSitio()} 
                      está diseñado para facilitar la reserva de instalaciones deportivas 
                      a los vecinos registrados. Para utilizar el sistema correctamente, 
                      tenga en cuenta las siguientes políticas:
                    </p>
                    <ul className="space-y-2 mt-3">
                      <li><strong>Identificación:</strong> Es obligatorio presentar su DNI al momento de usar la instalación.</li>
                      <li><strong>Puntualidad:</strong> Debe llegar 15 minutos antes de su reserva para el check-in.</li>
                      <li><strong>Acompañantes:</strong> El usuario que realiza la reserva debe estar presente durante el uso de la instalación.</li>
                      <li><strong>Equipamiento:</strong> Los usuarios deben traer su propio equipamiento deportivo, salvo cuando se indique lo contrario.</li>
                      <li><strong>Vestimenta:</strong> Es obligatorio usar ropa deportiva adecuada para cada instalación.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ayuda">
                <div className="bg-white p-6 rounded-lg border">
                  <h2 className="font-semibold text-lg mb-3">Preguntas Frecuentes</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-primary">¿Cómo puedo hacer una reserva?</h3>
                      <p className="mt-1 text-gray-700">
                        Para realizar una reserva, debe iniciar sesión en el sistema, 
                        seleccionar la instalación deseada, elegir fecha y hora disponible, 
                        y confirmar su reserva.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-primary">¿Cuántas reservas puedo tener activas?</h3>
                      <p className="mt-1 text-gray-700">
                        Cada usuario puede tener un máximo de {configSistema.getMaxReservasPorUsuario()} reservas activas simultáneamente.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-primary">¿Puedo cancelar mi reserva?</h3>
                      <p className="mt-1 text-gray-700">
                        Sí, puede cancelar su reserva hasta {configSistema.getLimiteCancelacionHoras()} horas antes 
                        del inicio programado. Pasado este tiempo, no será posible realizar la cancelación.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-primary">¿Cómo puedo recuperar mi contraseña?</h3>
                      <p className="mt-1 text-gray-700">
                        Para recuperar su contraseña, haga clic en "¿Olvidaste tu contraseña?" en la 
                        página de inicio de sesión y siga las instrucciones enviadas a su correo electrónico.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-primary">¿Cómo puedo reportar un problema con la instalación?</h3>
                      <p className="mt-1 text-gray-700">
                        Si encuentra algún problema con una instalación, puede reportarlo 
                        a través de la sección de contacto o directamente llamando al 
                        teléfono {configSistema.getTelefonoContacto()}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">¿Necesita más ayuda?</h3>
                    <p className="text-blue-700 text-sm">
                      Si tiene alguna consulta adicional, puede contactarnos a través de:
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-blue-700">
                        <span className="font-medium">Email:</span> {configSistema.getEmailContacto()}
                      </p>
                      <p className="text-blue-700">
                        <span className="font-medium">Teléfono:</span> {configSistema.getTelefonoContacto()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium mb-4">Horarios de Atención</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Lunes a Viernes:</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sábados:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Domingos y Feriados:</span>
                  <span className="font-medium">9:00 AM - 1:00 PM</span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Los horarios pueden variar según la disponibilidad de las instalaciones y días festivos.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium mb-4">Información de Contacto</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Email:</div>
                  <div className="text-gray-700">{configSistema.getEmailContacto()}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Teléfono:</div>
                  <div className="text-gray-700">{configSistema.getTelefonoContacto()}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Dirección:</div>
                  <div className="text-gray-700">
                    Av. La Marina 2000, San Miguel<br />
                    Lima, Perú
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
