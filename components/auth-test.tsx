"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

export default function AuthTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing login...')
    
    try {
      // First try the demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@finpulse.com',
        password: 'FinPulse2026!'
      })
      
      if (error) {
        setResult(`❌ Login Error: ${error.message}\n\nTrying to create the account first...`)
        
        // If login fails, try to create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@finpulse.com',
          password: 'FinPulse2026!',
          options: {
            emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
          }
        })
        
        if (signUpError) {
          setResult(`❌ Signup Error: ${signUpError.message}`)
        } else {
          setResult(`✅ Account Created! Now try logging in with:\nEmail: admin@finpulse.com\nPassword: FinPulse2026!`)
        }
      } else {
        setResult(`✅ Login Successful! User: ${data.user?.email}`)
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestAccount = async () => {
    setLoading(true)
    setResult('Creating test account...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'testuser@gmail.com',
        password: 'TestUser123!',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
        }
      })
      
      if (error) {
        setResult(`❌ Signup Error: ${error.message}`)
      } else {
        setResult(`✅ Account Created! Email: testuser@gmail.com, Password: TestUser123!`)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">FinPulse AI Auth Test</h2>
      
      <div className="space-y-4">
        <button 
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Demo Login'}
        </button>
        
        <button 
          onClick={createTestAccount}
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test Account'}
        </button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            <pre>{result}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold">Test Credentials:</h3>
        <p>📧 Email: admin@finpulse.com</p>
        <p>🔑 Password: FinPulse2026!</p>
        <hr className="my-2" />
        <p className="text-xs">Alternative: testuser@gmail.com / TestUser123!</p>
      </div>
    </div>
  )
}
