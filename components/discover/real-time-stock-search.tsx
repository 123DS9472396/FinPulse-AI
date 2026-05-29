'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, TrendingDown, Star, BarChart3, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  sector?: string
}

interface SearchResponse {
  success: boolean
  data: StockData[]
  total: number
  query: string
}

export function RealTimeStockSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [popularStocks, setPopularStocks] = useState<StockData[]>([])
  const searchTimeout = useRef<NodeJS.Timeout>()
  const router = useRouter()

  // Load popular stocks on mount
  useEffect(() => {
    loadPopularStocks()
  }, [])

  const loadPopularStocks = async () => {
    try {
      const response = await fetch('/api/stocks/search')
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setPopularStocks(data.data)
      }
    } catch (error) {
      console.error('Failed to load popular stocks:', error)
    }
  }

  const searchStocks = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setResults(data.data)
        setShowResults(true)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      searchStocks(value)
    }, 300)
  }

  const handleStockClick = (symbol: string) => {
    router.push(`/discover/stock/${symbol}`)
    setShowResults(false)
    setQuery('')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  const StockCard = ({ stock }: { stock: StockData }) => (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors border-white/10"
      onClick={() => handleStockClick(stock.symbol)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{stock.name}</h3>
              <Badge variant="outline" className="text-xs">
                {stock.symbol}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              <span>Vol: {formatVolume(stock.volume)}</span>
              {stock.sector && (
                <>
                  <span>•</span>
                  <span>{stock.sector}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">
              {formatPrice(stock.price)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${
              (stock.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(stock.changePercent || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for stocks by name or symbol (e.g., RELIANCE, TCS, HDFC)..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true)
          }}
          className="pl-10 pr-10 py-6 text-lg glass-card border-white/10 focus:border-purple-500/50 transition-colors"
        />
        {loading && (
          <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || query.trim()) && (
        <Card className="absolute top-full left-0 right-0 mt-2 glass-card border-white/10 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {results.length > 0 ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  Search Results ({results.length})
                </div>
                {results.map((stock) => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            ) : query.trim() && !loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No stocks found for "{query}"</p>
                <p className="text-xs mt-1">Try searching with stock symbols like RELIANCE, TCS, INFY</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Popular Stocks */}
      {!showResults && popularStocks.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Popular Stocks</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadPopularStocks}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularStocks.slice(0, 6).map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
