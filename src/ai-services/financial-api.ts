// Enhanced Financial Modeling Prep API Service with AI insights
import { supabase } from '@/lib/supabase'

const FMP_BASE_URL = process.env.NEXT_PUBLIC_FMP_BASE_URL || 'https://financialmodelingprep.com/api/v3'
const API_KEYS = [
  process.env.FMP_API_KEY_1 || 'demo',
  process.env.FMP_API_KEY_2 || 'demo', 
  process.env.FMP_API_KEY_3 || 'demo'
]

let currentKeyIndex = 0

function getNextApiKey() {
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

async function fmpRequest(endpoint: string, params: Record<string, any> = {}) {
  const apiKey = getNextApiKey()
  const url = new URL(`${FMP_BASE_URL}${endpoint}`)
  
  // Add API key and other parameters
  url.searchParams.append('apikey', apiKey)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })

  console.log('🌐 FMP API Request:', url.toString())
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AIPhen-Financial-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`FMP API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ FMP Response received:', Object.keys(data).length, 'items')
    return data
  } catch (error) {
    console.error('❌ FMP API Error:', error)
    throw error
  }
}

// AI-Enhanced Stock Analysis
export async function getAIStockAnalysis(symbol: string) {
  try {
    console.log(`🤖 Getting AI analysis for ${symbol}`)
    
    // Get comprehensive stock data
    const [
      profile,
      quote,
      ratios,
      growth,
      news,
      financials
    ] = await Promise.all([
      fmpRequest(`/profile/${symbol}`),
      fmpRequest(`/quote/${symbol}`),
      fmpRequest(`/ratios/${symbol}`, { limit: 1 }),
      fmpRequest(`/financial-growth/${symbol}`, { limit: 1 }),
      fmpRequest(`/stock_news`, { tickers: symbol, limit: 5 }),
      fmpRequest(`/income-statement/${symbol}`, { limit: 1 })
    ])

    // AI-powered analysis
    const aiInsights = await generateAIInsights(symbol, {
      profile: profile[0],
      quote: quote[0], 
      ratios: ratios[0],
      growth: growth[0],
      news,
      financials: financials[0]
    })

    // Store in database
    await supabase
      .from('ai_stock_analysis')
      .upsert({
        symbol,
        analysis_data: aiInsights,
        profile_data: profile[0],
        financial_data: {
          quote: quote[0],
          ratios: ratios[0],
          growth: growth[0]
        },
        updated_at: new Date().toISOString()
      })

    return {
      symbol,
      profile: profile[0],
      quote: quote[0],
      aiInsights,
      news: news.slice(0, 3),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in AI stock analysis:', error)
    throw error
  }
}

// Real-time Market Data
export async function getRealTimeMarketData() {
  try {
    console.log('📊 Fetching real-time market data...')
    
    const [
      majors,
      gainers,
      losers,
      active,
      sectors
    ] = await Promise.all([
      fmpRequest('/quotes/index'), // Major indices
      fmpRequest('/stock_market/gainers'),
      fmpRequest('/stock_market/losers'), 
      fmpRequest('/stock_market/actives'),
      fmpRequest('/sector-performance')
    ])

    const marketData = {
      indices: majors.filter((item: any) => 
        ['^GSPC', '^DJI', '^IXIC', '^RUT'].includes(item.symbol)
      ),
      gainers: gainers.slice(0, 10),
      losers: losers.slice(0, 10),
      mostActive: active.slice(0, 10),
      sectorPerformance: sectors,
      lastUpdated: new Date().toISOString()
    }

    // Cache in database
    await supabase
      .from('real_time_market_data')
      .upsert({
        data_type: 'market_overview',
        data: marketData,
        updated_at: new Date().toISOString()
      })

    return marketData
  } catch (error) {
    console.error('Error fetching real-time market data:', error)
    return null
  }
}

// AI-powered Portfolio Analysis
export async function getAIPortfolioAnalysis(holdings: any[]) {
  try {
    console.log('🧠 Generating AI portfolio analysis...')
    
    const portfolioData = await Promise.all(
      holdings.map(async (holding) => {
        const data = await getAIStockAnalysis(holding.symbol)
        return {
          ...holding,
          analysis: data.aiInsights,
          currentPrice: data.quote?.price || 0
        }
      })
    )

    // Generate AI recommendations
    const aiRecommendations = await generatePortfolioRecommendations(portfolioData)

    return {
      holdings: portfolioData,
      recommendations: aiRecommendations,
      riskScore: calculatePortfolioRisk(portfolioData),
      diversificationScore: calculateDiversification(portfolioData),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in AI portfolio analysis:', error)
    throw error
  }
}

// AI Insight Generation using Gemini
async function generateAIInsights(symbol: string, data: any) {
  try {
    const prompt = `
    Analyze this stock data for ${symbol} and provide AI-powered insights:
    
    Company: ${data.profile?.companyName}
    Sector: ${data.profile?.sector}
    Industry: ${data.profile?.industry}
    Market Cap: ${data.profile?.mktCap}
    Current Price: ${data.quote?.price}
    P/E Ratio: ${data.ratios?.peRatio}
    ROE: ${data.ratios?.returnOnEquity}
    Revenue Growth: ${data.growth?.revenueGrowth}
    
    Provide a comprehensive analysis including:
    1. Overall investment sentiment (Bullish/Bearish/Neutral)
    2. Key strengths and weaknesses
    3. Price targets (Conservative, Optimistic)
    4. Risk factors
    5. Investment recommendation
    6. Time horizon suggestion
    
    Format as JSON with these exact keys: sentiment, strengths, weaknesses, priceTargets, risks, recommendation, timeHorizon, score (1-100).
    `

    const response = await fetch('/api/ai-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, symbol })
    })

    if (response.ok) {
      const aiAnalysis = await response.json()
      return aiAnalysis
    } else {
      // Fallback analysis
      return generateBasicAnalysis(data)
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return generateBasicAnalysis(data)
  }
}

function generateBasicAnalysis(data: any) {
  const peRatio = data.ratios?.peRatio || 0
  const priceChange = data.quote?.changesPercentage || 0
  
  let sentiment = 'Neutral'
  let score = 50
  
  if (priceChange > 5 && peRatio < 20) {
    sentiment = 'Bullish'
    score = 75
  } else if (priceChange < -5 || peRatio > 30) {
    sentiment = 'Bearish'  
    score = 25
  }

  return {
    sentiment,
    score,
    strengths: ['Market position', 'Financial stability'],
    weaknesses: ['Market volatility', 'Sector risks'],
    priceTargets: {
      conservative: data.quote?.price * 1.1,
      optimistic: data.quote?.price * 1.25
    },
    risks: ['Market risk', 'Company-specific risk'],
    recommendation: sentiment === 'Bullish' ? 'BUY' : sentiment === 'Bearish' ? 'SELL' : 'HOLD',
    timeHorizon: '6-12 months'
  }
}

async function generatePortfolioRecommendations(holdings: any[]) {
  // Calculate portfolio metrics
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0)
  const sectors = [...new Set(holdings.map(h => h.sector))].length
  
  const recommendations = []
  
  if (sectors < 3) {
    recommendations.push({
      type: 'diversification',
      priority: 'high',
      message: 'Consider diversifying across more sectors to reduce risk',
      action: 'Add holdings in different sectors'
    })
  }
  
  // Identify overweight positions
  holdings.forEach(holding => {
    const weight = (holding.shares * holding.currentPrice) / totalValue
    if (weight > 0.25) {
      recommendations.push({
        type: 'rebalancing',
        priority: 'medium', 
        message: `${holding.symbol} represents ${(weight * 100).toFixed(1)}% of portfolio - consider reducing`,
        action: `Trim ${holding.symbol} position`
      })
    }
  })

  return recommendations
}

function calculatePortfolioRisk(holdings: any[]) {
  // Simple risk calculation based on volatility and concentration
  const weights = holdings.map(h => h.shares * h.currentPrice)
  const totalValue = weights.reduce((sum, w) => sum + w, 0)
  const normalizedWeights = weights.map(w => w / totalValue)
  
  // Concentration risk (higher concentration = higher risk)
  const herfindahlIndex = normalizedWeights.reduce((sum, w) => sum + w * w, 0)
  const concentrationRisk = herfindahlIndex * 100
  
  // Scale to 1-100 where 100 is highest risk
  return Math.min(Math.round(concentrationRisk * 2), 100)
}

function calculateDiversification(holdings: any[]) {
  const sectors = [...new Set(holdings.map(h => h.sector || 'Unknown'))]
  const industries = [...new Set(holdings.map(h => h.industry || 'Unknown'))]
  
  // Simple diversification score
  const sectorScore = Math.min(sectors.length * 20, 100)
  const industryScore = Math.min(industries.length * 10, 50)
  
  return Math.round(sectorScore + industryScore)
}

// Search stocks with AI-enhanced results
export async function searchStocks(query: string, limit = 10) {
  try {
    console.log(`🔍 Searching stocks: ${query}`)
    
    const results = await fmpRequest('/search', { 
      query,
      limit,
      exchange: 'NASDAQ,NYSE,AMEX'
    })

    // Enhance results with AI insights
    const enhancedResults = await Promise.all(
      results.slice(0, limit).map(async (stock: any) => {
        try {
          const profile = await fmpRequest(`/profile/${stock.symbol}`)
          const quote = await fmpRequest(`/quote/${stock.symbol}`)
          
          return {
            ...stock,
            profile: profile[0],
            quote: quote[0],
            aiScore: calculateBasicAIScore(profile[0], quote[0])
          }
        } catch {
          return { ...stock, aiScore: 50 }
        }
      })
    )

    return enhancedResults.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
  } catch (error) {
    console.error('Stock search error:', error)
    return []
  }
}

function calculateBasicAIScore(profile: any, quote: any) {
  if (!profile || !quote) return 50
  
  let score = 50
  
  // Market cap bonus
  if (profile.mktCap > 10000000000) score += 10 // Large cap
  else if (profile.mktCap > 2000000000) score += 5 // Mid cap
  
  // Performance bonus
  const changePercent = quote.changesPercentage || 0
  if (changePercent > 0) score += Math.min(changePercent, 20)
  else score += Math.max(changePercent, -20)
  
  // Volume bonus  
  if (quote.volume > 1000000) score += 5
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

export default {
  getAIStockAnalysis,
  getRealTimeMarketData,
  getAIPortfolioAnalysis,
  searchStocks
}
