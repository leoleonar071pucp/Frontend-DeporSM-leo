"use client"

import { useConfiguracion } from "@/context/ConfiguracionContext"
import { useEffect } from "react"

interface MetadataGeneratorProps {
  baseTitle?: string;
  title?: string;
  description?: string;
}

export function MetadataGenerator({ baseTitle, title, description }: MetadataGeneratorProps) {
  const { config } = useConfiguracion()

  useEffect(() => {
    // Update the document title based on the configuration
    if (config.nombreSitio) {
      // If a direct title is provided, use that
      const finalTitle = title || (baseTitle 
        ? `${baseTitle} | ${config.nombreSitio}` 
        : config.nombreSitio)
      document.title = finalTitle
      
      // Update meta description if provided
      if (description) {
        // Find existing description meta tag or create a new one
        let metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
          metaDescription = document.createElement('meta')
          metaDescription.setAttribute('name', 'description')
          document.head.appendChild(metaDescription)
        }
        metaDescription.setAttribute('content', description)
      }
    }
  }, [config.nombreSitio, baseTitle, title, description])

  return null
}
