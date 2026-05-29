import React from "react"
import { cn } from "@/lib/utils"

interface GradientPathCardProps {
  children: React.ReactNode
  className?: string
}

export function GradientPathCard({ children, className }: GradientPathCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-6 shadow-lg",
      "bg-gradient-to-br from-background via-background to-muted/50",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
