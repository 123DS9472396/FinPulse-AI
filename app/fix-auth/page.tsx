"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function FixAuthPage() {
  const [message, setMessage] = useState("")

  const clearStorage = () => {
    // Clear all localStorage
    localStorage.clear()
    // Clear all sessionStorage
    sessionStorage.clear()
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    
    setMessage("✅ Storage cleared! Please refresh the page.")
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setMessage("✅ Signed out successfully!")
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  const quickLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@test.com",
        password: "password123",
      })

      if (error) {
        setMessage(`Login Error: ${error.message}`)
      } else {
        setMessage("✅ Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Fix Authentication Issues</CardTitle>
            <CardDescription>
              Tools to fix multiple client instances and auth problems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={clearStorage} variant="destructive" className="w-full">
                Clear All Browser Storage
              </Button>
              <p className="text-sm text-muted-foreground">
                This will clear localStorage, sessionStorage, and cookies to fix multiple client instances.
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={signOut} variant="outline" className="w-full">
                Sign Out
              </Button>
              <p className="text-sm text-muted-foreground">
                Sign out from all Supabase sessions.
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={quickLogin} className="w-full">
                Quick Login (admin@test.com)
              </Button>
              <p className="text-sm text-muted-foreground">
                Try to login with test credentials directly.
              </p>
            </div>

            {message && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <Button 
                onClick={() => window.location.href = "/login"} 
                variant="secondary" 
                className="w-full"
              >
                Go to Login Page
              </Button>
              <Button 
                onClick={() => window.location.href = "/test-auth"} 
                variant="secondary" 
                className="w-full"
              >
                Go to Auth Test Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
