"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditFacilityProps {
  facility: any
  onCancel: () => void
  onSave: (updatedFacility: any) => void
}

export default function EditFacility({ facility, onCancel, onSave }: EditFacilityProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: facility.name,
    type: facility.type,
    location: facility.location,
    description: facility.description,
    capacity: facility.capacity,
    price: facility.price,
    contactNumber: facility.contactNumber,
    schedule: facility.schedule,
    features: facility.features.join("\n"),
    amenities: facility.amenities.join("\n"),
    rules: facility.rules.join("\n"),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.location.trim()) {
      newErrors.location = "La ubicación es obligatoria"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = "La capacidad es obligatoria"
    }

    if (!formData.price.trim()) {
      newErrors.price = "El precio es obligatorio"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "El número de contacto es obligatorio"
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = "El horario es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    setTimeout(() => {
      const updatedFacility = {
        ...facility,
        name: formData.name,
        location: formData.location,
        description: formData.description,
        capacity: formData.capacity,
        price: formData.price,
        contactNumber: formData.contactNumber,
        schedule: formData.schedule,
        features: formData.features.split("\n").filter((item) => item.trim() !== ""),
        amenities: formData.amenities.split("\n").filter((item) => item.trim() !== ""),
        rules: formData.rules.split("\n").filter((item) => item.trim() !== ""),
      }

      onSave(updatedFacility)
      setIsSaving(false)
      setIsSuccess(true)

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

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
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Input id="type" name="type" value={formData.type.replace(/-/g, " ")} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
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
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Características adicionales</h3>

            <div className="space-y-2">
              <Label htmlFor="features">Características</Label>
              <Textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows={5}
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
                value={formData.amenities}
                onChange={handleInputChange}
                rows={5}
              />
              <p className="text-xs text-gray-500">
                Ingresa una comodidad por línea. Ej: Vestuarios con casilleros
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Reglas</Label>
              <Textarea id="rules" name="rules" value={formData.rules} onChange={handleInputChange} rows={5} />
              <p className="text-xs text-gray-500">
                Ingresa una regla por línea. Ej: Uso obligatorio de gorro de baño
              </p>
            </div>
          </div>

          {isSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>Instalación actualizada correctamente.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary-light" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}