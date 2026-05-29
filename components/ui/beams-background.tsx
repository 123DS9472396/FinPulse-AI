import React from "react"
import { cn } from "@/lib/utils"

interface BeamsBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function BeamsBackground({ children, className }: BeamsBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />
      <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
