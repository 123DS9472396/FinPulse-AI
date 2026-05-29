'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DatabaseTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/db-test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test database', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Test</h1>
      
      <Button onClick={testDatabase} disabled={loading}>
        {loading ? 'Testing...' : 'Test Database Connection'}
      </Button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.solution && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Solution:</h3>
              <p className="text-yellow-700 mb-3">{result.message}</p>
              <div className="bg-yellow-100 p-3 rounded border">
                <p className="text-sm font-medium mb-2">Copy and run this SQL in your Supabase dashboard:</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {result.solution}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
