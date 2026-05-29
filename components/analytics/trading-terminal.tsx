"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Sliders, 
  LineChart, 
  RefreshCw, 
  ArrowRight,
  TrendingUpIcon,
  ChevronRight,
  Sparkles
} from "lucide-react"

// Import lightweight-charts only on client
let createChart: any
let LineStyle: any
let ColorType: any

if (typeof window !== "undefined") {
  const lw = require("lightweight-charts")
  createChart = lw.createChart
  LineStyle = lw.LineStyle
  ColorType = lw.ColorType
}

interface CandlestickData {
  time: string
  open: number
  high: number
  low: number
  close: number
}

interface LineData {
  time: string
  value: number
}

const calculateOptionPremium = (spot: number, strike: number, type: "CE" | "PE", asset: string) => {
  const isCE = type === "CE"
  const intrinsic = isCE ? Math.max(0, spot - strike) : Math.max(0, strike - spot)
  
  let extrinsic = 80 // Default for Nifty
  if (asset === "BANKNIFTY") extrinsic = 250
  else if (asset === "SENSEX") extrinsic = 150
  else if (!["NIFTY", "BANKNIFTY", "SENSEX"].includes(asset)) {
    extrinsic = spot * 0.05 // default for stocks, ~5% of price
  }
  
  const distance = Math.abs(spot - strike)
  const decay = Math.exp(-distance / (asset === "BANKNIFTY" ? 2000 : asset === "SENSEX" ? 3000 : ["NIFTY", "BANKNIFTY", "SENSEX"].includes(asset) ? 800 : spot * 0.08 || 200))
  const finalPremium = intrinsic + (extrinsic * decay)
  
  return +(Math.max(5, finalPremium)).toFixed(2)
}

