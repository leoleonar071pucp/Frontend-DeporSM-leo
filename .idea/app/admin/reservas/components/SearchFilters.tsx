"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { reservationsData } from "./data"

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearch: (e: React.FormEvent) => void
  selectedDate: Date | undefined
  handleDateFilter: (date: Date | undefined) => void
  setReservations: (reservations: any[]) => void
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  handleSearch,
  selectedDate,
  handleDateFilter,
  setReservations,
}: SearchFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-grow flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por número, usuario, instalación o DNI..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary-light">
              Buscar
            </Button>
          </form>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por instalación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setReservations(reservationsData)}>Todas</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setReservations(reservationsData.filter((r) => r.facilityName.includes("Piscina")))}
                >
                  Piscina
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setReservations(reservationsData.filter((r) => r.facilityName.includes("Fútbol")))}
                >
                  Canchas de fútbol
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setReservations(reservationsData.filter((r) => r.facilityName.includes("Gimnasio")))}
                >
                  Gimnasio
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setReservations(reservationsData.filter((r) => r.facilityName.includes("Atletismo")))
                  }
                >
                  Pista de atletismo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-0">
                <div className="p-2">
                  <CalendarComponent mode="single" selected={selectedDate} onSelect={handleDateFilter} locale={es} />
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleDateFilter(undefined)}
                    >
                      Limpiar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}