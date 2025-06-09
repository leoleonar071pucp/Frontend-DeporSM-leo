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
  const [chatSize, setChatSize] = useState({ width: 400, height: 600 })
  const [chatPosition, setChatPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
  const chatRef = useRef<HTMLDivElement>(null)

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
    // Resetear posición cuando se abre por primera vez
    if (!isOpen) {
      setChatPosition({
        x: Math.max(20, window.innerWidth - chatSize.width - 20),
        y: Math.max(20, window.innerHeight - chatSize.height - 100)
      })
    }
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

  // Funciones para drag & drop
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setChatPosition({
        x: Math.max(0, Math.min(window.innerWidth - chatSize.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - chatSize.height, e.clientY - dragStart.y))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Funciones para redimensionar
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      setChatSize({
        width: Math.max(300, Math.min(800, chatSize.width + deltaX)),
        height: Math.max(400, Math.min(800, chatSize.height + deltaY))
      })

      setDragStart({
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, chatPosition, chatSize])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <>
      {isOpen && (
        <Card
          ref={chatRef}
          className="fixed z-50 shadow-2xl border-2 border-gray-300 select-none"
          style={{
            left: `${chatPosition.x}px`,
            top: `${chatPosition.y}px`,
            width: `${chatSize.width}px`,
            height: `${chatSize.height}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <CardHeader
            className="p-4 bg-primary text-white flex flex-row justify-between items-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-medium">Asistente Virtual</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs opacity-75">
                {chatSize.width}×{chatSize.height}
              </div>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent
            className="p-4 overflow-y-auto flex-1"
            style={{
              height: `${chatSize.height - 140}px` // Restar header y footer
            }}
          >
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
          <CardFooter className="p-4 pt-0 relative">
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

            {/* Handle de redimensionamiento */}
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-400 hover:bg-gray-600 opacity-50 hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeMouseDown}
              style={{
                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
              }}
            />
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

