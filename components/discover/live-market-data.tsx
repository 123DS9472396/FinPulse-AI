'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, RefreshCw, Activity, DollarSign, BarChart3, ArrowRight } from 'lucide-react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
}

interface MarketSummary {
  nifty50: number
  sensex: number
  niftyChange: number
  sensexChange: number
  niftyBank?: number
  niftyBankChange?: number
  topGainers: StockData[]
  topLosers: StockData[]
  mostActive: StockData[]
}

export function LiveMarketData() {
  const router = useRouter()
  const [marketData, setMarketData] = useState<MarketSummary | null>(null)
  const [newsData, setNewsData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingNews, setLoadingNews] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('gainers')

  useEffect(() => {
    loadMarketData()
    loadNewsData()
    const interval = setInterval(() => {
      loadMarketData()
      loadNewsData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market/overview')
      const data = await response.json()
      if (data.success) {
        setMarketData(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to load market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNewsData = async () => {
    setLoadingNews(true)
    try {
      const response = await fetch('/api/market/news')
      const data = await response.json()
      if (data.success) {
        setNewsData(data.data)
      }
    } catch (error) {
      console.error('Failed to load news data:', error)
    } finally {
      setLoadingNews(false)
    }
  }

  const refreshMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market/overview', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setMarketData(data.data)
        setLastUpdated(new Date())
      }
      await loadNewsData()
    } catch (error) {
      console.error('Failed to refresh market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(price)

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toString()
  }

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)

  const StockList = ({ stocks }: { stocks: StockData[] }) => (
    <div className="space-y-2">
      {stocks && stocks.length > 0 ? (
        stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="glass-card p-3 rounded-xl border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer group"
            onClick={() => router.push(`/discover/stock/${stock.symbol}`)}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Left: symbol + name */}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{stock.symbol}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {stock.name}
                </div>
              </div>
              {/* Right: price + % + arrow */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="text-right">
                  <div className="font-semibold text-sm whitespace-nowrap">
                    {formatPrice(stock.price)}
                  </div>
                  <div className={`text-[11px] flex items-center justify-end gap-0.5 ${(stock.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stock.changePercent || 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </div>
            </div>
            {/* Vol row */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <BarChart3 className="h-3 w-3 flex-shrink-0" />
              <span>Vol: {formatVolume(stock.volume)}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No data available. Try refreshing.</p>
        </div>
      )}
    </div>
  )

  return (
    <Card className="glass-card glow-purple glass-highlight">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-green-400" />
              Live Market Data
            </CardTitle>
            <CardDescription className="text-xs">Real-time market insights and analysis</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMarketData}
            disabled={loading}
            className="glass-card border-white/10 w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reload cached data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Indices */}
        {marketData && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'NIFTY 50', value: marketData.nifty50, change: marketData.niftyChange, icon: <DollarSign className="h-4 w-4 text-blue-400" /> },
              { label: 'SENSEX', value: marketData.sensex, change: marketData.sensexChange, icon: <BarChart3 className="h-4 w-4 text-orange-400" /> },
              { label: 'NIFTY BANK', value: marketData.niftyBank ?? 54853.85, change: marketData.niftyBankChange ?? -0.43, icon: <Activity className="h-4 w-4 text-purple-400" /> },
            ].map(idx => (
              <Card key={idx.label} className="glass-card border-white/10">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {idx.icon}
                    <span className="font-semibold text-xs">{idx.label}</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {typeof idx.value === 'number' ? idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : idx.value}
                  </div>
                  <div className={`text-xs flex items-center justify-center gap-0.5 ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center">Updated {formatTime(lastUpdated)}</div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap w-full h-auto p-1 glass-card">
            <TabsTrigger value="gainers" className="flex-1 text-[11px] py-1">Trending</TabsTrigger>
            <TabsTrigger value="active" className="flex-1 text-[11px] py-1">Active</TabsTrigger>
            <TabsTrigger value="news" className="flex-1 text-[11px] py-1">News</TabsTrigger>
            <TabsTrigger value="ipos" className="flex-1 text-[11px] py-1">IPOs</TabsTrigger>
          </TabsList>
 
          <TabsContent value="gainers" className="mt-3">
            <StockList stocks={marketData?.topGainers || []} />
          </TabsContent>
 
          <TabsContent value="active" className="mt-3">
            <StockList stocks={marketData?.mostActive || []} />
          </TabsContent>
 
          <TabsContent value="news" className="mt-3">
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {loadingNews && newsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground animate-pulse">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-spin text-purple-400" />
                  <p className="text-sm">Fetching live global & Indian market news...</p>
                </div>
              ) : newsData && newsData.length > 0 ? (
                newsData.map((item, idx) => {
                  const dateStr = item.providerPublishTime
                    ? new Date(item.providerPublishTime * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''
 
                  return (
                    <a
                      key={item.uuid || idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-3 rounded-xl border border-white/5 hover:border-purple-500/40 hover:bg-white/5 transition-all cursor-pointer block group hover:scale-[1.01] text-left"
                    >
                      <p className="font-semibold text-xs text-white leading-snug group-hover:text-purple-400 transition-colors mb-1.5 line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                        <span className="font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.publisher}</span>
                        {dateStr && <span>{dateStr}</span>}
                      </div>
                    </a>
                  )
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No live market news available. Try refreshing.</p>
                </div>
              )}
            </div>
          </TabsContent>
 
          <TabsContent value="ipos" className="mt-3">
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">IPO data coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
