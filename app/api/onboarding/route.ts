import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("Onboarding API called")
    
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    
    const { userId, profileData } = body

    if (!userId || !profileData) {
      console.log("Missing required fields:", { userId: !!userId, profileData: !!profileData })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("Processing onboarding for user:", userId)
    console.log("Profile data:", JSON.stringify(profileData, null, 2))

    // Simple approach: try to insert, if conflict then update
    const profileRecord = {
      user_id: userId,
      first_name: profileData.first_name || null,
      last_name: profileData.last_name || null,
      risk_tolerance: profileData.risk_tolerance || null,
      investment_goal: profileData.investment_goal || null,
      current_portfolio_value: profileData.current_portfolio_value || 0,
      target_portfolio_value: profileData.target_portfolio_value || 0,
      investment_horizon: profileData.investment_horizon || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log("Attempting to upsert profile record:", JSON.stringify(profileRecord, null, 2))

    // First, let's try a simple select to test table access
    const { data: tableTest, error: tableTestError } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1)

    if (tableTestError) {
      console.error("Table access test failed:", JSON.stringify(tableTestError, null, 2))
      return NextResponse.json({
        error: "Table access failed",
        message: "Cannot access user_profiles table",
        details: tableTestError,
        suggestion: "Check if the table exists and RLS policies allow access"
      }, { status: 500 })
    }

    console.log("Table access test passed")

    // Use upsert (insert or update) approach
    const { data: result, error } = await supabase
      .from("user_profiles")
      .upsert(profileRecord, { 
        onConflict: "user_id",
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error("Upsert error:", JSON.stringify(error, null, 2))
      
      // If table doesn't exist, return a helpful error
      if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        return NextResponse.json({
          error: "Database table not found",
          message: "Please create the user_profiles table in your Supabase dashboard",
          tableScript: `
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  risk_tolerance TEXT,
  investment_goal TEXT,
  current_portfolio_value DECIMAL(15,2) DEFAULT 0,
  target_portfolio_value DECIMAL(15,2) DEFAULT 0,
  investment_horizon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
        }, { status: 500 })
      }
      
      // Check if error is empty object (common Supabase issue)
      if (Object.keys(error).length === 0) {
        // This might be a permission/auth issue, let's try a simpler approach
        console.log("Empty error object detected, this might be a permission issue")
        
        // Try to check if we can access the table at all
        const { data: testData, error: testError } = await supabase
          .from("user_profiles")
          .select("count")
          .limit(1)
        
        if (testError) {
          console.error("Table access test failed:", JSON.stringify(testError, null, 2))
          return NextResponse.json({
            error: "Database access error",
            message: "Cannot access user_profiles table. This might be a permission issue or the table doesn't exist.",
            testError: testError,
            suggestion: "Check your Supabase RLS policies or create the table"
          }, { status: 500 })
        }
      }
      
      throw error
    }

    console.log("Upsert successful:", JSON.stringify(result, null, 2))

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: "Profile saved successfully" 
    })

  } catch (error: any) {
    console.error("Error in onboarding API:", JSON.stringify(error, null, 2))
    console.error("Error stack:", error.stack)
    
    return NextResponse.json(
      { 
        error: "Failed to complete onboarding", 
        details: error?.message || "Unknown error",
        code: error?.code || "UNKNOWN",
        hint: error?.hint || null
      },
      { status: 500 }
    )
  }
}
