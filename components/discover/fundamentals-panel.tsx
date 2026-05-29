"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props { symbol: string; name?: string }

function fmt(val: number | null | undefined, suffix = "", decimals = 2): string {
  if (val === null || val === undefined) return "N/A"
  return `${val.toFixed(decimals)}${suffix}`
}
function fmtCr(val: number | null | undefined): string {
  if (!val) return "N/A"
  if (val >= 1e12) return `₹${(val / 1e11).toFixed(1)}L Cr`
  if (val >= 1e9)  return `₹${(val / 1e7).toFixed(0)}Cr`
  if (val >= 1e7)  return `₹${(val / 1e7).toFixed(1)}Cr`
  return `₹${(val / 1e5).toFixed(0)}L`
}
function colorVal(val: number | null, low: number, high: number, reverse = false) {
  if (val === null || val === undefined) return "text-white/40"
  if (reverse) { if (val <= low) return "text-green-400"; if (val <= high) return "text-yellow-400"; return "text-red-400" }
  if (val >= high) return "text-green-400"; if (val >= low) return "text-yellow-400"; return "text-red-400"
}

function MetricRow({
  label, value, display, color, onAsk
}: { label: string; value: any; display: string; color: string; onAsk: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
      <span className="text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${color}`}>{display}</span>
        <button
          onClick={onAsk}
          title="Ask AI to explain"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-purple-500/20"
        >
          <Sparkles className="h-3 w-3 text-purple-400" />
        </button>
      </div>
    </div>
  )
}

