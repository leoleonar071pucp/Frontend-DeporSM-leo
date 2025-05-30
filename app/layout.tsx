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
import { LayoutClientWrapper } from "@/components/layout-client-wrapper" // Importar el wrapper

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Reserva Deportiva - San Miguel",
  description: "Plataforma de reserva de canchas y servicios deportivos para vecinos de San Miguel",
  generator: 'v0.dev',
  icons: {
    icon: '/images/Icono_Municipalidad_SanMiguel.jpg',
    shortcut: '/images/Icono_Municipalidad_SanMiguel.jpg',
    apple: '/images/Icono_Municipalidad_SanMiguel.jpg',
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
        <link rel="icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" />
      </head>
      <body className={inter.className}>
        <AuthProvider> {/* AuthProvider envuelve todo */}
          <NotificationProvider> {/* NotificationProvider dentro de Auth */}
            <ThemeProvider attribute="class" defaultTheme="light">
              {/* LayoutClientWrapper se encarga de renderizar children y los componentes condicionales */}
              <LayoutClientWrapper chatbot={<Chatbot />} footer={<Footer />}>
                {children}
              </LayoutClientWrapper>
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'