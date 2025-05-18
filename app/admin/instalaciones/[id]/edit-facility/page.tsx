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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL } from "@/lib/config";


// Estructura para representar un horario disponible
interface AvailableTimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

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
  const [formError, setFormError] = useState<string | null>(null)
  
  // Estado para el formulario de horario a añadir
  const [newTimeSlot, setNewTimeSlot] = useState<AvailableTimeSlot>({
    dayOfWeek: "LUNES",
    startTime: "08:00",
    endTime: "10:00"
  })
  useEffect(() => {
    const fetchFacility = async () => {
      try {
        // Obtener los datos básicos de la instalación
        const res = await fetch(`${API_BASE_URL}/instalaciones/${id}`)
        const data = await res.json()
        
        // Transformar los datos para el formulario
        const transformed = {
          id: data.id,
          name: data.nombre,
          location: data.ubicacion,
          description: data.descripcion,
          type: data.tipo,
          price: data.precio ? data.precio.toString() : "0.00",
          capacity: data.capacidad.toString(),
          contactNumber: "987654321",
          imagenUrl: data.imagenUrl,
          schedule: `Lunes a Viernes: ${data.horarioApertura} - ${data.horarioCierre}`,
          features: "",
          amenities: "",
          rules: "",
          availableTimeSlots: []
        }
        
        // Establecer los valores iniciales
        setFacility(transformed)
        setFormData(transformed)
        
        // Obtener los horarios disponibles
        try {
          const horariosRes = await fetch(`${API_BASE_URL}/instalaciones/${id}/horarios-disponibles`)
          if (horariosRes.ok) {
            const horariosData = await horariosRes.json()
            if (Array.isArray(horariosData) && horariosData.length > 0) {
              // Actualizar el formulario con los horarios obtenidos
              setFormData((prev: any) => ({
                ...prev, 
                availableTimeSlots: horariosData.map((h: any) => ({
                  dayOfWeek: h.diaSemana,
                  startTime: h.horaInicio ? h.horaInicio.substring(0, 5) : "08:00",
                  endTime: h.horaFin ? h.horaFin.substring(0, 5) : "20:00"
                }))
              }))
            }
          }
        } catch (horarioError) {
          console.error("Error al cargar horarios disponibles:", horarioError)
        }
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
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    
    let uploadedUrl = formData.imagenUrl;
    if (imageFile) {
      const url = await uploadImageToSupabase(imageFile);
      if (url) uploadedUrl = url;
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
    };

    try {
      // Primero actualizamos la información básica de la instalación
      const res = await fetch(`${API_BASE_URL}/instalaciones/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFacility)
      });
      
      if (!res.ok) throw new Error("Error al actualizar instalación");
      
      // Luego actualizamos los horarios disponibles
      const horariosDisponibles = (formData.availableTimeSlots || []).map((slot: AvailableTimeSlot) => ({
        diaSemana: slot.dayOfWeek,
        horaInicio: `${slot.startTime}:00`,
        horaFin: `${slot.endTime}:00`
      }));
      
      const horariosRes = await fetch(`${API_BASE_URL}/instalaciones/${formData.id}/horarios-disponibles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horariosDisponibles)
      });
      
      if (!horariosRes.ok) throw new Error("Error al actualizar horarios disponibles");
      
      setIsSuccess(true);
      setTimeout(() => router.push("/admin/instalaciones"), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
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
            </div>            <div className="space-y-2 md:col-span-2">
              <Label>Horario</Label>
              <Input name="schedule" value={formData.schedule} onChange={handleInputChange} />
            </div>
            
            {/* Sección para horarios disponibles */}
            <div className="space-y-4 md:col-span-2 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Horarios Disponibles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dayOfWeek">Día</Label>
                  <Select 
                    value={newTimeSlot.dayOfWeek} 
                    onValueChange={(value: string) => setNewTimeSlot(prev => ({...prev, dayOfWeek: value}))}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LUNES">Lunes</SelectItem>
                      <SelectItem value="MARTES">Martes</SelectItem>
                      <SelectItem value="MIERCOLES">Miércoles</SelectItem>
                      <SelectItem value="JUEVES">Jueves</SelectItem>
                      <SelectItem value="VIERNES">Viernes</SelectItem>
                      <SelectItem value="SABADO">Sábado</SelectItem>
                      <SelectItem value="DOMINGO">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="startTime">Hora inicio</Label>
                  <Input 
                    id="startTime" 
                    type="time" 
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot(prev => ({...prev, startTime: e.target.value}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">Hora fin</Label>
                  <Input 
                    id="endTime" 
                    type="time" 
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot(prev => ({...prev, endTime: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    // Validar que no haya solapamiento de horarios
                    const overlapping = (formData.availableTimeSlots || []).some(
                      (slot: AvailableTimeSlot) => 
                        slot.dayOfWeek === newTimeSlot.dayOfWeek && 
                        ((newTimeSlot.startTime >= slot.startTime && newTimeSlot.startTime < slot.endTime) ||
                         (newTimeSlot.endTime > slot.startTime && newTimeSlot.endTime <= slot.endTime) ||
                         (slot.startTime >= newTimeSlot.startTime && slot.startTime < newTimeSlot.endTime))
                    );
                    
                    if (overlapping) {
                      setFormError("Este horario se solapa con otro ya definido para el mismo día");
                      return;
                    }
                    
                    // Añadir el nuevo horario
                    setFormData((prev: any) => ({
                      ...prev,
                      availableTimeSlots: [...(prev.availableTimeSlots || []), {...newTimeSlot}]
                    }));
                    
                    // Limpiar error si existe
                    if (formError) setFormError(null);
                  }}
                >
                  Añadir horario
                </Button>
              </div>
              
              {formError && (
                <p className="text-red-500 text-sm mt-1">{formError}</p>
              )}
              
              {formData.availableTimeSlots && formData.availableTimeSlots.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Día</th>
                        <th className="px-4 py-2 text-left">Hora inicio</th>
                        <th className="px-4 py-2 text-left">Hora fin</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.availableTimeSlots.map((slot: AvailableTimeSlot, index: number) => {
                        // Convertir el valor del enum a texto legible
                        const dayName = {
                          "LUNES": "Lunes",
                          "MARTES": "Martes",
                          "MIERCOLES": "Miércoles",
                          "JUEVES": "Jueves",
                          "VIERNES": "Viernes",
                          "SABADO": "Sábado",
                          "DOMINGO": "Domingo"
                        }[slot.dayOfWeek] || slot.dayOfWeek;
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2">{dayName}</td>
                            <td className="px-4 py-2">{slot.startTime}</td>
                            <td className="px-4 py-2">{slot.endTime}</td>
                            <td className="px-4 py-2 text-right">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => {
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    availableTimeSlots: prev.availableTimeSlots.filter((_: any, i: number) => i !== index)
                                  }))
                                }}
                              >
                                ✕
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 border rounded-md">
                  No hay horarios disponibles definidos
                </p>
              )}
              <p className="text-xs text-gray-500">Define los horarios en que la instalación estará disponible para reservas</p>
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
