"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, RefreshCw, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

interface MarketSummary {
  nifty50: number
  sensex: number
  niftyChange: number
  sensexChange: number
  topGainers: StockData[]
  topLosers: StockData[]
  mostActive: StockData[]
}

export function MarketDataDisplay() {
  const [marketData, setMarketData] = useState<MarketSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/overview')
      const data = await response.json()
      
      if (data.success) {
        setMarketData(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "1 day ago"
    return `${diffDays} days ago`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
        <div>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Live Market Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            {lastUpdated ? `Last updated ${formatTimeAgo(lastUpdated)}` : "Fetching market data..."}
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading} className="border-white/10">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh data</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="trending">
          <TabsList className="mb-4 bg-white/5 border border-white/10">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="active">Most Active</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="ipos">IPOs</TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            {marketData?.topGainers && marketData.topGainers.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Top Gainers</h4>
                {marketData.topGainers.slice(0, 5).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{stock.symbol}</h3>
                        <span className="text-xs text-gray-400">{stock.name.length > 15 ? stock.name.substring(0, 15) + '...' : stock.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatPrice(stock.price)}</span>
                      <div
                        className={`flex items-center ${stock.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {stock.changePercent >= 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="text-center text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No trending stocks data available</p>
                  <p className="text-xs mt-1">Try refreshing to load data</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {marketData?.mostActive && marketData.mostActive.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Most Active</h4>
                {marketData.mostActive.slice(0, 5).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{stock.symbol}</h3>
                        <span className="text-xs text-gray-400">{stock.name.length > 15 ? stock.name.substring(0, 15) + '...' : stock.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatPrice(stock.price)}</span>
                      <div
                        className={`flex items-center ${stock.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {stock.changePercent >= 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="text-center text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No trending stocks data available</p>
                  <p className="text-xs mt-1">Try refreshing to load data</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="news">
            <div className="flex items-center justify-center h-40">
              <div className="text-center text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No trending stocks data available</p>
                <p className="text-xs mt-1">Try refreshing to load data</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ipos">
            <div className="flex items-center justify-center h-40">
              <div className="text-center text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No trending stocks data available</p>
                <p className="text-xs mt-1">Try refreshing to load data</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
