"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SimpleLogin() {
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('Logging in...')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage(`❌ Login Error: ${error.message}`)
      } else {
        setMessage('✅ Login successful! Redirecting...')
        // Force a hard redirect to avoid layout issues
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('Creating account...')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        setMessage(`❌ Signup Error: ${error.message}`)
      } else {
        setMessage(`✅ Account created! Now try logging in.`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">FinPulse AI Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        {message && (
          <div className="mt-6 p-3 bg-black/30 rounded-lg text-white text-sm">
            {message}
          </div>
        )}
        
        <div className="mt-6 text-white/80 text-sm text-center">
          <p className="font-semibold">Test Credentials:</p>
          <p>📧 admin@test.com</p>
          <p>🔑 password123</p>
        </div>
      </div>
    </div>
  )
}