export function FundamentalsPanel({ symbol, name }: Props) {
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiOpen,  setAiOpen]  = useState(false)
  const [aiLabel, setAiLabel] = useState("")
  const [aiValue, setAiValue] = useState<any>(null)
  const [aiText,  setAiText]  = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/fundamentals/${symbol}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [symbol])

  const askAI = useCallback(async (metric: string, value: any) => {
    setAiLabel(metric)
    setAiValue(value)
    setAiText("")
    setAiOpen(true)
    setAiLoading(true)
    try {
      const res  = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metric", data: { symbol, name: name || symbol, metric, value, sector: data?.sector } }),
      })
      const json = await res.json()
      setAiText(json.answer || "Could not get explanation.")
    } catch { setAiText("AI unavailable. Please try again.") }
    finally  { setAiLoading(false) }
  }, [symbol, name, data])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[1,2,3].map((i) => (
          <Card key={i} className="glass-card border-white/10 animate-pulse">
            <CardContent className="p-5 space-y-3">
              {[1,2,3,4,5].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="w-20 h-3 bg-white/10 rounded" />
                  <div className="w-14 h-3 bg-white/5 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return (
    <div className="text-center py-8 text-white/40 text-sm">
      Could not load fundamental data for {symbol}
    </div>
  )

  const { redFlags } = data

  return (
    <>
      {/* ── Section A: Key Metric Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          {
            label: "P/E Ratio", value: data.peRatio,
            display: fmt(data.peRatio, "x"),
            sub: data.peForward ? `Fwd: ${fmt(data.peForward, "x")}` : "Forward N/A",
            color: "text-blue-400",
            bg: "from-blue-900/20 to-blue-800/10 border-blue-500/20",
          },
          {
            label: "Market Cap", value: data.marketCap,
            display: fmtCr(data.marketCap),
            sub: data.sector || "—",
            color: "text-purple-400",
            bg: "from-purple-900/20 to-purple-800/10 border-purple-500/20",
          },
          {
            label: "Return on Equity", value: data.roe,
            display: fmt(data.roe, "%"),
            sub: (data.roe ?? 0) >= 15 ? "Excellent" : (data.roe ?? 0) >= 8 ? "Moderate" : "Poor",
            color: colorVal(data.roe, 8, 15),
            bg: "from-green-900/15 to-green-800/5 border-green-500/15",
          },
          {
            label: "Debt / Equity", value: data.debtToEquity,
            display: fmt(data.debtToEquity, "%"),
            sub: (data.debtToEquity ?? 0) < 50 ? "Low Risk" : (data.debtToEquity ?? 0) < 100 ? "Moderate" : "High Debt",
            color: colorVal(data.debtToEquity, 50, 100, true),
            bg: "from-orange-900/15 to-orange-800/5 border-orange-500/15",
          },
        ].map((kpi) => (
          <div key={kpi.label}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${kpi.bg} p-4 cursor-pointer group`}
            onClick={() => askAI(kpi.label, kpi.value)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="text-xs text-white/40 mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.display}</p>
            <p className="text-xs text-white/30 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Section B: 3-column metrics grid ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Valuation */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-300">📊 Valuation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="P/E Ratio"         value={data.peRatio}    display={fmt(data.peRatio,    "x")}  color="text-white/80" onAsk={() => askAI("P/E Ratio", data.peRatio)} />
            <MetricRow label="P/B Ratio"         value={data.pbRatio}    display={fmt(data.pbRatio,    "x")}  color={colorVal(data.pbRatio, 1, 4, true)} onAsk={() => askAI("P/B Ratio", data.pbRatio)} />
            <MetricRow label="P/S Ratio"         value={data.psRatio}    display={fmt(data.psRatio,    "x")}  color="text-white/80" onAsk={() => askAI("P/S Ratio", data.psRatio)} />
            <MetricRow label="EV/EBITDA"         value={data.evEbitda}   display={fmt(data.evEbitda,   "x")}  color="text-white/80" onAsk={() => askAI("EV/EBITDA", data.evEbitda)} />
            <MetricRow label="PEG Ratio"         value={data.pegRatio}   display={fmt(data.pegRatio,   "x")}  color={colorVal(data.pegRatio, 1, 2, true)} onAsk={() => askAI("PEG Ratio", data.pegRatio)} />
            <MetricRow label="EV/Revenue"        value={data.evRevenue}  display={fmt(data.evRevenue,  "x")}  color="text-white/80" onAsk={() => askAI("EV/Revenue", data.evRevenue)} />
          </CardContent>
        </Card>

        {/* Profitability */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-300">💰 Profitability</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Net Margin"        value={data.netMargin}       display={fmt(data.netMargin,       "%")}  color={colorVal(data.netMargin, 8, 20)}        onAsk={() => askAI("Net Profit Margin", data.netMargin)} />
            <MetricRow label="Gross Margin"      value={data.grossMargin}     display={fmt(data.grossMargin,     "%")}  color={colorVal(data.grossMargin, 20, 50)}     onAsk={() => askAI("Gross Margin", data.grossMargin)} />
            <MetricRow label="Operating Margin"  value={data.operatingMargin} display={fmt(data.operatingMargin, "%")}  color={colorVal(data.operatingMargin, 10, 25)} onAsk={() => askAI("Operating Margin", data.operatingMargin)} />
            <MetricRow label="EBITDA Margin"     value={data.ebitdaMargin}    display={fmt(data.ebitdaMargin,    "%")}  color="text-white/80"                          onAsk={() => askAI("EBITDA Margin", data.ebitdaMargin)} />
            <MetricRow label="ROE"               value={data.roe}             display={fmt(data.roe,             "%")}  color={colorVal(data.roe, 8, 15)}              onAsk={() => askAI("Return on Equity (ROE)", data.roe)} />
            <MetricRow label="ROA"               value={data.roa}             display={fmt(data.roa,             "%")}  color={colorVal(data.roa, 3, 8)}               onAsk={() => askAI("Return on Assets (ROA)", data.roa)} />
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-orange-300">🏦 Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Debt/Equity"       value={data.debtToEquity}  display={fmt(data.debtToEquity, "%")}  color={colorVal(data.debtToEquity, 50, 100, true)}  onAsk={() => askAI("Debt to Equity Ratio", data.debtToEquity)} />
            <MetricRow label="Current Ratio"     value={data.currentRatio}  display={fmt(data.currentRatio, "x")}  color={colorVal(data.currentRatio, 1, 2)}            onAsk={() => askAI("Current Ratio", data.currentRatio)} />
            <MetricRow label="Dividend Yield"    value={data.dividendYield} display={fmt(data.dividendYield, "%")} color="text-yellow-400"                              onAsk={() => askAI("Dividend Yield", data.dividendYield)} />
            <MetricRow label="Beta"              value={data.beta}          display={fmt(data.beta, "", 2)}         color={colorVal(data.beta, 0.5, 1.2, true)}         onAsk={() => askAI("Beta (Market Risk)", data.beta)} />
            <MetricRow label="52W High"          value={data.fiftyTwoWeekHigh} display={data.fiftyTwoWeekHigh ? `₹${data.fiftyTwoWeekHigh.toLocaleString("en-IN")}` : "N/A"} color="text-green-400" onAsk={() => askAI("52-Week High", data.fiftyTwoWeekHigh)} />
            <MetricRow label="52W Low"           value={data.fiftyTwoWeekLow}  display={data.fiftyTwoWeekLow ? `₹${data.fiftyTwoWeekLow.toLocaleString("en-IN")}` : "N/A"}  color="text-red-400"   onAsk={() => askAI("52-Week Low", data.fiftyTwoWeekLow)} />
          </CardContent>
        </Card>
      </div>

      {/* ── Section C: Red Flag Detector ─────────────────────────────── */}
      {redFlags && (
        <Card className={`glass-card mt-4 border ${redFlags.riskLevel === "low" ? "border-green-500/20" : redFlags.riskLevel === "medium" ? "border-yellow-500/20" : "border-red-500/20"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                {redFlags.riskLevel === "low"
                  ? <CheckCircle  className="h-4 w-4 text-green-400" />
                  : redFlags.riskLevel === "medium"
                  ? <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  : <XCircle      className="h-4 w-4 text-red-400" />}
                Risk Analysis — Red Flag Detector
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Risk Score</span>
                <span className={`text-lg font-bold ${redFlags.riskLevel === "low" ? "text-green-400" : redFlags.riskLevel === "medium" ? "text-yellow-400" : "text-red-400"}`}>
                  {redFlags.riskScore}/100
                </span>
              </div>
            </div>
            <Progress
              value={redFlags.riskScore}
              className="h-1.5 mt-2"
            />
          </CardHeader>
          <CardContent>
            {redFlags.flags.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                🟢 No major red flags detected — fundamentally sound company
              </div>
            ) : (
              <div className="space-y-2">
                {redFlags.flags.map((flag: any, i: number) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${
                    flag.severity === "high"   ? "bg-red-500/10 border border-red-500/20"
                    : flag.severity === "medium" ? "bg-yellow-500/10 border border-yellow-500/20"
                    : "bg-white/5 border border-white/10"
                  }`}>
                    {flag.severity === "high"   ? <XCircle      className="h-3.5 w-3.5 text-red-400    mt-0.5 shrink-0" />
                    : flag.severity === "medium" ? <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    :                              <Info          className="h-3.5 w-3.5 text-white/40   mt-0.5 shrink-0" />}
                    <span className={`text-xs ${flag.severity === "high" ? "text-red-300" : flag.severity === "medium" ? "text-yellow-300" : "text-white/50"}`}>
                      {flag.message}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => askAI("Risk Analysis", redFlags.flags.map((f: any) => f.message).join("; "))}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Ask AI for detailed risk assessment
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Analyst Target ────────────────────────────────────────────── */}
      {data.targetPrice && (
        <div className="flex items-center justify-between mt-3 p-3 rounded-xl border border-white/8 bg-white/3">
          <div className="text-xs text-white/50">Analyst Target Price</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">₹{data.targetPrice?.toLocaleString("en-IN")}</span>
            {data.currentPrice && (
              <Badge className={`text-xs ${data.targetPrice > data.currentPrice ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                {data.targetPrice > data.currentPrice ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {(((data.targetPrice - data.currentPrice) / data.currentPrice) * 100).toFixed(1)}% upside
              </Badge>
            )}
            <span className="text-xs text-white/30">({data.numberOfAnalysts || "?"} analysts)</span>
          </div>
        </div>
      )}

      {/* ── AI Explain Dialog ──────────────────────────────────────────── */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="bg-[#0a0514] border border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-300">
              <Sparkles className="h-4 w-4" />
              AI Explains: {aiLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="px-3 py-2 bg-white/5 rounded-lg text-xs text-white/50">
              {symbol} · {aiLabel} = <span className="text-white/80 font-semibold">{typeof aiValue === "number" ? aiValue.toFixed(2) : aiValue}</span>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-purple-400 text-sm py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Groq AI is thinking…
              </div>
            ) : (
              <p className="text-sm text-white/80 leading-relaxed">{aiText}</p>
            )}
            <p className="text-[10px] text-white/25">Powered by Groq · Llama 3 70B · For educational purposes only</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
