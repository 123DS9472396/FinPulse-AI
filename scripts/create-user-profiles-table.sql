-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'moderate', 'high')),
    investment_goal TEXT CHECK (investment_goal IN ('wealth_preservation', 'balanced_growth', 'aggressive_growth', 'retirement', 'education')),
    current_portfolio_value DECIMAL(15,2) DEFAULT 0,
    target_portfolio_value DECIMAL(15,2) DEFAULT 0,
    investment_horizon TEXT CHECK (investment_horizon IN ('short_term', 'medium_term', 'long_term')),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own profile  
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to access all profiles
CREATE POLICY "Service role can access all profiles" ON public.user_profiles
    FOR ALL USING (current_setting('role') = 'service_role');
