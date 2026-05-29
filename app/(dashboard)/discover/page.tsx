import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiscoverTabs } from "@/components/discover/discover-tabs"
import { InstrumentFilters } from "@/components/discover/instrument-filters"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Star } from "lucide-react"
import { getCachedMutualFunds } from "@/lib/market-data-cache"
import { RealTimeStockSearch } from "@/components/discover/real-time-stock-search"
import { LiveMarketData } from "@/components/discover/live-market-data"
import { marketDataService } from "@/lib/market-api"

export default async function DiscoverPage() {
  // Fetch mutual funds data directly from the database
  const { funds: mutualFunds } = await getCachedMutualFunds()

  // Fetch live prices for featured assets dynamically in parallel
  const livePrices = await marketDataService.getMultipleStocks(['RELIANCE', 'TCS', 'HDFCBANK'])
  
  const getLiveStock = (sym: string) => {
    return livePrices.find(s => s.symbol === sym)
  }

  const rel = getLiveStock('RELIANCE')
  const tcs = getLiveStock('TCS')
  const hdfc = getLiveStock('HDFCBANK')

  const formatPrice = (val?: number) => 
    val ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'

  const formatChange = (val?: number) =>
    val !== undefined ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : '0.00%'

  const marketHighlights = [
    {
      title: "Top Gainers",
      value: "RELIANCE",
      change: formatChange(rel?.changePercent),
      price: formatPrice(rel?.price),
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      isPositive: (rel?.changePercent ?? 0) >= 0,
    },
    {
      title: "Most Active",
      value: "TCS",
      change: formatChange(tcs?.changePercent),
      price: formatPrice(tcs?.price),
      icon: <BarChart3 className="h-5 w-5 text-finance-purple" />,
      isPositive: (tcs?.changePercent ?? 0) >= 0,
    },
    {
      title: "Top Losers",
      value: "HDFC Bank",
      change: formatChange(hdfc?.changePercent),
      price: formatPrice(hdfc?.price),
      icon: <TrendingDown className="h-5 w-5 text-red-400" />,
      isPositive: (hdfc?.changePercent ?? 0) >= 0,
    },
    {
      title: "Market Cap",
      value: "₹2.8L Cr",
      change: "+1.2%",
      price: "Total",
      icon: <DollarSign className="h-5 w-5 text-finance-purple" />,
      isPositive: true,
    },
  ]

  const featuredInstruments = [
    {
      name: "Reliance Industries",
      symbol: "RELIANCE",
      price: formatPrice(rel?.price),
      change: formatChange(rel?.changePercent),
      volume: rel ? `${(rel.volume / 1e6).toFixed(1)}M` : "N/A",
      rating: 4.5,
      category: "Large Cap",
      isPositive: (rel?.changePercent ?? 0) >= 0,
    },
    {
      name: "Tata Consultancy Services",
      symbol: "TCS",
      price: formatPrice(tcs?.price),
      change: formatChange(tcs?.changePercent),
      volume: tcs ? `${(tcs.volume / 1e6).toFixed(1)}M` : "N/A",
      rating: 4.8,
      category: "Large Cap",
      isPositive: (tcs?.changePercent ?? 0) >= 0,
    },
    {
      name: "HDFC Bank Ltd",
      symbol: "HDFCBANK",
      price: formatPrice(hdfc?.price),
      change: formatChange(hdfc?.changePercent),
      volume: hdfc ? `${(hdfc.volume / 1e6).toFixed(1)}M` : "N/A",
      rating: 4.3,
      category: "Banking",
      isPositive: (hdfc?.changePercent ?? 0) >= 0,
    },
  ]

  return (
    <div className="container py-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-heading">Discover Investments</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore and analyze investment opportunities with AI-powered insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="max-w-4xl mx-auto">
        <RealTimeStockSearch />
      </div>

      {/* Market Highlights - Always show */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketHighlights.map((highlight, index) => (
          <Card
            key={index}
            className={`glass-card ${highlight.isPositive ? "glow-green" : "glow-red"} glass-highlight hover-float`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{highlight.title}</p>
                  <p className="text-xl font-bold">{highlight.value}</p>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium ${highlight.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                    >
                      {highlight.change}
                    </span>
                    <span className="text-sm text-muted-foreground">{highlight.price}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl glass-card">{highlight.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - Only show on the side */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar pr-2 pb-6">
          <InstrumentFilters />
          
          {/* Live Market Data */}
          <LiveMarketData />
        </div>

        {/* Content Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Featured Instruments - Primary Card with Purple Glow */}
          <Card className="glass-card glow-purple glass-highlight hover-float">
            <CardHeader>
              <CardTitle className="text-xl text-gradient-heading">Featured Instruments</CardTitle>
              <CardDescription>Top-rated investment opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredInstruments.map((instrument, index) => (
                <div key={index} className="glass-card p-4 rounded-xl hover-float group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl glass-card group-hover:bg-white/20 transition-colors">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{instrument.name}</h3>
                        <p className="text-sm text-muted-foreground">{instrument.symbol}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="glass-card text-xs">{instrument.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">{instrument.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{instrument.price}</div>
                      <div
                        className={`text-sm font-medium ${instrument.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                      >
                        {instrument.change}
                      </div>
                      <div className="text-xs text-muted-foreground">Vol: {instrument.volume}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Investment Types Tabs - Controlled by URL params */}
          <DiscoverTabs mutualFunds={mutualFunds} />
        </div>
      </div>
    </div>
  )
}
