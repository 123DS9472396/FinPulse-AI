-- ============================================
-- AIPhen AI-Powered Database Setup - Complete
-- ============================================

-- 1. User Management Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'moderate', 'high')),
    investment_goal TEXT CHECK (investment_goal IN ('wealth_preservation', 'balanced_growth', 'aggressive_growth', 'retirement', 'education')),
    current_portfolio_value DECIMAL(15,2) DEFAULT 0,
    target_portfolio_value DECIMAL(15,2) DEFAULT 0,
    investment_horizon TEXT CHECK (investment_horizon IN ('short_term', 'medium_term', 'long_term')),
    notification_preferences JSONB DEFAULT '{}',
    ai_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Portfolio Management Tables
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

-- 3. AI Analysis Tables
CREATE TABLE IF NOT EXISTS public.ai_stock_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    profile_data JSONB,
    financial_data JSONB,
    sentiment TEXT CHECK (sentiment IN ('Bullish', 'Bearish', 'Neutral')),
    ai_score INTEGER DEFAULT 50,
    confidence_level DECIMAL(5,2) DEFAULT 50.0,
    recommendation TEXT CHECK (recommendation IN ('BUY', 'SELL', 'HOLD')),
    price_targets JSONB,
    risks JSONB,
    opportunities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol)
);

-- 4. Real-time Market Data Tables
CREATE TABLE IF NOT EXISTS public.real_time_market_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_type TEXT NOT NULL,
    symbol TEXT,
    data JSONB NOT NULL,
    price DECIMAL(15,2),
    change_percent DECIMAL(5,2),
    volume BIGINT,
    market_cap BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI-Powered Market Insights
CREATE TABLE IF NOT EXISTS public.ai_market_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL, -- daily_summary, sector_analysis, trend_prediction
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    data JSONB,
    confidence_score DECIMAL(5,2) DEFAULT 50.0,
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
    relevant_symbols TEXT[],
    relevant_sectors TEXT[],
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Watchlists with AI Enhancement
CREATE TABLE IF NOT EXISTS public.user_watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT,
    added_price DECIMAL(15,2),
    target_price DECIMAL(15,2),
    ai_alerts_enabled BOOLEAN DEFAULT TRUE,
    price_alerts JSONB DEFAULT '[]',
    ai_insights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 7. Enhanced Market Data Cache
CREATE TABLE IF NOT EXISTS public.cached_trending_stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    price DECIMAL(10,2),
    percent_change DECIMAL(5,2),
    volume TEXT,
    market_cap BIGINT,
    overall_rating TEXT,
    ai_sentiment TEXT,
    ai_score INTEGER DEFAULT 50,
    stock_type TEXT NOT NULL CHECK (stock_type IN ('gainer', 'loser')),
    sector TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_most_active_stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    company TEXT NOT NULL,
    price DECIMAL(10,2),
    percent_change DECIMAL(5,2),
    volume TEXT,
    market_cap BIGINT,
    overall_rating TEXT,
    ai_sentiment TEXT,
    ai_score INTEGER DEFAULT 50,
    sector TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_market_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    url TEXT,
    image_url TEXT,
    source TEXT,
    author TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    sentiment TEXT,
    ai_tags TEXT[],
    relevant_symbols TEXT[],
    impact_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_ipo_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT,
    name TEXT NOT NULL,
    listing_date DATE,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    issue_size DECIMAL(15,2),
    is_sme BOOLEAN DEFAULT FALSE,
    sector TEXT,
    ai_rating TEXT,
    ai_analysis JSONB,
    additional_text TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cached_mutual_funds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fund_name TEXT NOT NULL,
    fund_code TEXT,
    nav DECIMAL(10,4),
    change_percent DECIMAL(5,2),
    fund_type TEXT,
    category TEXT,
    aum DECIMAL(15,2),
    expense_ratio DECIMAL(5,3),
    rating TEXT,
    ai_score INTEGER DEFAULT 50,
    ai_recommendation TEXT,
    risk_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AI Learning and Personalization
CREATE TABLE IF NOT EXISTS public.user_ai_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- search, analysis_request, portfolio_review, chat
    query TEXT,
    response JSONB,
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    learning_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Advanced Articles and Education
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    tags TEXT[],
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_time INTEGER DEFAULT 5,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_insights JSONB,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER DEFAULT 0, -- seconds
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, article_id)
);

