"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  BarChart3,
  Lock,
  Server,
  AlertTriangle,
  Globe,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeProvider } from "@/components/theme-provider"

export default function SuperadminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  // Cerrar sidebar automáticamente en pantallas pequeñas
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

  // Modificar la función toggleSidebar para que el sidebar siempre esté visible
  const toggleSidebar = () => {
    // Solo permitir cerrar el sidebar en pantallas pequeñas
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSubMenu = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const navItems = [
    { name: "Dashboard", href: "/superadmin", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      name: "Gestión de Usuarios",
      href: "/superadmin/usuarios",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { name: "Administradores", href: "/superadmin/usuarios/administradores", icon: <Shield className="h-4 w-4" /> },
        { name: "Coordinadores", href: "/superadmin/usuarios/coordinadores", icon: <Users className="h-4 w-4" /> },
        { name: "Vecinos", href: "/superadmin/usuarios/vecinos", icon: <Users className="h-4 w-4" /> },
      ],
    },
    {
      name: "Gestión del Sistema",
      href: "/superadmin/sistema",
      icon: <Server className="h-5 w-5" />,
      subItems: [
        {
          name: "Configuración General",
          href: "/superadmin/sistema/configuracion",
          icon: <Settings className="h-4 w-4" />,
        },
        { name: "Seguridad", href: "/superadmin/sistema/seguridad", icon: <Lock className="h-4 w-4" /> },
      ],
    },
    {
      name: "Monitoreo",
      href: "/superadmin/monitoreo",
      icon: <BarChart3 className="h-5 w-5" />,
      subItems: [
        { name: "Logs del Sistema", href: "/superadmin/monitoreo/logs", icon: <FileText className="h-4 w-4" /> },
        { name: "Alertas", href: "/superadmin/monitoreo/alertas", icon: <AlertTriangle className="h-4 w-4" /> },
      ],
    },
    { name: "Sitio Web", href: "/superadmin/sitio", icon: <Globe className="h-5 w-5" /> },
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar para escritorio */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0cb7f2] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#53d4ff]">
            <Link href="/superadmin" className="flex items-center">
              <span className="text-white text-xl font-bold">DeporSM SuperAdmin</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-grow py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`${
                          pathname.startsWith(item.href) ? "bg-[#53d4ff] text-white" : "text-white hover:bg-[#53d4ff]"
                        } group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full`}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 transition-transform ${expandedItems.includes(item.name) ? "rotate-180" : ""}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {expandedItems.includes(item.name) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`${
                                pathname === subItem.href ? "bg-[#53d4ff] text-white" : "text-white hover:bg-[#53d4ff]"
                              } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                            >
                              {subItem.icon}
                              <span className="ml-3">{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${
                        pathname === item.href ? "bg-[#53d4ff] text-white" : "text-white hover:bg-[#53d4ff]"
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

          <div className="p-4 border-t border-[#53d4ff]">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#53d4ff]" asChild>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@superadmin" />
                        <AvatarFallback className="bg-gray-800 text-white">SA</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/superadmin/perfil" className="w-full">
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/superadmin/cambiar-contrasena" className="w-full">
                        Cambiar Contraseña
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
              <div className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] overflow-y-auto">
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                  <Link href="/superadmin" className="flex items-center">
                    <span className="text-white text-xl font-bold">DeporSM SuperAdmin</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white">
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.subItems ? (
                        <>
                          <button
                            onClick={() => toggleSubMenu(item.name)}
                            className={`${
                              pathname.startsWith(item.href)
                                ? "bg-gray-800 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                            } group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full`}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3">{item.name}</span>
                            </div>
                            <svg
                              className={`h-4 w-4 transition-transform ${expandedItems.includes(item.name) ? "rotate-180" : ""}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {expandedItems.includes(item.name) && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`${
                                    pathname === subItem.href
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-300 hover:bg-gray-800"
                                  } group flex items-center px-3 py-2 text-xs font-medium rounded-md w-full`}
                                >
                                  {subItem.icon}
                                  <span className="ml-3">{subItem.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={`${
                            pathname === item.href ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
                          } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800" asChild>
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

