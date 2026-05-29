'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, Target, RefreshCw, Activity, BarChart3, Zap, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface Props {
  symbol: string
  name?: string
  onBuy?: () => void
  onSell?: () => void
  onSIP?: () => void
}

interface MLIndicators {
  trend: string
  trendStrength: number
  rsi: number
  macd: { value: number; signal: number; histogram: number }
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  atr: number
  adx: number
  stochastic: { k: number; d: number }
  vwap: number
  momentum: number
  support: number
  resistance: number
  bollingerBands: { upper: number; lower: number; middle: number }
  signals: Record<string, string>
}

export function AiStockAnalysis({ symbol, name, onBuy, onSell, onSIP }: Props) {
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [mlIndicators, setMlIndicators] = useState<MLIndicators | null>(null)
  const [error, setError] = useState('')
  const [dataPoints, setDataPoints] = useState(0)
  const [viewMode, setViewMode] = useState<'beginner' | 'pro'>('pro') // Default to Pro view to showcase the Technical Gauge!

  const generateAnalysis = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, name })
      })
      const data = await res.json()
      if (data.success) {
        setAnalysis(data.data.analysis)
        setMlIndicators(data.data.mlIndicators)
        setDataPoints(data.data.dataPoints || 0)
      } else {
        setError(data.error || 'Failed to generate analysis')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load analysis automatically on mount if symbol changes
  useEffect(() => {
    if (symbol) {
      generateAnalysis()
    }
  }, [symbol])

  const getBeginnerTranslation = () => {
    if (!mlIndicators) return null
    const trend = mlIndicators.trend
    const strength = mlIndicators.trendStrength
    const support = mlIndicators.support
    const resistance = mlIndicators.resistance
    const currentPrice = mlIndicators.bollingerBands.middle
    const atr = mlIndicators.atr
    
    // Determine Volatility Risk based on ATR percentage
    const volatilityPct = (atr / currentPrice) * 100
    let riskLevel = 'Low Risk'
    let riskColor = 'text-green-400 bg-green-500/10 border-green-500/20'
    if (volatilityPct > 2.5) {
      riskLevel = 'High Volatility'
      riskColor = 'text-red-400 bg-red-500/10 border-red-500/20'
    } else if (volatilityPct > 1.2) {
      riskLevel = 'Moderate Volatility'
      riskColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    }

    let summaryText = ''
    let actionTip = ''
    let recommendation = 'HOLD'
    let recommendationColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10'

    if (trend === 'Bullish') {
      if (strength >= 60) {
        recommendation = 'STRONG BUY'
        recommendationColor = 'text-green-400 border-green-500/30 bg-green-500/10'
        summaryText = `Our algorithms see strong buying interest. The price is trending upward with very high momentum.`
        actionTip = `Generally a favorable time to invest. Consider accumulating shares. We recommend keeping an eye on the safety limit at ₹${support.toFixed(0)}.`
      } else {
        recommendation = 'BUY ON DIPS'
        recommendationColor = 'text-green-300 border-green-500/20 bg-green-500/5'
        summaryText = `The stock has a slight upward bias, but overall conviction is low. Prices are consolidating in a neutral-to-positive direction.`
        actionTip = `Do not buy aggressively at current rates. The safest approach is to wait for minor price drops (dips) toward ₹${support.toFixed(0)} before entering.`
      }
    } else if (trend === 'Bearish') {
      if (strength >= 60) {
        recommendation = 'AVOID / SELL'
        recommendationColor = 'text-red-400 border-red-500/30 bg-red-500/10'
        summaryText = `Heavy selling pressure has been detected. The stock is in a confirmed downward price spiral.`
        actionTip = `Avoid purchasing right now as prices are likely to fall further. If you own it, consider taking profits or setting a stop-loss to secure capital.`
      } else {
        recommendation = 'WAIT FOR SUPPORT'
        recommendationColor = 'text-red-300 border-red-500/20 bg-red-500/5'
        summaryText = `There is a slight downward drift, but selling pressure is moderate and lacks strong momentum.`
        actionTip = `Do not purchase immediately. Wait for the price to drop and stabilize near the safety line of ₹${support.toFixed(0)} where strong buyers are waiting.`
      }
    } else {
      recommendation = 'HOLD / NEUTRAL'
      recommendationColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      summaryText = `The price is trading sideways within a tight range. There is no clear upward or downward direction.`
      actionTip = `If you own the stock, HOLD your position. For new buyers, wait for a clear price breakout above ₹${resistance.toFixed(0)} before committing new funds.`
    }

    return {
      recommendation,
      recommendationColor,
      summaryText,
      actionTip,
      riskLevel,
      riskColor,
      buyBelow: support * 1.02,
      sellAbove: resistance * 0.98,
      safetyShield: support * 0.98
    }
  }

  const getVoteTally = () => {
    if (!mlIndicators) return { bearish: 10, neutral: 2, bullish: 1, total: 13, ratio: 20 }

    let bearish = 0
    let bullish = 0
    let neutral = 0

    // 1. RSI
    if (mlIndicators.rsi > 70) bearish++
    else if (mlIndicators.rsi < 30) bullish++
    else neutral++

    // 2. MACD
    if (mlIndicators.macd.histogram > 0) bullish++
    else bearish++

    // 3. Stochastic
    if (mlIndicators.stochastic.k > 80) bearish++
    else if (mlIndicators.stochastic.k < 20) bullish++
    else neutral++

    // 4. Momentum
    if (mlIndicators.momentum > 0) bullish++
    else bearish++

    // 5. SMA 20 Crossovers
    if (mlIndicators.vwap > mlIndicators.sma20) bullish++
    else bearish++

    // 6. SMA 50 Crossovers
    if (mlIndicators.vwap > mlIndicators.sma50) bullish++
    else bearish++

    // 7. EMA trend mapping
    if (mlIndicators.ema12 > mlIndicators.ema26) bullish++
    else bearish++

    // 8. ADX trend weighting
    if (mlIndicators.adx < 20) neutral++
    else if (mlIndicators.trend === 'Bullish') bullish++
    else bearish++

    // 9. Trend Strength modifier to counts
    if (mlIndicators.trendStrength >= 65) {
      if (mlIndicators.trend === 'Bullish') bullish += 3
      else bearish += 3
    } else {
      neutral += 3
    }

    const total = bearish + neutral + bullish
    // Scale horizontal position between 5% and 95%
    const ratio = total > 0 ? ((bullish + neutral * 0.5) / total) * 90 + 5 : 50

    return { bearish, neutral, bullish, total, ratio }
  }

  const getAggregatedVerdict = (tally: ReturnType<typeof getVoteTally>) => {
    if (tally.bearish > tally.bullish && tally.bearish > tally.neutral) return 'Bearish'
    if (tally.bullish > tally.bearish && tally.bullish > tally.neutral) return 'Bullish'
    return 'Neutral'
  }

  const trendColor = mlIndicators?.trend === 'Bullish' ? 'text-green-400' :
    mlIndicators?.trend === 'Bearish' ? 'text-red-400' : 'text-blue-400'
  const trendBg = mlIndicators?.trend === 'Bullish' ? 'bg-green-500/10 border-green-500/30' :
    mlIndicators?.trend === 'Bearish' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'

  const beg = getBeginnerTranslation()
  const tally = getVoteTally()
  const verdict = getAggregatedVerdict(tally)

  const handleBuyTrigger = () => {
    if (onBuy) onBuy()
  }

  const handleSellTrigger = () => {
    if (onSell) onSell()
  }

  const handleSIPTrigger = () => {
    if (onSIP) onSIP()
  }

  return (
    <Card className="glass-card glow-purple border-white/10 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            AI Technical analysis
          </CardTitle>
          <Button
            onClick={generateAnalysis}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-xs font-bold gap-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Activity className="h-4.5 w-4.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Analyze Now
              </>
            )}
          </Button>
        </div>
        <CardDescription>9-Indicator ML Ensemble + Gemini AI Analysis</CardDescription>
      </CardHeader>

      <CardContent className="pt-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
              <BrainCircuit className="h-6 w-6 text-purple-400 absolute top-3 left-3" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-purple-300 font-medium">Running ML Technical Ensemble...</p>
              <p className="text-xs text-muted-foreground">RSI · MACD · ADX · ATR · Stochastic · OBV · VWAP · BB · MA</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        ) : mlIndicators && beg ? (
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex justify-center pb-1">
              <div className="grid grid-cols-2 w-full max-w-[320px] p-1 bg-white/5 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('beginner')}
                  className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                    viewMode === 'beginner'
                      ? 'bg-purple-600 text-white shadow font-semibold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Retail Summary
                </button>
                <button
                  onClick={() => setViewMode('pro')}
                  className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                    viewMode === 'pro'
                      ? 'bg-purple-600 text-white shadow font-semibold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Technical Pro
                </button>
              </div>
            </div>

            {viewMode === 'beginner' ? (
              /* --- BEGINNER / RETAIL SIMPLIFIED LAYOUT --- */
              <div className="space-y-5 animate-fade-in">
                {/* Simplified Recommendation Card */}
                <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${trendBg}`}>
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Beginner Advisory Recommendation</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black uppercase tracking-wider ${trendColor}`}>{beg.recommendation}</span>
                      <Badge className={beg.riskColor}>{beg.riskLevel}</Badge>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">AI Model Confidence</p>
                    <p className={`text-3xl font-black ${trendColor}`}>{mlIndicators.trendStrength}%</p>
                  </div>
                </div>

                {/* Plain English Translation Explanation */}
                <div className="glass-card border border-white/10 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-purple-400" /> What this means in Plain English
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {beg.summaryText}
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2">
                    <strong>Advisor Action Item:</strong> {beg.actionTip}
                  </p>
                </div>

                {/* Retail Quick Action Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="glass-card border border-green-500/20 rounded-xl p-3 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Ideal Buying Price</p>
                      <p className="text-sm font-bold text-green-400">₹{beg.buyBelow.toFixed(0)} or below</p>
                      <span className="text-[9px] text-white/30">Buy near historical support</span>
                    </div>
                  </div>

                  <div className="glass-card border border-blue-500/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Target className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Profit Target Price</p>
                      <p className="text-sm font-bold text-blue-400">₹{beg.sellAbove.toFixed(0)}</p>
                      <span className="text-[9px] text-white/30">Sell here to secure gains</span>
                    </div>
                  </div>

                  <div className="glass-card border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Safety Shield (Exit)</p>
                      <p className="text-sm font-bold text-red-400">₹{beg.safetyShield.toFixed(0)}</p>
                      <span className="text-[9px] text-white/30">Close trade if it drops below</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- HIGH-FIDELITY GROWW TECHNICAL GAUGE & INDICATORS BOARD --- */
              <div className="space-y-6 animate-fade-in">
                {/* 1. GROWW-STYLE SEGMENTED TECHNICAL GAUGE */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-white/50 font-semibold tracking-wide uppercase">Based on technicals, this stock is</p>
                    <h3 className={cn(
                      "text-2xl font-black uppercase tracking-wider",
                      verdict === 'Bullish' ? 'text-emerald-400' : verdict === 'Bearish' ? 'text-rose-400' : 'text-yellow-400'
                    )}>
                      {verdict}
                    </h3>
                  </div>

                  {/* Segmented Gradient Bar (20 bars) */}
                  <div className="relative pt-2 px-1">
                    <div className="flex justify-between items-center gap-1 h-3">
                      {Array.from({ length: 20 }).map((_, idx) => {
                        let colorClass = 'bg-[#6B7280]' // Neutral default
                        
                        if (idx <= 6) {
                          // Bearish reds
                          if (idx === 0) colorClass = 'bg-[#E11D48]'
                          else if (idx <= 3) colorClass = 'bg-[#EF4444]'
                          else colorClass = 'bg-[#F97316]'
                        } else if (idx >= 13) {
                          // Bullish greens
                          if (idx === 19) colorClass = 'bg-[#059669]'
                          else if (idx >= 16) colorClass = 'bg-[#10B981]'
                          else colorClass = 'bg-[#34D399]'
                        } else {
                          // Neutral greys
                          colorClass = 'bg-[#4B5563]'
                        }

                        return (
                          <div
                            key={idx}
                            className={cn('flex-1 rounded-[1.5px] transition-all h-full', colorClass)}
                          />
                        )
                      })}
                    </div>

                    {/* Arrow Pointer Trigger */}
                    <div
                      className="absolute top-5 transition-all duration-700 ease-out -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${tally.ratio}%` }}
                    >
                      {/* Triangle Pointer */}
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white drop-shadow-md" />
                    </div>
                  </div>

                  {/* Voting tally tags below gauge */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center font-mono text-[10px] uppercase font-bold tracking-wider leading-none">
                    <div className="flex flex-col items-center gap-1 text-rose-400">
                      <span className="text-white/40 font-medium text-[9px]">Bearish</span>
                      <span className="text-base font-extrabold">{tally.bearish}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-yellow-400">
                      <span className="text-white/40 font-medium text-[9px]">Neutral</span>
                      <span className="text-base font-extrabold">{tally.neutral}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-emerald-400">
                      <span className="text-white/40 font-medium text-[9px]">Bullish</span>
                      <span className="text-base font-extrabold">{tally.bullish}</span>
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC GROWW-STYLE INDICATORS DATA TABLE */}
                <div className="bg-zinc-950/30 border border-white/5 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-white/50 tracking-wider uppercase px-1">Ensemble Indicators List</h4>
                  
                  <div className="overflow-hidden border border-white/5 rounded-xl font-mono text-xs">
                    {/* Header */}
                    <div className="grid grid-cols-3 bg-white/5 px-4 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider leading-none">
                      <div>Indicator</div>
                      <div className="text-center">Value</div>
                      <div className="text-right">Verdict</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                      {[
                        {
                          name: 'RSI (14)',
                          val: `+${mlIndicators.rsi.toFixed(2)}`,
                          badge: mlIndicators.rsi > 70 ? 'Overbought (Sell)' : mlIndicators.rsi < 30 ? 'Oversold (Buy)' : 'Neutral',
                          color: mlIndicators.rsi > 70 ? 'text-rose-400' : mlIndicators.rsi < 30 ? 'text-emerald-400' : 'text-white/55'
                        },
                        {
                          name: 'MACD (12,26,9)',
                          val: `${mlIndicators.macd.histogram >= 0 ? '+' : ''}${mlIndicators.macd.histogram.toFixed(2)}`,
                          badge: mlIndicators.macd.histogram >= 0 ? 'Bullish' : 'Bearish',
                          color: mlIndicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        },
                        {
                          name: 'Stochastic %K',
                          val: `+${mlIndicators.stochastic.k.toFixed(2)}`,
                          badge: mlIndicators.stochastic.k > 80 ? 'Overbought' : mlIndicators.stochastic.k < 20 ? 'Oversold' : 'Neutral',
                          color: mlIndicators.stochastic.k > 80 ? 'text-rose-400' : mlIndicators.stochastic.k < 20 ? 'text-emerald-400' : 'text-white/55'
                        },
                        {
                          name: 'ADX (Trend Strength)',
                          val: `+${mlIndicators.adx.toFixed(2)}`,
                          badge: mlIndicators.adx >= 25 ? 'Strong Trend' : 'Weak Trend',
                          color: mlIndicators.adx >= 25 ? 'text-purple-400' : 'text-white/40'
                        },
                        {
                          name: 'ATR (Volatility)',
                          val: `₹${mlIndicators.atr.toFixed(2)}`,
                          badge: mlIndicators.atr / mlIndicators.bollingerBands.middle > 0.025 ? 'Highly Volatile' : 'Less volatile',
                          color: mlIndicators.atr / mlIndicators.bollingerBands.middle > 0.025 ? 'text-rose-400 font-semibold' : 'text-emerald-400'
                        },
                        {
                          name: 'Momentum',
                          val: `${mlIndicators.momentum >= 0 ? '+' : ''}${mlIndicators.momentum.toFixed(2)}%`,
                          badge: mlIndicators.momentum >= 0 ? 'Bullish Crossover' : 'Bearish Crossover',
                          color: mlIndicators.momentum >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      ].map((ind, idx) => (
                        <div key={idx} className="grid grid-cols-3 px-4 py-3 hover:bg-white/5 transition-all text-[11px] items-center font-medium">
                          <div className="text-white/80">{ind.name}</div>
                          <div className="text-center font-bold text-white/95">{ind.val}</div>
                          <div className={cn('text-right font-bold', ind.color)}>{ind.badge}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Levels summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950/30 border border-green-500/10 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none">Support Limit</span>
                    <span className="text-base font-extrabold text-green-400 font-mono">₹{mlIndicators.support.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-zinc-950/30 border border-red-500/10 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none">Resistance Ceiling</span>
                    <span className="text-base font-extrabold text-red-400 font-mono">₹{mlIndicators.resistance.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 3. DYNAMIC CALL-TO-ACTION GROWW BUTTONS STRIP */}
                <div className="flex items-center gap-3.5 pt-2 select-none">
                  <Button
                    onClick={handleSIPTrigger}
                    variant="outline"
                    className="flex-1 h-12.5 rounded-xl border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white text-xs font-black uppercase tracking-wider font-sans transition-all duration-300"
                  >
                    SIP setup
                  </Button>
                  <Button
                    onClick={handleSellTrigger}
                    className="flex-[2] h-12.5 rounded-xl bg-[#EF4444] hover:bg-[#D32F2F] text-white text-xs font-black uppercase tracking-wider font-sans shadow-lg shadow-red-500/20 active:scale-[0.99] border-0 transition-all duration-300"
                  >
                    Sell position
                  </Button>
                  <Button
                    onClick={handleBuyTrigger}
                    className="flex-[2] h-12.5 rounded-xl bg-[#10B981] hover:bg-[#0E9F6E] text-white text-xs font-black uppercase tracking-wider font-sans shadow-lg shadow-emerald-500/20 active:scale-[0.99] border-0 transition-all duration-300"
                  >
                    Buy shares
                  </Button>
                </div>

                {/* Markdown Gemini Qualitative AI Analysis Report */}
                <div className="border-t border-white/10 pt-4.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <p className="text-xs font-black text-yellow-400 uppercase tracking-widest">Ensemble AI Qualitative Outlook ({dataPoints} points analysed)</p>
                  </div>
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed text-white/70 prose-p:leading-relaxed prose-headings:text-purple-300 prose-strong:text-white bg-white/5 border border-white/5 rounded-2xl p-4.5 max-h-[300px] overflow-y-auto font-medium">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 animate-pulse">
              <BrainCircuit className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-white">9-Indicator ML Ensemble Ready</p>
              <p className="text-xs text-muted-foreground mt-1">RSI · MACD · ADX · ATR · Stochastic<br/>OBV · VWAP · Bollinger Bands · MA</p>
            </div>
            <Button onClick={generateAnalysis} className="bg-purple-600 hover:bg-purple-700 font-bold uppercase tracking-wider text-xs px-5 py-2.5 h-10">
              <Sparkles className="h-4 w-4 mr-2" /> Run Full Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