-- 10. API Usage and Performance Monitoring
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint_type TEXT NOT NULL,
    api_provider TEXT, -- FMP, Alpha Vantage, etc.
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

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_symbol ON public.user_portfolios(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_stock_analysis_symbol ON public.ai_stock_analysis(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_stock_analysis_updated_at ON public.ai_stock_analysis(updated_at);
CREATE INDEX IF NOT EXISTS idx_real_time_market_data_symbol ON public.real_time_market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_real_time_market_data_type ON public.real_time_market_data(data_type);
CREATE INDEX IF NOT EXISTS idx_ai_market_insights_type ON public.ai_market_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_market_insights_created_at ON public.ai_market_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user_id ON public.user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_symbol ON public.user_watchlists(symbol);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_type ON public.cached_trending_stocks(stock_type);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_created_at ON public.cached_trending_stocks(created_at);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_symbol ON public.cached_trending_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_most_active_created_at ON public.cached_most_active_stocks(created_at);
CREATE INDEX IF NOT EXISTS idx_most_active_symbol ON public.cached_most_active_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_market_news_created_at ON public.cached_market_news(created_at);
CREATE INDEX IF NOT EXISTS idx_market_news_pub_date ON public.cached_market_news(pub_date);
CREATE INDEX IF NOT EXISTS idx_market_news_symbols ON public.cached_market_news USING GIN(relevant_symbols);
CREATE INDEX IF NOT EXISTS idx_ipo_data_created_at ON public.cached_ipo_data(created_at);
CREATE INDEX IF NOT EXISTS idx_ipo_data_listing_date ON public.cached_ipo_data(listing_date);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_created_at ON public.cached_mutual_funds(created_at);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_type ON public.cached_mutual_funds(fund_type);
CREATE INDEX IF NOT EXISTS idx_user_ai_interactions_user_id ON public.user_ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_interactions_type ON public.user_ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_article_progress_user_id ON public.article_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint_type ON public.api_usage_logs(endpoint_type);

-- 12. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_progress ENABLE ROW LEVEL SECURITY;

-- Market data tables - read-only for authenticated users
ALTER TABLE public.ai_stock_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_trending_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_most_active_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_ipo_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_mutual_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies for user data
CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolio" ON public.user_portfolios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON public.user_watchlists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI interactions" ON public.user_ai_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own article progress" ON public.article_progress
    FOR ALL USING (auth.uid() = user_id);

-- 14. Create RLS policies for market data (read-only for authenticated users)
CREATE POLICY "Authenticated users can read AI stock analysis" ON public.ai_stock_analysis
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read real-time market data" ON public.real_time_market_data
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read AI market insights" ON public.ai_market_insights
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read trending stocks" ON public.cached_trending_stocks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read active stocks" ON public.cached_most_active_stocks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read market news" ON public.cached_market_news
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read IPO data" ON public.cached_ipo_data
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read mutual funds" ON public.cached_mutual_funds
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read articles" ON public.articles
    FOR SELECT TO authenticated USING (published = true);

-- 15. Functions for AI recommendations
CREATE OR REPLACE FUNCTION public.get_user_ai_recommendations(user_uuid UUID)
RETURNS TABLE (
    recommendation_type TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Portfolio rebalancing recommendations
    RETURN QUERY
    SELECT 
        'portfolio_rebalancing'::TEXT,
        'Portfolio Rebalancing Suggested'::TEXT,
        'Your portfolio allocation may benefit from rebalancing'::TEXT,
        'medium'::TEXT,
        jsonb_build_object(
            'current_allocation', 
            (SELECT jsonb_agg(jsonb_build_object('symbol', symbol, 'weight', portfolio_weight))
             FROM public.user_portfolios WHERE user_id = user_uuid)
        );
    
    -- High AI score stock recommendations  
    RETURN QUERY
    SELECT 
        'high_potential_stocks'::TEXT,
        'High AI Score Opportunities'::TEXT,
        'Stocks with high AI confidence scores worth considering'::TEXT,
        'high'::TEXT,
        jsonb_build_object(
            'stocks',
            (SELECT jsonb_agg(jsonb_build_object('symbol', symbol, 'ai_score', ai_score, 'sentiment', sentiment))
             FROM public.ai_stock_analysis 
             WHERE ai_score > 75 AND sentiment = 'Bullish'
             ORDER BY ai_score DESC LIMIT 5)
        );
        
    RETURN;
END;
$$;

-- 16. Insert sample data for testing
INSERT INTO public.articles (title, slug, content, excerpt, category, tags, difficulty_level) VALUES
('Understanding Stock Market Basics', 'stock-market-basics', 'A comprehensive guide to understanding how the stock market works...', 'Learn the fundamentals of stock market investing', 'Education', ARRAY['stocks', 'basics', 'investing'], 'beginner'),
('Advanced Portfolio Diversification', 'portfolio-diversification', 'Deep dive into portfolio diversification strategies...', 'Master the art of portfolio diversification', 'Strategy', ARRAY['portfolio', 'diversification', 'risk'], 'advanced'),
('AI in Financial Markets', 'ai-in-finance', 'How artificial intelligence is transforming financial markets...', 'Explore the role of AI in modern finance', 'Technology', ARRAY['ai', 'fintech', 'innovation'], 'intermediate')
ON CONFLICT (slug) DO NOTHING;

-- 17. Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.market_overview AS
SELECT 
    'gainers' as category,
    symbol,
    company_name,
    price,
    percent_change,
    ai_score,
    created_at
FROM public.cached_trending_stocks 
WHERE stock_type = 'gainer'
UNION ALL
SELECT 
    'losers' as category,
    symbol,
    company_name,
    price,
    percent_change,
    ai_score,
    created_at
FROM public.cached_trending_stocks 
WHERE stock_type = 'loser'
UNION ALL
SELECT 
    'active' as category,
    symbol,
    company,
    price,
    percent_change,
    ai_score,
    created_at
FROM public.cached_most_active_stocks;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS market_overview_unique_idx ON public.market_overview (category, symbol, created_at);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Complete setup message
DO $$
BEGIN
    RAISE NOTICE '✅ AIPhen AI-Powered Database Setup Complete!';
    RAISE NOTICE '📊 Created % tables with AI capabilities', 
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE '🔒 Row Level Security enabled on all user tables';
    RAISE NOTICE '🚀 Ready for AI-powered financial analysis!';
END $$;
