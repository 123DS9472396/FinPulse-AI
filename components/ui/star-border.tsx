import React from "react"
import { cn } from "@/lib/utils"

interface StarBorderProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function StarBorder({ children, className, color = "border-yellow-500/20" }: StarBorderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border p-6",
      "bg-gradient-to-br from-background via-background to-yellow-500/5",
      color,
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 opacity-50" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
