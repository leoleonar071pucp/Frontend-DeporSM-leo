import type React from "react"
import { InfoIcon } from "lucide-react"

export function Info({ children }: { children: React.ReactNode }) {
  return <InfoIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
}

