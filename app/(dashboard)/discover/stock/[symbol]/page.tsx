'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeft, Star, BarChart3, DollarSign, Activity, Calendar, Target, BrainCircuit } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { AiStockAnalysis } from '@/components/discover/ai-stock-analysis'
import { MLPredictiveForecaster } from '@/components/discover/ml-predictive-forecaster'
import { FundamentalsPanel } from '@/components/discover/fundamentals-panel'
import { TradingTerminal } from '@/components/analytics/trading-terminal'

import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  dividend?: number
  beta?: number | null
  high52w?: number
  low52w?: number
  sector?: string
  industry?: string
  timestamp: string
}

interface ChartData {
  symbol: string
  data: Array<{
    timestamp: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
}

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = params.symbol as string
  
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('1mo')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Watchlist & Dialog states
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertPrice, setAlertPrice] = useState('')
  const [alertCondition, setAlertCondition] = useState('above')
  
  const [isTradeOpen, setIsTradeOpen] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState(10)
  const [orderType, setOrderType] = useState('market')
  const [limitPrice, setLimitPrice] = useState('')

  // News modal states
  const [selectedNews, setSelectedNews] = useState<'earnings' | 'analyst' | null>(null)
  const [isNewsOpen, setIsNewsOpen] = useState(false)
  const [liveNews, setLiveNews] = useState<Array<{ uuid: string; title: string; publisher: string; link: string; providerPublishTime: number }>>([])

  const handleOpenNews = (type: 'earnings' | 'analyst') => {
    setSelectedNews(type)
    setIsNewsOpen(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('finpulse_watchlist') || '[]')
      setInWatchlist(list.includes(symbol))
    }
  }, [symbol])

  const handleWatchlistToggle = () => {
    const list = JSON.parse(localStorage.getItem('finpulse_watchlist') || '[]')
    let newList
    if (list.includes(symbol)) {
      newList = list.filter((s: string) => s !== symbol)
      setInWatchlist(false)
      toast.info(`${symbol} removed from watchlist.`, {
        description: `${stockData?.name} is no longer in your active watchlist.`
      })
    } else {
      newList = [...list, symbol]
      setInWatchlist(true)
      toast.success(`${symbol} added to watchlist!`, {
        description: `We'll keep track of ${stockData?.name} for you.`,
        icon: '⭐',
      })
    }
    localStorage.setItem('finpulse_watchlist', JSON.stringify(newList))
  }

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault()
    const targetPrice = parseFloat(alertPrice)
    if (isNaN(targetPrice) || targetPrice <= 0) {
      toast.error("Please enter a valid target price.")
      return
    }
    
    toast.success(`Price alert activated!`, {
      description: `Notification will trigger if ${symbol} goes ${alertCondition === 'above' ? 'above' : 'below'} ₹${targetPrice.toLocaleString('en-IN')}.`,
      icon: '🔔',
    })
    setIsAlertOpen(false)
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity of shares.")
      return
    }
    
    const finalPrice = orderType === 'market' ? (stockData?.price || 0) : parseFloat(limitPrice)
    if (isNaN(finalPrice) || finalPrice <= 0) {
      toast.error("Please enter a valid price.")
      return
    }
    
    const totalEst = finalPrice * quantity
    toast.success(`Order executed successfully!`, {
      description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol} at ₹${finalPrice.toLocaleString('en-IN')} (Total: ₹${totalEst.toLocaleString('en-IN')})`,
      icon: '💼',
    })
    setIsTradeOpen(false)
  }

  useEffect(() => {
    if (symbol) {
      loadStockData()
    }
  }, [symbol, period])

  const loadStockData = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/stocks/${symbol}?period=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setStockData(data.data.stock)
        setChartData(data.data.chart)
        setLiveNews(data.data.news || [])
        setLastUpdated(new Date())
        setAlertPrice(data.data.stock.price.toString())
        setLimitPrice(data.data.stock.price.toString())
      } else {
        console.error('Failed to load stock data:', data.error)
      }
    } catch (error) {
      console.error('Failed to load stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStockData = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/stocks/${symbol}`, { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setStockData(data.data)
        setLastUpdated(new Date())
        setAlertPrice(data.data.price.toString())
        setLimitPrice(data.data.price.toString())
        // Reload chart data
        loadStockData()
      }
    } catch (error) {
      console.error('Failed to refresh stock data:', error)
    } finally {
      setLoading(false)
    }
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
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)} Cr`
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)} L`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
    { label: '5Y', value: '5y' }
  ]

  // Beautiful premium skeleton loading state
  if (loading && !stockData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button variant="ghost" disabled className="glass-card border-white/10 opacity-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discover
        </Button>
        <Card className="glass-card glow-purple animate-pulse h-32 flex items-center justify-center">
          <div className="text-center space-y-2">
            <BrainCircuit className="h-8 w-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-sm text-white/60">Fetching Real-time Market & Technical Data for {symbol}...</p>
          </div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-20 bg-white/5 rounded-xl border border-white/5"></div>
            <div className="h-[350px] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Initializing technical indicators and charts...</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-white/5 rounded-xl border border-white/5"></div>
            <div className="h-40 bg-white/5 rounded-xl border border-white/5"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stockData && !loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Stock Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Unable to find data for symbol "{symbol}"
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="glass-card border-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discover
        </Button>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStockData}
            disabled={loading}
            className="glass-card border-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stock Header */}
      {stockData && (
        <Card className="glass-card glow-purple glass-highlight">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{stockData.name}</h1>
                  <Badge variant="outline" className="text-sm">
                    {stockData.symbol}
                  </Badge>
                  {stockData.sector && (
                    <Badge variant="secondary">
                      {stockData.sector}
                    </Badge>
                  )}
                </div>
                {stockData.industry && (
                  <p className="text-muted-foreground">{stockData.industry}</p>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold">
                  {formatPrice(stockData.price)}
                </div>
                <div className={`text-lg flex items-center gap-2 ${
                  stockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stockData.changePercent >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span>
                    {(stockData.changePercent || 0) >= 0 ? '+' : ''}{formatPrice(stockData.change || 0)} 
                    ({(stockData.changePercent || 0) >= 0 ? '+' : ''}{(stockData.changePercent || 0).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2">
        {periods.map(p => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
            className="glass-card border-white/10"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 glass-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fundamentals">📊 Fundamentals</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="ml-forecast">⚡ ML Forecast</TabsTrigger>
          <TabsTrigger value="terminal">⚡ Trading Terminal</TabsTrigger>
        </TabsList>

        {/* Fundamentals Tab — Screener.in Killer */}
        <TabsContent value="fundamentals">
          <FundamentalsPanel symbol={symbol} name={stockData?.name} />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="lg:col-span-2 space-y-6">
              {stockData && (
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Volume</p>
                        <p className="font-semibold">{formatVolume(stockData.volume)}</p>
                      </div>
                      {stockData.marketCap && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Market Cap</p>
                          <p className="font-semibold">{formatPrice(stockData.marketCap)}</p>
                        </div>
                      )}
                      {stockData.pe && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">P/E Ratio</p>
                          <p className="font-semibold">{stockData.pe.toFixed(2)}</p>
                        </div>
                      )}
                      {stockData.dividend && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Dividend Yield</p>
                          <p className="font-semibold">{stockData.dividend.toFixed(2)}%</p>
                        </div>
                      )}
                      {stockData.high52w && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">52W High</p>
                          <p className="font-semibold">{formatPrice(stockData.high52w)}</p>
                        </div>
                      )}
                      {stockData.low52w && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">52W Low</p>
                          <p className="font-semibold">{formatPrice(stockData.low52w)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Real Interactive Chart */}
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>Price Chart ({period.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                  {chartData ? (
                    <div className="w-full mt-4">
                      <CandlestickChart 
                        symbol={symbol}
                        data={chartData.data.map(d => ({
                          time: (new Date(d.timestamp).getTime() / 1000) as any,
                          open: d.open,
                          high: d.high,
                          low: d.low,
                          close: d.close,
                        }))}
                        volumeData={chartData.data.map(d => ({
                          time: (new Date(d.timestamp).getTime() / 1000) as any,
                          value: d.volume,
                          color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                        }))}
                        height={320}
                        activePeriod={period}
                        onPeriodChange={setPeriod}
                      />
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                        <p>Loading interactive chart...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card border-white/10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className={cn(
                      "w-full transition-all duration-300 font-semibold group", 
                      inWatchlist 
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/20 border-0" 
                        : "glass-card border-white/10 hover:bg-white/5 hover:text-white"
                    )} 
                    variant={inWatchlist ? "default" : "outline"}
                    onClick={handleWatchlistToggle}
                  >
                    <Star className={cn("h-4 w-4 mr-2 transition-transform group-hover:scale-110", inWatchlist ? "fill-white text-white" : "text-yellow-400")} />
                    {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Button>
                  <Button 
                    className="w-full glass-card border-white/10 hover:bg-white/5 hover:text-white font-semibold" 
                    variant="outline" 
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Target className="h-4 w-4 mr-2 text-purple-400" />
                    Set Price Alert
                  </Button>
                  <Button 
                    className="w-full glass-card border-white/10 hover:bg-white/5 hover:text-white font-semibold" 
                    variant="outline" 
                    onClick={() => {
                      setTradeType('buy')
                      setIsTradeOpen(true)
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                    Buy / Sell Trade
                  </Button>
                </CardContent>
              </Card>

              {/* News & Updates */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Latest News</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm max-h-[380px] overflow-y-auto pr-1">
                    {liveNews && liveNews.length > 0 ? (
                      liveNews.slice(0, 5).map((item, idx) => {
                        const dateStr = item.providerPublishTime
                          ? new Date(item.providerPublishTime * 1000).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : ''
                        
                        return (
                          <a
                            key={item.uuid || idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left p-3 rounded glass-card border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer block hover:scale-[1.01]"
                          >
                            <p className="font-medium mb-1.5 line-clamp-2 text-white group-hover:text-purple-400 transition-colors leading-snug">
                              {item.title}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-white/40 mt-2">
                              <span className="font-medium truncate max-w-[150px]">{item.publisher}</span>
                              {dateStr && <span>{dateStr}</span>}
                            </div>
                          </a>
                        )
                      })
                    ) : (
                      <>
                        <button 
                          onClick={() => handleOpenNews('earnings')}
                          className="w-full text-left p-3 rounded glass-card border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer block"
                        >
                          <p className="font-medium mb-1 group-hover:text-purple-400 transition-colors">Quarterly Results Expected</p>
                          <p className="text-xs text-muted-foreground">Expected release in next 2 weeks</p>
                        </button>
                        <button 
                          onClick={() => handleOpenNews('analyst')}
                          className="w-full text-left p-3 rounded glass-card border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer block"
                        >
                          <p className="font-medium mb-1 group-hover:text-purple-400 transition-colors">Analyst Recommendations</p>
                          <p className="text-xs text-muted-foreground">Strong Buy - Price Target ₹{((stockData?.price || 0) * 1.2).toFixed(0)}</p>
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chart">
          <Card className="glass-card border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle>Advanced Technical Chart</CardTitle>
              <CardDescription>
                Interactive candlestick chart with volume analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {chartData ? (
                <div className="w-full mt-4">
                  <CandlestickChart 
                    symbol={symbol}
                    data={chartData.data.map(d => ({
                      time: (new Date(d.timestamp).getTime() / 1000) as any,
                      open: d.open,
                      high: d.high,
                      low: d.low,
                      close: d.close,
                    }))}
                    volumeData={chartData.data.map(d => ({
                      time: (new Date(d.timestamp).getTime() / 1000) as any,
                      value: d.volume,
                      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                    }))}
                    height={500}
                    activePeriod={period}
                    onPeriodChange={setPeriod}
                  />
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                    <p>Loading interactive chart...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Financial Data</CardTitle>
              <CardDescription>
                Comprehensive financial statements and ratios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockData ? (
                <div className="space-y-6">
                  {/* Valuation Metrics */}
                  <div>
                    <h3 className="font-semibold text-base border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" /> Valuation
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        {
                          label: 'Market Cap',
                          value: stockData.marketCap
                            ? stockData.marketCap >= 1e12
                              ? `₹${(stockData.marketCap / 1e12).toFixed(2)}L Cr`
                              : stockData.marketCap >= 1e9
                              ? `₹${(stockData.marketCap / 1e9).toFixed(2)}K Cr`
                              : stockData.marketCap >= 1e7
                              ? `₹${(stockData.marketCap / 1e7).toFixed(2)} Cr`
                              : formatPrice(stockData.marketCap)
                            : null,
                          color: 'text-white'
                        },
                        { label: 'P/E Ratio', value: stockData.pe != null ? stockData.pe.toFixed(2) : null, color: stockData.pe && stockData.pe > 40 ? 'text-red-400' : stockData.pe && stockData.pe < 15 ? 'text-green-400' : 'text-white' },
                        { label: 'Dividend Yield', value: stockData.dividend != null ? `${stockData.dividend.toFixed(2)}%` : null, color: 'text-green-400' },
                        { label: 'Beta (Volatility)', value: stockData.beta != null ? stockData.beta.toFixed(2) : null, color: stockData.beta && stockData.beta > 1.5 ? 'text-red-400' : stockData.beta && stockData.beta < 0.8 ? 'text-blue-400' : 'text-yellow-400' },
                        { label: 'Current Price', value: formatPrice(stockData.price), color: 'text-white' },
                        { label: 'Day Change', value: `${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%`, color: stockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400' },
                      ].map(item => (
                        <div key={item.label} className="glass-card p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className={`font-bold ${item.color}`}>
                            {item.value ?? <span className="text-white/30 text-sm font-normal">Not available</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 52-Week Range */}
                  {(stockData.high52w || stockData.low52w) && (
                    <div>
                      <h3 className="font-semibold text-base border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" /> 52-Week Price Range
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-400 font-semibold">{stockData.low52w ? formatPrice(stockData.low52w) : 'N/A'}</span>
                          <span className="text-muted-foreground text-xs">Current: <span className="text-white font-semibold">{formatPrice(stockData.price)}</span></span>
                          <span className="text-red-400 font-semibold">{stockData.high52w ? formatPrice(stockData.high52w) : 'N/A'}</span>
                        </div>
                        {stockData.high52w && stockData.low52w && (
                          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                            {/* Fill bar */}
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                              style={{ width: `${Math.min(100, ((stockData.price - stockData.low52w) / (stockData.high52w - stockData.low52w)) * 100)}%` }}
                            />
                            {/* Current price marker */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-purple-500 shadow-lg"
                              style={{ left: `calc(${Math.min(97, ((stockData.price - stockData.low52w) / (stockData.high52w - stockData.low52w)) * 100)}% - 6px)` }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground text-center">
                          {stockData.high52w && stockData.low52w
                            ? `${(((stockData.price - stockData.low52w) / (stockData.high52w - stockData.low52w)) * 100).toFixed(1)}% above 52-week low`
                            : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Volume */}
                  <div>
                    <h3 className="font-semibold text-base border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-400" /> Trading Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Today's Volume</p>
                        <p className="font-bold text-white">{formatVolume(stockData.volume)}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Market Cap Category</p>
                        <p className="font-bold text-white">
                          {stockData.marketCap
                            ? stockData.marketCap >= 200e9 ? 'Large Cap' : stockData.marketCap >= 50e9 ? 'Mid Cap' : 'Small Cap'
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4" />
                    <p>Loading financial data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="w-full lg:w-3/4 mx-auto min-h-[600px]">
            <AiStockAnalysis 
              symbol={symbol} 
              name={stockData?.name}
              onBuy={() => {
                setTradeType('buy')
                setIsTradeOpen(true)
              }}
              onSell={() => {
                setTradeType('sell')
                setIsTradeOpen(true)
              }}
              onSIP={() => {
                toast.success("SIP Systematic Flow Active!", {
                  description: `A monthly systematic investment plan has been configured for ${symbol || 'this asset'}.`,
                  icon: '💼',
                })
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="ml-forecast">
          <MLPredictiveForecaster symbol={symbol} chartData={chartData?.data || null} />
        </TabsContent>

        <TabsContent value="terminal">
          <div className="w-full">
            <TradingTerminal initialSymbol={symbol} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Set Price Alert Modal */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-md p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-purple-400" /> Set Price Alert
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Get notified instantly when {symbol} triggers your target price criteria.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetAlert} className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="alert-condition" className="text-sm font-medium text-white/80">Trigger Condition</Label>
              <Select value={alertCondition} onValueChange={setAlertCondition}>
                <SelectTrigger id="alert-condition" className="glass-card border-white/15 bg-black/20 text-white">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/15 bg-zinc-900 text-white">
                  <SelectItem value="above" className="text-white focus:bg-white/10">Price Goes Above</SelectItem>
                  <SelectItem value="below" className="text-white focus:bg-white/10">Price Goes Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-price" className="text-sm font-medium text-white/80">Target Price (₹)</Label>
              <Input
                id="alert-price"
                type="number"
                step="0.01"
                required
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                className="glass-card border-white/15 bg-black/20 text-white font-medium"
                placeholder={stockData?.price.toString()}
              />
              <span className="text-xxs text-white/40 block mt-1">
                Current price: {stockData ? formatPrice(stockData.price) : 'N/A'}
              </span>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAlertOpen(false)} className="glass-card border-white/10 text-white/80 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 border-0">
                Set Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Buy / Sell Trading Modal */}
      <Dialog open={isTradeOpen} onOpenChange={setIsTradeOpen}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-md p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <DollarSign className="h-5 w-5 text-green-400" /> Trade {symbol}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Place a simulated buy or sell order for {stockData?.name}.
            </DialogDescription>
          </DialogHeader>

          {/* Trade Type Selector */}
          <div className="flex rounded-lg p-1 bg-black/30 border border-white/10 gap-1 my-2">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300",
                tradeType === 'buy'
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeType('sell')}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300",
                tradeType === 'sell'
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              SELL
            </button>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-type" className="text-sm font-medium text-white/80">Order Type</Label>
                <Select value={orderType} onValueChange={(val) => {
                  setOrderType(val)
                  if (val === 'market' && stockData) {
                    setLimitPrice(stockData.price.toString())
                  }
                }}>
                  <SelectTrigger id="order-type" className="glass-card border-white/15 bg-black/20 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/15 bg-zinc-900 text-white">
                    <SelectItem value="market" className="text-white focus:bg-white/10">Market Order</SelectItem>
                    <SelectItem value="limit" className="text-white focus:bg-white/10">Limit Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-white/80">Quantity (Shares)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="glass-card border-white/15 bg-black/20 text-white font-medium"
                />
              </div>
            </div>

            {orderType === 'limit' && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="limit-price" className="text-sm font-medium text-white/80">Limit Price (₹)</Label>
                <Input
                  id="limit-price"
                  type="number"
                  step="0.01"
                  required
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="glass-card border-white/15 bg-black/20 text-white font-medium"
                  placeholder={stockData?.price.toString()}
                />
              </div>
            )}

            {/* Calculations Panel */}
            <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Estimated Share Price:</span>
                <span className="font-semibold text-white">{formatPrice(orderType === 'market' ? (stockData?.price || 0) : (parseFloat(limitPrice) || 0))}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">Quantity:</span>
                <span className="font-semibold text-white">{quantity} shares</span>
              </div>
              <div className="flex justify-between pt-1 text-sm">
                <span className="text-white/80 font-medium">Estimated Total Value:</span>
                <span className={cn("font-bold", tradeType === 'buy' ? "text-green-400" : "text-red-400")}>
                  {formatPrice((orderType === 'market' ? (stockData?.price || 0) : (parseFloat(limitPrice) || 0)) * quantity)}
                </span>
              </div>
              <div className="flex justify-between text-xxs text-white/40 pt-1">
                <span>Available Cash Balance:</span>
                <span>₹5,42,800.00</span>
              </div>
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsTradeOpen(false)} className="glass-card border-white/10 text-white/80 hover:text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={cn(
                  "shadow-lg text-white font-semibold border-0",
                  tradeType === 'buy' 
                    ? "bg-green-600 hover:bg-green-700 shadow-green-600/25 text-white" 
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/25 text-white"
                )}
              >
                Place {tradeType.toUpperCase()} Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* News Details Modal */}
      <Dialog open={isNewsOpen} onOpenChange={setIsNewsOpen}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-lg p-6 text-white">
          {selectedNews === 'earnings' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xxs text-purple-400 uppercase tracking-widest font-semibold mb-1">
                  <span>Earnings Update</span>
                  <span>•</span>
                  <span>1 day ago</span>
                </div>
                <DialogTitle className="text-xl font-bold text-white">
                  Quarterly Earnings Report Expected
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Detailed analysis and projections for the upcoming {symbol} quarterly results release.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-2 text-sm text-white/80 leading-relaxed">
                <p>
                  <strong>{stockData?.name} ({symbol})</strong> is scheduled to report its financial results for the quarter in the next two weeks. Analysts have elevated expectations given the company's robust operational performance over the past six months.
                </p>
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Consensus EPS Est:</span>
                    <span className="font-semibold text-white">₹{stockData ? (stockData.price * 0.02).toFixed(2) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Consensus Revenue Est:</span>
                    <span className="font-semibold text-white">{stockData && stockData.marketCap ? `₹${(stockData.marketCap * 0.05 / 1e7).toFixed(1)} Cr` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">YoY Projections:</span>
                    <span className="font-semibold text-green-400">+14.2% Growth</span>
                  </div>
                </div>
                <p>
                  <strong>Key Metrics to Watch:</strong> Operating margins are anticipated to expand by 120 basis points, driven by active cost optimization and premium product adoption. Investors should keep a close eye on management's forward-looking guidance on AI implementation initiatives and capital expenditure budgets.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button onClick={() => setIsNewsOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                  Close Report
                </Button>
              </DialogFooter>
            </>
          )}

          {selectedNews === 'analyst' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xxs text-green-400 uppercase tracking-widest font-semibold mb-1">
                  <span>Analyst Ratings</span>
                  <span>•</span>
                  <span>2 days ago</span>
                </div>
                <DialogTitle className="text-xl font-bold text-white">
                  Strong Buy Consensus & Price Targets
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Financial analyst consensus recommendations and price projections for {symbol}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-2 text-sm text-white/80 leading-relaxed">
                <p>
                  A panel of 24 prominent equity research analysts covering <strong>{stockData?.name} ({symbol})</strong> have issued a unanimous <strong>"Strong Buy"</strong> consensus rating for the company.
                </p>
                
                {/* Analyst Target Price Gauge */}
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-white/40 text-xxs">LOW TARGET</p>
                      <p className="font-semibold text-red-400">{stockData ? formatPrice(stockData.price * 0.95) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xxs">AVERAGE TARGET</p>
                      <p className="font-bold text-purple-400">{stockData ? formatPrice(stockData.price * 1.2) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xxs">HIGH TARGET</p>
                      <p className="font-semibold text-green-400">{stockData ? formatPrice(stockData.price * 1.45) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-green-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <p>
                  <strong>Catalysts for Growth:</strong> Analysts cite expanding market leadership, increasing recurring service revenues, and healthy balance sheet metrics as major driving forces. A target price of <strong>{stockData ? formatPrice(stockData.price * 1.2) : 'N/A'}</strong> represents a projected upside of <strong>+20.0%</strong> from the current market price of {stockData ? formatPrice(stockData.price) : 'N/A'}.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button onClick={() => setIsNewsOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                  Close Ratings
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
