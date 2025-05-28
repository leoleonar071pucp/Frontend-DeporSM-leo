"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getStatusBadge, getPaymentStatusBadge } from "./utils"
import { API_BASE_URL } from "@/lib/config"
import { Calendar, Clock, MapPin, User, CreditCard, CheckCircle, Info, FileText, Eye, Download } from "lucide-react"

// Función utilitaria para detectar el tipo de archivo
const getFileType = (url: string): 'image' | 'pdf' | 'unknown' => {
  if (!url) return 'unknown';

  const extension = url.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    return 'image';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  return 'unknown';
};

// Función para obtener el nombre del archivo
const getFileName = (url: string): string => {
  if (!url) return 'comprobante';

  const fileName = url.split('/').pop() || 'comprobante';
  return fileName.split('?')[0]; // Remover query parameters si existen
};

interface ReservationDetailsProps {
  showDetailsDialog: boolean
  setShowDetailsDialog: (show: boolean) => void
  selectedReservation: any
  setShowApproveDialog: (show: boolean) => void
  setShowCancelDialog: (show: boolean) => void
}

export default function ReservationDetails({
  showDetailsDialog,
  setShowDetailsDialog,
  selectedReservation,
  setShowApproveDialog,
  setShowCancelDialog,
}: ReservationDetailsProps) {
  return (
    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Reserva</DialogTitle>
          <DialogDescription>
            Información completa de la reserva #{selectedReservation?.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        {selectedReservation && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={selectedReservation.facilityImage || "/placeholder.svg"}
                  alt={selectedReservation.facilityName}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{selectedReservation.facilityName}</h3>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedReservation.status)}
                    {getPaymentStatusBadge(selectedReservation.paymentStatus)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p>{selectedReservation.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p>{selectedReservation.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p>{selectedReservation.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de creación</p>
                      <p>{selectedReservation.createdAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Datos del Usuario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre completo</p>
                    <p>{selectedReservation.userDetails.name || "No disponible"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p>{selectedReservation.userDetails.dni || "No disponible"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p>{selectedReservation.userDetails.email || "No disponible"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p>{selectedReservation.userDetails.phone || "No disponible"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Detalles del Pago</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-700 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  El precio se calcula multiplicando el precio por hora de la instalación por la duración de la reserva.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-500">Método de pago</p>
                    <p>{selectedReservation.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-500">Estado del pago</p>
                    <p>{selectedReservation.paymentStatus}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="font-medium">{selectedReservation.paymentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de pago</p>
                  <p>{selectedReservation.paymentDate || "Pendiente"}</p>
                </div>

                {/* Mostrar cálculo del precio */}
                <div className="md:col-span-2 bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Cálculo del precio:</span> {selectedReservation.time} ({selectedReservation.paymentAmount})
                  </p>
                </div>

                {/* Mostrar comprobante de pago si existe */}
                {selectedReservation.urlComprobante && (
                  <div className="md:col-span-2 mt-2">
                    <p className="text-sm text-gray-500 mb-2 font-medium">Comprobante de pago</p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {(() => {
                        const fileUrl = (() => {
                          const url = selectedReservation.urlComprobante;
                          if (!url) return '';

                          // Si ya es una URL completa de Supabase, usarla directamente
                          if (url.startsWith('http')) return url;

                          // Si es una URL relativa del backend local, concatenar con API_BASE_URL
                          if (url.startsWith('/')) {
                            const baseUrl = API_BASE_URL.replace('/api', '');
                            return `${baseUrl}${url}`;
                          }

                          // En cualquier otro caso, concatenar normalmente
                          return `${API_BASE_URL}/${url}`;
                        })();

                        const fileType = getFileType(fileUrl);
                        const fileName = getFileName(fileUrl);

                        if (fileType === 'image') {
                          // Mostrar imagen
                          return (
                            <div className="flex items-center justify-center">
                              <img
                                src={fileUrl}
                                alt="Comprobante de pago"
                                className="max-w-full h-auto max-h-96 rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?text=Comprobante+no+disponible";
                                  target.alt = "Comprobante no disponible";
                                }}
                              />
                            </div>
                          );
                        } else if (fileType === 'pdf') {
                          // Mostrar vista de PDF
                          return (
                            <div className="flex flex-col items-center space-y-4">
                              <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-lg">
                                <FileText className="h-10 w-10 text-red-600" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-gray-900 mb-1">Comprobante PDF</p>
                                <p className="text-sm text-gray-600 mb-3">{fileName}</p>
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(fileUrl, '_blank')}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Ver PDF
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = fileUrl;
                                      link.download = fileName;
                                      link.click();
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Download className="h-4 w-4" />
                                    Descargar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Tipo de archivo desconocido
                          return (
                            <div className="flex flex-col items-center space-y-4">
                              <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                                <FileText className="h-10 w-10 text-gray-600" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-gray-900 mb-1">Comprobante</p>
                                <p className="text-sm text-gray-600 mb-3">{fileName}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  Abrir archivo
                                </Button>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedReservation.additionalInfo && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Información adicional</h3>
                  <p className="text-gray-700">{selectedReservation.additionalInfo}</p>
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <h4 className="text-md font-medium text-blue-800 mb-2">Información importante</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">El usuario debe presentar su comprobante de reserva al llegar a la instalación.</p>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">Se recomienda llegar con al menos 10 minutos de anticipación.</p>
                </li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
            Cerrar
          </Button>
          {selectedReservation?.status === "pendiente" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setShowDetailsDialog(false)
                setShowApproveDialog(true)
              }}
            >
              Aprobar Reserva
            </Button>
          )}
          {(selectedReservation?.status === "pendiente" || selectedReservation?.status === "confirmada") && (
            <Button
              variant="destructive"
              onClick={() => {
                setShowDetailsDialog(false)
                setShowCancelDialog(true)
              }}
            >
              Cancelar Reserva
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}