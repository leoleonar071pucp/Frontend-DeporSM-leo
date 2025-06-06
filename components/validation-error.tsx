"use client"

import { AlertCircle } from "lucide-react"

interface ValidationErrorProps {
  message: string | null
}

export function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null
  
  return (
    <div className="bg-red-50 p-3 rounded-md mb-4 border border-red-200">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  )
}
