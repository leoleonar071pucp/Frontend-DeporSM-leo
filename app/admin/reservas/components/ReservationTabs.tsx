"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReservationsTable from "./ReservationsTable"

interface ReservationTabsProps {
  activeTab: string
  handleTabChange: (value: string) => void
  reservations: any[]
  handleViewDetails: (reservation: any) => void
  setSelectedReservation: (reservation: any) => void
  setShowApproveDialog: (show: boolean) => void
  setShowCancelDialog: (show: boolean) => void
  searchQuery: string
  selectedDate: Date | undefined
  setSearchQuery: (query: string) => void
  setSelectedDate: (date: Date | undefined) => void
  setReservations: (reservations: any[]) => void
  reservationsData: any[]
}

export default function ReservationTabs({
  activeTab,
  handleTabChange,
  reservations,
  handleViewDetails,
  setSelectedReservation,
  setShowApproveDialog,
  setShowCancelDialog,
  searchQuery,
  selectedDate,
  setSearchQuery,
  setSelectedDate,
  setReservations,
  reservationsData,
}: ReservationTabsProps) {
  return (
    <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="todas">Todas</TabsTrigger>
        <TabsTrigger value="confirmadas">Confirmadas</TabsTrigger>
        <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
        <TabsTrigger value="completadas">Completadas</TabsTrigger>
        <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-4">
        <ReservationsTable
          reservations={reservations}
          handleViewDetails={handleViewDetails}
          setSelectedReservation={setSelectedReservation}
          setShowApproveDialog={setShowApproveDialog}
          setShowCancelDialog={setShowCancelDialog}
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          setSearchQuery={setSearchQuery}
          setSelectedDate={setSelectedDate}
          setReservations={setReservations}
          reservationsData={reservationsData}
        />
      </TabsContent>
    </Tabs>
  )
}