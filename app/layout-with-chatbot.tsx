import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Chatbot } from "@/components/chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Reserva Deportiva - San Miguel",
  description: "Plataforma de reserva de canchas y servicios deportivos para vecinos de San Miguel",
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
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/Icono_Municipalidad_SanMiguel.jpg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}

