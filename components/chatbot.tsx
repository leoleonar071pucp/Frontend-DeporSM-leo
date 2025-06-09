"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X, Loader2 } from "lucide-react"
import { useConfiguracion } from "@/context/ConfiguracionContext"

type Message = {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isLoading?: boolean
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  // URL del webhook de n8n
  const N8N_WEBHOOK_URL = "https://qubos-n8n.ennfle.easypanel.host/webhook/dda7025f-0900-41e1-9adf-ce28187e7588/chat"

  // Función para formatear el texto del bot
  const formatBotMessage = (text: string) => {
    return text
      // Agregar saltos de línea después de números con punto
      .replace(/(\d+\.\s\*\*[^*]+\*\*)/g, '\n$1')
      // Agregar saltos de línea antes de guiones
      .replace(/(\s-\s)/g, '\n$1')
      // Agregar salto de línea después de cada instalación
      .replace(/(Contacto:\s[0-9-]+)/g, '$1\n')
      // Limpiar múltiples saltos de línea
      .replace(/\n\n+/g, '\n\n')
      // Limpiar espacios al inicio
      .trim()
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim() === "" || isLoading) return

    const userMessage = message.trim()
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    }

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, newUserMessage])
    setMessage("")
    setIsLoading(true)

    // Agregar mensaje de carga del bot
    const loadingMessage: Message = {
      id: messages.length + 2,
      text: "Escribiendo...",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Enviar mensaje a n8n
      console.log('Enviando mensaje a n8n:', userMessage)

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage,
          sessionId: `session_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('Respuesta de n8n:', data)

      // Reemplazar mensaje de carga con respuesta real
      const rawText = data.output || data.response || data.message || "Lo siento, no pude procesar tu mensaje."
      const formattedText = formatBotMessage(rawText)

      const botResponse: Message = {
        id: messages.length + 2,
        text: formattedText,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages(prev => prev.slice(0, -1).concat(botResponse))

    } catch (error) {
      console.error('Error al enviar mensaje a n8n:', error)

      // Reemplazar mensaje de carga con mensaje de error
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Lo siento, hay un problema de conexión. Por favor intenta de nuevo.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages(prev => prev.slice(0, -1).concat(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  // Función eliminada - ahora usamos n8n para las respuestas

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
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.sender === "user" ? "bg-primary text-white" : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin mt-1" />
                      )}
                      <div className="text-sm whitespace-pre-line leading-relaxed">
                        {msg.text.split('\n').map((line, index) => {
                          // Detectar si es un título (contiene **)
                          const isTitle = line.includes('**')
                          // Detectar si es un elemento de lista (empieza con número o emoji)
                          const isListItem = /^\d+\./.test(line.trim()) || /^🏟️/.test(line.trim())

                          return (
                            <div
                              key={index}
                              className={`
                                ${isTitle ? 'font-semibold text-blue-600 mb-1' : ''}
                                ${isListItem ? 'font-medium mb-2 mt-2' : ''}
                                ${line.trim().startsWith('-') ? 'ml-4 text-gray-600' : ''}
                                ${line.trim() === '' ? 'mb-2' : 'mb-1'}
                              `}
                            >
                              {line.replace(/\*\*/g, '')}
                            </div>
                          )
                        })}
                      </div>
                    </div>
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
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary-light"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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

