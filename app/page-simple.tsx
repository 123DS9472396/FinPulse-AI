"use client"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">FinPulse AI - AI-Powered Financial Assistant</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Empowering financial literacy through AI-driven education and insights
          </p>
          <Button>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
