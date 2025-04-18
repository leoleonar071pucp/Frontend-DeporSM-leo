"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useNotification } from "@/context/NotificationContext"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  PlusSquare,
  CheckSquare,
  Loader2,
  ClipboardList,
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

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotification()

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      name: "Instalaciones",
      href: "/admin/instalaciones",
      icon: <Calendar className="h-5 w-5" />,
      subItems: [
        { name: "Ver todas", href: "/admin/instalaciones", icon: <CheckSquare className="h-4 w-4" /> },
        { name: "Agregar nueva", href: "/admin/instalaciones/nueva", icon: <PlusSquare className="h-4 w-4" /> },
        { name: "Mantenimiento", href: "/admin/instalaciones/mantenimiento", icon: <Settings className="h-4 w-4" /> },
      ],
    },
    { name: "Reservas", href: "/admin/reservas", icon: <Users className="h-5 w-5" /> },
    { name: "Coordinadores", href: "/admin/coordinadores", icon: <Users className="h-5 w-5" /> },
    { name: "Observaciones", href: "/admin/observaciones", icon: <ClipboardList className="h-5 w-5" /> },
    { name: "Reportes", href: "/admin/reportes", icon: <FileText className="h-5 w-5" /> },
    { name: "Configuración", href: "/admin/configuracion", icon: <Settings className="h-5 w-5" /> },
  ]

  // --- Protección de Ruta por Rol ---
  useEffect(() => {
    if (!isAuthLoading) { // Solo verificar después de que la carga inicial de Auth termine
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin'); // Redirigir a login si no está autenticado
      } else if (user?.role !== 'admin') {
        console.warn("Acceso denegado: Usuario no es administrador.");
        // Redirigir a una página de 'no autorizado' o a la página principal del usuario
        // Por ahora, redirigimos a la página principal como ejemplo
        router.push('/');
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  // --- Renderizado Condicional por Carga/Autenticación/Rol ---
  // Muestra un loader mientras carga o si el usuario no es admin (antes de redirigir)
  if (isAuthLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Renderizado Principal (Solo si es Admin) ---
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar para escritorio */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-light">
            <Link href="/admin" className="flex items-center">
              <span className="text-white text-xl font-bold">DeporSM Admin</span>
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
                          className={`h-4 w-4 transition-transform ${expandedItems.includes(item.name) ? "rotate-180" : ""}`}
                        />
                      </button>

                      {expandedItems.includes(item.name) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`${
                                pathname === subItem.href
                                  ? "bg-primary-light text-white"
                                  : "text-white hover:bg-primary-light"
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
                        pathname === item.href ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
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
              <button onClick={logout} className="w-full flex items-center text-left">
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar sesión
              </button>
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
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
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
                        href="/admin/notificaciones"
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
                          <DropdownMenuItem key={notification.id} className="p-0" onSelect={() => !notification.read && markAsRead(notification.id)}>
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

                <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.nombre || "Admin"} />
                        <AvatarFallback className="bg-primary-light text-white">AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.nombre || "Administrador"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin/perfil" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin/configuracion" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => { logout(); setIsProfileMenuOpen(false); }} className="cursor-pointer">
                      Cerrar Sesión
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
                  <Link href="/admin" className="flex items-center">
                    <span className="text-white text-xl font-bold">DeporSM Admin</span>
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
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`${
                                    pathname === subItem.href
                                      ? "bg-primary-light text-white"
                                      : "text-white hover:bg-primary-light"
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
                            pathname === item.href ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                          } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
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
                    <button onClick={logout} className="w-full flex items-center text-left">
                      <LogOut className="h-5 w-5 mr-3" />
                      Cerrar sesión
                    </button>
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

