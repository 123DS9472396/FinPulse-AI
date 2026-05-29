"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuperSimpleTestPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    setMessage("Testing database...")

    try {
      const response = await fetch("/api/db-setup")
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ Database test: ${data.message}\nTables: ${JSON.stringify(data.tables, null, 2)}`)
      } else {
        setMessage(`❌ Database test failed: ${data.message}\nError: ${JSON.stringify(data.error, null, 2)}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testTableCreation = async () => {
    setLoading(true)
    setMessage("Testing table creation...")

    try {
      const response = await fetch("/api/db-setup", { method: "POST" })
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ Table test: ${data.message}`)
      } else {
        setMessage(`❌ Table test failed: ${data.message}\nSuggestion: ${data.suggestion}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setMessage("Testing connection...")

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from("user_profiles")
        .select("count")
        .limit(1)

      if (error) {
        setMessage(`Connection Error: ${error.message}`)
      } else {
        setMessage("✅ Connection successful!")
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    setMessage("Testing auth...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@test.com",
        password: "password123",
      })

      if (error) {
        setMessage(`Auth Error: ${error.message}`)
      } else if (data.user) {
        setMessage(`✅ Auth successful! User: ${data.user.email}`)
      } else {
        setMessage("❌ No user returned")
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    setMessage("Creating test user...")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: "admin@test.com",
        password: "password123",
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
        },
      })

      if (error) {
        setMessage(`Signup Error: ${error.message}`)
      } else if (data.user) {
        setMessage(`✅ User created! Check email: ${data.user.email}`)
      } else {
        setMessage("❌ No user returned from signup")
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Supabase Connection Test</CardTitle>
            <CardDescription>
              Test the Supabase connection and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testDatabase} disabled={loading}>
                Test Database
              </Button>
              <Button onClick={testTableCreation} disabled={loading} variant="outline">
                Test Table
              </Button>
              <Button onClick={testConnection} disabled={loading} variant="outline">
                Test Connection
              </Button>
              <Button onClick={testAuth} disabled={loading} variant="outline">
                Test Auth
              </Button>
              <Button onClick={createTestUser} disabled={loading} variant="secondary">
                Create Test User
              </Button>
            </div>

            {message && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{message}</pre>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
              <div>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
