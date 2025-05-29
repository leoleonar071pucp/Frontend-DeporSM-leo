"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/config";
import { uploadMultipleObservationImages, uploadObservationImage, validateFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/supabase-storage";
import LocationValidator from "@/components/location/LocationValidator";
import { Coordinates } from "@/lib/google-maps";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

// Componente de carga para el Suspense
function ObservacionLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Componente interno que usa searchParams
function NuevaObservacionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const facilityId = searchParams.get("id");
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);

  // Estado para almacenar las instalaciones cargadas del backend
  const [facilitiesData, setFacilitiesData] = useState<Array<{
    id: number,
    nombre: string,
    tipo?: string,
    ubicacion?: string,
    latitud?: number,
    longitud?: number,
    radioValidacion?: number
  }>>([]);

  // Estado para la instalación seleccionada
  const [selectedFacility, setSelectedFacility] = useState<{
    id: number,
    nombre: string,
    latitud?: number,
    longitud?: number,
    radioValidacion?: number
  } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    facilityId: "",
    title: "",
    description: "",
    priority: "media",
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    // Cargar datos reales desde el backend
    const loadData = async () => {
      try {
        // Verificar que hay usuario autenticado y es coordinador
        if (!user || !user.rol || user.rol.nombre !== 'coordinador') {
          console.log("No hay usuario coordinador autenticado");
          setFormError("Debes estar autenticado como coordinador para crear observaciones.");
          setIsLoading(false);
          return;
        }

        // Obtener las instalaciones asignadas al coordinador actual
        const response = await fetch(`${API_BASE_URL}/instalaciones/coordinador/${user.id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al cargar las instalaciones');
        }

        const data = await response.json();
        setFacilitiesData(data);

        // Si hay un ID de instalación en la URL, preseleccionarlo
        if (facilityId) {
          setFormData((prev) => ({
            ...prev,
            facilityId: facilityId,
          }));

          // También establecer la instalación seleccionada
          const facility = data.find((f: any) => f.id.toString() === facilityId);
          if (facility) {
            setSelectedFacility({
              id: facility.id,
              nombre: facility.nombre,
              latitud: facility.latitud,
              longitud: facility.longitud,
              radioValidacion: facility.radioValidacion
            });
          }
        }
      } catch (error) {
        console.error("Error cargando las instalaciones:", error);
        setFormError("No se pudieron cargar las instalaciones asignadas. Intenta nuevamente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [facilityId, user]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Si se cambia la instalación, resetear la validación de ubicación y establecer la instalación seleccionada
    if (name === "facilityId") {
      setIsLocationValid(false);
      setUserLocation(null);

      // Encontrar la instalación seleccionada
      const facility = facilitiesData.find(f => f.id.toString() === value);
      setSelectedFacility(facility ? {
        id: facility.id,
        nombre: facility.nombre,
        latitud: facility.latitud,
        longitud: facility.longitud,
        radioValidacion: facility.radioValidacion
      } : null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);

      // Validar cada archivo usando la función utilitaria
      for (const file of newPhotos) {
        const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
        if (!validation.isValid) {
          setErrors((prev) => ({
            ...prev,
            photos: validation.error || "Archivo no válido",
          }));
          return;
        }
      }

      // Validar cantidad máxima (3 fotos)
      if (photos.length + newPhotos.length > 3) {
        setErrors((prev) => ({
          ...prev,
          photos: "Máximo 3 fotos permitidas",
        }));
        return;
      }

      setPhotos((prev) => [...prev, ...newPhotos]);

      // Limpiar error si existe
      if (errors.photos) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.photos;
          return newErrors;
        });
      }
    }
  };
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Función de subida usando la utilidad centralizada
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    return await uploadObservationImage(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.facilityId) {
      newErrors.facilityId = "Debes seleccionar una instalación";
    }

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!formData.priority) {
      newErrors.priority = "Debes seleccionar una prioridad";
    }

    // Validación de ubicación habilitada
    if (!isLocationValid) {
      newErrors.location = "Debes verificar tu ubicación antes de enviar la observación"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError("Por favor, corrige los errores en el formulario antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Subir las fotos a Supabase y obtener las URLs
      let uploadedUrls: string[] = [];

      if (photos.length > 0) {
        console.log('Subiendo múltiples imágenes a Supabase...');
        uploadedUrls = await uploadMultipleObservationImages(photos);

        if (uploadedUrls.length < photos.length) {
          throw new Error("No se pudieron subir todas las imágenes");
        }

        console.log('Imágenes subidas exitosamente:', uploadedUrls);
      }      const observacionData = {
        usuarioId: user?.id, // Usar el ID del usuario autenticado
        instalacionId: parseInt(formData.facilityId),
        titulo: formData.title, // Usar el título ingresado por el usuario
        descripcion: formData.description,
        prioridad: formData.priority,
        ubicacionLat: userLocation?.lat.toString(),
        ubicacionLng: userLocation?.lng.toString(),
        fotos: uploadedUrls, // Agregar las URLs de Supabase
        fotosUrl: uploadedUrls.join(',') // Añadir también como string separado por comas
      };

      // Llamada a la API para crear la observación
      const response = await fetch(`/api/observaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observacionData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Observación creada:", responseData);

      setIsSuccess(true);

      // Agregar notificación de éxito (manteniendo consistencia con el resto del sistema)
      const facilityName = selectedFacility?.nombre || "la instalación seleccionada";
      await addNotification({
        title: "Observación creada",
        message: `Su observación sobre ${facilityName} ha sido registrada exitosamente y está pendiente de revisión.`,
        type: "observacion"
      });

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push("/coordinador/observaciones");
      }, 2000);
    } catch (error) {
      console.error("Error al crear la observación:", error);
      setFormError("Ocurrió un error al crear la observación. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/coordinador/observaciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nueva Observación</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Reportar Observación</CardTitle>
            <CardDescription>Ingresa los detalles de la observación para la instalación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facilityId">
                  Instalación <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.facilityId}
                  onValueChange={(value) => handleSelectChange("facilityId", value)}
                  disabled={isLocationValid}
                >                  <SelectTrigger id="facilityId" className={errors.facilityId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona una instalación" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilitiesData.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id.toString()}>
                        {facility.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.facilityId && <p className="text-red-500 text-sm">{errors.facilityId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ingresa un título para la observación"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              {/* Validación de ubicación con LocationValidator */}
              {selectedFacility && selectedFacility.latitud && selectedFacility.longitud ? (
                <LocationValidator
                  facilityLocation={{
                    lat: selectedFacility.latitud,
                    lng: selectedFacility.longitud
                  }}
                  facilityName={selectedFacility.nombre}
                  allowedRadius={selectedFacility.radioValidacion || 100}
                  onValidationResult={(isValid, distance) => {
                    setIsLocationValid(isValid);
                    if (isValid) {
                      // Limpiar error de ubicación si existe
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.location;
                        return newErrors;
                      });
                    }
                  }}
                  onLocationUpdate={(location: Coordinates) => {
                    setUserLocation({ lat: location.lat, lng: location.lng });
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <Label>
                    Verificación de ubicación <span className="text-red-500">*</span>
                  </Label>
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      {!formData.facilityId
                        ? "Selecciona una instalación para habilitar la verificación de ubicación"
                        : "La instalación seleccionada no tiene coordenadas configuradas. Contacta al administrador."
                      }
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe detalladamente la observación"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger id="priority" className={errors.priority ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona una prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
              </div>
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label htmlFor="photos">Fotos (opcional)</Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 ${errors.photos ? "border-red-500" : "border-gray-300"}`}
              >
                <div className="space-y-4">
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo) || "/placeholder.svg"}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removePhoto(index)}
                          >
                            &times;
                          </Button>
                        </div>
                      ))}
                      {photos.length < 3 && (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-md h-24 flex items-center justify-center cursor-pointer"
                          onClick={() => document.getElementById("photos")?.click()}
                        >
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600 mt-2">Haz clic para seleccionar o arrastra y suelta fotos</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById("photos")?.click()}
                      >
                        Seleccionar fotos
                      </Button>
                    </div>
                  )}
                  <Input
                    id="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
              </div>
              {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}
              <p className="text-xs text-gray-500">
                Formatos aceptados: JPG, PNG, WEBP. Máximo 3 fotos. Tamaño máximo por foto: 5MB
              </p>
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
                <AlertDescription>Observación creada correctamente. Redirigiendo...</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/coordinador/observaciones">Cancelar</Link>
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSubmitting || isSuccess}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Observación"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Componente principal que exportamos
export default function NuevaObservacion() {
  return (
    <Suspense fallback={<ObservacionLoading />}>
      <NuevaObservacionForm />
    </Suspense>
  );
}