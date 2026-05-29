"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

export default function DatabaseCleanup() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const testConnection = async () => {
    setLoading(true)
    setResult('Testing Supabase connection...')
    
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setResult(`❌ Connection Error: ${error.message}`)
      } else {
        setResult(`✅ Connection successful!\nCurrent session: ${data.session ? 'Logged in' : 'Not logged in'}`)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const signOutAll = async () => {
    setLoading(true)
    setResult('Signing out all sessions...')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setResult(`❌ Signout Error: ${error.message}`)
      } else {
        setResult(`✅ Signed out successfully!`)
        // Clear local storage
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createFreshAccount = async () => {
    setLoading(true)
    setResult('Creating fresh account with unique email...')
    
    try {
      // Generate unique email
      const timestamp = Date.now()
      const email = `user${timestamp}@aiphen.demo`
      const password = 'AIPhenUser123!'
      
      setResult(`Creating account with email: ${email}`)
      
      // Sign out first
      await supabase.auth.signOut()
      
      // Create new account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
        }
      })
      
      if (signUpError) {
        setResult(`❌ Signup Error: ${signUpError.message}`)
        return
      }

      setResult(`✅ Account created successfully!\n📧 Email: ${email}\n🔑 Password: ${password}\n\nTesting immediate login...`)
      
      // Try immediate login (this should work if email confirmation is disabled)
      setTimeout(async () => {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })
        
        if (signInError) {
          setResult(`✅ Account created: ${email}\n❌ Login failed: ${signInError.message}\n\n🔍 Email confirmation might be required. Check Supabase settings.`)
        } else {
          setResult(`🎉 COMPLETE SUCCESS!\n📧 Email: ${email}\n🔑 Password: ${password}\n✅ Logged in successfully!\n\nRedirecting to dashboard...`)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 3000)
        }
      }, 2000)
      
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const trySimpleLogin = async () => {
    setLoading(true)
    setResult('Trying simple login with test credentials...')
    
    try {
      // Try with a simple test account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      
      if (error) {
        setResult(`❌ Simple login failed: ${error.message}\n\nTrying to create this test account...`)
        
        // Create simple test account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'password123'
        })
        
        if (signUpError) {
          setResult(`❌ Test account creation failed: ${signUpError.message}`)
        } else {
          setResult(`✅ Test account created!\n📧 Email: test@example.com\n🔑 Password: password123\n\nNow try logging in manually.`)
        }
      } else {
        setResult(`🎉 Simple login successful!\nRedirecting to dashboard...`)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-lg w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">🗑️ Database Cleanup & Fresh Start</h1>
        
        <div className="space-y-3">
          <button 
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing...' : '🔍 Test Connection'}
          </button>
          
          <button 
            onClick={signOutAll}
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing out...' : '🚪 Sign Out All Sessions'}
          </button>
          
          <button 
            onClick={createFreshAccount}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : '🆕 Create Fresh Account'}
          </button>
          
          <button 
            onClick={trySimpleLogin}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing...' : '🧪 Try Simple Login'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-black/30 rounded-lg text-white text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 text-white/80 text-xs">
          <h3 className="font-semibold text-white mb-2">Manual Cleanup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to your Supabase dashboard</li>
            <li>Navigate to Authentication → Users</li>
            <li>Delete all test users</li>
            <li>Check Authentication → Settings</li>
            <li>Disable "Enable email confirmations" if enabled</li>
            <li>Come back and try "Create Fresh Account"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
