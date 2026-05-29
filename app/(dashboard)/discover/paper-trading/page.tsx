"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, Plus, RotateCcw, ArrowUpCircle, ArrowDownCircle, Wallet, RefreshCw, Trophy, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

const INITIAL_BALANCE = 100000

interface Position {
  symbol:     string
  quantity:   number
  avgPrice:   number
  currentPrice: number
  lastUpdated: string
}
interface Trade {
  id:         string
  symbol:     string
  type:       "buy" | "sell"
  quantity:   number
  price:      number
  total:      number
  timestamp:  string
  pnl?:       number
}

function fmt(n: number, prefix = "₹") {
  return `${prefix}${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PaperTradingPage() {
  const [cash,      setCash]      = useState(INITIAL_BALANCE)
  const [positions, setPositions] = useState<Position[]>([])
  const [trades,    setTrades]    = useState<Trade[]>([])
  const [symbol,    setSymbol]    = useState("")
  const [quantity,  setQuantity]  = useState(1)
  const [price,     setPrice]     = useState<number | null>(null)
  const [fetching,  setFetching]  = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem("paper_portfolio")
      if (s) {
        const d = JSON.parse(s)
        setCash(d.cash ?? INITIAL_BALANCE)
        setPositions(d.positions ?? [])
        setTrades(d.trades ?? [])
      }
    } catch {}
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("paper_portfolio", JSON.stringify({ cash, positions, trades }))
  }, [cash, positions, trades])

  const fetchPrice = useCallback(async () => {
    if (!symbol.trim()) return
    setFetching(true)
    setPrice(null)
    try {
      const res  = await fetch(`/api/market/${symbol.toUpperCase()}`)
      const json = await res.json()
      if (json.price) {
        setPrice(json.price)
        // Also update position if held
        setPositions((prev) => prev.map((p) =>
          p.symbol === symbol.toUpperCase()
            ? { ...p, currentPrice: json.price, lastUpdated: new Date().toISOString() }
            : p
        ))
      }
    } catch {}
    finally { setFetching(false) }
  }, [symbol])

  const handleBuy = () => {
    if (!price || !symbol || quantity <= 0) return
    const total = price * quantity
    if (total > cash) return alert("Insufficient cash!")
    const sym = symbol.toUpperCase()

    setCash((c) => c - total)
    setPositions((prev) => {
      const existing = prev.find((p) => p.symbol === sym)
      if (existing) {
        const newQty  = existing.quantity + quantity
        const newAvg  = (existing.avgPrice * existing.quantity + price * quantity) / newQty
        return prev.map((p) => p.symbol === sym ? { ...p, quantity: newQty, avgPrice: newAvg, currentPrice: price } : p)
      }
      return [...prev, { symbol: sym, quantity, avgPrice: price, currentPrice: price, lastUpdated: new Date().toISOString() }]
    })
    setTrades((t) => [{ id: crypto.randomUUID(), symbol: sym, type: "buy", quantity, price, total, timestamp: new Date().toISOString() }, ...t])
    setSymbol(""); setQuantity(1); setPrice(null)
  }

  const handleSell = () => {
    if (!price || !symbol || quantity <= 0) return
    const sym = symbol.toUpperCase()
    const pos = positions.find((p) => p.symbol === sym)
    if (!pos || pos.quantity < quantity) return alert("Not enough shares to sell!")
    const total = price * quantity
    const pnl   = (price - pos.avgPrice) * quantity

    setCash((c) => c + total)
    setPositions((prev) => {
      const updated = prev.map((p) => p.symbol === sym ? { ...p, quantity: p.quantity - quantity } : p)
      return updated.filter((p) => p.quantity > 0)
    })
    setTrades((t) => [{ id: crypto.randomUUID(), symbol: sym, type: "sell", quantity, price, total, pnl, timestamp: new Date().toISOString() }, ...t])
    setSymbol(""); setQuantity(1); setPrice(null)
  }

  const totalPositionValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0)
  const totalPortfolio     = cash + totalPositionValue
  const totalPnL           = totalPortfolio - INITIAL_BALANCE
  const totalPnLPct        = (totalPnL / INITIAL_BALANCE) * 100
  const totalUnrealised    = positions.reduce((s, p) => s + (p.currentPrice - p.avgPrice) * p.quantity, 0)

  const reset = () => {
    setCash(INITIAL_BALANCE)
    setPositions([])
    setTrades([])
    setResetOpen(false)
  }

  return (
    <div className="container py-8 space-y-6 max-w-6xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/20 border border-blue-500/20 p-6">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">🎮 Simulation Mode · No Real Money</Badge>
            </div>
            <h1 className="text-3xl font-bold">Paper Trading</h1>
            <p className="text-white/60 mt-1">Practice with virtual ₹1,00,000 at real market prices</p>
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)} className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Portfolio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Portfolio Value",    value: fmt(totalPortfolio),    sub: "Cash + Holdings",                      color: "purple", icon: <Wallet className="h-5 w-5" /> },
          { label: "Total P&L",         value: fmt(totalPnL),          sub: `${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(2)}%`, color: totalPnL >= 0 ? "green" : "red", icon: totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" /> },
          { label: "Available Cash",    value: fmt(cash),               sub: `${((cash / totalPortfolio) * 100).toFixed(0)}% of portfolio`, color: "blue",   icon: <Trophy className="h-5 w-5" /> },
          { label: "Unrealised P&L",   value: fmt(totalUnrealised),    sub: `${positions.length} position${positions.length !== 1 ? "s" : ""}`, color: totalUnrealised >= 0 ? "green" : "red", icon: <History className="h-5 w-5" /> },
        ].map((k) => (
          <Card key={k.label} className={`glass-card border-${k.color}-500/20 hover:border-${k.color}-500/40 transition-all`}>
            <CardContent className="p-4">
              <div className={`p-2 bg-${k.color}-500/15 rounded-lg w-fit mb-3 text-${k.color}-400`}>{k.icon}</div>
              <p className="text-xs text-white/40 uppercase tracking-wider">{k.label}</p>
              <p className={`text-xl font-bold mt-1 ${k.label.includes("P&L") ? (parseFloat(fmt(totalPnL).replace(/[₹,]/g, "")) >= 0 ? "text-green-400" : "text-red-400") : "text-white"}`}>{k.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Panel */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Place Order</CardTitle>
            <CardDescription className="text-xs text-white/40">Buy or sell at real market prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-white/40">Stock Symbol</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && fetchPrice()}
                  placeholder="RELIANCE, TCS…"
                  className="bg-white/5 border-white/10 text-sm"
                />
                <Button onClick={fetchPrice} disabled={fetching} size="icon" variant="outline" className="glass-card border-white/10 shrink-0">
                  <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            {price !== null && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-sm text-white/60">Market Price</span>
                <span className="text-lg font-bold text-blue-400">₹{price.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div>
              <Label className="text-xs text-white/40">Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="mt-1 bg-white/5 border-white/10 text-sm" />
            </div>
            {price !== null && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/8 text-sm">
                <span className="text-white/40">Order Value</span>
                <span className="font-semibold">{fmt(price * quantity)}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button onClick={handleBuy} disabled={!price || quantity <= 0 || price * quantity > cash} className="bg-green-600 hover:bg-green-500 border-0 font-bold">
                <ArrowUpCircle className="h-4 w-4 mr-1" /> BUY
              </Button>
              <Button onClick={handleSell} disabled={!price || quantity <= 0 || !positions.find((p) => p.symbol === symbol.toUpperCase())} className="bg-red-600 hover:bg-red-500 border-0 font-bold">
                <ArrowDownCircle className="h-4 w-4 mr-1" /> SELL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Holdings + History Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="holdings">
            <TabsList className="glass-card mb-4">
              <TabsTrigger value="holdings">Holdings ({positions.length})</TabsTrigger>
              <TabsTrigger value="history">Trade History ({trades.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings">
              <Card className="glass-card border-white/10">
                <CardContent className="p-0">
                  {positions.length === 0 ? (
                    <div className="text-center py-10 text-white/30 text-sm">No open positions. Buy a stock to start!</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      <div className="grid grid-cols-6 gap-2 px-4 py-2 text-xs text-white/30 font-medium uppercase">
                        <span className="col-span-1">Symbol</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Avg Price</span>
                        <span className="text-right">Current</span>
                        <span className="text-right">P&L</span>
                        <span className="text-right">P&L %</span>
                      </div>
                      {positions.map((p) => {
                        const pnl    = (p.currentPrice - p.avgPrice) * p.quantity
                        const pnlPct = ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100
                        return (
                          <div key={p.symbol} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm hover:bg-white/3 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-xs font-bold">
                                {p.symbol.charAt(0)}
                              </div>
                              <span className="font-semibold text-xs">{p.symbol}</span>
                            </div>
                            <span className="text-right text-xs text-white/60">{p.quantity}</span>
                            <span className="text-right text-xs">₹{p.avgPrice.toFixed(2)}</span>
                            <span className="text-right text-xs">₹{p.currentPrice.toFixed(2)}</span>
                            <span className={`text-right text-xs font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {pnl >= 0 ? "+" : ""}{fmt(pnl)}
                            </span>
                            <span className={`text-right text-xs font-semibold ${pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="glass-card border-white/10">
                <CardContent className="p-0">
                  {trades.length === 0 ? (
                    <div className="text-center py-10 text-white/30 text-sm">No trades yet</div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                      {trades.map((t) => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-3 text-xs hover:bg-white/3">
                          <div className="flex items-center gap-2">
                            <Badge className={t.type === "buy" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                              {t.type.toUpperCase()}
                            </Badge>
                            <span className="font-semibold">{t.symbol}</span>
                            <span className="text-white/40">{t.quantity} × ₹{t.price.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{fmt(t.total)}</p>
                            {t.pnl !== undefined && (
                              <p className={t.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                                {t.pnl >= 0 ? "+" : ""}{fmt(t.pnl)} P&L
                              </p>
                            )}
                            <p className="text-white/30 text-[10px]">{new Date(t.timestamp).toLocaleDateString("en-IN")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-[#0a0514] border border-white/10">
          <DialogHeader>
            <DialogTitle>Reset Paper Trading Portfolio?</DialogTitle>
            <DialogDescription className="text-white/50">
              This will reset your virtual balance to ₹1,00,000 and clear all positions and trade history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} className="glass-card border-white/10">Cancel</Button>
            <Button onClick={reset} className="bg-red-600 hover:bg-red-500 border-0">Reset Everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