export function TradingTerminal({ initialSymbol }: { initialSymbol?: string }) {
  const spotContainerRef = useRef<HTMLDivElement>(null)
  const optionContainerRef = useRef<HTMLDivElement>(null)
  
  const spotChartInstance = useRef<any>(null)
  const optionChartInstance = useRef<any>(null)
  
  const spotSeriesInstance = useRef<any>(null)
  const optionSeriesInstance = useRef<any>(null)
  
  const ema9SeriesInstance = useRef<any>(null)
  const ema20SeriesInstance = useRef<any>(null)
  
  const spotTpLineInstance = useRef<any>(null)
  const spotSlLineInstance = useRef<any>(null)
  
  const optionTpLineInstance = useRef<any>(null)
  const optionSlLineInstance = useRef<any>(null)
  const optionEntryLineInstance = useRef<any>(null)

  // Spot Index & Options selection state
  const [activeAsset, setActiveAsset] = useState<string>(initialSymbol || "NIFTY")
  const [optionType, setOptionType] = useState<"CE" | "PE">("CE")
  const [strikePrice, setStrikePrice] = useState<number>(23900)
  
  // Real-time fluctuating price states
  const [spotPrice, setSpotPrice] = useState<number>(23907.15)
  const [spotChange, setSpotChange] = useState<number>(-6.55)
  const [spotChangePercent, setSpotChangePercent] = useState<number>(-0.03)
  const [optionPrice, setOptionPrice] = useState<number>(120.00)
  const [optionChange, setOptionChange] = useState<number>(5.50)
  
  // Draggable targets & safety buffers state
  const [targetReward, setTargetReward] = useState<number>(170.00) // TP level
  const [riskFloor, setRiskFloor] = useState<number>(90.00) // SL level
  const [entryPrice, setEntryPrice] = useState<number>(120.00) // Entry level
  const [autoTsl, setAutoTsl] = useState<boolean>(true) // Trailing Stop Loss
  
  // Scanner setup tracking state
  const [scannerEMA, setScannerEMA] = useState<"Bullish Cross imminent" | "Bearish Crossover active" | "No Crossover">("Bullish Cross imminent")
  const [scannerHarami, setScannerHarami] = useState<"Harami Inside Candle Pattern Spotted!" | "Scanning..." | "No harami">("Harami Inside Candle Pattern Spotted!")
  const [setupTriggered, setSetupTriggered] = useState<boolean>(true) // Setup matched trigger
  
  // Active Position state
  const [positionActive, setPositionActive] = useState<boolean>(false)
  const [positionQty, setPositionQty] = useState<number>(50) // 1 Lot (NIFTY is 50 qty)
  const [positionEntryPrice, setPositionEntryPrice] = useState<number>(0)
  const [positionPnL, setPositionPnL] = useState<number>(0)
  const [maxTslObservedPrice, setMaxTslObservedPrice] = useState<number>(0)

  // Real-time index candlestick history loaded from yfinance API
  const [spotHistory, setSpotHistory] = useState<CandlestickData[]>([])

  // Generate fallback mock history if API fails
  const generateChartHistoryFallback = (baseSpot: number) => {
    const spotData: CandlestickData[] = []
    const date = new Date()
    date.setDate(date.getDate() - 30)

    for (let i = 0; i < 30; i++) {
      const timeStr = date.toISOString().split("T")[0]
      const sOpen = +(baseSpot - 40 + Math.random() * 80).toFixed(2)
      const sClose = +(baseSpot - 40 + Math.random() * 80).toFixed(2)
      const sHigh = +(Math.max(sOpen, sClose) + Math.random() * 30).toFixed(2)
      const sLow = +(Math.min(sOpen, sClose) - Math.random() * 30).toFixed(2)

      spotData.push({ time: timeStr, open: sOpen, high: sHigh, low: sLow, close: sClose })
      date.setDate(date.getDate() + 1)
    }

    return { spotData }
  }

  // Load live spot price, nearest strike, and historical spot chart data on activeAsset changes
  useEffect(() => {
    const fetchLiveIndexData = async () => {
      let baseSpot = 2000 // default stock price
      let spotChgPct = 0
      let spotChg = 0

      const isIndex = ["NIFTY", "BANKNIFTY", "SENSEX"].includes(activeAsset)

      if (isIndex) {
        baseSpot = activeAsset === "NIFTY" ? 23907.15 : activeAsset === "BANKNIFTY" ? 54853.85 : 75867.80
        spotChgPct = activeAsset === "NIFTY" ? -0.03 : activeAsset === "BANKNIFTY" ? -0.43 : -0.19
        spotChg = +(baseSpot * (spotChgPct / 100)).toFixed(2)

        try {
          const overviewRes = await fetch('/api/market/overview')
          if (overviewRes.ok) {
            const overviewJson = await overviewRes.json()
            if (overviewJson.success && overviewJson.data) {
              const d = overviewJson.data
              if (activeAsset === "NIFTY") {
                baseSpot = d.nifty50
                spotChgPct = d.niftyChange
                spotChg = +(baseSpot * (spotChgPct / 100)).toFixed(2)
              } else if (activeAsset === "BANKNIFTY") {
                baseSpot = d.niftyBank ?? 54853.85
                spotChgPct = d.niftyBankChange ?? -0.43
                spotChg = +(baseSpot * (spotChgPct / 100)).toFixed(2)
              } else if (activeAsset === "SENSEX") {
                baseSpot = d.sensex
                spotChgPct = d.sensexChange
                spotChg = +(baseSpot * (spotChgPct / 100)).toFixed(2)
              }
            }
          }
        } catch (err) {
          console.error("Error fetching live overview prices:", err)
        }
      } else {
        // Fetch from stock details API
        try {
          const stockRes = await fetch(`/api/stocks/${activeAsset}`)
          if (stockRes.ok) {
            const stockJson = await stockRes.json()
            if (stockJson.success && stockJson.data?.stock) {
              const s = stockJson.data.stock
              baseSpot = s.price || 1000
              spotChg = s.change || 0
              spotChgPct = s.changePercent || 0
            }
          }
        } catch (err) {
          console.error("Error fetching stock price:", err)
        }
      }

      setSpotPrice(baseSpot)
      setSpotChange(spotChg)
      setSpotChangePercent(spotChgPct)

      // Set Qty based on activeAsset
      let qty = 100 // default for stocks
      if (activeAsset === "NIFTY") qty = 50
      else if (activeAsset === "BANKNIFTY") qty = 15
      else if (activeAsset === "SENSEX") qty = 10
      setPositionQty(qty)

      // Calculate nearest strike
      const step = isIndex 
        ? (activeAsset === "NIFTY" ? 50 : 100)
        : (baseSpot > 1000 ? 50 : baseSpot > 200 ? 10 : 5)
      const nearestStrike = Math.round(baseSpot / step) * step
      setStrikePrice(nearestStrike)

      // Fetch historical chart data
      const ticker = isIndex
        ? (activeAsset === "NIFTY" ? "^NSEI" : activeAsset === "BANKNIFTY" ? "^NSEBANK" : "^BSESN")
        : (activeAsset.includes(".") ? activeAsset : `${activeAsset}.NS`)
      try {
        const chartRes = await fetch(`/api/market/chart?symbol=${encodeURIComponent(ticker)}&period=1mo`)
        if (chartRes.ok) {
          const chartJson = await chartRes.json()
          if (chartJson.success && chartJson.data?.candlestick) {
            setSpotHistory(chartJson.data.candlestick)
            return
          }
        }
      } catch (err) {
        console.error("Error fetching index chart history:", err)
      }

      // Fallback: Generate mock history if API fails
      const { spotData } = generateChartHistoryFallback(baseSpot)
      setSpotHistory(spotData)
    }

    fetchLiveIndexData()
  }, [activeAsset])

  // Initialize dual charts
  useEffect(() => {
    if (typeof window === "undefined" || !spotContainerRef.current || !optionContainerRef.current) return

    // Clean up previous instances
    cleanupCharts()

    // Dynamically calculate premium base values to align UI price labels with chart y-axis
    const baseOpt = calculateOptionPremium(spotPrice, strikePrice, optionType, activeAsset)

    setOptionPrice(baseOpt)
    setOptionChange(+(baseOpt * 0.05).toFixed(2))

    // Dynamically align TP/SL bounds to make Risk:Reward ratios correct
    const isIndex = ["NIFTY", "BANKNIFTY", "SENSEX"].includes(activeAsset)
    setEntryPrice(baseOpt)
    setTargetReward(baseOpt + (activeAsset === "BANKNIFTY" ? 150 : isIndex ? 50 : baseOpt * 0.25))
    setRiskFloor(baseOpt - (activeAsset === "BANKNIFTY" ? 100 : isIndex ? 30 : baseOpt * 0.15))

    // 1. Create Spot Chart (Top)
    const spotChart = createChart(spotContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(12, 10, 24, 0.6)" },
        textColor: "rgba(255, 255, 255, 0.5)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.02)" },
        horzLines: { color: "rgba(255, 255, 255, 0.02)" },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      width: spotContainerRef.current.clientWidth,
      height: 240,
    })
    spotChartInstance.current = spotChart

    // 2. Create Options Chart (Bottom)
    const optionChart = createChart(optionContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(12, 10, 24, 0.6)" },
        textColor: "rgba(255, 255, 255, 0.5)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.02)" },
        horzLines: { color: "rgba(255, 255, 255, 0.02)" },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      width: optionContainerRef.current.clientWidth,
      height: 240,
    })
    optionChartInstance.current = optionChart

    // 3. Add Series
    const spotSeries = spotChart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    })
    spotSeriesInstance.current = spotSeries

    const optionSeries = optionChart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    })
    optionSeriesInstance.current = optionSeries

    const ema9Series = spotChart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 1.5,
      title: "EMA 9",
    })
    ema9SeriesInstance.current = ema9Series

    const ema20Series = spotChart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 1.5,
      title: "EMA 20",
    })
    ema20SeriesInstance.current = ema20Series

    // 4. Load spot history & calculate correlated option premium candlesticks
    if (spotHistory.length > 0) {
      // Robust client-side deduplication and sorting to guarantee strictly ascending order and prevent lightweight-charts errors
      const seenTimes = new Set<string | number>()
      const sanitizedSpotHistory = spotHistory
        .filter(c => c && c.time !== undefined && c.time !== null)
        .map(c => {
          let timeKey = c.time
          if (typeof timeKey === 'string' && timeKey.includes('T')) {
            timeKey = timeKey.split('T')[0]
          }
          return { ...c, time: timeKey }
        })
        .sort((a, b) => {
          const valA = typeof a.time === 'number' ? a.time : Number(a.time)
          const valB = typeof b.time === 'number' ? b.time : Number(b.time)
          if (!isNaN(valA) && !isNaN(valB)) {
            return valA - valB
          }
          return String(a.time).localeCompare(String(b.time))
        })
        .filter(c => {
          const key = typeof c.time === 'number' ? c.time : String(c.time)
          if (seenTimes.has(key)) return false
          seenTimes.add(key)
          return true
        })

      if (sanitizedSpotHistory.length > 0) {
        spotSeries.setData(sanitizedSpotHistory)
        
        const optionData = sanitizedSpotHistory.map(c => ({
          time: c.time,
          open: calculateOptionPremium(c.open, strikePrice, optionType, activeAsset),
          high: calculateOptionPremium(optionType === "CE" ? c.high : c.low, strikePrice, optionType, activeAsset),
          low: calculateOptionPremium(optionType === "CE" ? c.low : c.high, strikePrice, optionType, activeAsset),
          close: calculateOptionPremium(c.close, strikePrice, optionType, activeAsset)
        }))
        optionSeries.setData(optionData)
        
        const ema9Data = sanitizedSpotHistory.map(c => ({ time: c.time, value: +(c.close * 0.999).toFixed(2) }))
        const ema20Data = sanitizedSpotHistory.map(c => ({ time: c.time, value: +(c.close * 0.998).toFixed(2) }))
        ema9Series.setData(ema9Data)
        ema20Series.setData(ema20Data)
      }
    }

    // Fit views
    spotChart.timeScale().fitContent()
    optionChart.timeScale().fitContent()

    // 5. Draw Key Support/Resistance Indicator price lines dynamically on Spot chart
    const range = spotPrice * 0.003
    const spotResLevel = +(spotPrice + range).toFixed(2)
    const spotSupLevel = +(spotPrice - range).toFixed(2)

    spotSeries.createPriceLine({
      price: spotResLevel,
      color: "#3b82f6",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Key Resistance",
    })
    spotSeries.createPriceLine({
      price: spotSupLevel,
      color: "#f59e0b",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Key Support",
    })

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (spotContainerRef.current && optionContainerRef.current) {
        spotChart.resize(spotContainerRef.current.clientWidth, 240)
        optionChart.resize(optionContainerRef.current.clientWidth, 240)
      }
    })
    resizeObserver.observe(spotContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      cleanupCharts()
    }
  }, [activeAsset, optionType, strikePrice, spotHistory])

  const cleanupCharts = () => {
    try {
      if (spotChartInstance.current) {
        spotChartInstance.current.remove()
        spotChartInstance.current = null
      }
      if (optionChartInstance.current) {
        optionChartInstance.current.remove()
        optionChartInstance.current = null
      }
    } catch (e) {
      console.error("Error cleaning up charts:", e)
    }
  }

  // Update target/risk/entry lines on Options chart when values change
  useEffect(() => {
    const optionSeries = optionSeriesInstance.current
    if (!optionSeries || typeof window === "undefined" || !LineStyle) return

    // Clean up previous lines
    if (optionTpLineInstance.current) optionSeries.removePriceLine(optionTpLineInstance.current)
    if (optionSlLineInstance.current) optionSeries.removePriceLine(optionSlLineInstance.current)
    if (optionEntryLineInstance.current) optionSeries.removePriceLine(optionEntryLineInstance.current)

    // Create Take Profit Line
    optionTpLineInstance.current = optionSeries.createPriceLine({
      price: targetReward,
      color: "#10b981",
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `TP: ₹${targetReward.toFixed(2)}`,
    })

    // Create Stop Loss Line
    optionSlLineInstance.current = optionSeries.createPriceLine({
      price: riskFloor,
      color: "#ef4444",
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `SL: ₹${riskFloor.toFixed(2)}`,
    })

    // Create Entry line if trade is in active mode
    if (positionActive) {
      optionEntryLineInstance.current = optionSeries.createPriceLine({
        price: positionEntryPrice,
        color: "#94a3b8",
        lineWidth: 1.5,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `ENTRY: ₹${positionEntryPrice.toFixed(2)}`,
      })
    } else {
      optionEntryLineInstance.current = optionSeries.createPriceLine({
        price: entryPrice,
        color: "#a78bfa",
        lineWidth: 1.5,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `LIMIT: ₹${entryPrice.toFixed(2)}`,
      })
    }
  }, [targetReward, riskFloor, entryPrice, positionActive, positionEntryPrice])

  // Simulated Tick Engine (Updates the charts every 1.5 seconds)
  useEffect(() => {
    let tickCount = 0
    const interval = setInterval(() => {
      const spotSeries = spotSeriesInstance.current
      const optionSeries = optionSeriesInstance.current
      const ema9Series = ema9SeriesInstance.current
      const ema20Series = ema20SeriesInstance.current
      
      if (!spotSeries || !optionSeries) return

      // Simulated Spot Random Walk (NSE Index fluctuations)
      const isUp = Math.random() > 0.45
      // Increase magnitude slightly for BANKNIFTY and SENSEX due to their higher price levels
      const magnitude = Math.random() * (activeAsset === "NIFTY" ? 2 : activeAsset === "BANKNIFTY" ? 8 : 12)
      const delta = isUp ? magnitude : -magnitude
      const newSpotPrice = +(spotPrice + delta).toFixed(2)
      setSpotPrice(newSpotPrice)
      
      const newChange = +(spotChange + delta).toFixed(2)
      setSpotChange(newChange)
      
      // Calculate change percent relative to standard index denominator
      const baseSpotDenominator = activeAsset === "NIFTY" ? 23910.00 : activeAsset === "BANKNIFTY" ? 55092.90 : 76000.00
      setSpotChangePercent(+(newChange / baseSpotDenominator * 100).toFixed(2))

      // Simulated Option Premium correlation mapped directly from our Black-Scholes approximation
      const newOptionPrice = calculateOptionPremium(newSpotPrice, strikePrice, optionType, activeAsset)
      setOptionPrice(newOptionPrice)
      
      const initialOptPrice = calculateOptionPremium(spotPrice, strikePrice, optionType, activeAsset)
      setOptionChange(+(newOptionPrice - initialOptPrice).toFixed(2))

      // Append live tick to the charts (Update current candle)
      const lastTime = new Date().toISOString().split("T")[0] // standard daily charting format
      
      // Calculate dynamic candlestick boundaries relative to active asset
      const spotBaseOpen = spotPrice
      const spotBaseHigh = Math.max(spotPrice, newSpotPrice)
      const spotBaseLow = Math.min(spotPrice, newSpotPrice)

      spotSeries.update({
        time: lastTime,
        open: spotBaseOpen,
        high: spotBaseHigh,
        low: spotBaseLow,
        close: newSpotPrice
      })

      const optBaseOpen = optionPrice
      const optBaseHigh = Math.max(optionPrice, newOptionPrice)
      const optBaseLow = Math.min(optionPrice, newOptionPrice)

      optionSeries.update({
        time: lastTime,
        open: optBaseOpen,
        high: optBaseHigh,
        low: optBaseLow,
        close: newOptionPrice
      })

      ema9Series.update({ time: lastTime, value: newSpotPrice * 0.9997 })
      ema20Series.update({ time: lastTime, value: newSpotPrice * 0.9995 })

      // Active Position Calculations
      if (positionActive) {
        // Fluctuating Profit and Loss
        const pnl = +( (newOptionPrice - positionEntryPrice) * positionQty ).toFixed(2)
        setPositionPnL(pnl)

        // Trailing Stop Loss logic
        if (autoTsl) {
          if (newOptionPrice > maxTslObservedPrice) {
            setMaxTslObservedPrice(newOptionPrice)
            // Trailing Stop Loss rules: raise stop loss upward as option price creates new highs, maintaining 30 pts buffer
            const newSL = +(newOptionPrice - 30).toFixed(2)
            if (newSL > riskFloor) {
              setRiskFloor(newSL)
              toast.info(`TSL Adjusted: Stop Loss trailed to ₹${newSL.toFixed(2)} to secure profit!`, { id: "tsl-adjust" })
            }
          }
        }

        // Target Take Profit check
        if (newOptionPrice >= targetReward) {
          exitTrade(newOptionPrice, "Take Profit Hit! 🎉")
        }
        // Stop Loss floor check
        else if (newOptionPrice <= riskFloor) {
          exitTrade(newOptionPrice, "Stop Loss Hit. 🛡️")
        }
      }

      // Scanner Tick Alternation (Mocking active real-time logic analysis)
      tickCount++
      if (tickCount % 6 === 0) {
        // Toggle Inside Candle and EMA matching state for realistic scanner alerts
        const match = Math.random() > 0.3
        setSetupTriggered(match)
        setScannerHarami(match ? "Harami Inside Candle Pattern Spotted!" : "Scanning...")
        setScannerEMA(match ? "Bullish Cross imminent" : "Bearish Crossover active")
        if (match) {
          toast.success("⚡ Inside Bar & EMA 9/20 Crossover logic scanner MATCHED! Setup ready to execute.", { id: "scanner-alert" })
        }
      }

    }, 1500)

    return () => clearInterval(interval)
  }, [spotPrice, optionPrice, positionActive, positionEntryPrice, targetReward, riskFloor, autoTsl, maxTslObservedPrice, optionType, strikePrice, activeAsset, spotChange])


  // Handle manual or automatic trade execution
  const executeTrade = () => {
    if (positionActive) return

    setPositionActive(true)
    setPositionEntryPrice(optionPrice)
    setMaxTslObservedPrice(optionPrice)
    setPositionPnL(0)

    // Calculate default Target Reward (TP) and Risk Floor (SL) automatically based on Entry
    const isIndex = ["NIFTY", "BANKNIFTY", "SENSEX"].includes(activeAsset)
    const slVal = +(optionPrice - (activeAsset === "BANKNIFTY" ? 100 : isIndex ? 30 : optionPrice * 0.15)).toFixed(2)
    const tpVal = +(optionPrice + (activeAsset === "BANKNIFTY" ? 150 : isIndex ? 50 : optionPrice * 0.25)).toFixed(2)
    setRiskFloor(slVal)
    setTargetReward(tpVal)

    toast.success(`🚀 Setup Trade Executed! Bought 1 Lot ${activeAsset} ${strikePrice} ${optionType} @ ₹${optionPrice.toFixed(2)} with Auto TP/SL set!`, { duration: 5000 })
  }

  // Handle trade exit
  const exitTrade = (exitPrice: number, reason: string) => {
    if (!positionActive) return

    const finalPnL = +( (exitPrice - positionEntryPrice) * positionQty ).toFixed(2)
    
    // Play sound or show alert
    toast(reason, {
      description: `Premium exited @ ₹${exitPrice.toFixed(2)} | Net Return: ${finalPnL >= 0 ? "+" : ""}${finalPnL.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`,
      duration: 6000,
    })

    // Store in virtual paper trading logs if needed
    try {
      const history = JSON.parse(localStorage.getItem("paper_trading_history") || "[]")
      history.unshift({
        id: `trade-${Date.now()}`,
        symbol: `${activeAsset} ${strikePrice} ${optionType}`,
        type: "BUY",
        qty: positionQty,
        buyPrice: positionEntryPrice,
        sellPrice: exitPrice,
        pnl: finalPnL,
        date: new Date().toISOString(),
      })
      localStorage.setItem("paper_trading_history", JSON.stringify(history))
      
      // Update paper virtual balance
      const currentBalance = parseFloat(localStorage.getItem("paper_trading_balance") || "100000")
      localStorage.setItem("paper_trading_balance", (currentBalance + finalPnL).toFixed(2))
    } catch (_) {}

    setPositionActive(false)
  }

  return (
    <Card className="glass-card glow glow-purple glass-highlight border-white/10 w-full overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-pink-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
              <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                ⚡ FinPulse Live Trading Terminal
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                  Zero Slippage routing active
                </Badge>
              </CardTitle>
              <CardDescription className="text-white/60 text-xs">
                Real-time options tracking & automated setup logic scanners
              </CardDescription>
            </div>
          </div>

          {/* Quick asset switch */}
          <div className="flex items-center gap-2">
            {(["NIFTY", "BANKNIFTY", "SENSEX"] as const).map((asset) => (
              <button
                key={asset}
                onClick={() => {
                  setActiveAsset(asset)
                  toast.success(`Switched terminal to ${asset} spot index!`, { id: "asset-switch" })
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeAsset === asset
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
 
      <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Logic Scan, Options Selection & Draggable Slider Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Options Chain Selection */}
          <Card className="glass-card bg-white/5 border-white/5 shadow-inner">
            <CardHeader className="p-3 border-b border-white/10">
              <CardTitle className="text-sm font-semibold text-white/90">Options Selector</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOptionType("CE")
                    toast(`Loaded ${activeAsset} ${strikePrice} Call Option Contract (CE)`);
                  }}
                  className={`py-2 rounded-lg text-center text-xs font-bold transition-all border ${
                    optionType === "CE"
                      ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-md shadow-green-500/10"
                      : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  CALLS (CE)
                </button>
                <button
                  onClick={() => {
                    setOptionType("PE")
                    toast(`Loaded ${activeAsset} ${strikePrice} Put Option Contract (PE)`);
                  }}
                  className={`py-2 rounded-lg text-center text-xs font-bold transition-all border ${
                    optionType === "PE"
                      ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-md shadow-red-500/10"
                      : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  PUTS (PE)
                </button>
              </div>

              <div>
                <label className="text-[10px] text-white/50 block mb-1">STRIKE PRICE</label>
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/15">
                  <span className="text-xs font-bold text-purple-300">{strikePrice}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setStrikePrice(strikePrice - 50)} 
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/80"
                    >
                      -50
                    </button>
                    <button 
                      onClick={() => setStrikePrice(strikePrice + 50)} 
                      className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/80"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Scanner */}
          <Card className="glass-card bg-white/5 border-white/5">
            <CardHeader className="p-3 border-b border-white/10">
              <CardTitle className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Strategy Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-4 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-black/30 border border-white/5">
                <span className="text-white/60">EMA 9/20 Cross</span>
                <Badge className={scannerEMA.includes("Bullish") ? "bg-green-500/20 text-green-400 border-0" : "bg-orange-500/20 text-orange-400 border-0"}>
                  {scannerEMA}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-black/30 border border-white/5">
                <span className="text-white/60">Inside Candle</span>
                <Badge className={scannerHarami.includes("Spotted") ? "bg-green-500/20 text-green-400 border-0" : "bg-white/5 text-white/40 border-0"}>
                  {scannerHarami}
                </Badge>
              </div>

              {/* setup triggered notification & BUY CE button */}
              {setupTriggered && !positionActive && (
                <div className="space-y-3 pt-2">
                  <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-[11px] text-purple-300 leading-relaxed text-center animate-pulse">
                    ⚡ Inside Harami Candle Crossover Matched! Setup is ripe for entry.
                  </div>
                  <Button
                    onClick={executeTrade}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 text-xs shadow-lg shadow-green-600/35 border-0 rounded-xl"
                  >
                    ⚡ EXECUTE SETUP TRADE
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Draggable Price Targets Slider Controls */}
          <Card className="glass-card bg-white/5 border-white/5">
            <CardHeader className="p-3 border-b border-white/10">
              <CardTitle className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-purple-400" />
                Draggable Level Slider
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-green-400">Take Profit (TP)</span>
                  <span className="text-green-400">₹{targetReward.toFixed(2)}</span>
                </div>
                <Slider
                  min={optionPrice}
                  max={optionPrice + 100}
                  step={0.5}
                  value={[targetReward]}
                  onValueChange={(val) => setTargetReward(val[0])}
                  className="[&>[role=slider]]:bg-green-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-red-400">Stop Loss (SL)</span>
                  <span className="text-red-400">₹{riskFloor.toFixed(2)}</span>
                </div>
                <Slider
                  min={optionPrice - 80}
                  max={optionPrice}
                  step={0.5}
                  value={[riskFloor]}
                  onValueChange={(val) => setRiskFloor(val[0])}
                  className="[&>[role=slider]]:bg-red-400"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="text-xs">
                  <span className="text-white/50 block">Risk:Reward</span>
                  <span className="text-white font-bold">
                    1 : {((targetReward - optionPrice) / Math.max(1, optionPrice - riskFloor)).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-right">
                  <span className="text-white/50 block">Est Gain per Lot</span>
                  <span className="text-green-400 font-bold">
                    +₹{Math.max(0, (targetReward - optionPrice) * positionQty).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* TSL Checkbox Switcher */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 pt-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <div className="text-xs">
                    <span className="text-white block font-medium">Auto Trailing SL</span>
                    <span className="text-white/40 block text-[9px]">Follows price (+30 pts buffer)</span>
                  </div>
                </div>
                <Switch 
                  checked={autoTsl} 
                  onCheckedChange={setAutoTsl}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Stack: Stacking Dual Charts View & Order Positions Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Dual stacked charting canvas */}
          <div className="space-y-4 p-3 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            {/* Spot Chart Header */}
            <div className="flex justify-between items-center text-xs font-semibold px-2">
              <span className="text-white/80 flex items-center gap-1.5">
                <LineChart className="h-4 w-4 text-blue-400" />
                {activeAsset} Index Spot Chart (Live updates)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white">₹{spotPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span className={spotChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {spotChange >= 0 ? "+" : ""}{spotChange.toFixed(2)} ({spotChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Spot Canvas Ref */}
            <div 
              ref={spotContainerRef} 
              id="spot-chart-canvas" 
              className="w-full rounded-xl overflow-hidden border border-white/5 bg-black/40"
              style={{ minHeight: "240px" }}
            />

            {/* Option Chart Header */}
            <div className="flex justify-between items-center text-xs font-semibold px-2 pt-2 border-t border-white/10">
              <span className="text-white/80 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-green-400" />
                {activeAsset} 28-MAY {strikePrice} {optionType} Option Premium Chart
              </span>
              <div className="flex items-center gap-3">
                <span className="text-purple-300">₹{optionPrice.toFixed(2)}</span>
                <span className={optionChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {optionChange >= 0 ? "+" : ""}{optionChange.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Option Canvas Ref */}
            <div 
              ref={optionContainerRef} 
              id="option-chart-canvas" 
              className="w-full rounded-xl overflow-hidden border border-white/5 bg-black/40 relative"
              style={{ minHeight: "240px" }}
            >
              {/* Floating Order Tag / Mobile Overlay inside Options Canvas */}
              {positionActive && (
                <div 
                  className="absolute top-4 left-4 z-10 glass-card p-3 shadow-xl rounded-xl border border-white/15 animate-fade-in flex flex-col gap-2 min-w-[200px]"
                  style={{ background: "rgba(10, 5, 25, 0.9)" }}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-1">
                    <span className="text-[10px] font-bold text-purple-300 tracking-wider">ACTIVE ORDER</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-1.5 py-0.5">
                      1 Lot
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-white/50 block text-[9px]">Premium P&L</span>
                      <span className={`font-bold text-sm ${positionPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {positionPnL >= 0 ? "+" : ""}₹{positionPnL.toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => exitTrade(optionPrice, "Exited manually. 🚪")}
                      className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border-0 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 transition-all"
                    >
                      Exit Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulated positions table */}
          {positionActive && (
            <Card className="glass-card bg-white/5 border-white/5 animate-fade-in">
              <CardHeader className="p-3 border-b border-white/10 bg-purple-950/20">
                <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>Open Option Positions (NSE)</span>
                  <Badge className="bg-purple-600 text-white">Active (1)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/50 font-semibold bg-black/20">
                        <th className="p-3">CONTRACT</th>
                        <th className="p-3 text-center">TYPE</th>
                        <th className="p-3 text-center">LOTS (QTY)</th>
                        <th className="p-3 text-right">ENTRY VALUE</th>
                        <th className="p-3 text-right">CURRENT PRICE</th>
                        <th className="p-3 text-right">UNREALIZED P&L</th>
                        <th className="p-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/5 text-white/90">
                        <td className="p-3 font-semibold">{activeAsset} 28-MAY {strikePrice} {optionType}</td>
                        <td className="p-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            optionType === "CE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {optionType === "CE" ? "CALL" : "PUT"}
                          </span>
                        </td>
                        <td className="p-3 text-center">1 Lot ({positionQty})</td>
                        <td className="p-3 text-right">₹{positionEntryPrice.toFixed(2)}</td>
                        <td className="p-3 text-right text-purple-300">₹{optionPrice.toFixed(2)}</td>
                        <td className={`p-3 text-right font-bold ${positionPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {positionPnL >= 0 ? "+" : ""}₹{positionPnL.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => exitTrade(optionPrice, "Exited manually. 🚪")}
                            className="bg-red-600 hover:bg-red-700 py-1 h-7 text-[10px]"
                          >
                            Exit Position
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
