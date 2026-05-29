'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseTest() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Basic connection
      testResults.connection = 'Testing...'
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (connectionError) {
        testResults.connection = `❌ Error: ${connectionError.message} (Code: ${connectionError.code})`
      } else {
        testResults.connection = '✅ Connected successfully'
      }

      // Test 2: Check current user
      testResults.auth = 'Testing...'
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        testResults.auth = `❌ Auth error: ${userError.message}`
      } else if (user) {
        testResults.auth = `✅ User authenticated: ${user.email}`
      } else {
        testResults.auth = '⚠️ No user logged in'
      }

      // Test 3: Try to read user_profiles table
      testResults.read_profiles = 'Testing...'
      const { data: profiles, error: readError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5)

      if (readError) {
        testResults.read_profiles = `❌ Read error: ${readError.message} (Code: ${readError.code})`
      } else {
        testResults.read_profiles = `✅ Read successful, ${profiles?.length || 0} profiles found`
      }

      // Test 4: Try to insert a test profile (if user is logged in)
      if (user) {
        testResults.insert_test = 'Testing...'
        const testProfile = {
          user_id: user.id,
          first_name: 'Test',
          last_name: 'User',
          risk_tolerance: 'moderate',
          investment_goal: 'balanced_growth'
        }

        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .upsert(testProfile)
          .select()

        if (insertError) {
          testResults.insert_test = `❌ Insert error: ${insertError.message} (Code: ${insertError.code})`
        } else {
          testResults.insert_test = '✅ Insert/update successful'
        }
      }

      // Test 5: Check table existence
      testResults.tables = 'Testing...'
      const tables = ['user_profiles', 'user_portfolios', 'cached_trending_stocks']
      const tableResults = []

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1)
          if (error) {
            tableResults.push(`❌ ${table}: ${error.message}`)
          } else {
            tableResults.push(`✅ ${table}: exists`)
          }
        } catch (e) {
          tableResults.push(`❌ ${table}: not found`)
        }
      }
      testResults.tables = tableResults.join('<br>')

    } catch (error: any) {
      testResults.general_error = `❌ General error: ${error.message}`
    }

    setResults(testResults)
    setLoading(false)
  }

  const signInWithEmail = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (error) {
      alert(`Sign in error: ${error.message}`)
    } else {
      alert('Signed in successfully!')
      runTests()
    }
  }

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (error) {
      alert(`Sign up error: ${error.message}`)
    } else {
      alert('Sign up successful! Check email for confirmation.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 AIPhen Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run Database Tests'}
            </Button>
            <Button onClick={signUp} variant="outline">
              Create Test Account
            </Button>
            <Button onClick={signInWithEmail} variant="outline">
              Sign In Test Account
            </Button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              {Object.entries(results).map(([test, result]) => (
                <div key={test} className="p-3 bg-gray-50 rounded-lg">
                  <strong>{test.replace(/_/g, ' ').toUpperCase()}:</strong>
                  <div dangerouslySetInnerHTML={{ __html: result as string }} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Quick Fix Instructions:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Go to <a href="https://supabase.com/dashboard/project/wyfijtlmbqjzrefujuhv" className="underline" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
              <li>Click on "SQL Editor" in the left sidebar</li>
              <li>Copy and paste the contents of <code>scripts/quick-fix-policies.sql</code></li>
              <li>Click "Run" to execute the script</li>
              <li>Come back here and click "Run Database Tests" again</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
