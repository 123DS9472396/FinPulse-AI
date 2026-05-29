import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    console.log('=== Database Connection Test ===')
    
    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('Connection test error:', connectionError)
      
      // Check if it's a table not found error
      if (connectionError.message?.includes('relation "user_profiles" does not exist')) {
        return Response.json({
          success: false,
          issue: 'table_missing',
          message: 'The user_profiles table does not exist',
          solution: `Please run this SQL in your Supabase dashboard:

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  risk_tolerance TEXT,
  investment_goal TEXT,
  current_portfolio_value INTEGER,
  target_portfolio_value INTEGER,
  investment_horizon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and write their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);`
        })
      }
      
      return Response.json({
        success: false,
        issue: 'connection_error',
        error: connectionError
      })
    }
    
    // Test 2: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'user_profiles' })
      .single()
    
    console.log('Table info:', tableInfo)
    
    // Test 3: Try a simple insert test
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      first_name: 'Test',
      last_name: 'User',
      risk_tolerance: 'moderate'
    }
    
    const { data: insertTest, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testData)
      .select()
    
    // Clean up test record
    if (insertTest) {
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
    }
    
    return Response.json({
      success: true,
      message: 'Database is working correctly',
      tests: {
        connection: 'OK',
        table_exists: 'OK',
        insert_test: insertError ? 'FAILED' : 'OK',
        insert_error: insertError
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return Response.json({
      success: false,
      issue: 'unexpected_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
