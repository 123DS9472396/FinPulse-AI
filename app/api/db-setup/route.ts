import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Database setup check started")

    // First, try to check if the user_profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "user_profiles")

    console.log("Table check result:", { tables, tablesError })

    // Try to create the user_profiles table if it doesn't exist
    if (!tables || tables.length === 0) {
      console.log("user_profiles table not found, attempting to create...")
      
      // Since we can't create tables directly via the JavaScript client,
      // let's try to insert a test record to see what happens
      const { data: testData, error: testError } = await supabase
        .from("user_profiles")
        .select("count")
        .limit(1)

      if (testError) {
        console.error("Error accessing user_profiles table:", testError)
        return NextResponse.json({
          status: "error",
          message: "user_profiles table does not exist",
          error: testError,
          suggestion: "Please create the user_profiles table in your Supabase dashboard"
        })
      }
    }

    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      tables: tables || [],
      auth: authError ? { error: authError.message } : { connected: true }
    })

  } catch (error: any) {
    console.error("Database setup error:", error)
    return NextResponse.json({
      status: "error",
      message: "Database setup failed",
      error: error.message
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log("Creating user_profiles table structure...")

    // Try to create a simple user profile record to test the table
    const testProfile = {
      user_id: "test-user-id",
      first_name: "Test",
      last_name: "User", 
      risk_tolerance: "moderate",
      investment_goal: "balanced_growth",
      current_portfolio_value: 0,
      target_portfolio_value: 10000,
      investment_horizon: "medium_term",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .insert(testProfile)
      .select()

    if (error) {
      return NextResponse.json({
        status: "error", 
        message: "Failed to create test profile",
        error: error,
        suggestion: "Table structure might be missing. Check your Supabase dashboard."
      }, { status: 500 })
    }

    // Clean up test record
    await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", "test-user-id")

    return NextResponse.json({
      status: "success",
      message: "user_profiles table is working correctly",
      testData: data
    })

  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Table test failed", 
      error: error.message
    }, { status: 500 })
  }
}
