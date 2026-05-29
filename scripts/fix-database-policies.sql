-- Fix Database Policies - Remove existing policies and recreate properly
-- AIPhen Database Policy Fix Script

-- Drop existing policies if they exist (ignore errors if they don't exist)
DO $$ 
BEGIN
    -- Drop all existing policies for user_profiles
    DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Service role can access all profiles" ON public.user_profiles;
    
    -- Drop policies for other tables that might have conflicts
    DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.user_portfolios;
    DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.user_watchlists;
    DROP POLICY IF EXISTS "Users can manage own AI interactions" ON public.user_ai_interactions;
    DROP POLICY IF EXISTS "Users can manage own article progress" ON public.article_progress;
    
    RAISE NOTICE 'Existing policies dropped successfully';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not have existed - continuing with setup';
END $$;

-- Ensure Row Level Security is enabled
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.article_progress ENABLE ROW LEVEL SECURITY;

-- Create clean policies for user_profiles
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

-- Create policies for other user tables
CREATE POLICY "Users can manage own portfolio" 
    ON public.user_portfolios FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" 
    ON public.user_watchlists FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI interactions" 
    ON public.user_ai_interactions FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own article progress" 
    ON public.article_progress FOR ALL
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database policies fixed successfully!';
    RAISE NOTICE '🔒 Row Level Security enabled and configured';
    RAISE NOTICE '🚀 Ready to use AIPhen platform!';
END $$;
