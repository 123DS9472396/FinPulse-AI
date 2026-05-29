'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, TrendingUp, TrendingDown, Star, Brain, Filter, BarChart3 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Stock {
  symbol: string
  company_name: string
  price: number
  percent_change: number
  volume: string
  sector: string
  ai_score: number
  ai_sentiment: string
  market_cap?: number
}

interface MutualFund {
  fund_name: string
  nav: number
  change_percent: number
  fund_type: string
  rating: string
  ai_score: number
  expense_ratio?: number
}

export default function EnhancedDiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([])
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [selectedSector, setSelectedSector] = useState('all')
  const [sortBy, setSortBy] = useState('ai_score')

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    // Load trending stocks
    const mockTrendingStocks: Stock[] = [
      {
        symbol: 'RELIANCE',
        company_name: 'Reliance Industries Ltd',
        price: 2456.75,
        percent_change: 5.2,
        volume: '2.3M',
        sector: 'Energy',
        ai_score: 85,
        ai_sentiment: 'Bullish',
        market_cap: 1660000000000
      },
      {
        symbol: 'TCS',
        company_name: 'Tata Consultancy Services',
        price: 3234.20,
        percent_change: 2.1,
        volume: '5.1M',
        sector: 'Technology',
        ai_score: 82,
        ai_sentiment: 'Bullish',
        market_cap: 1180000000000
      },
      {
        symbol: 'HDFC',
        company_name: 'HDFC Bank Ltd',
        price: 1567.45,
        percent_change: -3.8,
        volume: '8.2M',
        sector: 'Banking',
        ai_score: 72,
        ai_sentiment: 'Neutral',
        market_cap: 865000000000
      },
      {
        symbol: 'INFY',
        company_name: 'Infosys Ltd',
        price: 1789.30,
        percent_change: 1.5,
        volume: '3.7M',
        sector: 'Technology',
        ai_score: 78,
        ai_sentiment: 'Bullish',
        market_cap: 742000000000
      }
    ]

    const mockMutualFunds: MutualFund[] = [
      {
        fund_name: 'Sample Large Cap Fund',
        nav: 150.25,
        change_percent: 1.2,
        fund_type: 'Large Cap',
        rating: '4',
        ai_score: 88,
        expense_ratio: 1.25
      },
      {
        fund_name: 'Growth Equity Fund',
        nav: 89.67,
        change_percent: 2.8,
        fund_type: 'Mid Cap',
        rating: '5',
        ai_score: 92,
        expense_ratio: 1.8
      },
      {
        fund_name: 'Balanced Advantage Fund',
        nav: 45.12,
        change_percent: 0.9,
        fund_type: 'Hybrid',
        rating: '3',
        ai_score: 75,
        expense_ratio: 1.5
      }
    ]

    setTrendingStocks(mockTrendingStocks)
    setMutualFunds(mockMutualFunds)
  }

  const searchStocks = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // Simulate API call with filtering from trending stocks
      const results = trendingStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )

      // Add some mock search results if query doesn't match trending
      if (results.length === 0) {
        const mockResults: Stock[] = [
          {
            symbol: searchQuery.toUpperCase(),
            company_name: `${searchQuery} Corporation Ltd`,
            price: Math.random() * 1000 + 500,
            percent_change: (Math.random() - 0.5) * 10,
            volume: `${(Math.random() * 5 + 1).toFixed(1)}M`,
            sector: 'Technology',
            ai_score: Math.floor(Math.random() * 40) + 60,
            ai_sentiment: Math.random() > 0.5 ? 'Bullish' : 'Neutral'
          }
        ]
        setSearchResults(mockResults)
      } else {
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredStocks = () => {
    let stocks = searchResults.length > 0 ? searchResults : trendingStocks
    
    if (selectedSector !== 'all') {
      stocks = stocks.filter(stock => stock.sector === selectedSector)
    }

    return stocks.sort((a, b) => {
      switch (sortBy) {
        case 'ai_score':
          return b.ai_score - a.ai_score
        case 'price':
          return b.price - a.price
        case 'change':
          return b.percent_change - a.percent_change
        default:
          return 0
      }
    })
  }

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'Bearish': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4 text-yellow-600" />
    }
  }

  const sectors = [...new Set(trendingStocks.map(stock => stock.sector))]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Investments</h1>
          <p className="text-gray-600">Explore and analyze investment opportunities with AI-powered insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for stocks, mutual funds, ETFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
              className="pl-10"
            />
          </div>
          <Button onClick={searchStocks} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stocks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="ai-picks">AI Picks</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_score">AI Score</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change">% Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {getFilteredStocks().map((stock, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600">{stock.company_name}</p>
                          <p className="text-xs text-gray-500">{stock.sector}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(stock.ai_sentiment)}
                          <Badge className={getAIScoreColor(stock.ai_score)}>
                            <Brain className="h-3 w-3 mr-1" />
                            {stock.ai_score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{stock.price.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${
                        stock.percent_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.percent_change >= 0 ? '+' : ''}{stock.percent_change.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">Vol: {stock.volume}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">AI Sentiment: {stock.ai_sentiment}</span>
                      {stock.market_cap && (
                        <span className="text-gray-600">
                          Market Cap: ₹{(stock.market_cap / 1000000000).toFixed(1)}B
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mutual-funds" className="space-y-6">
          <div className="grid gap-4">
            {mutualFunds.map((fund, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{fund.fund_name}</h3>
                          <p className="text-sm text-gray-600">{fund.fund_type}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < parseInt(fund.rating) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge className={getAIScoreColor(fund.ai_score)}>
                              <Brain className="h-3 w-3 mr-1" />
                              {fund.ai_score}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{fund.nav.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${
                        fund.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {fund.change_percent >= 0 ? '+' : ''}{fund.change_percent.toFixed(2)}%
                      </div>
                      {fund.expense_ratio && (
                        <div className="text-xs text-gray-500">Expense: {fund.expense_ratio}%</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Gainers
                </CardTitle>
                <CardDescription>Stocks with highest gains today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingStocks
                    .filter(stock => stock.percent_change > 0)
                    .sort((a, b) => b.percent_change - a.percent_change)
                    .slice(0, 3)
                    .map((stock, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{stock.symbol}</div>
                          <div className="text-sm text-gray-600">{stock.sector}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-medium">+{stock.percent_change.toFixed(2)}%</div>
                          <div className="text-sm">₹{stock.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Top Losers
                </CardTitle>
                <CardDescription>Stocks with highest losses today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingStocks
                    .filter(stock => stock.percent_change < 0)
                    .sort((a, b) => a.percent_change - b.percent_change)
                    .slice(0, 3)
                    .map((stock, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{stock.symbol}</div>
                          <div className="text-sm text-gray-600">{stock.sector}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-medium">{stock.percent_change.toFixed(2)}%</div>
                          <div className="text-sm">₹{stock.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-picks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI-Recommended Investments
              </CardTitle>
              <CardDescription>
                Stocks and funds selected by our AI based on your investment profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {trendingStocks
                  .filter(stock => stock.ai_score >= 80)
                  .map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <p className="text-sm text-gray-600">{stock.company_name}</p>
                            <p className="text-xs text-gray-500">AI Confidence: High • {stock.sector}</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Pick
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{stock.price.toFixed(2)}</div>
                        <div className={`text-sm font-medium ${
                          stock.percent_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.percent_change >= 0 ? '+' : ''}{stock.percent_change.toFixed(2)}%
                        </div>
                        <Button size="sm" className="mt-2">
                          Add to Watchlist
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
