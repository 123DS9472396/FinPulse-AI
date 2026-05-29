import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Simple Onboarding API called ===")
    
    // Create an authenticated Supabase client using awaited cookies for Next.js 15
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    
    const { userId, profileData } = body

    if (!userId || !profileData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Simple approach: just try to insert
    const { data: result, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        risk_tolerance: profileData.risk_tolerance,
        investment_goal: profileData.investment_goal,
        current_portfolio_value: profileData.current_portfolio_value,
        target_portfolio_value: profileData.target_portfolio_value,
        investment_horizon: profileData.investment_horizon,
      })
      .select()
      .single()

    if (error) {
      console.error("Insert error:", JSON.stringify(error, null, 2))
      console.error("Insert error message:", error.message)
      console.error("Insert error code:", error.code)
      console.error("Insert error details:", error.details)
      
      // Check if the error object is empty or undefined
      if (!error.message && !error.code) {
        return NextResponse.json({
          error: "Empty error from database - likely missing table",
          suggestion: "The user_profiles table probably doesn't exist",
          quickFix: "Go to Supabase dashboard and run the SQL script",
          sql: `-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);`
        }, { status: 500 })
      }
      
      // Check for specific error types
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          error: "Table does not exist",
          message: "The user_profiles table needs to be created",
          sql: `CREATE TABLE public.user_profiles (
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

      if (error.code === '23505') {
        // Unique constraint violation, try update instead
        const { data: updateResult, error: updateError } = await supabase
          .from("user_profiles")
          .update({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            risk_tolerance: profileData.risk_tolerance,
            investment_goal: profileData.investment_goal,
            current_portfolio_value: profileData.current_portfolio_value,
            target_portfolio_value: profileData.target_portfolio_value,
            investment_horizon: profileData.investment_horizon,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single()

        if (updateError) {
          console.error("Update error:", JSON.stringify(updateError, null, 2))
          return NextResponse.json({
            error: "Failed to update profile",
            details: updateError
          }, { status: 500 })
        }

        console.log("Profile updated successfully:", updateResult)
        return NextResponse.json({ 
          success: true, 
          data: updateResult,
          action: "updated"
        })
      }

      return NextResponse.json({
        error: "Database operation failed",
        details: error
      }, { status: 500 })
    }

    console.log("Profile created successfully:", result)
    return NextResponse.json({ 
      success: true, 
      data: result,
      action: "created"
    })

  } catch (error: any) {
    console.error("Simple onboarding error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}
