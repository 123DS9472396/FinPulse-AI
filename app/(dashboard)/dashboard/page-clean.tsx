"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  DollarSign,
  LineChart,
  Award,
  CheckCircle,
  Target,
  Plus,
  Zap,
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowUp,
  Users,
  Calendar,
  Calculator,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading and test APIs
    const loadDashboard = async () => {
      try {
        // Test API connectivity
        const response = await fetch('/api/test-apis')
        const data = await response.json()
        setMarketData(data)
      } catch (error) {
        console.error('API test failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading AIPhen Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-8">
      {/* API Status Banner */}
      {marketData && (
        <Card className="glass-card glow-purple">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">🚀 AIPhen Platform Status</p>
                <p className="text-sm text-muted-foreground">
                  APIs: {marketData.apis?.alphaVantage?.status === 'working' ? '✅ Alpha Vantage' : '❌ Alpha Vantage'} | 
                  {marketData.apis?.yahooFinance?.status === 'working' ? ' ✅ Yahoo Finance' : ' ❌ Yahoo Finance'}
                </p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {marketData.status === 'success' ? 'Connected' : 'Checking...'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-heading">Welcome to AIPhen</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your AI-powered financial companion for smart investments and financial planning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="glass-card bg-purple-600 hover:bg-purple-700 border-0">
            <Link href="/discover">
              <LineChart className="h-4 w-4 mr-2" />
              Explore Markets
            </Link>
          </Button>
          <Button asChild variant="outline" className="glass-card border-white/10">
            <Link href="/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card glow-green glass-highlight hover-float">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">₹1,35,600</p>
                <p className="text-sm text-green-400">+35.6% ↗</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-blue glass-highlight hover-float">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Return</p>
                <p className="text-2xl font-bold">+5.2%</p>
                <p className="text-sm text-blue-400">vs +3.8% last month</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-purple glass-highlight hover-float">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Investments</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-purple-400">Diversified portfolio</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <PieChart className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card glow-orange glass-highlight hover-float">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Progress</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-sm text-orange-400">3 courses completed</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-full">
                <BookOpen className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Market Overview */}
        <div className="xl:col-span-2 space-y-6">
          {/* Live Market Data */}
          <Card className="glass-card glow-purple glass-highlight">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading">Live Market Overview</CardTitle>
                  <CardDescription>Real-time Indian market indices and top stocks</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 glass-card rounded-xl">
                  <p className="text-sm text-muted-foreground">NIFTY 50</p>
                  <p className="text-xl font-bold">19,674.25</p>
                  <p className="text-sm text-green-400">+127.45 (+0.65%)</p>
                </div>
                <div className="p-4 glass-card rounded-xl">
                  <p className="text-sm text-muted-foreground">SENSEX</p>
                  <p className="text-xl font-bold">66,527.67</p>
                  <p className="text-sm text-green-400">+445.87 (+0.67%)</p>
                </div>
                <div className="p-4 glass-card rounded-xl">
                  <p className="text-sm text-muted-foreground">BANK NIFTY</p>
                  <p className="text-xl font-bold">45,123.30</p>
                  <p className="text-sm text-red-400">-234.12 (-0.52%)</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Top Gainers Today</h4>
                <div className="space-y-2">
                  {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'].map((stock, index) => (
                    <div key={stock} className="flex items-center justify-between p-2 glass-card rounded">
                      <span className="font-medium">{stock}</span>
                      <div className="text-right">
                        <span className="text-green-400 font-bold">+{(Math.random() * 5 + 1).toFixed(2)}%</span>
                        <p className="text-xs text-muted-foreground">₹{(Math.random() * 1000 + 2000).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card glow-blue glass-highlight">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Quick Actions</CardTitle>
              <CardDescription>Fast access to key platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col glass-card border-white/10 hover-float">
                  <Link href="/discover">
                    <LineChart className="h-6 w-6 mb-2" />
                    <span className="text-sm">Search Stocks</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col glass-card border-white/10 hover-float">
                  <Link href="/analytics">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Portfolio Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col glass-card border-white/10 hover-float">
                  <Link href="/education">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="text-sm">Learning Hub</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col glass-card border-white/10 hover-float">
                  <Link href="/expenses">
                    <DollarSign className="h-6 w-6 mb-2" />
                    <span className="text-sm">Calculators</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <Card className="glass-card glow-green glass-highlight">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Portfolio Summary</CardTitle>
              <CardDescription>Your investment performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold">₹1,35,600</p>
                  <p className="text-sm text-green-400">+₹35,600 (35.6%)</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Equity</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="glass-card" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Mutual Funds</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="glass-card" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Fixed Deposits</span>
                    <span>5%</span>
                  </div>
                  <Progress value={5} className="glass-card" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card className="glass-card glow-orange glass-highlight">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Learning Journey</CardTitle>
              <CardDescription>Your financial education progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-bold">78%</span>
                </div>
                <Progress value={78} className="glass-card" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Stock Market Basics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Technical Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 border-2 border-orange-400 rounded-full"></div>
                    <span className="text-sm">Portfolio Management</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full glass-card border-white/10">
                  <Link href="/education">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-card glow-purple glass-highlight">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
              <CardDescription>Your latest platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 glass-card rounded">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Viewed RELIANCE analysis</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 glass-card rounded">
                  <Calculator className="h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Used SIP Calculator</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 glass-card rounded">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed Options Trading</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
