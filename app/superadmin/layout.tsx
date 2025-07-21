"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  User,
  Users,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Loader2,

  Database,
  Server,
  Globe,
  Lock
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
import { SiteTitle } from "@/components/site-title"

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, hasRole } = useAuth()

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
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName]
    )
  }

  const navItems = [
    { name: "Dashboard", href: "/superadmin", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      name: "Usuarios",
      href: "/superadmin/usuarios",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { name: "Administradores", href: "/superadmin/usuarios/administradores", icon: <Shield className="h-4 w-4" /> },
        { name: "Coordinadores", href: "/superadmin/usuarios/coordinadores", icon: <User className="h-4 w-4" /> },
        { name: "Vecinos", href: "/superadmin/usuarios/vecinos", icon: <Users className="h-4 w-4" /> }
      ],
    },
    {
      name: "Sistema",
      href: "/superadmin/sistema",
      icon: <Server className="h-5 w-5" />,
      subItems: [
        { name: "Configuración", href: "/superadmin/sistema/configuracion", icon: <Settings className="h-4 w-4" /> },
        { name: "Seguridad", href: "/superadmin/sistema/seguridad", icon: <Lock className="h-4 w-4" /> },
      ],
    },

  ]

  // --- Protección de Ruta por Rol ---
  useEffect(() => {
    if (!isAuthLoading) { // Solo verificar después de que la carga inicial de Auth termine
      if (!isAuthenticated) {
        console.log("Usuario no autenticado, redirigiendo a login");
        router.push('/login?redirect=/superadmin'); // Redirigir a login si no está autenticado
      } else if (!hasRole('superadmin')) {
        console.warn("Acceso denegado: Usuario no es superadministrador.");
        console.log("Rol actual del usuario:", user?.rol?.nombre);

        // Forzar logout si el usuario no tiene el rol correcto
        // Esto previene que usuarios con otros roles accedan a rutas de superadmin
        if (user?.rol?.nombre && user.rol.nombre !== 'superadmin') {
          console.log("Forzando logout por acceso no autorizado a superadmin");
          logout();
          return;
        }

        // Redirigir según el rol del usuario
        if (hasRole('vecino')) {
          router.push('/');
        } else if (hasRole('admin')) {
          router.push('/admin');
        } else if (hasRole('coordinador')) {
          router.push('/coordinador');
        } else {
          router.push('/'); // Fallback a la página principal
        }
      }
    }
  }, [isAuthenticated, isAuthLoading, hasRole, router, user, logout]);

  // --- Renderizado Condicional por Carga/Autenticación/Rol ---
  if (isAuthLoading || !isAuthenticated || !hasRole('superadmin')) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0cb7f2]" />
      </div>
    );
  }

  // Generar iniciales para el avatar desde el nombre del usuario
  const userInitials = user?.nombre && user?.apellidos
    ? (user.nombre.charAt(0) + user.apellidos.charAt(0)).toUpperCase()
    : user?.nombre
      ? user.nombre.charAt(0).toUpperCase()
      : 'SA';

  // --- Renderizado Principal (Solo si es SuperAdmin) ---
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar para escritorio */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0cb7f2] transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
        >          <div className="flex items-center justify-between h-16 px-4 border-b border-[#53d4ff]">
            <Link href="/superadmin" className="flex items-center">
              <SiteTitle className="text-white" />
              <span className="text-white ml-2 font-bold">SuperAdmin</span>
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
                            ? "bg-[#53d4ff] text-white"
                            : "text-white hover:bg-[#53d4ff]"
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
                                  ? "bg-[#53d4ff] text-white"
                                  : "text-white hover:bg-[#53d4ff]"
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
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.nombre || "SuperAdmin"} />
                        <AvatarFallback className="bg-[#0cb7f2] text-white">{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user ?
                        `${user.nombre.split(' ')[0]} ${user.apellidos ? user.apellidos.split(' ')[0] : ''}`
                        : "Superadministrador"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/superadmin/perfil" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/superadmin/cambiar-contrasena" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                        Cambiar contraseña
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
              <div className="fixed inset-y-0 left-0 w-64 bg-[#0cb7f2] overflow-y-auto">
                <div className="flex items-center justify-between h-16 px-4 border-b border-[#53d4ff]">
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
                                ? "bg-[#53d4ff] text-white"
                                : "text-white hover:bg-[#53d4ff]"
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
                                      ? "bg-[#53d4ff] text-white"
                                      : "text-white hover:bg-[#53d4ff]"
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

                <div className="p-4 border-t border-[#53d4ff]">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#53d4ff]" asChild>
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

