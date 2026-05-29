"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Sparkles, Calculator, TrendingUp, AlertTriangle, Loader2, IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface Holding {
  id: string
  symbol: string
  purchaseDate: string
  purchasePrice: number
  quantity: number
  currentPrice: number
  assetType: "equity" | "equity_mf" | "debt_mf" | "real_estate"
}

interface TaxResult {
  holdingDays: number
  isLTCG: boolean
  holdMoreDays: number
  totalGain: number
  stcgTax: number
  ltcgTax: number
  taxSaving: number
  isLoss: boolean
}

const ASSET_TYPES = [
  { value: "equity",      label: "Stocks / Equity ETF" },
  { value: "equity_mf",   label: "Equity Mutual Funds" },
  { value: "debt_mf",     label: "Debt Mutual Funds" },
  { value: "real_estate", label: "Real Estate" },
]

// Indian tax rules
function calcTax(holding: Holding): TaxResult {
  const purchaseDate = new Date(holding.purchaseDate)
  const today        = new Date()
  const holdingDays  = Math.floor((today.getTime() - purchaseDate.getTime()) / 86400000)
  const totalGain    = (holding.currentPrice - holding.purchasePrice) * holding.quantity

  let ltcgThresholdDays = 365  // 1 year for equity
  if (holding.assetType === "debt_mf")     ltcgThresholdDays = 1095 // 3 years
  if (holding.assetType === "real_estate") ltcgThresholdDays = 730  // 2 years

  const isLTCG      = holdingDays >= ltcgThresholdDays
  const holdMoreDays = Math.max(0, ltcgThresholdDays - holdingDays)
  const isLoss       = totalGain < 0

  // STCG Tax
  let stcgRate = 0.15  // 15% for equity (Budget 2024: now 20%)
  if (holding.assetType === "debt_mf" || holding.assetType === "real_estate") stcgRate = 0.30 // as per tax slab

  // LTCG Tax
  let ltcgRate = 0.10  // 10% equity LTCG above ₹1L exempt
  if (holding.assetType === "debt_mf")     ltcgRate = 0.20 // 20% with indexation
  if (holding.assetType === "real_estate") ltcgRate = 0.20 // 20% with indexation

  const stcgTax = isLoss ? 0 : totalGain * stcgRate
  const ltcgTax = isLoss ? 0 : Math.max(0, totalGain - 100000) * ltcgRate // ₹1L exempt for equity LTCG
  const taxSaving = Math.max(0, stcgTax - ltcgTax)

  return { holdingDays, isLTCG, holdMoreDays, totalGain, stcgTax, ltcgTax, taxSaving, isLoss }
}

function fmt(n: number) { return `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` }

