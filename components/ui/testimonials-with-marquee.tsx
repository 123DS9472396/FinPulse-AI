import React from "react"
import { cn } from "@/lib/utils"

interface TestimonialsSectionProps {
  className?: string
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Student",
      content: "FinPulse AI made complex financial concepts so easy to understand. The AI explanations are brilliant!",
      avatar: "/placeholder-user.jpg"
    },
    {
      name: "Raj Patel",
      role: "New Investor",
      content: "Finally found a platform that teaches without trying to sell me products. Exactly what I needed.",
      avatar: "/placeholder-user.jpg"
    },
    {
      name: "Anjali Singh",
      role: "Professional",
      content: "The interactive learning approach helped me make better financial decisions for my family.",
      avatar: "/placeholder-user.jpg"
    }
  ]

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-lg p-6 shadow-lg border">
              <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-muted rounded-full mr-3" />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
