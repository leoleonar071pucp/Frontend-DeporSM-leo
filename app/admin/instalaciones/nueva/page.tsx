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

import { createClient } from '@supabase/supabase-js'


// Create a single supabase client for interacting with your database
const supabase = createClient('https://goajrdpkfhunnfuqtoub.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYWpyZHBrZmh1bm5mdXF0b3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTU1NTQsImV4cCI6MjA2MjI5MTU1NH0.-_GxSWv-1UZNsXcSwIcFUKlprJ5LMX_0iz5VbesGgPQ')

  
  


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
  schedule: string;
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
    schedule: "",
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

      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "El archivo debe ser JPG, PNG o WEBP",
        }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "El archivo no debe superar los 5MB",
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
    if (!formData.price.trim()) newErrors.price = "El precio es obligatorio"
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "El número de contacto es obligatorio"
    if (!formData.schedule.trim()) newErrors.schedule = "El horario es obligatorio"
    if (!imageFile) newErrors.image = "La imagen es obligatoria"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    const filePath = `instalaciones/${Date.now()}_${file.name}`
  
    const { data, error } = await supabase
      .storage
      .from('instalaciones') // nombre de tu bucket
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })
  
    if (error) {
      console.error("Error al subir imagen:", error.message)
      return null
    }
  
    const { data: publicUrlData } = supabase
      .storage
      .from('instalaciones')
      .getPublicUrl(filePath)
  
    return publicUrlData.publicUrl
  }
  

  // Tipar evento
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    if (!validateForm()) {
      setFormError("Por favor, corrige los errores antes de continuar.")
      return
    }
  
    setIsSubmitting(true)
    setFormError("")
  
    try {
      let imagenUrl = null
  
      if (imageFile) {
        imagenUrl = await uploadImageToSupabase(imageFile)
        if (!imagenUrl) throw new Error("Fallo la subida de imagen")
      }
  
      const response = await fetch("http://localhost:8080/api/instalaciones", {
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
          horarioApertura: "08:00:00",
          horarioCierre: "20:00:00",
          imagenUrl: imagenUrl,
          precio: parseFloat(formData.price),
          activo: true
        }),
      })
  
      if (!response.ok) {
        throw new Error("Error al crear instalación")
      }
  
      setIsSuccess(true)
      setTimeout(() => router.push("/admin/instalaciones"), 2000)
  
    } catch (error) {
      console.error(error)
      setFormError("Ocurrió un error al guardar la instalación.")
    } finally {
      setIsSubmitting(false)
    }
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
                    <SelectItem value="piscina">Piscina</SelectItem>
                    <SelectItem value="cancha-futbol-grass">Cancha de Fútbol (Grass)</SelectItem>
                    <SelectItem value="cancha-futbol-loza">Cancha de Fútbol (Loza)</SelectItem>
                    <SelectItem value="gimnasio">Gimnasio</SelectItem>
                    <SelectItem value="pista-atletismo">Pista de Atletismo</SelectItem>
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
                  placeholder="Ej: S/. 15.00 por hora"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">
                Horario <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schedule"
                name="schedule"
                placeholder="Ej: Lunes a Viernes: 8:00 - 21:00, Sábados y Domingos: 9:00 - 18:00"
                value={formData.schedule}
                onChange={handleInputChange}
                className={errors.schedule ? "border-red-500" : ""}
              />
              {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule}</p>}
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
