// Test account creation script
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wyfijtlmbqjzrefujuhv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmlqdGxtYnFqenJlZnVqdWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzEyNjcsImV4cCI6MjA1MjU0NzI2N30.Cj0n14Q4R0GG9Qpd1QFjJDJP7fS7R6oLJ3aOK_kKqLY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestAccount() {
  console.log('Creating test account...')
  
  const { data, error } = await supabase.auth.signUp({
    email: 'test@aiphen.demo',
    password: 'TestPassword123!',
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback?redirectTo=/onboarding'
    }
  })

  if (error) {
    console.error('Error creating account:', error)
  } else {
    console.log('Test account created successfully:', data)
    console.log('---')
    console.log('TEST ACCOUNT CREDENTIALS:')
    console.log('Email: test@aiphen.demo')
    console.log('Password: TestPassword123!')
    console.log('---')
  }
}

createTestAccount()
