-- Simple Database Setup for AIPhen - Safe setup with existence checks
-- This script will only create what doesn't exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
    investment_goal TEXT CHECK (investment_goal IN ('wealth_preservation', 'balanced_growth', 'aggressive_growth', 'retirement', 'education')) DEFAULT 'balanced_growth',
    current_portfolio_value DECIMAL(15,2) DEFAULT 0,
    target_portfolio_value DECIMAL(15,2) DEFAULT 100000,
    investment_horizon TEXT CHECK (investment_horizon IN ('short_term', 'medium_term', 'long_term')) DEFAULT 'medium_term',
    ai_preferences JSONB DEFAULT '{"notifications": true, "insights": true, "recommendations": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create user_portfolios table if it doesn't exist  
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

-- 3. Create basic market data cache tables
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

-- 4. Create AI analysis table
CREATE TABLE IF NOT EXISTS public.ai_stock_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    profile_data JSONB,
    financial_data JSONB,
    sentiment TEXT CHECK (sentiment IN ('Bullish', 'Bearish', 'Neutral')) DEFAULT 'Neutral',
    ai_score INTEGER DEFAULT 50,
    confidence_level DECIMAL(5,2) DEFAULT 50.0,
    recommendation TEXT CHECK (recommendation IN ('BUY', 'SELL', 'HOLD')) DEFAULT 'HOLD',
    price_targets JSONB,
    risks JSONB,
    opportunities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol)
);

-- 5. Create API usage logs table
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

-- 6. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_symbol ON public.user_portfolios(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_stock_analysis_symbol ON public.ai_stock_analysis(symbol);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_symbol ON public.cached_trending_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_most_active_symbol ON public.cached_most_active_stocks(symbol);

-- 8. Drop existing policies safely and recreate
DO $$ 
BEGIN
    -- Drop existing policies (ignore errors)
    DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.user_portfolios;
    RAISE NOTICE 'Old policies dropped';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'No existing policies to drop';
END $$;

-- 9. Create new policies
CREATE POLICY "Users can read own profile" 
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolio" 
    ON public.user_portfolios FOR ALL
    USING (auth.uid() = user_id);

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 AIPhen Database Setup Complete!';
    RAISE NOTICE '📊 Essential tables created with proper indexes';
    RAISE NOTICE '🔒 Row Level Security policies configured';
    RAISE NOTICE '✅ Ready to use the platform!';
END $$;
