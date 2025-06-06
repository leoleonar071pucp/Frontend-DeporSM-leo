"use client"

import { Loader2 } from "lucide-react"

interface LoadingComponentProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingComponent({ 
  size = "md", 
  text = "Cargando...",
  className = ""
}: LoadingComponentProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}
