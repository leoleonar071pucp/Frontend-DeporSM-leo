"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { calculateAndFormatPrice } from "@/lib/price-utils"
import { API_BASE_URL } from "@/lib/config"

function ConfirmacionReservaContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status") ?? 'pending'
  const resNum = searchParams.get("resNum")
  const facilityName = searchParams.get("facilityName")
  const dateParam = searchParams.get("date")
  const time = searchParams.get("time")
  const price = searchParams.get("price")
  const [facilityPrice, setFacilityPrice] = useState<string | null>(null)

  // Calcular el precio basado en la duración si tenemos el precio por hora
  useEffect(() => {
    if (price && time) {
      const pricePerHour = parseFloat(price)
      if (!isNaN(pricePerHour)) {
        const calculatedPrice = calculateAndFormatPrice(pricePerHour, time)
        setFacilityPrice(calculatedPrice)
      }
    }
  }, [price, time])

  // Guardar información de la reserva completada en sessionStorage
  // para prevenir volver a la página de confirmación
  useEffect(() => {
    if (resNum) {
      // Extraer el ID de la instalación de los parámetros de búsqueda
      const urlParams = new URLSearchParams(window.location.search);
      const instalacionId = urlParams.get('id');

      // Normalizar la fecha para guardarla en formato YYYY-MM-DD
      const fechaNormalizada = dateParam ? new Date(dateParam).toISOString().split('T')[0] : null;

      // Guardar el ID de la reserva, la fecha/hora de completado y la instalación
      sessionStorage.setItem('reservaCompletada', JSON.stringify({
        id: resNum,
        timestamp: Date.now(),
        status: status,
        instalacionId: instalacionId,
        fecha: dateParam,
        fechaNormalizada: fechaNormalizada,
        horario: time
      }));

      console.log("Reserva completada guardada en sessionStorage:", {
        id: resNum,
        timestamp: Date.now(),
        status: status,
        instalacionId: instalacionId,
        fecha: dateParam,
        fechaNormalizada: fechaNormalizada,
        horario: time
      });
    }
  }, [resNum, status, dateParam, time]);

  const formattedDate = dateParam
    ? format(new Date(dateParam), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
    : "Fecha Desconocida"

  const isSuccess = status === 'success'
  const title = isSuccess ? "¡Reserva Exitosa!" : "Reserva Pendiente"
  const description = isSuccess
    ? "Tu reserva ha sido procesada correctamente. Hemos enviado un correo electrónico con los detalles."
    : "Tu solicitud de reserva ha sido recibida. Quedará confirmada una vez que validemos tu comprobante de pago."
  const icon = isSuccess
    ? <CheckCircle className="h-10 w-10 text-white" />
    : <Clock className="h-10 w-10 text-white" />
  const statusText = isSuccess ? "Confirmada" : "Pendiente de Pago"
  const statusColor = isSuccess ? "text-green-600" : "text-yellow-600"

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary-background py-8 px-4 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardHeader>
              <div className={`mx-auto mb-4 ${isSuccess ? 'bg-primary-light' : 'bg-yellow-500'} rounded-full p-3 w-16 h-16 flex items-center justify-center`}>
                {icon}
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">{description}</p>

              <div className="bg-primary-pale p-4 rounded-md text-left mb-6">
                <h3 className="font-medium mb-2">Detalles de la Reserva</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Número de Reserva:</strong> #{resNum || 'N/A'}
                  </li>
                  <li>
                    <strong>Instalación:</strong> {facilityName || 'N/A'}
                  </li>
                  <li>
                    <strong>Fecha:</strong> {formattedDate}
                  </li>
                  <li>
                    <strong>Horario:</strong> {time || 'N/A'}
                  </li>
                  <li>
                    <strong>Estado:</strong> <span className={`${statusColor} font-medium`}>{statusText}</span>
                  </li>
                  {facilityPrice && (
                    <li>
                      <strong>Precio:</strong> {facilityPrice}
                    </li>
                  )}
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Recuerda que puedes cancelar tu reserva hasta 48 horas antes de la fecha programada. Pasado este tiempo,
                no habrá reembolso.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary-light">
                <Link href="/mis-reservas">Ver Mis Reservas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmacionReserva() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmacionReservaContent />
    </Suspense>
  )
}

