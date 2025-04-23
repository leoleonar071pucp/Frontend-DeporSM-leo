"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionSistemaPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Estado para la configuración general
  const [generalConfig, setGeneralConfig] = useState({
    siteName: "DeporSM - Sistema de Reservas Deportivas",
    siteDescription: "Sistema de reserva de canchas y servicios deportivos para la Municipalidad de San Miguel.",
    contactEmail: "deportes@munisanmiguel.gob.pe",
    contactPhone: "987-654-321",
    maintenanceMode: false,
    enableRegistration: true,
    enableReservations: true,
    maxReservationsPerUser: "3",
    reservationTimeLimit: "48",
  })

  // Estado para la configuración de correo
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: "smtp.munisanmiguel.gob.pe",
    smtpPort: "587",
    smtpUsername: "notificaciones@munisanmiguel.gob.pe",
    smtpPassword: "••••••••••••",
    senderName: "DeporSM - Municipalidad de San Miguel",
    senderEmail: "notificaciones@munisanmiguel.gob.pe",
    enableEmailNotifications: true,
  })

  // Estado para la configuración de pagos
  const [paymentConfig, setPaymentConfig] = useState({
    enableOnlinePayments: true,
    enableBankTransfer: true,
    paymentTimeLimit: "24",
    bankName: "Banco de la Nación",
    bankAccount: "123-456-789",
    bankAccountHolder: "Municipalidad de San Miguel",
    visaEnabled: true,
    mastercardEnabled: true,
  })

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneralSwitchChange = (name, checked) => {
    setGeneralConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const handleEmailChange = (e) => {
    const { name, value } = e.target
    setEmailConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailSwitchChange = (name, checked) => {
    setEmailConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSwitchChange = (name, checked) => {
    setPaymentConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveConfig = () => {
    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados exitosamente.",
      })

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Gestiona la configuración general del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuccess && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Guardado correctamente</span>
            </div>
          )}
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? (
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
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Correo Electrónico</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configura los parámetros generales del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRegistration" className="font-medium">
                      Habilitar Registro de Usuarios
                    </Label>
                    <p className="text-sm text-gray-500">Permite que los usuarios puedan registrarse en el sistema</p>
                  </div>
                  <Switch
                    id="enableRegistration"
                    checked={generalConfig.enableRegistration}
                    onCheckedChange={(checked) => handleGeneralSwitchChange("enableRegistration", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableReservations" className="font-medium">
                      Habilitar Reservas
                    </Label>
                    <p className="text-sm text-gray-500">
                      Permite que los usuarios puedan realizar reservas en el sistema
                    </p>
                  </div>
                  <Switch
                    id="enableReservations"
                    checked={generalConfig.enableReservations}
                    onCheckedChange={(checked) => handleGeneralSwitchChange("enableReservations", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Correo Electrónico</CardTitle>
              <CardDescription>Configura los parámetros para el envío de correos electrónicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Servidor SMTP</Label>
                  <Input
                    id="smtpServer"
                    name="smtpServer"
                    value={emailConfig.smtpServer}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input id="smtpPort" name="smtpPort" value={emailConfig.smtpPort} onChange={handleEmailChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Usuario SMTP</Label>
                  <Input
                    id="smtpUsername"
                    name="smtpUsername"
                    value={emailConfig.smtpUsername}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                  <Input
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nombre del Remitente</Label>
                  <Input
                    id="senderName"
                    name="senderName"
                    value={emailConfig.senderName}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Email del Remitente</Label>
                  <Input
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableEmailNotifications" className="font-medium">
                    Habilitar Notificaciones por Email
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite el envío de notificaciones por correo electrónico a los usuarios
                  </p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={emailConfig.enableEmailNotifications}
                  onCheckedChange={(checked) => handleEmailSwitchChange("enableEmailNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
              <CardDescription>Configura los parámetros para el procesamiento de pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTimeLimit">Límite de Tiempo para Pagos (horas)</Label>
                  <Input
                    id="paymentTimeLimit"
                    name="paymentTimeLimit"
                    type="number"
                    min="1"
                    max="72"
                    value={paymentConfig.paymentTimeLimit}
                    onChange={handlePaymentChange}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableOnlinePayments" className="font-medium">
                      Habilitar Pagos en Línea
                    </Label>
                    <p className="text-sm text-gray-500">
                      Permite que los usuarios puedan realizar pagos en línea con tarjeta
                    </p>
                  </div>
                  <Switch
                    id="enableOnlinePayments"
                    checked={paymentConfig.enableOnlinePayments}
                    onCheckedChange={(checked) => handlePaymentSwitchChange("enableOnlinePayments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableBankTransfer" className="font-medium">
                      Habilitar Transferencia Bancaria
                    </Label>
                    <p className="text-sm text-gray-500">
                      Permite que los usuarios puedan realizar pagos mediante transferencia bancaria
                    </p>
                  </div>
                  <Switch
                    id="enableBankTransfer"
                    checked={paymentConfig.enableBankTransfer}
                    onCheckedChange={(checked) => handlePaymentSwitchChange("enableBankTransfer", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información Bancaria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nombre del Banco</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={paymentConfig.bankName}
                      onChange={handlePaymentChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Número de Cuenta</Label>
                    <Input
                      id="bankAccount"
                      name="bankAccount"
                      value={paymentConfig.bankAccount}
                      onChange={handlePaymentChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountHolder">Titular de la Cuenta</Label>
                    <Input
                      id="bankAccountHolder"
                      name="bankAccountHolder"
                      value={paymentConfig.bankAccountHolder}
                      onChange={handlePaymentChange}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Métodos de Pago</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="visaEnabled" className="font-medium">
                      Visa
                    </Label>
                    <p className="text-sm text-gray-500">Habilitar pagos con tarjetas Visa</p>
                  </div>
                  <Switch
                    id="visaEnabled"
                    checked={paymentConfig.visaEnabled}
                    onCheckedChange={(checked) => handlePaymentSwitchChange("visaEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mastercardEnabled" className="font-medium">
                      Mastercard
                    </Label>
                    <p className="text-sm text-gray-500">Habilitar pagos con tarjetas Mastercard</p>
                  </div>
                  <Switch
                    id="mastercardEnabled"
                    checked={paymentConfig.mastercardEnabled}
                    onCheckedChange={(checked) => handlePaymentSwitchChange("mastercardEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

