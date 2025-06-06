"use client"

import { useConfiguracion } from "@/context/ConfiguracionContext"

interface SiteTitleProps {
  className?: string
  withDescription?: boolean
  inline?: boolean
}

export function SiteTitle({ className = "", withDescription = false, inline = false }: SiteTitleProps) {
  const { config } = useConfiguracion();
  
  if (config.isLoading) {
    if (inline) {
      return <>DeporSM</>;
    }
    return (
      <div className={className}>
        <h1 className="text-2xl font-bold animate-pulse bg-gray-200 rounded h-8 w-40"></h1>
        {withDescription && (
          <p className="text-sm text-muted-foreground mt-1 animate-pulse bg-gray-200 rounded h-4 w-64"></p>
        )}
      </div>
    );
  }
  
  if (inline) {
    return <>{config.nombreSitio || "DeporSM"}</>;
  }
  
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">{config.nombreSitio || "DeporSM"}</h1>
      {withDescription && (
        <p className="text-sm text-muted-foreground mt-1">
          {config.descripcionSitio || "Sistema de Reservas Deportivas"}
        </p>
      )}
    </div>
  );
}
