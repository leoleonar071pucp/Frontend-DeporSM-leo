"use client"

import { useEffect, useState, use } from "react"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"
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

// Mapeo entre los valores de visualización y los valores de almacenamiento
const typeMapping: Record<string, string> = {
  "Piscina": "piscina",
  "Cancha de Fútbol (Grass)": "cancha-futbol-grass",
  "Cancha de Fútbol (Losa)": "cancha-futbol-loza",
  "Gimnasio": "gimnasio",
  "Pista de Atletismo": "pista-atletismo"
};

import { uploadInstallationImage, validateFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/supabase-storage"

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

        // Mostrar los datos recibidos para depuración
        console.log("Datos recibidos de la instalación:", data);
        console.log("Tipo de instalación recibido:", data.tipo);

        // Convertir el tipo de almacenamiento al formato de visualización
        let displayType = data.tipo || "";

        // Mapeo inverso para convertir de formato de almacenamiento a formato de visualización
        const reverseTypeMapping: Record<string, string> = {};
        Object.entries(typeMapping).forEach(([display, storage]) => {
          reverseTypeMapping[storage] = display;
        });

        // Intentar encontrar el tipo de visualización correspondiente
        if (displayType && reverseTypeMapping[displayType]) {
          displayType = reverseTypeMapping[displayType];
        } else {
          // Si no está en el mapeo, intentar normalizar basado en el contenido
          const tipoLower = displayType.toLowerCase();

          if (tipoLower.includes("piscina")) {
            displayType = "Piscina";
          } else if (tipoLower.includes("cancha") && (tipoLower.includes("grass") || tipoLower.includes("gras"))) {
            displayType = "Cancha de Fútbol (Grass)";
          } else if (tipoLower.includes("cancha") && (tipoLower.includes("loza") || tipoLower.includes("losa"))) {
            displayType = "Cancha de Fútbol (Losa)";
          } else if (tipoLower.includes("gimnasio")) {
            displayType = "Gimnasio";
          } else if (tipoLower.includes("pista") || tipoLower.includes("atletismo")) {
            displayType = "Pista de Atletismo";
          } else {
            // Si no se puede normalizar, convertir a un formato más legible
            // Convertir guiones a espacios y capitalizar cada palabra
            displayType = displayType
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }

        console.log("Tipo original:", data.tipo);
        console.log("Tipo convertido para visualización:", displayType);

        // Transformar los datos para el formulario
        const transformed = {
          id: data.id,
          name: data.nombre,
          location: data.ubicacion,
          description: data.descripcion,
          type: displayType, // Usar el tipo convertido para visualización
          price: data.precio ? data.precio.toString() : "0.00",
          capacity: data.capacidad.toString(),
          contactNumber: data.contactoNumero || "",
          imagenUrl: data.imagenUrl,

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

      // Validar archivo usando la función utilitaria
      const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, image: validation.error || "Archivo no válido" }))
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
    return await uploadInstallationImage(file);
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.location.trim()) newErrors.location = "La ubicación es obligatoria"
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria"
    if (!formData.type) newErrors.type = "El tipo de instalación es obligatorio"

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

    // Asegurarse de que el tipo no esté vacío
    if (!formData.type) {
      setErrors(prev => ({...prev, type: "El tipo de instalación es obligatorio"}));
      setIsSaving(false);
      return;
    }

    // Convertir el tipo de visualización al formato de almacenamiento
    let tipoAlmacenamiento = formData.type;
    if (typeMapping[formData.type]) {
      tipoAlmacenamiento = typeMapping[formData.type];
    } else {
      // Si no está en el mapeo, convertir a minúsculas y reemplazar espacios por guiones
      tipoAlmacenamiento = formData.type.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    }

    console.log("Tipo original:", formData.type);
    console.log("Tipo convertido para almacenamiento:", tipoAlmacenamiento);

    const updatedFacility = {
      nombre: formData.name,
      descripcion: formData.description,
      ubicacion: formData.location,
      tipo: tipoAlmacenamiento, // Usar el tipo convertido
      capacidad: Number(formData.capacity),
      contactoNumero: formData.contactNumber,
      imagenUrl: uploadedUrl,
      precio: parseFloat(formData.price),
      activo: true
    };

    // Mostrar los datos que se van a enviar para depuración
    console.log("Datos a enviar:", updatedFacility);

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
              <Select
                value={formData.type || ""}
                defaultValue={formData.type || ""}
                onValueChange={(value: string) => {
                  console.log("Tipo seleccionado:", value);
                  setFormData((prev: any) => ({...prev, type: value}));
                  // Limpiar error si existe
                  if (errors.type) {
                    const newErrors = { ...errors };
                    delete newErrors.type;
                    setErrors(newErrors);
                  }
                }}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piscina">Piscina</SelectItem>
                  <SelectItem value="Cancha de Fútbol (Grass)">Cancha de Fútbol (Grass)</SelectItem>
                  <SelectItem value="Cancha de Fútbol (Losa)">Cancha de Fútbol (Losa)</SelectItem>
                  <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                  <SelectItem value="Pista de Atletismo">Pista de Atletismo</SelectItem>
                  {/* Agregar un elemento para mostrar el tipo actual si no coincide con ninguno de los anteriores */}
                  {formData.type &&
                   !["Piscina", "Cancha de Fútbol (Grass)", "Cancha de Fútbol (Losa)", "Gimnasio", "Pista de Atletismo"].includes(formData.type) &&
                   <SelectItem value={formData.type}>{formData.type}</SelectItem>}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              {formData.type && <p className="text-xs text-gray-500 mt-1">Tipo actual: {formData.type}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input name="location" value={formData.location} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Número de contacto</Label>
              <Input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Ej: 987-654-321"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidad</Label>
              <Input
                name="capacity"
                type="number"
                min="1"
                step="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className={errors.capacity ? "border-red-500" : ""}
              />
              {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
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
