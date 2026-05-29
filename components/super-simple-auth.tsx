"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

export default function SuperSimpleAuth() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const testEverything = async () => {
    setLoading(true)
    setResult('Starting comprehensive test...\n')
    
    try {
      // Test 1: Check connection
      setResult(prev => prev + '1. Testing Supabase connection...\n')
      const { data: sessionData } = await supabase.auth.getSession()
      setResult(prev => prev + `✅ Connection OK. Current session: ${sessionData.session ? 'Yes' : 'None'}\n\n`)
      
      // Test 2: Sign out everything
      setResult(prev => prev + '2. Signing out all sessions...\n')
      await supabase.auth.signOut()
      setResult(prev => prev + '✅ Signed out\n\n')
      
      // Test 3: Try creating account with very simple email
      const testEmail = 'admin@test.com'
      const testPassword = 'password123'
      
      setResult(prev => prev + `3. Creating account: ${testEmail}\n`)
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: 'http://localhost:3000/dashboard'
        }
      })
      
      if (signUpError) {
        setResult(prev => prev + `❌ Signup failed: ${signUpError.message}\n\n`)
      } else {
        setResult(prev => prev + `✅ Signup successful!\n`)
        setResult(prev => prev + `User ID: ${signUpData.user?.id}\n`)
        setResult(prev => prev + `Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}\n\n`)
      }
      
      // Test 4: Immediate login attempt
      setResult(prev => prev + '4. Attempting immediate login...\n')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        setResult(prev => prev + `❌ Login failed: ${signInError.message}\n`)
        setResult(prev => prev + `\n🔍 This suggests email confirmation is REQUIRED.\n`)
        setResult(prev => prev + `\n📧 SOLUTION: Go to Supabase Auth Settings and disable email confirmation.\n\n`)
      } else {
        setResult(prev => prev + `🎉 LOGIN SUCCESSFUL!\n`)
        setResult(prev => prev + `✅ Email: ${testEmail}\n`)
        setResult(prev => prev + `✅ Password: ${testPassword}\n`)
        setResult(prev => prev + `✅ User: ${signInData.user?.email}\n\n`)
        setResult(prev => prev + `🚀 Redirecting to dashboard in 3 seconds...\n`)
        
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      }
      
    } catch (err) {
      setResult(prev => prev + `❌ Unexpected error: ${err}\n`)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async () => {
    setLoading(true)
    setResult('Trying quick login with admin@test.com...\n')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'password123'
      })
      
      if (error) {
        setResult(prev => prev + `❌ Login failed: ${error.message}\n`)
      } else {
        setResult(prev => prev + `🎉 Quick login successful!\n`)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (err) {
      setResult(prev => prev + `❌ Error: ${err}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-2xl w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">🔐 Super Simple Auth Test</h1>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={testEverything}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing Everything...' : '🧪 Complete Auth Test'}
          </button>
          
          <button 
            onClick={quickLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : '⚡ Quick Login (admin@test.com)'}
          </button>
        </div>
        
        {result && (
          <div className="bg-black/30 rounded-lg p-4 text-white font-mono text-sm max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-100 text-sm">
          <h3 className="font-bold mb-2">🎯 Quick Fix Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>In your Supabase dashboard, go to <strong>Authentication → Settings</strong></li>
            <li>Find <strong>"Enable email confirmations"</strong> and turn it <strong>OFF</strong></li>
            <li>Click <strong>Save</strong></li>
            <li>Come back here and click <strong>"🧪 Complete Auth Test"</strong></li>
            <li>If successful, use: <strong>admin@test.com</strong> / <strong>password123</strong></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
