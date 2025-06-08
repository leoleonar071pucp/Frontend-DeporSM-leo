"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Loader2, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useConfiguracion } from "@/context/ConfiguracionContext"
import { ValidationError } from "@/components/validation-error"

// Interfaces para los estados
interface GeneralConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  enableRegistration: boolean;
  enableReservations: boolean;
  maxReservationsPerUser: string;
  reservationTimeLimit: string;
}

export default function ConfiguracionSistemaPage() {
  const { toast } = useToast()
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSuccessGeneral, setIsSuccessGeneral] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para la configuración general
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig>({
    siteName: "DeporSM - Sistema de Reservas Deportivas",
    siteDescription: "Sistema de reserva de canchas y servicios deportivos para la Municipalidad de San Miguel.",
    contactEmail: "deportes@munisanmiguel.gob.pe",
    contactPhone: "987-654-321",
    maintenanceMode: false,
    enableRegistration: true,
    enableReservations: true,
    maxReservationsPerUser: "3",
    reservationTimeLimit: "48",  })

  // Usar el contexto de configuración
  const { config: sistemaConfig, recargarConfig, actualizarConfig } = useConfiguracion();

  // Cargar configuración al inicio
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!sistemaConfig.isLoading) {
      setGeneralConfig({
        siteName: sistemaConfig.nombreSitio,
        siteDescription: sistemaConfig.descripcionSitio,
        contactEmail: sistemaConfig.emailContacto,
        contactPhone: sistemaConfig.telefonoContacto,
        maintenanceMode: sistemaConfig.modoMantenimiento,
        enableRegistration: sistemaConfig.registroHabilitado,
        enableReservations: sistemaConfig.reservasHabilitadas,
        maxReservationsPerUser: sistemaConfig.maxReservasPorUsuario.toString(),
        reservationTimeLimit: sistemaConfig.limiteTiempoCancelacion.toString(),
      });
      setIsLoading(false);
    }

    if (sistemaConfig.error) {
      setError(sistemaConfig.error);
      toast({
        title: "Error al cargar la configuración",
        description: sistemaConfig.error,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [sistemaConfig, toast]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneralSwitchChange = (name: string, checked: boolean) => {
    setGeneralConfig((prev) => ({ ...prev, [name]: checked }))
  }


  const handleSaveGeneralConfig = async () => {
    setIsSavingGeneral(true)
    setError(null);
    
    // Validar campos
    if (!generalConfig.siteName || generalConfig.siteName.trim() === "") {
      setError("El nombre del sitio no puede estar vacío");
      setIsSavingGeneral(false);
      toast({
        title: "Error de validación",
        description: "El nombre del sitio no puede estar vacío",
        variant: "destructive"
      });
      return;
    }
    
    if (!generalConfig.contactEmail || !generalConfig.contactEmail.includes('@')) {
      setError("Ingrese una dirección de email válida");
      setIsSavingGeneral(false);
      toast({
        title: "Error de validación",
        description: "Ingrese una dirección de email válida",
        variant: "destructive"
      });
      return;
    }
    
    const maxReservas = parseInt(generalConfig.maxReservationsPerUser);
    if (isNaN(maxReservas) || maxReservas < 1) {
      setError("El número máximo de reservas debe ser un número positivo");
      setIsSavingGeneral(false);
      toast({
        title: "Error de validación",
        description: "El número máximo de reservas debe ser un número positivo",
        variant: "destructive"
      });
      return;
    }
    
    const tiempoLimite = parseInt(generalConfig.reservationTimeLimit);
    if (isNaN(tiempoLimite) || tiempoLimite < 1) {
      setError("El tiempo límite de cancelación debe ser un número positivo");
      setIsSavingGeneral(false);
      toast({
        title: "Error de validación",
        description: "El tiempo límite de cancelación debe ser un número positivo",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convertir de la interfaz del Frontend a la del Backend
      const backendConfig = {
        nombreSitio: generalConfig.siteName.trim(),
        descripcionSitio: generalConfig.siteDescription.trim(),
        emailContacto: generalConfig.contactEmail.trim(),
        telefonoContacto: generalConfig.contactPhone.trim(),
        modoMantenimiento: generalConfig.maintenanceMode,
        registroHabilitado: generalConfig.enableRegistration,
        reservasHabilitadas: generalConfig.enableReservations,
        maxReservasPorUsuario: maxReservas,
        limiteTiempoCancelacion: tiempoLimite,
      };      // Guardar en el backend a través del contexto
      await actualizarConfig(backendConfig);
      
      // Forzar recarga de la configuración del sistema
      await recargarConfig();
      
      // Mostrar éxito
      setIsSuccessGeneral(true);
      toast({
        title: "Configuración general guardada",
        description: "Los cambios en la configuración general han sido guardados exitosamente.",
      });

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccessGeneral(false);
      }, 3000);
    } catch (err) {
      console.error('Error al guardar la configuración:', err);
      toast({
        title: "Error al guardar la configuración",
        description: "No se pudo guardar la configuración. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingGeneral(false);
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando configuración del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Gestiona la configuración general del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Configura los parámetros generales del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ValidationError message={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nombre del Sitio</Label>
              <Input id="siteName" name="siteName" value={generalConfig.siteName} onChange={handleGeneralChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={generalConfig.contactEmail}
                onChange={handleGeneralChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descripción del Sitio</Label>
            <Textarea
              id="siteDescription"
              name="siteDescription"
              value={generalConfig.siteDescription}
              onChange={handleGeneralChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={generalConfig.contactPhone}
                onChange={handleGeneralChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxReservationsPerUser">Máximo de Reservas por Usuario</Label>
              <Input
                id="maxReservationsPerUser"
                name="maxReservationsPerUser"
                type="number"
                min="1"
                max="10"
                value={generalConfig.maxReservationsPerUser}
                onChange={handleGeneralChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reservationTimeLimit">Límite de Tiempo para Cancelar Reservas (horas)</Label>
              <Input
                id="reservationTimeLimit"
                name="reservationTimeLimit"
                type="number"
                min="1"
                max="72"
                value={generalConfig.reservationTimeLimit}
                onChange={handleGeneralChange}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode" className="font-medium">
                  Modo Mantenimiento
                </Label>
                <p className="text-sm text-gray-500">
                  Activa el modo mantenimiento para mostrar una página de mantenimiento a los usuarios
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={generalConfig.maintenanceMode}
                onCheckedChange={(checked) => handleGeneralSwitchChange("maintenanceMode", checked)}
              />
            </div>
            {/* Opción comentada: Habilitar Registro de Usuarios
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableRegistration" className="font-medium">
                  Habilitar Registro de Usuarios
                </Label>
                <p className="text-sm text-gray-500">
                  Permite que los usuarios puedan registrarse en el sistema
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Al desactivar esta opción, solo los administradores podrán crear nuevas cuentas
                </p>
              </div>
              <Switch
                id="enableRegistration"
                checked={generalConfig.enableRegistration}
                onCheckedChange={(checked) => handleGeneralSwitchChange("enableRegistration", checked)}
              />
            </div>
            */}

            {/* Opción comentada: Habilitar Reservas
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableReservations" className="font-medium">
                  Habilitar Reservas
                </Label>
                <p className="text-sm text-gray-500">
                  Permite que los usuarios puedan realizar reservas en el sistema
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Desactivar suspenderá temporalmente todas las reservas nuevas sin afectar las existentes
                </p>
              </div>
              <Switch
                id="enableReservations"
                checked={generalConfig.enableReservations}
                onCheckedChange={(checked) => handleGeneralSwitchChange("enableReservations", checked)}
              />
            </div>
            */}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isSuccessGeneral && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Guardado correctamente</span>
            </div>
          )}
          <Button className="bg-gray-900 hover:bg-gray-800 ml-auto" onClick={handleSaveGeneralConfig} disabled={isSavingGeneral}>
            {isSavingGeneral ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