export default function TaxOptimizerPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [aiText,   setAiText]   = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  // Standalone calculator state
  const [calcGain,    setCalcGain]    = useState("")
  const [calcPeriod,  setCalcPeriod]  = useState("stcg")
  const [calcAsset,   setCalcAsset]   = useState("equity")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ltcg_holdings")
      if (saved) setHoldings(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem("ltcg_holdings", JSON.stringify(holdings))
  }, [holdings])

  const addHolding = () => {
    const today = new Date()
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    setHoldings((h) => [
      ...h,
      {
        id:            crypto.randomUUID(),
        symbol:        "",
        purchaseDate:  oneYearAgo.toISOString().split("T")[0],
        purchasePrice: 0,
        quantity:      1,
        currentPrice:  0,
        assetType:     "equity",
      },
    ])
  }

  const updateHolding = (id: string, field: keyof Holding, value: any) => {
    setHoldings((h) => h.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeHolding = (id: string) => setHoldings((h) => h.filter((item) => item.id !== id))

  const totals = holdings.reduce(
    (acc, h) => {
      const t = calcTax(h)
      return {
        totalInvested: acc.totalInvested + h.purchasePrice * h.quantity,
        totalCurrent:  acc.totalCurrent  + h.currentPrice  * h.quantity,
        totalTax:      acc.totalTax      + (t.isLTCG ? t.ltcgTax : t.stcgTax),
        totalSaving:   acc.totalSaving   + (t.isLTCG ? 0 : t.taxSaving),
      }
    },
    { totalInvested: 0, totalCurrent: 0, totalTax: 0, totalSaving: 0 }
  )

  const holdingSoon = holdings.filter((h) => {
    const t = calcTax(h)
    return !t.isLTCG && t.holdMoreDays > 0 && t.holdMoreDays <= 60 && !t.isLoss
  })

  const askAI = async () => {
    setAiLoading(true)
    setAiText("")
    try {
      const summary = holdings.map((h) => {
        const t = calcTax(h)
        return `${h.symbol}: held ${t.holdingDays} days, gain ₹${t.totalGain.toFixed(0)}, tax ₹${(t.isLTCG ? t.ltcgTax : t.stcgTax).toFixed(0)}`
      }).join("; ")
      const res  = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio_advice", question: `Based on my holdings: ${summary}. What is my tax optimization strategy for LTCG? Which should I sell now vs hold longer?`, data: {} }),
      })
      const json = await res.json()
      setAiText(json.answer || "Could not get AI advice.")
    } catch { setAiText("AI unavailable. Please try again.") }
    finally  { setAiLoading(false) }
  }

  // Standalone calculator
  const gain = parseFloat(calcGain) || 0
  let calcStcg = 0, calcLtcg = 0
  if (calcAsset === "equity" || calcAsset === "equity_mf") {
    calcStcg = gain * 0.20
    calcLtcg = Math.max(0, gain - 100000) * 0.10
  } else {
    calcStcg = gain * 0.30
    calcLtcg = gain * 0.20
  }

  return (
    <div className="container py-8 space-y-6 max-w-6xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/30 via-emerald-900/20 to-teal-900/20 border border-green-500/20 p-6">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1">
                🇮🇳 India-Specific · LTCG/STCG Tax Rules
              </span>
            </div>
            <h1 className="text-3xl font-bold">Tax Optimizer</h1>
            <p className="text-white/60 mt-1">Know exactly when to sell to save maximum tax. Free · AI-powered.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <p className="text-xs text-white/40">Total Tax Owed</p>
              <p className="text-xl font-bold text-red-400">{fmt(totals.totalTax)}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <p className="text-xs text-white/40">Potential Saving</p>
              <p className="text-xl font-bold text-green-400">{fmt(totals.totalSaving)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LTCG Alert — Hold More */}
      {holdingSoon.length > 0 && (
        <Card className="glass-card border-yellow-500/30 bg-yellow-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-300">⏰ Hold a Little Longer — LTCG Opportunity</p>
              <p className="text-xs text-white/50 mt-0.5">These holdings qualify for LTCG within 60 days:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {holdingSoon.map((h) => {
                  const t = calcTax(h)
                  return (
                    <span key={h.id} className="text-xs bg-yellow-500/15 border border-yellow-500/30 rounded-full px-2 py-0.5 text-yellow-300">
                      {h.symbol || "Unnamed"}: {t.holdMoreDays} days → save {fmt(t.taxSaving)}
                    </span>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Your Holdings</CardTitle>
            <CardDescription className="text-xs text-white/40">Add your stocks/MFs to calculate tax</CardDescription>
          </div>
          <Button onClick={addHolding} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
            <Plus className="h-4 w-4 mr-1" /> Add Holding
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {holdings.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              Click "Add Holding" to get started
            </div>
          )}
          {holdings.map((h) => {
            const t = calcTax(h)
            return (
              <div key={h.id} className="border border-white/8 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <div>
                    <Label className="text-xs text-white/40">Symbol</Label>
                    <Input value={h.symbol} onChange={(e) => updateHolding(h.id, "symbol", e.target.value.toUpperCase())} placeholder="TCS" className="h-8 text-sm bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">Asset Type</Label>
                    <Select value={h.assetType} onValueChange={(v) => updateHolding(h.id, "assetType", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#0a0514] border-white/10">
                        {ASSET_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">Purchase Date</Label>
                    <Input type="date" value={h.purchaseDate} onChange={(e) => updateHolding(h.id, "purchaseDate", e.target.value)} className="h-8 text-xs bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">Buy Price (₹)</Label>
                    <Input type="number" value={h.purchasePrice || ""} onChange={(e) => updateHolding(h.id, "purchasePrice", parseFloat(e.target.value) || 0)} placeholder="1000" className="h-8 text-sm bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">Qty</Label>
                    <Input type="number" value={h.quantity} onChange={(e) => updateHolding(h.id, "quantity", parseInt(e.target.value) || 1)} className="h-8 text-sm bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">Current Price (₹)</Label>
                    <Input type="number" value={h.currentPrice || ""} onChange={(e) => updateHolding(h.id, "currentPrice", parseFloat(e.target.value) || 0)} placeholder="1500" className="h-8 text-sm bg-white/5 border-white/10" />
                  </div>
                </div>

                {h.purchasePrice > 0 && h.currentPrice > 0 && (
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <Badge className={t.isLTCG ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                      {t.isLTCG ? "✅ LTCG" : `⏳ STCG · ${t.holdMoreDays}d to LTCG`}
                    </Badge>
                    <span className={t.isLoss ? "text-red-400" : "text-green-400"}>
                      {t.isLoss ? "📉" : "📈"} {t.isLoss ? "Loss:" : "Gain:"} {fmt(t.totalGain)}
                    </span>
                    <span className="text-white/40">
                      Tax: <span className="text-red-400 font-semibold">{fmt(t.isLTCG ? t.ltcgTax : t.stcgTax)}</span>
                    </span>
                    {!t.isLTCG && t.taxSaving > 0 && (
                      <span className="text-green-400">
                        💰 Save {fmt(t.taxSaving)} by holding {t.holdMoreDays} more days
                      </span>
                    )}
                    <button onClick={() => removeHolding(h.id)} className="ml-auto text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {holdings.length > 0 && (
            <Button onClick={askAI} disabled={aiLoading} className="w-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 hover:from-purple-600/50 hover:to-pink-600/50">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Ask AI: What's my optimal tax strategy?
            </Button>
          )}
          {aiText && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-white/80 leading-relaxed">
              <p className="text-purple-300 font-semibold mb-2">🤖 Groq AI Tax Advice</p>
              {aiText}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standalone Tax Calculator */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-400" />
            Quick Tax Calculator
          </CardTitle>
          <CardDescription className="text-xs text-white/40">Calculate STCG vs LTCG tax instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs text-white/40">Capital Gain (₹)</Label>
              <Input type="number" value={calcGain} onChange={(e) => setCalcGain(e.target.value)} placeholder="50000" className="mt-1 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-white/40">Asset Type</Label>
              <Select value={calcAsset} onValueChange={setCalcAsset}>
                <SelectTrigger className="mt-1 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0a0514] border-white/10">
                  {ASSET_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                  <p className="text-xs text-white/40">STCG Tax (short-term)</p>
                  <p className="text-lg font-bold text-red-400 mt-1">{fmt(calcStcg)}</p>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                  <p className="text-xs text-white/40">LTCG Tax (long-term)</p>
                  <p className="text-lg font-bold text-green-400 mt-1">{fmt(calcLtcg)}</p>
                </div>
              </div>
            </div>
          </div>
          {gain > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-300">
              <TrendingUp className="h-4 w-4 shrink-0" />
              Holding long-term saves you <span className="font-bold mx-1">{fmt(calcStcg - calcLtcg)}</span> in taxes
              {calcAsset === "equity" && gain > 100000 && <span className="text-xs text-white/40 ml-1">(₹1L exempt for LTCG)</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indian Tax Rules Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">📋 Indian Capital Gains Tax Rules (FY 2024-25)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { asset: "Equity / Stocks", ltcgDays: "365 days", stcgRate: "20%", ltcgRate: "10% (₹1L exempt)", color: "blue" },
              { asset: "Equity Mutual Funds", ltcgDays: "365 days", stcgRate: "20%", ltcgRate: "10% (₹1L exempt)", color: "purple" },
              { asset: "Debt Mutual Funds", ltcgDays: "1095 days", stcgRate: "As per slab", ltcgRate: "20% (with indexation)", color: "orange" },
              { asset: "Real Estate", ltcgDays: "730 days", stcgRate: "As per slab", ltcgRate: "20% (with indexation)", color: "green" },
            ].map((r) => (
              <div key={r.asset} className={`p-3 rounded-xl border border-${r.color}-500/20 bg-${r.color}-500/5`}>
                <p className={`font-semibold text-${r.color}-300 mb-2`}>{r.asset}</p>
                <div className="space-y-1 text-white/50">
                  <p>LTCG threshold: <span className="text-white/70">{r.ltcgDays}</span></p>
                  <p>STCG rate: <span className="text-red-400">{r.stcgRate}</span></p>
                  <p>LTCG rate: <span className="text-green-400">{r.ltcgRate}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
