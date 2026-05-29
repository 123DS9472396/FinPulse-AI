"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

export default function QuickAuth() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const createWorkingAccount = async () => {
    setLoading(true)
    setResult('Creating your working account...')
    
    try {
      // Create account with your email
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'bhiwandidiesel@gmail.com',
        password: 'BhiwandiUser123!',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
        }
      })
      
      if (signUpError) {
        setResult(`❌ Signup Error: ${signUpError.message}`)
        return
      }

      setResult(`✅ Account created! Now testing login...`)
      
      // Wait a moment then try to login
      setTimeout(async () => {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'bhiwandidiesel@gmail.com',
          password: 'BhiwandiUser123!'
        })
        
        if (signInError) {
          setResult(`✅ Account created but login failed: ${signInError.message}\n\n🔍 This might mean email confirmation is required.\nCheck your email for a confirmation link!`)
        } else {
          setResult(`🎉 SUCCESS! Account created and logged in!\nRedirecting to dashboard...`)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        }
      }, 2000)
      
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testExistingLogin = async () => {
    setLoading(true)
    setResult('Testing existing account...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'bhiwandidiesel@gmail.com',
        password: 'BhiwandiUser123!'
      })
      
      if (error) {
        setResult(`❌ Login failed: ${error.message}\n\nTry creating the account first.`)
      } else {
        setResult(`🎉 Login successful! Redirecting...`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">FinPulse AI Quick Fix</h1>
        
        <div className="space-y-4">
          <button 
            onClick={createWorkingAccount}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Working...' : '🔧 Create Working Account'}
          </button>
          
          <button 
            onClick={testExistingLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing...' : '🧪 Test Existing Login'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-black/20 rounded-lg text-white text-sm">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 text-white/80 text-sm">
          <h3 className="font-semibold text-white">Your Credentials:</h3>
          <p>📧 Email: bhiwandidiesel@gmail.com</p>
          <p>🔑 Password: BhiwandiUser123!</p>
          <p className="text-xs mt-2 text-white/60">
            Note: You might need to check your email for confirmation after account creation.
          </p>
        </div>
      </div>
    </div>
  )
}
