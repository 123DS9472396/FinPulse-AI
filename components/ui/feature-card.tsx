import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color?: string
  className?: string
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color = "from-blue-500/20 to-cyan-500/20", 
  className 
}: FeatureCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", color)} />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
