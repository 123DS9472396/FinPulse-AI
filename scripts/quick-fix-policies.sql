-- QUICK FIX for AIPhen Database - Complete Setup
-- Run this in Supabase SQL Editor to resolve all errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create all required tables first
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
    industry TEXT,
    portfolio_weight DECIMAL(5,2) DEFAULT 0,
    ai_score INTEGER DEFAULT 50,
    last_ai_analysis TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Step 2: Drop ALL existing policies safely
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- Get all policy names for user_profiles and drop them
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol_name);
        RAISE NOTICE 'Dropped policy: %', pol_name;
    END LOOP;
    
    -- Get all policy names for user_portfolios and drop them  
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_portfolios' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_portfolios', pol_name);
        RAISE NOTICE 'Dropped policy: %', pol_name;
    END LOOP;
    
    RAISE NOTICE '✅ All existing policies cleared';
END $$;

-- Step 3: Enable RLS on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

-- Step 4: Create fresh, clean policies
CREATE POLICY "profile_select_policy" 
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "profile_insert_policy" 
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_update_policy" 
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_all_policy" 
    ON public.user_portfolios FOR ALL
    USING (auth.uid() = user_id);

-- Step 5: Grant proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 6: Create additional essential tables
-- Step 6: Create additional essential tables
CREATE TABLE IF NOT EXISTS public.cached_trending_stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT,
    company_name TEXT NOT NULL,
    price DECIMAL(10,2),
    percent_change DECIMAL(5,2),
    volume TEXT,
    overall_rating TEXT,
    stock_type TEXT NOT NULL CHECK (stock_type IN ('gainer', 'loser')),
    ai_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_most_active_stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT,
    company TEXT NOT NULL,
    price DECIMAL(10,2),
    percent_change DECIMAL(5,2),
    volume TEXT,
    overall_rating TEXT,
    ai_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_market_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT,
    image_url TEXT,
    source TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    relevant_symbols TEXT[],
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    ai_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint_type TEXT NOT NULL,
    api_provider TEXT,
    endpoint_url TEXT,
    request_params JSONB,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    response_size INTEGER DEFAULT 0,
    error_message TEXT,
    rate_limit_remaining INTEGER,
    cost_units DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for performance (using correct column names)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_symbol ON public.user_portfolios(symbol);
-- For cached_trending_stocks table (has symbol column)
CREATE INDEX IF NOT EXISTS idx_trending_stocks_symbol ON public.cached_trending_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_type ON public.cached_trending_stocks(stock_type);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_created_at ON public.cached_trending_stocks(created_at);
-- For cached_most_active_stocks table (has symbol column)  
CREATE INDEX IF NOT EXISTS idx_most_active_symbol ON public.cached_most_active_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_most_active_created_at ON public.cached_most_active_stocks(created_at);
-- For other tables
CREATE INDEX IF NOT EXISTS idx_market_news_created_at ON public.cached_market_news(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_usage_logs(created_at);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 COMPLETE DATABASE SETUP FINISHED!';
    RAISE NOTICE '✅ All tables created successfully';
    RAISE NOTICE '✅ All policy conflicts resolved';
    RAISE NOTICE '🔒 Fresh RLS policies created';
    RAISE NOTICE '📊 Performance indexes added';
    RAISE NOTICE '🚀 AIPhen platform is ready!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the app at http://localhost:3001';
    RAISE NOTICE '2. Try logging in and creating a profile';
    RAISE NOTICE '3. Check if all features are working';
    RAISE NOTICE '4. Visit /database-test to run diagnostics';
END $$;
