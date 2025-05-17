"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Save } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

// Definir la interface para el estado de configuración de seguridad
interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordExpiration: boolean;
  passwordExpirationDays: string;
  minPasswordLength: string;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  maxLoginAttempts: string;
  lockoutDuration: string;
  sessionTimeout: string;
  ipRestriction: boolean;
  allowedIPs: string;
}

export default function SeguridadPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    passwordExpiration: true,
    passwordExpirationDays: "90",
    minPasswordLength: "8",
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    sessionTimeout: "60",
    ipRestriction: false,
    allowedIPs: "",
  })

  const handleSwitchChange = (setting: string, checked: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: checked }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      setIsSuccess(true)

      toast({
        title: "Configuración de seguridad guardada",
        description: "Los cambios en la configuración de seguridad han sido guardados exitosamente.",
      })

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seguridad del Sistema</h1>
        <p className="text-muted-foreground">Configura los parámetros de seguridad del sistema</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="password">Contraseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad General</CardTitle>
              <CardDescription>Configura los parámetros generales de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSwitchChange("twoFactorAuth", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipRestriction">Restricción de IP</Label>
                    <p className="text-sm text-muted-foreground">Limita el acceso a direcciones IP específicas</p>
                  </div>
                  <Switch
                    id="ipRestriction"
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => handleSwitchChange("ipRestriction", checked)}
                  />
                </div>

                {securitySettings.ipRestriction && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="allowedIPs">IPs permitidas</Label>
                    <Input
                      id="allowedIPs"
                      name="allowedIPs"
                      placeholder="192.168.1.1, 192.168.1.2"
                      value={securitySettings.allowedIPs}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">Ingresa las direcciones IP separadas por comas</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Intentos máximos de inicio de sesión</Label>
                  <Select
                    value={securitySettings.maxLoginAttempts}
                    onValueChange={(value) => handleSelectChange("maxLoginAttempts", value)}
                  >
                    <SelectTrigger id="maxLoginAttempts">
                      <SelectValue placeholder="Selecciona el número de intentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 intentos</SelectItem>
                      <SelectItem value="5">5 intentos</SelectItem>
                      <SelectItem value="10">10 intentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Número de intentos fallidos antes de bloquear la cuenta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Duración del bloqueo (minutos)</Label>
                  <Select
                    value={securitySettings.lockoutDuration}
                    onValueChange={(value) => handleSelectChange("lockoutDuration", value)}
                  >
                    <SelectTrigger id="lockoutDuration">
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tiempo que permanecerá bloqueada la cuenta después de múltiples intentos fallidos
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Guardado correctamente</span>
                </div>
              )}
              <Button className="bg-gray-900 hover:bg-gray-800 ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
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

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Política de Contraseñas</CardTitle>
              <CardDescription>
                Configura los requisitos y políticas para las contraseñas de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordExpiration">Expiración de contraseñas</Label>
                    <p className="text-sm text-muted-foreground">
                      Requiere que los usuarios cambien su contraseña periódicamente
                    </p>
                  </div>
                  <Switch
                    id="passwordExpiration"
                    checked={securitySettings.passwordExpiration}
                    onCheckedChange={(checked) => handleSwitchChange("passwordExpiration", checked)}
                  />
                </div>

                {securitySettings.passwordExpiration && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="passwordExpirationDays">Días hasta la expiración</Label>
                    <Select
                      value={securitySettings.passwordExpirationDays}
                      onValueChange={(value) => handleSelectChange("passwordExpirationDays", value)}
                    >
                      <SelectTrigger id="passwordExpirationDays">
                        <SelectValue placeholder="Selecciona los días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                        <SelectItem value="180">180 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minPasswordLength">Longitud mínima de contraseña</Label>
                  <Select
                    value={securitySettings.minPasswordLength}
                    onValueChange={(value) => handleSelectChange("minPasswordLength", value)}
                  >
                    <SelectTrigger id="minPasswordLength">
                      <SelectValue placeholder="Selecciona la longitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 caracteres</SelectItem>
                      <SelectItem value="8">8 caracteres</SelectItem>
                      <SelectItem value="10">10 caracteres</SelectItem>
                      <SelectItem value="12">12 caracteres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Requisitos de complejidad</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireSpecialChars"
                        checked={securitySettings.requireSpecialChars}
                        onCheckedChange={(checked) => handleSwitchChange("requireSpecialChars", checked)}
                      />
                      <Label htmlFor="requireSpecialChars" className="font-normal">
                        Requerir caracteres especiales
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireNumbers"
                        checked={securitySettings.requireNumbers}
                        onCheckedChange={(checked) => handleSwitchChange("requireNumbers", checked)}
                      />
                      <Label htmlFor="requireNumbers" className="font-normal">
                        Requerir números
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireUppercase"
                        checked={securitySettings.requireUppercase}
                        onCheckedChange={(checked) => handleSwitchChange("requireUppercase", checked)}
                      />
                      <Label htmlFor="requireUppercase" className="font-normal">
                        Requerir mayúsculas
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Guardado correctamente</span>
                </div>
              )}
              <Button className="bg-gray-900 hover:bg-gray-800 ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
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

