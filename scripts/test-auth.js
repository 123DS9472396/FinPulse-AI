// Simple auth test script
// Run this in browser console on localhost:3000/login

console.log('Testing AIPhen Authentication...')

// Test the Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wyfijtlmbqjzrefujuhv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmlqdGxtYnFqenJlZnVqdWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzEyNjcsImV4cCI6MjA1MjU0NzI2N30.Cj0n14Q4R0GG9Qpd1QFjJDJP7fS7R6oLJ3aOK_kKqLY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test credentials
const testCredentials = {
  email: 'admin@aiphen.demo',
  password: 'AdminPassword123!'
}

async function testAuth() {
  console.log('1. Testing Supabase connection...')
  
  try {
    // Test connection
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Connection successful. Current session:', session)
    
    console.log('2. Creating test account...')
    
    // Create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testCredentials.email,
      password: testCredentials.password,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
      }
    })
    
    if (signUpError) {
      console.error('Signup error:', signUpError)
    } else {
      console.log('Signup successful:', signUpData)
    }
    
    console.log('3. Testing login...')
    
    // Test login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testCredentials.email,
      password: testCredentials.password
    })
    
    if (signInError) {
      console.error('Login error:', signInError)
    } else {
      console.log('Login successful:', signInData)
      console.log('✅ Authentication working!')
      console.log('Use these credentials:')
      console.log(`Email: ${testCredentials.email}`)
      console.log(`Password: ${testCredentials.password}`)
    }
    
  } catch (error) {
    console.error('Auth test failed:', error)
  }
}

// Run the test
testAuth()
