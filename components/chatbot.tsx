"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X } from "lucide-react"
import { useConfiguracion } from "@/context/ConfiguracionContext"

type Message = {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function Chatbot() {  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const { config } = useConfiguracion()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `¡Hola! Soy el asistente virtual de ${config.nombreSitio || "DeporSM"}. ¿En qué puedo ayudarte hoy?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim() === "") return

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, newUserMessage])
    setMessage("")

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = getBotResponse(message)
      const newBotMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newBotMessage])
    }, 1000)
  }

  const getBotResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase()

    if (lowerCaseMessage.includes("disponibilidad") || lowerCaseMessage.includes("disponible")) {
      return "Para verificar la disponibilidad, puedes visitar la sección de instalaciones y seleccionar la que te interese. Allí podrás ver un calendario con los horarios disponibles."
    } else if (lowerCaseMessage.includes("reserva") || lowerCaseMessage.includes("reservar")) {
      return "Para hacer una reserva, debes seleccionar la instalación que deseas, elegir fecha y hora disponible, y completar el proceso de pago. ¿Necesitas ayuda con alguna instalación específica?"
    } else if (lowerCaseMessage.includes("cancelar") || lowerCaseMessage.includes("cancelación")) {
      return "Puedes cancelar tu reserva hasta 48 horas antes de la fecha programada. Para hacerlo, ve a la sección 'Mis Reservas' y selecciona la opción de cancelar. Recuerda que pasado este tiempo, no habrá reembolso."
    } else if (lowerCaseMessage.includes("pago") || lowerCaseMessage.includes("pagar")) {
      return "Ofrecemos dos métodos de pago: pago en línea con tarjeta de crédito/débito o depósito/transferencia bancaria. En el caso del depósito, deberás subir el comprobante para que podamos validarlo."
    } else if (lowerCaseMessage.includes("horario") || lowerCaseMessage.includes("hora")) {
      return "Los horarios de nuestras instalaciones varían según el tipo. Generalmente están disponibles de 8:00 a 21:00. Puedes consultar los horarios específicos en la sección de cada instalación."
    } else if (
      lowerCaseMessage.includes("precio") ||
      lowerCaseMessage.includes("costo") ||
      lowerCaseMessage.includes("tarifa")
    ) {
      return "Los precios varían según la instalación. Por ejemplo, las canchas de fútbol de grass sintético tienen un costo de S/. 120.00 por hora, mientras que la piscina cuesta S/. 15.00 por hora. Puedes consultar los precios específicos en la descripción de cada instalación."
    } else if (
      lowerCaseMessage.includes("hola") ||
      lowerCaseMessage.includes("buenos días") ||
      lowerCaseMessage.includes("buenas tardes")
    ) {
      return "¡Hola! ¿En qué puedo ayudarte hoy con las instalaciones deportivas de San Miguel?"
    } else if (lowerCaseMessage.includes("gracias") || lowerCaseMessage.includes("muchas gracias")) {
      return "¡De nada! Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en consultarme."
    } else {
      return "No estoy seguro de entender tu consulta. ¿Puedes reformularla? Puedo ayudarte con información sobre disponibilidad, reservas, cancelaciones, pagos, horarios y precios de nuestras instalaciones deportivas."
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 md:w-96 z-50 shadow-lg">
          <CardHeader className="p-4 bg-primary text-white flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-medium">Asistente Virtual</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary-light">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-primary hover:bg-primary-light shadow-lg z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </>
  )
}

