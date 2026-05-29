"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight, BookOpen, DollarSign, LineChart, BarChart3,
  TrendingUp, TrendingDown, Bookmark, Star, Calculator,
  BookMarked, RefreshCw, Zap, Shield, Target, ChevronRight,
  Sparkles, Globe, Bell, PieChart,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { NewsSentimentWidget } from "@/components/ai/news-sentiment-widget"

interface Profile {
  first_name?: string
  last_name?: string
  investment_goal?: string
  current_portfolio_value?: number
  target_portfolio_value?: number
  investment_horizon?: string
  risk_tolerance?: string
}

// Inline shimmer for values still loading
function Shimmer({ w = "w-24", h = "h-6" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-white/10 rounded-lg animate-pulse`} />
}

export default function DashboardPage() {
  // ── state — NO isLoading that blocks render ─────────────────────
  const [profile,     setProfile]     = useState<Profile | null>(null)
  const [profileDone, setProfileDone] = useState(false)   // just tracks if fetch finished
  const [watchlist,   setWatchlist]   = useState<string[]>([])
  const [liveMarket,  setLiveMarket]  = useState<any>(null)
  const [apiStatus,   setApiStatus]   = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // ── Effect: load everything in the background ───────────────────
  useEffect(() => {
    // 1) Watchlist — synchronous localStorage, instant
    try {
      const stored = JSON.parse(localStorage.getItem("finpulse_watchlist") || "[]")
      setWatchlist(Array.isArray(stored) ? stored : [])
    } catch (_) {}

    // 2) Profile — cached in sessionStorage to avoid repeated Supabase calls
    const profileCache = sessionStorage.getItem("fp_profile")
    if (profileCache) {
      try { setProfile(JSON.parse(profileCache)) } catch (_) {}
      setProfileDone(true)
    }

    // Failsafe: if profile fetch takes >3s, stop shimmer and show "Not set"
    const profileTimeout = setTimeout(() => setProfileDone(true), 3000)

    // Fetch fresh profile in background (don't block render)
    ;(async () => {
      try {
        const supabase = getSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, investment_goal, current_portfolio_value, target_portfolio_value, investment_horizon, risk_tolerance")
            .eq("user_id", user.id)
            .single()
          if (data) {
            setProfile(data)
            sessionStorage.setItem("fp_profile", JSON.stringify(data))
          }
        }
      } catch (_) {}
      clearTimeout(profileTimeout)
      setProfileDone(true)
    })()

    // 3) Market data + API status — parallel, non-blocking
    Promise.all([
      fetch("/api/test-apis").then(r => r.json()).catch(() => null),
      fetch("/api/market/overview").then(r => r.json()).catch(() => null),
    ]).then(([apis, market]) => {
      if (apis)            setApiStatus(apis)
      if (market?.success) {
        setLiveMarket(market.data)
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour12: false }))
      }
    })
  }, [])

  // ── Derived values ──────────────────────────────────────────────
  const portfolioValue = profile?.current_portfolio_value ?? 0
  const targetValue    = profile?.target_portfolio_value  ?? 0
  const firstName      = profile?.first_name || ""
  const risk           = profile?.risk_tolerance || "moderate"
  const goalProgress   = targetValue > 0 ? Math.min(100, Math.round((portfolioValue / targetValue) * 100)) : 0
  const equityPct      = risk === "high" ? 70 : risk === "low" ? 40 : 55
  const mfPct          = risk === "high" ? 20 : risk === "low" ? 35 : 30
  const debtPct        = 100 - equityPct - mfPct

  // ── NO blocking isLoading — page renders immediately ────────────
  return (
    <div className="min-h-screen">

      {/* ── API Status Bar ─────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {[
              { key: "yahooFinance", label: "Yahoo Finance" },
              { key: "finnhub",      label: "Finnhub"       },
              { key: "groq",         label: "Groq AI"       },
              { key: "alphaVantage", label: "Alpha Vantage" },
            ].map((api) => {
              const status = apiStatus?.apis?.[api.key]?.status
              const ok = status === "working" || status === "limited"
              const noKey = status === "no_key"
              return (
                <div key={api.key} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400 animate-pulse" : noKey ? "bg-yellow-500/50" : "bg-white/20"}`} />
                  <span className="text-white/40">{api.label}</span>
                  <span className={ok ? "text-green-400" : noKey ? "text-yellow-500/70" : "text-white/25"}>
                    {ok ? "✓" : noKey ? "·" : apiStatus ? "✗" : "…"}
                  </span>
                </div>
              )
            })}
            {lastUpdated && <span className="text-white/25 hidden sm:inline">· {lastUpdated}</span>}
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/5 text-xs px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5" />
            System Online
          </Badge>
        </div>
      </div>

      <div className="container py-8 space-y-8">

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-pink-900/30 border border-white/10 p-8">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-pink-600/20 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI-Powered Dashboard
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                {firstName ? (
                  <>Welcome back, <span className="text-gradient-heading">{firstName}</span> 👋</>
                ) : (
                  <>Welcome to <span className="text-gradient-heading">FinPulse AI</span></>
                )}
              </h1>
              <p className="text-lg text-white/60 max-w-xl">
                Your AI-powered financial companion for smart investments and financial planning
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-500/25">
                <Link href="/discover"><LineChart className="h-5 w-5 mr-2" />Explore Markets</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass-card border-white/20 hover:bg-white/10">
                <Link href="/analytics"><BarChart3 className="h-5 w-5 mr-2" />View Analytics</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── KPI Stats Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Portfolio Value */}
          <Card className="glass-card border-white/10 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-green-500/15 rounded-xl group-hover:bg-green-500/25 transition-colors">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                {portfolioValue > 0 && targetValue > 0 && (
                  <span className="text-xs text-green-400 font-medium">{goalProgress}% of goal</span>
                )}
              </div>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Portfolio Value</p>
              {!profileDone ? (
                <Shimmer />
              ) : portfolioValue > 0 ? (
                <>
                  <p className="text-2xl font-bold tracking-tight">₹{portfolioValue.toLocaleString("en-IN")}</p>
                  {targetValue > 0 && (
                    <p className="text-xs text-white/40 mt-1 truncate">Target: ₹{targetValue.toLocaleString("en-IN")}</p>
                  )}
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg text-white/25 font-medium">Not set</p>
                  <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Set up profile <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Profile */}
          <Card className="glass-card border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500/15 rounded-xl group-hover:bg-blue-500/25 transition-colors">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  risk === "high" ? "bg-red-500/20 text-red-400" :
                  risk === "low"  ? "bg-green-500/20 text-green-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {risk === "high" ? "Aggressive" : risk === "low" ? "Conservative" : "Moderate"}
                </span>
              </div>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Risk Profile</p>
              {!profileDone ? (
                <Shimmer />
              ) : profile ? (
                <>
                  <p className="text-2xl font-bold capitalize tracking-tight">{risk}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {profile.investment_horizon?.replace(/_/g, " ") || "Medium term"}
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg text-white/25 font-medium">Not set</p>
                  <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Complete profile <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="glass-card border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-500/15 rounded-xl group-hover:bg-purple-500/25 transition-colors">
                  <Bookmark className="h-5 w-5 text-purple-400" />
                </div>
                {watchlist.length > 0 && (
                  <Link href="/discover" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
                )}
              </div>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Watchlist</p>
              <p className="text-2xl font-bold tracking-tight text-purple-400">{watchlist.length}</p>
              <p className="text-xs text-white/40 mt-1">
                {watchlist.length > 0
                  ? watchlist.slice(0, 2).join(", ") + (watchlist.length > 2 ? ` +${watchlist.length - 2}` : "")
                  : "No stocks tracked"}
              </p>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card className="glass-card border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-500/15 rounded-xl group-hover:bg-orange-500/25 transition-colors">
                  <Target className="h-5 w-5 text-orange-400" />
                </div>
                {portfolioValue > 0 && targetValue > 0 && (
                  <span className="text-xs text-orange-400 font-medium">{goalProgress}%</span>
                )}
              </div>
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Goal Progress</p>
              {!profileDone ? (
                <Shimmer />
              ) : portfolioValue > 0 && targetValue > 0 ? (
                <>
                  <p className="text-2xl font-bold tracking-tight text-orange-400">{goalProgress}%</p>
                  <Progress value={goalProgress} className="h-1.5 mt-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-yellow-500" />
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg text-white/25 font-medium">Set a goal</p>
                  <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Update profile <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Main Content Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Live Market + Quick Actions + News */}
          <div className="xl:col-span-2 space-y-6">

            {/* Live Market Overview */}
            <Card className="glass-card border-white/10 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Live Market Overview
                    </CardTitle>
                    <CardDescription className="text-white/40 mt-0.5">Real-time Indian market indices</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live Data
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Indices */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "NIFTY 50",   value: liveMarket?.nifty50,   change: liveMarket?.niftyChange,     fallback: "23,907", fc: -0.03 },
                    { label: "SENSEX",     value: liveMarket?.sensex,    change: liveMarket?.sensexChange,    fallback: "75,867", fc: -0.19 },
                    { label: "BANK NIFTY", value: liveMarket?.niftyBank, change: liveMarket?.niftyBankChange, fallback: "54,853", fc: -0.43 },
                  ].map((idx) => {
                    const chg = idx.change ?? idx.fc
                    const positive = chg >= 0
                    return (
                      <div key={idx.label} className={`relative overflow-hidden rounded-xl p-4 border ${positive ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <p className="text-xs text-white/50 font-medium mb-2">{idx.label}</p>
                        {!liveMarket ? (
                          <div className="space-y-2">
                            <Shimmer w="w-20" h="h-7" />
                            <Shimmer w="w-12" h="h-3" />
                          </div>
                        ) : (
                          <>
                            <p className="text-xl font-bold tracking-tight">
                              {idx.value
                                ? idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : idx.fallback}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>
                              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Top Gainers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white/80">Top Gainers Today</h4>
                    <Link href="/discover" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {liveMarket?.topGainers?.length > 0 ? (
                      liveMarket.topGainers.slice(0, 4).map((stock: any) => (
                        <Link key={stock.symbol} href={`/discover/stock/${stock.symbol}`}
                          className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all duration-200 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                              {stock.symbol?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{stock.symbol}</p>
                              <p className="text-xs text-white/40 truncate">{stock.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-400">+{(stock.changePercent || 0).toFixed(2)}%</p>
                              <p className="text-xs text-white/40">₹{(stock.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/10 group-hover:text-purple-400 transition-colors" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      /* Skeleton rows while loading */
                      [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 px-3 animate-pulse">
                          <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="w-16 h-3 bg-white/10 rounded" />
                            <div className="w-28 h-2.5 bg-white/5 rounded" />
                          </div>
                          <div className="w-14 h-3 bg-white/10 rounded" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-white/40">Fast access to platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { href: "/discover",               icon: <LineChart className="h-5 w-5" />,  label: "Stock Search",  color: "#a855f7", bg: "rgba(168,85,247,0.12)",  desc: "Discover & analyse" },
                    { href: "/analytics",              icon: <BarChart3  className="h-5 w-5" />,  label: "Analytics",     color: "#60a5fa", bg: "rgba(96,165,250,0.12)",   desc: "Track performance" },
                    { href: "/education",              icon: <BookOpen   className="h-5 w-5" />,  label: "Learn",         color: "#fb923c", bg: "rgba(249,115,22,0.12)",   desc: "Grow your skills" },
                    { href: "/resources/tools/sip-calculator", icon: <Calculator className="h-5 w-5" />,  label: "Calculators",   color: "#4ade80", bg: "rgba(74,222,128,0.12)",   desc: "Plan & simulate" },
                    { href: "/expenses/tax",           icon: <Shield     className="h-5 w-5" />,  label: "Tax Optimizer", color: "#facc15", bg: "rgba(250,204,21,0.12)",   desc: "LTCG savings" },
                    { href: "/discover/paper-trading", icon: <Target     className="h-5 w-5" />,  label: "Paper Trade",   color: "#f472b6", bg: "rgba(244,114,182,0.12)",  desc: "Practice trading" },
                  ].map((a) => (
                    <a key={a.href} href={a.href}
                      className="group flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border border-white/[0.06] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200">
                      <div className="p-2.5 rounded-xl transition-transform group-hover:scale-110"
                        style={{ background: a.bg, color: a.color }}>
                        {a.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{a.label}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{a.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Pulse — Live News */}
            <NewsSentimentWidget />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* Portfolio Summary */}
            <Card className="glass-card border-white/10 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Portfolio Summary</CardTitle>
                <CardDescription className="text-white/40 text-xs">Your investment overview</CardDescription>
              </CardHeader>
              <CardContent>
                {!profileDone ? (
                  /* Skeleton while profile loads */
                  <div className="space-y-4 animate-pulse">
                    <div className="h-24 rounded-xl bg-white/5" />
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i}>
                          <div className="flex justify-between mb-1.5">
                            <div className="w-24 h-3 bg-white/10 rounded" />
                            <div className="w-8 h-3 bg-white/10 rounded" />
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : portfolioValue > 0 ? (
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-white/50 mb-1">Total Portfolio Value</p>
                      <p className="text-3xl font-bold">₹{portfolioValue.toLocaleString("en-IN")}</p>
                      {targetValue > 0 && (
                        <>
                          <p className="text-xs text-green-400 mt-1">Target: ₹{targetValue.toLocaleString("en-IN")}</p>
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs text-white/40">
                              <span>Progress</span><span>{goalProgress}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${goalProgress}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Estimated Allocation</p>
                      <p className="text-xs text-white/30">Based on your {risk} risk tolerance</p>
                      {[
                        { label: "Equity / Stocks", pct: equityPct, from: "from-violet-500", to: "to-purple-600" },
                        { label: "Mutual Funds",    pct: mfPct,    from: "from-pink-500",   to: "to-rose-600"  },
                        { label: "Debt / FDs",      pct: debtPct,  from: "from-emerald-500",to: "to-teal-600"  },
                      ].map((a) => (
                        <div key={a.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/70">{a.label}</span>
                            <span className="font-semibold">{a.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${a.from} ${a.to} rounded-full`} style={{ width: `${a.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="w-full glass-card border-white/10 hover:border-purple-500/40 text-sm">
                      <Link href="/analytics"><BarChart3 className="h-4 w-4 mr-2" />Full Analytics Report</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                      <PieChart className="h-7 w-7 text-white/20" />
                    </div>
                    <p className="text-sm text-white/50">No portfolio data</p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      Complete your profile to see personalised portfolio insights.
                    </p>
                    <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 mt-2">
                      <Link href="/admin">Set up profile</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Watchlist Card */}
            <Card className="glass-card border-white/10">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    My Watchlist
                  </CardTitle>
                  {watchlist.length > 0 && (
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                      {watchlist.length} stocks
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {watchlist.length > 0 ? (
                  <div className="space-y-2">
                    {watchlist.slice(0, 5).map((sym) => (
                      <Link key={sym} href={`/discover/stock/${sym}`}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center text-xs font-bold">
                            {sym.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm">{sym}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                      </Link>
                    ))}
                    {watchlist.length > 5 && (
                      <p className="text-xs text-white/40 text-center pt-1">+{watchlist.length - 5} more stocks</p>
                    )}
                    <Button asChild variant="outline" className="w-full glass-card border-white/10 text-sm mt-1">
                      <Link href="/discover"><BookMarked className="h-4 w-4 mr-2" />Discover More</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                      <Bookmark className="h-6 w-6 text-white/20" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Watchlist is empty</p>
                      <p className="text-xs text-white/30 mt-1">Visit a stock page and click ★ to track it</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="glass-card border-white/10">
                      <Link href="/discover">Discover Stocks</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Features Card */}
            <Card className="glass-card border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/10">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-purple-300">🚀 AI Features Live</p>
                </div>
                {[
                  { label: "AI Portfolio Coach",  href: "/discover",               badge: "Groq AI" },
                  { label: "Stock Fundamentals",  href: "/discover",               badge: "Live"    },
                  { label: "LTCG Tax Optimizer",  href: "/expenses/tax",           badge: "New ✨"  },
                  { label: "Paper Trading Sim",   href: "/discover/paper-trading", badge: "New ✨"  },
                ].map((f) => (
                  <Link key={f.label} href={f.href} className="flex items-center justify-between hover:opacity-80 transition-opacity">
                    <span className="text-xs text-white/60">{f.label}</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">{f.badge}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
