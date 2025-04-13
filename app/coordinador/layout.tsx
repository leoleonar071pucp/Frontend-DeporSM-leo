"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeProvider } from "@/components/theme-provider"

// Datos de ejemplo para las notificaciones
const notifications = [
  {
    id: 1,
    title: "Nueva instalación asignada",
    message: "Se te ha asignado la Cancha de Fútbol (Grass)",
    date: "Hace 10 minutos",
    read: false,
  },
  {
    id: 2,
    title: "Recordatorio de inspección",
    message: "Tienes una inspección programada para la Piscina Municipal mañana",
    date: "Hace 2 horas",
    read: false,
  },
  {
    id: 3,
    title: "Observación aprobada",
    message: "Tu observación sobre la Pista de Atletismo ha sido aprobada",
    date: "Hace 5 horas",
    read: true,
  },
]

export default function CoordinadorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  // Cerrar sidebar automáticamente en pantallas pequeñas
  const toggleSidebar = () => {
    // Solo permitir cerrar el sidebar en pantallas pequeñas
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  // Modificar el useEffect para que el sidebar siempre esté visible en pantallas grandes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // En móviles, puede estar cerrado
      } else {
        // En pantallas grandes, siempre visible
        setIsSidebarOpen(true)
      }
    }

    // Configuración inicial
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSubMenu = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const navItems = [
    { name: "Dashboard", href: "/coordinador", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Instalaciones Asignadas", href: "/coordinador/instalaciones", icon: <MapPin className="h-5 w-5" /> },
    { name: "Asistencia", href: "/coordinador/asistencia", icon: <Calendar className="h-5 w-5" /> },
    { name: "Observaciones", href: "/coordinador/observaciones", icon: <ClipboardList className="h-5 w-5" /> },
    { name: "Configuración", href: "/coordinador/configuracion", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar para escritorio */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-light">
            <Link href="/coordinador" className="flex items-center">
              <span className="text-white text-xl font-bold">DeporSM Coordinador</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-grow py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.name === "Instalaciones Asignadas" ? (
                    <>
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`${
                          pathname.startsWith(item.href)
                            ? "bg-primary-light text-white"
                            : "text-white hover:bg-primary-light"
                        } group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full`}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.includes(item.name) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expandedItems.includes(item.name) && (
                        <div className="ml-6 mt-1 space-y-1">
                          <Link
                            href="/coordinador/instalaciones"
                            className={`${
                              pathname === "/coordinador/instalaciones"
                                ? "bg-primary-light text-white"
                                : "text-white hover:bg-primary-light"
                            } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                          >
                            <MapPin className="h-4 w-4" />
                            <span className="ml-3">Ver todas</span>
                          </Link>
                          <Link
                            href="/coordinador/instalaciones/mapa"
                            className={`${
                              pathname === "/coordinador/instalaciones/mapa"
                                ? "bg-primary-light text-white"
                                : "text-white hover:bg-primary-light"
                            } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                          >
                            <MapPin className="h-4 w-4" />
                            <span className="ml-3">Mapa</span>
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${
                        pathname === item.href || pathname.startsWith(item.href + "/")
                          ? "bg-primary-light text-white"
                          : "text-white hover:bg-primary-light"
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-primary-light">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-primary-light" asChild>
              <Link href="/logout">
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar sesión
              </Link>
            </Button>
          </div>
        </aside>

        {/* Header y contenido principal */}
        <div
          className={`flex flex-col ${isSidebarOpen ? "lg:ml-64" : "ml-0"} min-h-screen transition-all duration-300`}
        >
          <header className="bg-white shadow-sm z-40">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
                  <Menu className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notificaciones</span>
                      <Link
                        href="/coordinador/notificaciones"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        Ver todas
                      </Link>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[300px]">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-0">
                            <div className={`w-full p-3 ${notification.read ? "opacity-70" : "bg-primary-background"}`}>
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <span className="text-xs text-gray-500">{notification.date}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@coordinador" />
                        <AvatarFallback className="bg-primary-light text-white">CO</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/coordinador/perfil" className="w-full">
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/coordinador/configuracion" className="w-full">
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/logout" className="w-full">
                        Cerrar Sesión
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Menú móvil */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
              <div className="fixed inset-y-0 left-0 w-64 bg-primary overflow-y-auto">
                <div className="flex items-center justify-between h-16 px-4 border-b border-primary-light">
                  <Link href="/coordinador" className="flex items-center">
                    <span className="text-white text-xl font-bold">DeporSM Coordinador</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white">
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.name === "Instalaciones Asignadas" ? (
                        <>
                          <button
                            onClick={() => toggleSubMenu(item.name)}
                            className={`${
                              pathname.startsWith(item.href)
                                ? "bg-primary-light text-white"
                                : "text-white hover:bg-primary-light"
                            } group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full`}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3">{item.name}</span>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedItems.includes(item.name) ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {expandedItems.includes(item.name) && (
                            <div className="ml-6 mt-1 space-y-1">
                              <Link
                                href="/coordinador/instalaciones"
                                className={`${
                                  pathname === "/coordinador/instalaciones"
                                    ? "bg-primary-light text-white"
                                    : "text-white hover:bg-primary-light"
                                } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                                onClick={toggleMobileMenu}
                              >
                                <MapPin className="h-4 w-4" />
                                <span className="ml-3">Ver todas</span>
                              </Link>
                              <Link
                                href="/coordinador/instalaciones/mapa"
                                className={`${
                                  pathname === "/coordinador/instalaciones/mapa"
                                    ? "bg-primary-light text-white"
                                    : "text-white hover:bg-primary-light"
                                } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                                onClick={toggleMobileMenu}
                              >
                                <MapPin className="h-4 w-4" />
                                <span className="ml-3">Mapa</span>
                              </Link>
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={`${
                            pathname === item.href || pathname.startsWith(item.href + "/")
                              ? "bg-primary-light text-white"
                              : "text-white hover:bg-primary-light"
                          } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                          onClick={toggleMobileMenu}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-primary-light">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-primary-light" asChild>
                    <Link href="/logout">
                      <LogOut className="h-5 w-5 mr-3" />
                      Cerrar sesión
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <main className="flex-grow p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}

