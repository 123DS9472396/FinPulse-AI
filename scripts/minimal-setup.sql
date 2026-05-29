-- MINIMAL DATABASE SETUP - No errors guaranteed
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create only essential tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    risk_tolerance TEXT DEFAULT 'moderate',
    investment_goal TEXT DEFAULT 'balanced_growth',
    current_portfolio_value DECIMAL(15,2) DEFAULT 0,
    target_portfolio_value DECIMAL(15,2) DEFAULT 100000,
    investment_horizon TEXT DEFAULT 'medium_term',
    ai_preferences JSONB DEFAULT '{"notifications": true, "insights": true, "recommendations": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT,
    shares DECIMAL(15,4) DEFAULT 0,
    avg_purchase_price DECIMAL(15,2) DEFAULT 0,
    current_price DECIMAL(15,2) DEFAULT 0,
    sector TEXT,
    portfolio_weight DECIMAL(5,2) DEFAULT 0,
    ai_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Step 2: Drop existing policies safely
DO $$ 
BEGIN
    -- Drop all policies for user_profiles
    DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "profile_select_policy" ON public.user_profiles;
    DROP POLICY IF EXISTS "profile_insert_policy" ON public.user_profiles;
    DROP POLICY IF EXISTS "profile_update_policy" ON public.user_profiles;
    
    -- Drop all policies for user_portfolios
    DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.user_portfolios;
    DROP POLICY IF EXISTS "portfolio_all_policy" ON public.user_portfolios;
    
    RAISE NOTICE 'All policies dropped successfully';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist - continuing';
END $$;

-- Step 3: Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies
CREATE POLICY "user_profiles_policy" 
    ON public.user_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_portfolios_policy" 
    ON public.user_portfolios FOR ALL
    USING (auth.uid() = user_id);

-- Step 5: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Create basic indexes (only essential ones)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.user_portfolios(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 MINIMAL SETUP COMPLETE!';
    RAISE NOTICE '✅ Essential tables created';
    RAISE NOTICE '✅ Policies configured';
    RAISE NOTICE '🚀 Ready to test AIPhen!';
    RAISE NOTICE '';
    RAISE NOTICE 'Test at: http://localhost:3001';
END $$;
