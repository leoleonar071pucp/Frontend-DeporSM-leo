"use client"

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/config'
import { apiGet } from '@/lib/api-client'

export default function CorsTestPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [authData, setAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Test health endpoint
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (healthResponse.ok) {
          const data = await healthResponse.json()
          setHealthData(data)
        } else {
          setError(`Error en health check: ${healthResponse.status} ${healthResponse.statusText}`)
        }

        // Test auth endpoint
        try {
          const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })

          if (authResponse.ok) {
            const data = await authResponse.json()
            setAuthData(data)
          } else {
            console.log('No autenticado o error en auth:', authResponse.status)
          }
        } catch (authError) {
          console.error('Error al verificar autenticación:', authError)
        }

      } catch (err) {
        setError(`Error de conexión: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Prueba de CORS y Cookies</h1>
      
      {loading && <p className="text-gray-600">Cargando...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {healthData && (
        <div className="bg-white shadow-md rounded p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">Health Check</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado de Autenticación</h2>
        {authData ? (
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(authData, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-600">No autenticado o error al obtener datos de autenticación</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Información de Configuración</h2>
        <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
        <p><strong>Navegador:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'No disponible'}</p>
      </div>
    </div>
  )
}
