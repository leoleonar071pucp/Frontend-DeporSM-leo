"use client"

import { useEffect, useState, use } from "react"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from '@supabase/supabase-js'
import { useRouter } from "next/navigation"

const supabase = createClient(
  'https://goajrdpkfhunnfuqtoub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYWpyZHBrZmh1bm5mdXF0b3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTU1NTQsImV4cCI6MjA2MjI5MTU1NH0.-_GxSWv-1UZNsXcSwIcFUKlprJ5LMX_0iz5VbesGgPQ'
)

export default function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [facility, setFacility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/instalaciones/${id}`)
        const data = await res.json()
        const transformed = {
          id: data.id,
          name: data.nombre,
          location: data.ubicacion,
          description: data.descripcion,
          type: data.tipo,
          price: data.precio.toString(),
          capacity: data.capacidad.toString(),
          contactNumber: "987654321",
          imagenUrl: data.imagenUrl,
          schedule: `Lunes a Viernes: ${data.horarioApertura} - ${data.horarioCierre}`,
          features: "",
          amenities: "",
          rules: ""
        }
        setFacility(transformed)
        setFormData(transformed)
      } catch (error) {
        console.error("Error al cargar instalación:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFacility()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const validTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: "El archivo debe ser JPG, PNG o WEBP" }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "El archivo no debe superar los 5MB" }))
        return
      }
      setImageFile(file)
      if (errors.image) {
        const newErrors = { ...errors }
        delete newErrors.image
        setErrors(newErrors)
      }
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    const filePath = `instalaciones/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('instalaciones').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    })
    if (error) {
      console.error("Error al subir imagen:", error.message)
      return null
    }
    const { data: publicUrlData } = supabase.storage.from('instalaciones').getPublicUrl(filePath)
    return publicUrlData.publicUrl
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.location.trim()) newErrors.location = "La ubicación es obligatoria"
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria"
    if (!formData.capacity.trim()) newErrors.capacity = "La capacidad es obligatoria"
    if (!formData.price.trim()) newErrors.price = "El precio es obligatorio"
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "El número de contacto es obligatorio"
    if (!formData.schedule.trim()) newErrors.schedule = "El horario es obligatorio"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSaving(true)

    let uploadedUrl = formData.imagenUrl
    if (imageFile) {
      const url = await uploadImageToSupabase(imageFile)
      if (url) uploadedUrl = url
    }

    const updatedFacility = {
      nombre: formData.name,
      descripcion: formData.description,
      ubicacion: formData.location,
      tipo: formData.type,
      capacidad: Number(formData.capacity),
      horarioApertura: "08:00:00",
      horarioCierre: "20:00:00",
      imagenUrl: uploadedUrl,
      precio: parseFloat(formData.price),
      activo: true
    }

    try {
      const res = await fetch(`http://localhost:8080/api/instalaciones/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFacility)
      })
      if (!res.ok) throw new Error("Error al actualizar instalación")
      setIsSuccess(true)
      setTimeout(() => router.push("/admin/instalaciones"), 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>
  if (!facility || !formData) return <p className="p-4 text-red-500">No se encontró la instalación</p>

  return (
    <Card>
      <form onSubmit={handleSave}>
        <CardHeader>
          <CardTitle>Editar Instalación</CardTitle>
          <CardDescription>Modifica los datos de la instalación deportiva</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input value={formData.type.replace(/-/g, " ")} disabled />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input name="location" value={formData.location} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Número de contacto</Label>
              <Input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Capacidad</Label>
              <Input name="capacity" value={formData.capacity} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input name="price" value={formData.price} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Horario</Label>
              <Input name="schedule" value={formData.schedule} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descripción</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Características</Label>
              <Textarea name="features" value={formData.features} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Comodidades</Label>
              <Textarea name="amenities" value={formData.amenities} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Reglas</Label>
              <Textarea name="rules" value={formData.rules} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Actualizar Imagen</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="cursor-pointer"
                onChange={handleFileChange}
              />
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Vista previa"
                  className="w-full h-96 object-cover rounded-md mt-2"
                />
              ) : (
                formData.imagenUrl && (
                  <img
                    src={formData.imagenUrl}
                    alt="Vista previa"
                    className="w-full h-96 object-cover rounded-md mt-2"
                  />
                )
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => history.back()}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSaving}>
            {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>) : "Guardar Cambios"}
          </Button>
        </CardFooter>
        {isSuccess && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>Instalación actualizada correctamente.</AlertDescription>
          </Alert>
        )}
      </form>
    </Card>
  )
}
