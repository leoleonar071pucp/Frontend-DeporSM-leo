"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, X, Calendar, Info, CheckCircle, User, LogIn, LogOut, UserPlus, Loader2, FileText } from "lucide-react" // Added icons
import { Button, buttonVariants } from "@/components/ui/button" // Importar buttonVariants
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { useNotification } from "@/context/NotificationContext" // Import useNotification
import { cn } from "@/lib/utils" // Importar cn
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

// Datos de ejemplo eliminados, vienen del contexto

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, logout, isLoading, isLoggingOut } = useAuth() // Agregar isLoggingOut
  const { notifications, unreadCount: contextUnreadCount } = useNotification() // Get notification state

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Línea eliminada: const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <Info className="h-5 w-5 text-yellow-500" />
      case "reporte":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "info":
      default:
        return <Calendar className="h-5 w-5 text-primary" />
    }
  }

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Instalaciones", href: "/instalaciones" },
    // { name: "Mis Reservas", href: "/mis-reservas" }, // Conditionally shown later or protected
    { name: "Contacto", href: "/contacto" },
  ]

  return (
    <nav className="bg-primary sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                DeporSM
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Renderizar enlaces en orden específico */}
                {/* Inicio */}
                <Link
                  key="Inicio"
                  href="/"
                  className={`${
                    pathname === "/" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Inicio
                </Link>
                {/* Instalaciones */}
                <Link
                  key="Instalaciones"
                  href="/instalaciones"
                  className={`${
                    pathname === "/instalaciones" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Instalaciones
                </Link>
                {/* Mis Reservas (condicional) */}
                {isAuthenticated && (
                   <Link
                    key="Mis Reservas"
                    href="/mis-reservas"
                    className={`${
                      pathname === "/mis-reservas" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Mis Reservas
                  </Link>
                )}
                {/* Contacto */}
                 <Link
                  key="Contacto"
                  href="/contacto"
                  className={`${
                    pathname === "/contacto" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-2"> {/* Added space-x-2 */}
              {/* Notificaciones (solo si está autenticado) */}
              {isAuthenticated && (
                <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-white hover:bg-primary-light">
                      <Bell className="h-5 w-5" />
                      {/* Usar contextUnreadCount */}
                      {contextUnreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                          {contextUnreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notificaciones</span>
                      <Link
                        href="/notificaciones"
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
                          <DropdownMenuItem key={notification.id} className="p-0 cursor-pointer">
                            <div className={`w-full p-3 ${notification.read ? "opacity-70" : "bg-primary-background"}`}>
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                    <span className="text-xs text-gray-500">{notification.date}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                </div>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Menú de Usuario o Botones de Login/Registro */}
              {isLoading ? (
                 <Button variant="ghost" size="icon" className="relative text-white" disabled>
                    <Loader2 className="h-5 w-5 animate-spin" />
                 </Button>
              ) : isAuthenticated && user ? (
                <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full ml-2 hover:bg-primary-light">
                      <Avatar>
                        {/* Idealmente usar user.avatarUrl si existe */}
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.nombre || ""} />
                        <AvatarFallback className="bg-primary-light text-white">
                          {/* Generar iniciales */}
                          {user?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || <User />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.nombre || "Mi Cuenta"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/perfil" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" /> Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                       <Link href="/notificaciones" className="w-full flex items-center" onClick={() => setIsProfileMenuOpen(false)}>
                         <Bell className="mr-2 h-4 w-4" /> Notificaciones
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={() => { logout(); setIsProfileMenuOpen(false); }} 
                      className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 flex items-center"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cerrando sesión...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Aplicar estilos de botón directamente a Link, eliminar Button y asChild */}
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-white text-primary hover:bg-white hover:text-primary" // Clases específicas adicionales
                    )}
                  >
                    <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                  </Link>
                  {/* Aplicar estilos de botón directamente a Link, eliminar Button y asChild */}
                  <Link
                    href="/registro"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }), // Usar variant default para que cn aplique estilos base
                      "bg-white text-primary hover:bg-gray-200" // Clases específicas adicionales
                    )}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                    </Link>
                  {/* </Button> <- Etiqueta eliminada */}
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Renderizar enlaces en orden específico (móvil) */}
            {/* Inicio */}
            <Link
              key="Inicio"
              href="/"
              className={`${
                pathname === "/" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={toggleMenu}
            >
              Inicio
            </Link>
            {/* Instalaciones */}
            <Link
              key="Instalaciones"
              href="/instalaciones"
              className={`${
                pathname === "/instalaciones" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={toggleMenu}
            >
              Instalaciones
            </Link>
            {/* Mis Reservas (condicional) */}
            {isAuthenticated && (
               <Link
                key="Mis Reservas"
                href="/mis-reservas"
                 className={`${
                  pathname === "/mis-reservas" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={toggleMenu}
              >
                Mis Reservas
              </Link>
             )}
             {/* Contacto */}
             <Link
              key="Contacto"
              href="/contacto"
              className={`${
                pathname === "/contacto" ? "bg-primary-light text-white" : "text-white hover:bg-primary-light"
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={toggleMenu}
            >
              Contacto
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-primary-light">
            {isLoading ? (
               <div className="px-5 py-2">
                 <Loader2 className="h-5 w-5 animate-spin text-white" />
               </div>
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.nombre || ""} />
                       <AvatarFallback className="bg-primary-light text-white">
                          {user?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || <User />}
                       </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.nombre}</div>
                    <div className="text-sm font-medium text-primary-pale">{user?.email}</div>
                  </div>
                  <Link href="/notificaciones" className="ml-auto relative" onClick={toggleMenu}>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Bell className="h-6 w-6" />
                      {/* Usar contextUnreadCount */}
                      {contextUnreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                          {contextUnreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/perfil"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
                    onClick={toggleMenu}
                  >
                    Perfil
                  </Link>
                  <Link
                    href="/notificaciones"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
                    onClick={toggleMenu}
                  >
                    Notificaciones
                  </Link>
                  <button // Usar button para llamar a logout
                    onClick={() => { logout(); toggleMenu(); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-primary-light hover:text-red-100"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cerrando sesión...
                      </span>
                    ) : (
                      "Cerrar Sesión"
                    )}
                  </button>
                </div>
              </>
            ) : (
               <div className="px-2 space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
                    onClick={toggleMenu}
                  >
                    Iniciar Sesión
                  </Link>
                   <Link
                    href="/registro"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
                    onClick={toggleMenu}
                  >
                    Registrarse
                  </Link>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

