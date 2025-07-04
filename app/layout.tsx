// Quitar "use client"

import type React from "react"
// Quitar usePathname
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext" // Importar AuthProvider
import { Chatbot } from "@/components/chatbot"
import { Footer } from "@/components/footer" // Importar Footer
import { NotificationProvider } from "@/context/NotificationContext"
import { ConfiguracionProvider } from "@/context/ConfiguracionContext" // Importar proveedor de configuración
import { LayoutClientWrapper } from "@/components/layout-client-wrapper" // Importar el wrapper
import { MetadataGenerator } from "@/components/metadata-generator" // Importar el generador de metadatos
import { Toaster } from "@/components/ui/toaster" // Importar Toaster
import { SessionMonitor } from "@/components/session-monitor" // Importar monitor de sesión

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Reserva Deportiva - San Miguel",
  description: "Plataforma de reserva de canchas y servicios deportivos para vecinos de San Miguel",
  generator: 'v0.dev',
  icons: {
    icon: '/images/Icono_Municipalidad_SanMiguel.png',
    shortcut: '/images/Icono_Municipalidad_SanMiguel.png',
    apple: '/images/Icono_Municipalidad_SanMiguel.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Quitar lógica de pathname e isInternalRoute
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/Icono_Municipalidad_SanMiguel.png" type="image/png" />
        <link rel="shortcut icon" href="/images/Icono_Municipalidad_SanMiguel.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/Icono_Municipalidad_SanMiguel.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider> {/* AuthProvider envuelve todo */}
          <SessionMonitor /> {/* Monitor de sesión para detectar desactivaciones */}
          <ConfiguracionProvider> {/* ConfiguracionProvider dentro de Auth */}
            <NotificationProvider> {/* NotificationProvider dentro de ConfiguracionProvider */}
              <ThemeProvider attribute="class" defaultTheme="light">
                {/* LayoutClientWrapper se encarga de renderizar children y los componentes condicionales */}
                <LayoutClientWrapper chatbot={<Chatbot />} footer={<Footer />}>
                  <MetadataGenerator baseTitle={metadata.title as string} />
                  {children}
                </LayoutClientWrapper>
                <Toaster />
              </ThemeProvider>
            </NotificationProvider>
          </ConfiguracionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}