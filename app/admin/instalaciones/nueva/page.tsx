"use client"

import React, { useState } from "react" // Importar React explícitamente
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

import { API_BASE_URL } from "@/lib/config" // Importar API_BASE_URL
import { uploadInstallationImage, validateFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/supabase-storage"




// --- Interfaz para los datos del formulario ---
interface FacilityFormData {
  name: string;
  type: string;
  location: string;
  description: string;
  capacity: string; // Mantener como string por el input, validar como número
  price: string;
  contactNumber: string;
  features: string; // Mantener como string, procesar al enviar si es necesario
  amenities: string; // Mantener como string
  rules: string; // Mantener como string
  // Nuevos campos para horarios disponibles
  availableTimeSlots: AvailableTimeSlot[];
}

// Estructura para representar un horario disponible
interface AvailableTimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// --- Tipos para errores ---
type FormErrors = Partial<Record<keyof FacilityFormData | 'image', string>>; // Incluir 'image'

export default function NuevaInstalacion() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formError, setFormError] = useState<string>("") // Tipar error general
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Estado del formulario tipado
  const [formData, setFormData] = useState<FacilityFormData>({
    name: "",
    type: "",
    location: "",
    description: "",
    capacity: "",
    price: "",
    contactNumber: "",
    features: "",
    amenities: "",
    rules: "",

    availableTimeSlots: [],
  })

  // Días de la semana
  const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]

  // Estado para el formulario de horario a añadir
  const [newTimeSlot, setNewTimeSlot] = useState<AvailableTimeSlot>({
    dayOfWeek: "LUNES",
    startTime: "08:00",
    endTime: "10:00"
  })

  // Estado para errores de validación tipado
  const [errors, setErrors] = useState<FormErrors>({})

  // Tipar evento
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FacilityFormData; value: string }; // Asegurar que name es una clave válida
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Tipar parámetros
  const handleSelectChange = (name: keyof FacilityFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Tipar evento
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validar archivo usando la función utilitaria
      const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          image: validation.error || "Archivo no válido",
        }))
        return
      }

      setImageFile(file)

      // Limpiar error si existe
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.image
          return newErrors
        })
      }
    }
  }

  const validateForm = (): boolean => { // Añadir tipo de retorno
    const newErrors: FormErrors = {}

    // Validar campos obligatorios
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.type) newErrors.type = "El tipo de instalación es obligatorio"
    if (!formData.location.trim()) newErrors.location = "La ubicación es obligatoria"
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria"
    if (!formData.capacity.trim()) {
        newErrors.capacity = "La capacidad es obligatoria"
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
        newErrors.capacity = "La capacidad debe ser un número positivo"
    }
    if (!formData.price.trim()) {
      newErrors.price = "El precio es obligatorio"
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número positivo"
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "El número de contacto es obligatorio"
    if (!imageFile) newErrors.image = "La imagen es obligatoria"

    // Validar que haya al menos un horario disponible
    if (formData.availableTimeSlots.length === 0) {
      newErrors.availableTimeSlots = "Debe definir al menos un horario disponible para la instalación"
    }

    setErrors(newErrors)

    // Si hay errores, mostrar mensaje general
    if (Object.keys(newErrors).length > 0) {
      setFormError("Por favor, complete todos los campos obligatorios marcados con *")
    } else {
      setFormError("")
    }

    return Object.keys(newErrors).length === 0
  }

  // Función de subida usando la utilidad centralizada
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    return await uploadInstallationImage(file);
  }


  // Tipar evento
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validar el formulario y mostrar errores específicos
    if (!validateForm()) {
      // El mensaje general ya se establece en validateForm()
      window.scrollTo({ top: 0, behavior: 'smooth' }) // Desplazar hacia arriba para ver los errores
      return
    }

    setIsSubmitting(true)
    setFormError("")

    try {
      let imagenUrl = null

      if (imageFile) {
        imagenUrl = await uploadImageToSupabase(imageFile)
        if (!imagenUrl) {
          setFormError("Error al subir la imagen. Por favor, intente nuevamente.")
          setIsSubmitting(false)
          return
        }
      }

      // Procesar características, comodidades y reglas (separadas por líneas)
      const caracteristicas = formData.features.trim() ?
          formData.features.split('\n').filter(line => line.trim()) : [];

      const comodidades = formData.amenities.trim() ?
          formData.amenities.split('\n').filter(line => line.trim()) : [];

      const reglas = formData.rules.trim() ?
          formData.rules.split('\n').filter(line => line.trim()) : [];

      // Formatear horarios disponibles para enviar al backend
      const horariosDisponibles = formData.availableTimeSlots.map(slot => ({
        diaSemana: slot.dayOfWeek,
        horaInicio: `${slot.startTime}:00`,  // Añadir segundos para formato de hora SQL
        horaFin: `${slot.endTime}:00`
      }))

      const response = await fetch(`${API_BASE_URL}/instalaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,
          descripcion: formData.description,
          ubicacion: formData.location,
          tipo: formData.type,
          capacidad: Number(formData.capacity),
          contactoNumero: formData.contactNumber,
          imagenUrl: imagenUrl,
          precio: parseFloat(formData.price),
          activo: true,
          caracteristicas: caracteristicas,
          comodidades: comodidades,
          reglas: reglas,
          horariosDisponibles: horariosDisponibles
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && typeof errorData === 'string' && errorData.includes("Error al crear instalación:")) {
          throw new Error(errorData);
        } else {
          throw new Error("Error al crear instalación. Verifique los datos e intente nuevamente.");
        }
      }

      setIsSuccess(true)
      setTimeout(() => router.push("/admin/instalaciones"), 2000)

    } catch (error: any) {
      console.error(error)
      setFormError(error.message || "Ocurrió un error al guardar la instalación.")
      window.scrollTo({ top: 0, behavior: 'smooth' }) // Desplazar hacia arriba para ver el error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para manejar cambios en el formulario de nuevo horario
  const handleTimeSlotChange = (field: keyof AvailableTimeSlot, value: string) => {
    setNewTimeSlot(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para añadir un nuevo horario disponible
  const addTimeSlot = () => {
    // Validar que la hora de inicio sea anterior a la de fin
    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      setFormError("La hora de inicio debe ser anterior a la hora de fin")
      return
    }

    // Validar que no haya solapamientos con otros horarios del mismo día
    const overlapping = formData.availableTimeSlots.some(slot =>
      slot.dayOfWeek === newTimeSlot.dayOfWeek &&
      ((slot.startTime <= newTimeSlot.startTime && slot.endTime > newTimeSlot.startTime) ||
       (slot.startTime < newTimeSlot.endTime && slot.endTime >= newTimeSlot.endTime) ||
       (slot.startTime >= newTimeSlot.startTime && slot.endTime <= newTimeSlot.endTime))
    )

    if (overlapping) {
      setFormError("Este horario se solapa con otro ya definido para el mismo día")
      return
    }

    setFormData(prev => ({
      ...prev,
      availableTimeSlots: [...prev.availableTimeSlots, {...newTimeSlot}]
    }))

    // Limpiar error si existe
    if (formError) setFormError("")
  }

  // Función para eliminar un horario disponible
  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/instalaciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Agregar Nueva Instalación</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información de la Instalación</CardTitle>
            <CardDescription>Ingresa los datos de la nueva instalación deportiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Piscina Municipal"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                {/* Asegurarse que el 'name' en handleSelectChange sea una key válida */}
                <Select value={formData.type} onValueChange={(value: string) => handleSelectChange("type", value)}>
                  <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piscina">Piscina</SelectItem>
                    <SelectItem value="Cancha de Fútbol (Grass)">Cancha de Fútbol (Grass)</SelectItem>
                    <SelectItem value="Cancha de Fútbol (Losa)">Cancha de Fútbol (Losa)</SelectItem>
                    <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                    <SelectItem value="Pista de Atletismo">Pista de Atletismo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Ubicación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ej: Complejo Deportivo Municipal"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  Número de contacto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  placeholder="Ej: 987-654-321"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={errors.contactNumber ? "border-red-500" : ""}
                />
                {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">
                  Capacidad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number" // Usar type number
                  placeholder="Ej: 30"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className={errors.capacity ? "border-red-500" : ""}
                />
                {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Precio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ej: 15.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>
            </div>



            {/* Nueva sección para horarios disponibles */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Horarios Disponibles <span className="text-red-500">*</span>
                </h3>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md ${errors.availableTimeSlots ? "border-red-500" : ""}`}>
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Día de la semana</Label>                  <Select
                    value={newTimeSlot.dayOfWeek}
                    onValueChange={(value: string) => handleTimeSlotChange("dayOfWeek", value)}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map(dia => (
                        <SelectItem key={dia} value={dia}>
                          {dia.charAt(0) + dia.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => handleTimeSlotChange("startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => handleTimeSlotChange("endTime", e.target.value)}
                  />
                </div>
                <div className="md:col-span-3 mt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={addTimeSlot}
                    className="bg-primary hover:bg-primary-light"
                  >
                    Añadir Horario
                  </Button>
                </div>
              </div>

              {/* Lista de horarios disponibles */}
              {formData.availableTimeSlots.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Día</th>
                        <th className="px-4 py-2 text-left">Inicio</th>
                        <th className="px-4 py-2 text-left">Fin</th>
                        <th className="px-4 py-2 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.availableTimeSlots.map((slot, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}</td>
                          <td className="px-4 py-2">{slot.startTime}</td>
                          <td className="px-4 py-2">{slot.endTime}</td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => removeTimeSlot(index)}
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`text-center py-4 border rounded-md ${errors.availableTimeSlots ? "text-red-500 border-red-500" : "text-gray-500"}`}>
                  No hay horarios disponibles definidos
                </p>
              )}
              {errors.availableTimeSlots && (
                <p className="text-red-500 text-sm">{errors.availableTimeSlots}</p>
              )}
              <p className="text-xs text-gray-500">Define los horarios en que la instalación estará disponible para reservas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe la instalación deportiva"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <Separator />

            {/* Características adicionales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Características adicionales</h3>

              <div className="space-y-2">
                <Label htmlFor="features">Características</Label>
                <Textarea
                  id="features"
                  name="features"
                  placeholder="Ingresa las características separadas por líneas"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Ingresa una característica por línea. Ej: Dimensiones: 25m x 12.5m
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Comodidades</Label>
                <Textarea
                  id="amenities"
                  name="amenities"
                  placeholder="Ingresa las comodidades separadas por líneas"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  rows={3}
                />
                <p className="text-xs text-gray-500">Ingresa una comodidad por línea. Ej: Vestuarios con casilleros</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Reglas</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  placeholder="Ingresa las reglas separadas por líneas"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Ingresa una regla por línea. Ej: Uso obligatorio de gorro de baño
                </p>
              </div>
            </div>

            <Separator />

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Imagen <span className="text-red-500">*</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center ${errors.image ? "border-red-500" : "border-gray-300"}`}
              >
                {imageFile ? (
                  <div className="space-y-2 flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Previsualización"
                    className="w-full max-w-xs rounded border"
                  />
                  <p className="text-sm text-gray-600 mt-2">{imageFile.name}</p>
                  <Button variant="outline" size="sm" onClick={() => setImageFile(null)}>
                    Cambiar archivo
                  </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Haz clic para seleccionar o arrastra y suelta una imagen</p>
                    <Input
                      id="image"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}> {/* Añadir type="button" */}
                      Seleccionar archivo
                    </Button>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
              <p className="text-xs text-gray-500">Formatos aceptados: JPG, PNG, WEBP. Tamaño máximo: 5MB</p>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>Instalación creada correctamente. Redirigiendo...</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/instalaciones">Cancelar</Link>
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSubmitting || isSuccess}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Instalación"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
