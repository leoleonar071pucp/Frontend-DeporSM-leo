"use client"

import { useConfiguracion } from "@/context/ConfiguracionContext"

export function InfoContacto() {
  const { config } = useConfiguracion();
    if (config.isLoading) {
    return (
      <address className="not-italic text-primary-pale space-y-4">
        <p>Av. Federico Gállese Nº 370</p>
        <p>San Miguel, Lima</p>
        <p>Teléfono: <span className="animate-pulse bg-gray-600 opacity-30 rounded h-4 w-24 inline-block"></span></p>
        <p>Email: <span className="animate-pulse bg-gray-600 opacity-30 rounded h-4 w-40 inline-block"></span></p>
      </address>
    );
  }
  
  return (
    <address className="not-italic text-primary-pale space-y-4">
      <p>Av. Federico Gállese Nº 370</p>
      <p>San Miguel, Lima</p>
      <p>Teléfono: {config.telefonoContacto || "999-999-999"}</p>
      <p>Email: {config.emailContacto || "deportes@munisanmiguel.gob.pe"}</p>
    </address>
  );
}
