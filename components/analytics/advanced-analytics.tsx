'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Download, Calendar, BarChart3, PieChart, Activity, RefreshCw, FileText } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

// Premium Recharts imports for visual portfolio analytics
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Pie as RechartsPie, 
  Cell 
} from 'recharts'

// Advanced Options & Spot Candlestick Trading Terminal
import { TradingTerminal } from './trading-terminal'

interface AnalyticsData {
  totalGain: number
  totalGainPercent: number
  portfolioValue: number
  monthlyReturn: number
  annualReturn: number
  riskScore: string
  volatility: number
  performance: Array<{
    month: string
    value: number
    change: number
    date: string
  }>
  allocation: Array<{
    name: string
    percentage: number
    amount: number
    color: string
  }>
  sectors: Array<{
    name: string
    percentage: number
    change: number
    amount: number
  }>
  monthlyPerformance: Array<{
    month: string
    return: number
    value: number
  }>
}

export default function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('7months')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [period])

  const loadAnalyticsData = async () => {
    setLoading(true)
    
    // Default fallback values
    let portfolioValue = 135600
    let monthlyReturn = 5.2
    let equityPct = 35
    let mfPct = 25

    try {
      const supabase = getSupabaseBrowser()
      // Enforce a strict 500ms timeout on the Supabase network promise to prevent hanging offline
      const userPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('current_portfolio_value, risk_tolerance, investment_goal')
          .eq('user_id', user.id)
          .single()
        if (profile) {
          portfolioValue = profile.current_portfolio_value || portfolioValue
          const risk = profile.risk_tolerance || 'moderate'
          equityPct = risk === 'high' ? 70 : risk === 'low' ? 40 : 55
          mfPct     = risk === 'high' ? 20 : risk === 'low' ? 35 : 30
        }
      }
    } catch (_) {
      console.log('⚠️ [FinPulse Analytics] Supabase profile fetch timed out or failed. Falling back to high-fidelity mock data.')
    }

    const annualReturn = +(monthlyReturn * 12 * 0.7).toFixed(1)
    const totalGain    = Math.round(portfolioValue * 0.26)

    setTimeout(() => {
      const mockData: AnalyticsData = {
        totalGain,
        totalGainPercent: 26.0,
        portfolioValue,
        monthlyReturn,
        annualReturn,
        riskScore: 'Moderate',
        volatility: 16.2,
        performance: [
          { month: 'Jan', value: Math.round(portfolioValue * 0.76), change: 2.8, date: '2024-01-01' },
          { month: 'Feb', value: Math.round(portfolioValue * 0.80), change: 5.5, date: '2024-02-01' },
          { month: 'Mar', value: Math.round(portfolioValue * 0.78), change: -2.1, date: '2024-03-01' },
          { month: 'Apr', value: Math.round(portfolioValue * 0.85), change: 8.1, date: '2024-04-01' },
          { month: 'May', value: Math.round(portfolioValue * 0.90), change: 6.5, date: '2024-05-01' },
          { month: 'Jun', value: Math.round(portfolioValue * 0.95), change: 5.4, date: '2024-06-01' },
          { month: 'Jul', value: portfolioValue,                    change: monthlyReturn, date: '2024-07-01' }
        ],
        allocation: [
          { name: 'Large Cap Stocks', percentage: equityPct, amount: Math.round(portfolioValue * equityPct / 100), color: '#9b87f5' },
          { name: 'Mid Cap Stocks',   percentage: 20,        amount: Math.round(portfolioValue * 0.20), color: '#8b5cf6' },
          { name: 'Mutual Funds',     percentage: mfPct,     amount: Math.round(portfolioValue * mfPct / 100), color: '#ec4899' },
          { name: 'Bonds & FDs',      percentage: 15,        amount: Math.round(portfolioValue * 0.15), color: '#10b981' },
          { name: 'Cash & Liquid',    percentage: 5,         amount: Math.round(portfolioValue * 0.05), color: '#f59e0b' }
        ],
        sectors: [
          { name: 'Information Technology', percentage: 28, change: 12.5, amount: Math.round(portfolioValue * 0.28) },
          { name: 'Financial Services',     percentage: 22, change: 8.2,  amount: Math.round(portfolioValue * 0.22) },
          { name: 'Healthcare & Pharma',    percentage: 18, change: 15.1, amount: Math.round(portfolioValue * 0.18) },
          { name: 'Consumer Goods',         percentage: 12, change: 5.8,  amount: Math.round(portfolioValue * 0.12) },
          { name: 'Energy & Power',         percentage: 10, change: -2.3, amount: Math.round(portfolioValue * 0.10) },
          { name: 'Infrastructure',         percentage: 6,  change: 18.7, amount: Math.round(portfolioValue * 0.06) },
          { name: 'Others',                 percentage: 4,  change: 3.2,  amount: Math.round(portfolioValue * 0.04) }
        ],
        monthlyPerformance: [
          { month: 'Jan 2024', return: 2.8, value: Math.round(portfolioValue * 0.76) },
          { month: 'Feb 2024', return: 5.5, value: Math.round(portfolioValue * 0.80) },
          { month: 'Mar 2024', return: -2.1, value: Math.round(portfolioValue * 0.78) },
          { month: 'Apr 2024', return: 8.1, value: Math.round(portfolioValue * 0.85) },
          { month: 'May 2024', return: 6.5, value: Math.round(portfolioValue * 0.90) },
          { month: 'Jun 2024', return: 5.4, value: Math.round(portfolioValue * 0.95) },
          { month: 'Jul 2024', return: monthlyReturn, value: portfolioValue }
        ]
      }
      
      setAnalyticsData(mockData)
      setLastUpdated(new Date())
      setLoading(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`
    } else if (amount >= 100000) {
      // Use 1 decimal place to prevent confusing rounding ticks (e.g. showing 1.1 L and 1.4 L uniquely)
      return `₹${(amount / 100000).toFixed(1)} L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const downloadPDF = async () => {
    if (!analyticsData) return
    
    // Create PDF content
    const pdfContent = `
      FinPulse AI Portfolio Analytics Report
      Generated on: ${new Date().toLocaleDateString('en-IN')}
      
      PORTFOLIO SUMMARY
      Total Portfolio Value: ${formatCurrency(analyticsData.portfolioValue)}
      Total Gain: ${formatCurrency(analyticsData.totalGain)} (${analyticsData.totalGainPercent}%)
      Monthly Return: ${analyticsData.monthlyReturn}%
      Annual Return (CAGR): ${analyticsData.annualReturn}%
      Risk Score: ${analyticsData.riskScore}
      Volatility: ${analyticsData.volatility}%
      
      ASSET ALLOCATION
      ${analyticsData.allocation.map(asset => 
        `${asset.name}: ${asset.percentage}% (${formatCurrency(asset.amount)})`
      ).join('\n')}
      
      SECTOR PERFORMANCE
      ${analyticsData.sectors.map(sector => 
        `${sector.name}: ${sector.percentage}% (${sector.change >= 0 ? '+' : ''}${sector.change}%)`
      ).join('\n')}
      
      MONTHLY PERFORMANCE
      ${analyticsData.monthlyPerformance.map(month => 
        `${month.month}: ${month.return >= 0 ? '+' : ''}${month.return}% (${formatCurrency(month.value)})`
      ).join('\n')}
    `
    
    // Create and download blob
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finpulse-portfolio-analytics-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const periods = [
    { label: 'Last Week', value: '1week' },
    { label: 'Last Month', value: '1month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 7 Months', value: '7months' },
    { label: 'Last Year', value: '1year' },
    { label: 'Last 3 Years', value: '3years' },
    { label: 'All Time', value: 'all' }
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-white/10 rounded-lg" />
            <div className="h-4 w-96 bg-white/5 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 bg-white/5 rounded-xl border border-white/5" />
            <div className="h-10 w-24 bg-white/5 rounded-xl border border-white/5" />
            <div className="h-10 w-32 bg-white/5 rounded-xl border border-white/5" />
          </div>
        </div>

        {/* Cards Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="glass-card border-white/5 bg-white/5">
              <CardContent className="p-6 space-y-3">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-8 w-32 bg-white/10 rounded-lg" />
                <div className="h-4 w-24 bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs Skeleton */}
        <div className="space-y-6 animate-pulse">
          <div className="h-12 w-full bg-white/5 rounded-xl border border-white/5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/5 bg-white/5 h-[420px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div className="h-12 w-12 bg-white/10 rounded-full mx-auto" />
                    <div className="h-4 w-48 bg-white/10 rounded mx-auto" />
                    <div className="h-2 w-64 bg-white/5 rounded mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="glass-card border-white/5 bg-white/5 h-[180px]" />
              <Card className="glass-card border-white/5 bg-white/5 h-[216px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData && !loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load portfolio analytics
            </p>
            <Button onClick={loadAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Track your investment performance and portfolio allocation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 glass-card border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={loadAnalyticsData}
            disabled={loading}
            className="glass-card border-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={downloadPDF}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!analyticsData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card glow-green glass-highlight">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gain</p>
                  <p className="text-2xl font-bold text-green-400">
                    +{formatCurrency(analyticsData.totalGain)}
                  </p>
                  <p className="text-sm text-green-400">
                    +{analyticsData.totalGainPercent}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glow-purple glass-highlight">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analyticsData.portfolioValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +{analyticsData.totalGainPercent}% ({formatCurrency(analyticsData.totalGain)})
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glow-blue glass-highlight">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Return</p>
                  <p className="text-2xl font-bold text-blue-400">
                    +{analyticsData.monthlyReturn}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    vs +3.8% last month
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glow-orange glass-highlight">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Return (CAGR)</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {analyticsData.annualReturn}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    vs 12% market avg
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 glass-card">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="terminal">⚡ Trading Terminal</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Portfolio Performance Trend</CardTitle>
                      <CardDescription>
                        Monthly portfolio value progression with growth indicators
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="glass-card border-white/10">
                      {period.replace(/(\d+)/, '$1 ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData?.performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="performanceColor" x1="0" y1="0" x2="0" y2="100%">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v).replace('₹', '')} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(10,5,25,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                          itemStyle={{ color: '#a78bfa' }}
                          formatter={(v: any) => [formatCurrency(v), 'Portfolio Value']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#performanceColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Score</span>
                        <Badge variant="outline">{analyticsData.riskScore}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volatility</span>
                        <span className="text-sm font-semibold">{analyticsData.volatility}%</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData?.monthlyPerformance.map((month, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded glass-card border-white/10">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            month.return >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {month.return >= 0 ? '+' : ''}{month.return}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(month.value)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Average Monthly Return</span>
                      <span className="text-sm font-semibold text-green-400">+4.5%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Consistent growth trend</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allocation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Diversified portfolio breakdown with amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.allocation.map((asset, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{asset.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{asset.percentage}%</span>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(asset.amount)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${asset.percentage}%`,
                            backgroundColor: asset.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {analyticsData && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Value</span>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(analyticsData.portfolioValue)}</span>
                        <div className="text-sm text-green-400">+{analyticsData.totalGainPercent}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Visual Allocation</CardTitle>
                <CardDescription>Portfolio distribution chart</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full flex items-center justify-center relative">
                  {/* Glassmorphic Central Summary Donut Infographic */}
                  <div className="absolute flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Total Portfolio</span>
                    <span className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                      {formatCurrency(analyticsData?.portfolioValue || 0)}
                    </span>
                    <span className="text-[11px] text-green-400 font-semibold mt-0.5">
                      +{analyticsData?.totalGainPercent}% Return
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <RechartsPie
                        data={analyticsData?.allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {analyticsData?.allocation?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10,5,25,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any, name: any, props: any) => [
                          `${formatCurrency(value)} (${props.payload.percentage}%)`,
                          name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>Indian market sector allocation with trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData?.sectors.map((sector, index) => (
                  <div key={index} className="p-4 rounded glass-card border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{sector.name}</h4>
                        <p className="text-sm text-muted-foreground">{sector.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          sector.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {sector.change >= 0 ? '+' : ''}{sector.change}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(sector.amount)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          sector.change >= 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${sector.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>AI-powered insights based on your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded glass-card border-green-500/20 bg-green-500/10">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-500/20 text-green-400">Strong Performance</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Your portfolio is outperforming the market by 6.4%. Consider maintaining current allocation.
                  </p>
                </div>

                <div className="p-4 rounded glass-card border-orange-500/20 bg-orange-500/10">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-orange-500/20 text-orange-400">Rebalancing Opportunity</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    IT sector is overweight at 28%. Consider taking some profits and diversifying.
                  </p>
                </div>

                <div className="p-4 rounded glass-card border-blue-500/20 bg-blue-500/10">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-500/20 text-blue-400">Growth Opportunity</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Infrastructure sector showing strong momentum (+18.7%). Consider increasing allocation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Download Reports</CardTitle>
                <CardDescription>Export detailed portfolio analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={downloadPDF}
                  className="w-full glass-card border-white/10"
                  variant="outline"
                  disabled={!analyticsData}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Portfolio Summary Report
                </Button>
                
                <Button 
                  className="w-full glass-card border-white/10"
                  variant="outline"
                  disabled
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Analysis (Coming Soon)
                </Button>
                
                <Button 
                  className="w-full glass-card border-white/10"
                  variant="outline"
                  disabled
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Asset Allocation Report (Coming Soon)
                </Button>
                
                <div className="mt-4 p-3 rounded glass-card border-white/10 text-sm text-muted-foreground">
                  <p className="font-semibold mb-1">Report Features:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Detailed performance metrics</li>
                    <li>• Risk analysis and recommendations</li>
                    <li>• Sector and asset allocation breakdown</li>
                    <li>• Historical trend analysis</li>
                    <li>• Tax optimization suggestions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="terminal">
          <TradingTerminal />
        </TabsContent>
      </Tabs>

      {lastUpdated && (
        <div className="text-center text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString('en-IN')}
        </div>
      )}
    </div>
  )
}
