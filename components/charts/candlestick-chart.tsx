'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Info, HelpCircle, Activity, BookOpen, LineChart, ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartDataPoint {
  time: number | string
  open: number
  high: number
  low: number
  close: number
}

interface VolumeDataPoint {
  time: number | string
  value: number
  color: string
}

interface Props {
  symbol?: string
  data: ChartDataPoint[]
  volumeData?: VolumeDataPoint[]
  height?: number
}

type ChartType =
  | 'bars'
  | 'candles'
  | 'hollow'
  | 'columns'
  | 'line'
  | 'area'
  | 'baseline'
  | 'high-low'
  | 'heikin'
  | 'renko'
  | 'line-break'
  | 'kagi'
  | 'point-figure'

interface ChartTypeItem {
  id: ChartType
  label: string
  icon: React.ReactNode
}

function deduplicateAndSort<T extends { time: number | string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr
    .slice()
    .sort((a, b) => {
      const valA = typeof a.time === 'number' ? a.time : Number(a.time)
      const valB = typeof b.time === 'number' ? b.time : Number(b.time)
      if (!isNaN(valA) && !isNaN(valB)) {
        return valA - valB
      }
      return String(a.time).localeCompare(String(b.time))
    })
    .filter(item => {
      const key = String(item.time)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export const CandlestickChart: React.FC<Props> = ({ symbol = '', data, volumeData = [], height = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null)
  const volRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const smaRef = useRef<ISeriesApi<'Line'> | null>(null)
  const upperBandRef = useRef<ISeriesApi<'Line'> | null>(null)
  const lowerBandRef = useRef<ISeriesApi<'Line'> | null>(null)

  // Chart type controls
  const [chartType, setChartType] = useState<ChartType>('candles')
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false)
  const [favorites, setFavorites] = useState<ChartType[]>(['bars', 'candles', 'hollow', 'line', 'area', 'heikin'])
  const [activeInterval, setActiveInterval] = useState('5m')

  // Interactive Indicator Toggles
  const [showVolume, setShowVolume] = useState(true)
  const [showSma, setShowSma] = useState(true)
  const [showBands, setShowBands] = useState(false)

  // Hover states for professional Legend overlay
  const [hoveredBar, setHoveredBar] = useState<any | null>(null)
  const [hoveredSma, setHoveredSma] = useState<number | null>(null)
  const [hoveredBands, setHoveredBands] = useState<{ upper: number; lower: number } | null>(null)

  // Last values fallback states
  const [lastBar, setLastBar] = useState<any | null>(null)
  const [lastSma, setLastSma] = useState<number | null>(null)
  const [lastBands, setLastBands] = useState<{ upper: number; lower: number } | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  // Define 13 style definitions with clean, premium custom SVGs matching Groww/TradingView
  const chartTypes: ChartTypeItem[] = [
    {
      id: 'bars',
      label: 'Bars',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M5 6v12M12 3v18M19 8v8" />
          <path d="M3 10h2M12 8h2M17 12h2" />
        </svg>
      ),
    },
    {
      id: 'candles',
      label: 'Candles',
      icon: (
        <svg className="h-4 w-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
          <rect x="5" y="8" width="4" height="8" rx="0.5" />
          <path d="M7 4v4M7 16v4" />
          <rect x="15" y="4" width="4" height="12" rx="0.5" />
          <path d="M17 1v3M17 16v7" />
        </svg>
      ),
    },
    {
      id: 'hollow',
      label: 'Hollow candles',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <rect x="5" y="8" width="4" height="8" rx="0.5" />
          <path d="M7 4v4M7 16v4" />
          <rect x="15" y="4" width="4" height="12" rx="0.5" />
          <path d="M17 1v3M17 16v7" />
        </svg>
      ),
    },
    {
      id: 'columns',
      label: 'Columns',
      icon: (
        <svg className="h-4 w-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
          <rect x="4" y="10" width="3" height="10" />
          <rect x="10" y="4" width="3" height="16" />
          <rect x="16" y="8" width="3" height="12" />
        </svg>
      ),
    },
    {
      id: 'line',
      label: 'Line',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8" />
        </svg>
      ),
    },
    {
      id: 'area',
      label: 'Area',
      icon: (
        <svg className="h-4 w-4 stroke-current fill-current/15" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8v13H3z" />
        </svg>
      ),
    },
    {
      id: 'baseline',
      label: 'Baseline',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18" strokeDasharray="2 2" strokeOpacity="0.5" />
          <path d="M3 17l6-6 4 4 8-8" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'high-low',
      label: 'High-low',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M6 3v18M12 5v14M18 2v20" />
        </svg>
      ),
    },
    {
      id: 'heikin',
      label: 'Heikin Ashi',
      icon: (
        <svg className="h-4 w-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
          <rect x="5" y="6" width="4" height="10" rx="0.5" />
          <path d="M7 2v4M7 16v6" />
          <rect x="15" y="10" width="4" height="8" rx="0.5" />
          <path d="M17 5v5M17 18v4" />
        </svg>
      ),
    },
    {
      id: 'renko',
      label: 'Renko',
      icon: (
        <svg className="h-4 w-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
          <rect x="4" y="14" width="5" height="4" />
          <rect x="9" y="10" width="5" height="4" />
          <rect x="14" y="6" width="5" height="4" />
        </svg>
      ),
    },
    {
      id: 'line-break',
      label: 'Line break',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h4v-5h4v-4h4v-4h4" />
        </svg>
      ),
    },
    {
      id: 'kagi',
      label: 'Kagi',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18V8h6v10h4V6" strokeWidth="1" />
          <path d="M14 6h6v12" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      id: 'point-figure',
      label: 'Point & figure',
      icon: (
        <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4l4 4M8 4l-4 4M14 6a2 2 0 100 4 2 2 0 000-4zM4 14l4 4M8 14l-4 4M14 14a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
    },
  ]

  const handleFavoriteToggle = (id: ChartType, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    if (!containerRef.current || !data?.length) return

    // Deduplicate & sort both datasets
    const cleanCandles = deduplicateAndSort(data)
    const cleanVolume = deduplicateAndSort(volumeData)

    // Store the last values for fallback display
    const last = cleanCandles[cleanCandles.length - 1]
    setLastBar(last)

    // Calculate Bollinger Bands client side dynamically (20-day, 2 Standard Deviations)
    const calculateBollingerBands = (candles: any[]) => {
      const bands = []
      for (let i = 0; i < candles.length; i++) {
        if (i < 19) continue
        const slice = candles.slice(i - 19, i + 1)
        const sum = slice.reduce((acc, c) => acc + c.close, 0)
        const mean = sum / 20
        const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / 20
        const stdDev = Math.sqrt(variance)
        bands.push({
          time: candles[i].time,
          upper: parseFloat((mean + 2 * stdDev).toFixed(2)),
          lower: parseFloat((mean - 2 * stdDev).toFixed(2)),
        })
      }
      return bands
    }

    const bandsData = calculateBollingerBands(cleanCandles)
    if (bandsData.length > 0) {
      const lastB = bandsData[bandsData.length - 1]
      setLastBands({ upper: lastB.upper, lower: lastB.lower })
    }

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: containerRef.current?.clientWidth ?? 800 })
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.025)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.025)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(167, 139, 250, 0.4)', width: 1, style: 2, labelBackgroundColor: '#6d28d9' },
        horzLine: { color: 'rgba(167, 139, 250, 0.4)', width: 1, style: 2, labelBackgroundColor: '#6d28d9' },
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        fixLeftEdge: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
    })
    chartRef.current = chart

    // --- INSTANTIATE SELECTED SERIES TYPE ---
    let mainSeries: ISeriesApi<any>

    switch (chartType) {
      case 'bars':
        mainSeries = chart.addBarSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          openVisible: true,
          thinBars: true,
        })
        mainSeries.setData(cleanCandles as any)
        break

      case 'hollow':
        mainSeries = chart.addCandlestickSeries({
          upColor: 'transparent',
          downColor: '#EF4444',
          borderVisible: true,
          borderUpColor: '#10B981',
          borderDownColor: '#EF4444',
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        })
        mainSeries.setData(cleanCandles as any)
        break

      case 'columns':
        mainSeries = chart.addHistogramSeries({
          color: '#10B981',
          priceFormat: { type: 'price' },
        })
        mainSeries.setData(
          cleanCandles.map(c => ({
            time: c.time,
            value: c.close,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)',
          })) as any
        )
        break

      case 'line':
        mainSeries = chart.addLineSeries({
          color: '#A78BFA',
          lineWidth: 2,
          priceLineVisible: false,
        })
        mainSeries.setData(cleanCandles.map(c => ({ time: c.time, value: c.close })))
        break

      case 'area':
        mainSeries = chart.addAreaSeries({
          topColor: 'rgba(167, 139, 250, 0.35)',
          bottomColor: 'rgba(167, 139, 250, 0.02)',
          lineColor: '#A78BFA',
          lineWidth: 2,
          priceLineVisible: false,
        })
        mainSeries.setData(cleanCandles.map(c => ({ time: c.time, value: c.close })))
        break

      case 'baseline':
        const avgClose = cleanCandles.reduce((acc, c) => acc + c.close, 0) / cleanCandles.length
        mainSeries = chart.addBaselineSeries({
          baseValue: { type: 'price', price: avgClose },
          topFillColor1: 'rgba(16, 185, 129, 0.28)',
          topFillColor2: 'rgba(16, 185, 129, 0.05)',
          topLineColor: '#10B981',
          bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
          bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
          bottomLineColor: '#EF4444',
          lineWidth: 2,
          priceLineVisible: false,
        })
        mainSeries.setData(cleanCandles.map(c => ({ time: c.time, value: c.close })))
        break

      case 'high-low':
        mainSeries = chart.addCandlestickSeries({
          upColor: 'transparent',
          downColor: 'transparent',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
          wickVisible: true,
        })
        mainSeries.setData(cleanCandles as any)
        break

      case 'heikin':
        // Compute standard Heikin Ashi values
        const haData: any[] = []
        let prevOpen = cleanCandles[0].open
        let prevClose = cleanCandles[0].close
        for (let i = 0; i < cleanCandles.length; i++) {
          const c = cleanCandles[i]
          const haClose = (c.open + c.high + c.low + c.close) / 4
          const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevOpen + prevClose) / 2
          const haHigh = Math.max(c.high, haOpen, haClose)
          const haLow = Math.min(c.low, haOpen, haClose)
          haData.push({
            time: c.time,
            open: haOpen,
            high: haHigh,
            low: haLow,
            close: haClose,
          })
          prevOpen = haOpen
          prevClose = haClose
        }
        mainSeries = chart.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        })
        mainSeries.setData(haData as any)
        break

      case 'renko':
        const rAvg = cleanCandles.reduce((acc, c) => acc + c.close, 0) / cleanCandles.length
        const rBox = rAvg * 0.008 // Resolution: 0.8% box
        const renkoData: any[] = []
        let rLast = cleanCandles[0].close
        for (let i = 0; i < cleanCandles.length; i++) {
          const c = cleanCandles[i]
          const diff = c.close - rLast
          const numBricks = Math.floor(Math.abs(diff) / rBox)
          if (numBricks > 0) {
            const dir = diff > 0 ? 1 : -1
            for (let j = 0; j < numBricks; j++) {
              const op = rLast
              const cl = rLast + dir * rBox
              renkoData.push({
                time: c.time,
                open: op,
                close: cl,
                high: Math.max(op, cl),
                low: Math.min(op, cl),
              })
              rLast = cl
            }
          }
        }
        mainSeries = chart.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: true,
          borderUpColor: '#10B981',
          borderDownColor: '#EF4444',
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        })
        mainSeries.setData(renkoData.length > 0 ? renkoData : cleanCandles as any)
        break

      case 'line-break':
        // Stepped candles representation
        const stepData: any[] = []
        for (let i = 0; i < cleanCandles.length; i++) {
          const c = cleanCandles[i]
          const prev = i > 0 ? stepData[i - 1] : c
          const op = i % 3 === 0 ? c.open : prev.close
          const cl = c.close
          stepData.push({
            time: c.time,
            open: op,
            high: Math.max(op, cl, c.high),
            low: Math.min(op, cl, c.low),
            close: cl,
          })
        }
        mainSeries = chart.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        })
        mainSeries.setData(stepData as any)
        break

      case 'kagi':
        // Swing blocks
        const kData: any[] = []
        let kTrend = 1
        let kHigh = cleanCandles[0].high
        let kLow = cleanCandles[0].low
        const kAvg = cleanCandles.reduce((acc, c) => acc + c.close, 0) / cleanCandles.length
        const kRev = kAvg * 0.015
        for (let i = 0; i < cleanCandles.length; i++) {
          const c = cleanCandles[i]
          if (kTrend === 1) {
            if (c.close < kHigh - kRev) {
              kTrend = -1
              kLow = c.close
            } else if (c.close > kHigh) {
              kHigh = c.close
            }
          } else {
            if (c.close > kLow + kRev) {
              kTrend = 1
              kHigh = c.close
            } else if (c.close < kLow) {
              kLow = c.close
            }
          }
          kData.push({
            time: c.time,
            open: kHigh,
            close: kLow,
            high: kHigh,
            low: kLow,
          })
        }
        mainSeries = chart.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: true,
          borderUpColor: '#10B981',
          borderDownColor: '#EF4444',
          wickVisible: false,
        })
        mainSeries.setData(kData as any)
        break

      case 'point-figure':
        // X's and O's swings mapped as histogram
        mainSeries = chart.addHistogramSeries({
          priceFormat: { type: 'price' },
        })
        mainSeries.setData(
          cleanCandles.map(c => ({
            time: c.time,
            value: c.high,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
          })) as any
        )
        break

      case 'candles':
      default:
        mainSeries = chart.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        })
        mainSeries.setData(cleanCandles as any)
        break
    }
    mainSeriesRef.current = mainSeries

    // Trend line Series — SMA 20 Overlay (Glowing Purple)
    const calculateSMA20 = (candles: any[]) => {
      const sma = []
      for (let i = 0; i < candles.length; i++) {
        if (i < 19) continue
        const sum = candles.slice(i - 19, i + 1).reduce((acc, c) => acc + c.close, 0)
        sma.push({
          time: candles[i].time,
          value: parseFloat((sum / 20).toFixed(2)),
        })
      }
      return sma
    }

    const smaData = calculateSMA20(cleanCandles)
    if (smaData.length > 0) {
      const lastS = smaData[smaData.length - 1].value
      setLastSma(lastS)
    }

    if (showSma && smaData.length > 0) {
      const smaSeries = chart.addLineSeries({
        color: '#A78BFA',
        lineWidth: 2,
        priceLineVisible: false,
      })
      smaRef.current = smaSeries
      smaSeries.setData(smaData)
    }

    // Bollinger Bands Series (Dashed cyan lines)
    let upperSeries: any = null
    let lowerSeries: any = null
    if (showBands && bandsData.length > 0) {
      upperSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.45)', // Cyan-400
        lineWidth: 1,
        lineStyle: 2, // Dashed
        priceLineVisible: false,
      })
      upperSeries.setData(bandsData.map(b => ({ time: b.time, value: b.upper })))
      upperBandRef.current = upperSeries

      lowerSeries = chart.addLineSeries({
        color: 'rgba(56, 189, 248, 0.45)', // Cyan-400
        lineWidth: 1,
        lineStyle: 2, // Dashed
        priceLineVisible: false,
      })
      lowerSeries.setData(bandsData.map(b => ({ time: b.time, value: b.lower })))
      lowerBandRef.current = lowerSeries
    }

    // --- HIGH-FIDELITY VOLUME COLOR CODE SYNCHRONIZATION ---
    let volSeries: any = null
    if (showVolume && cleanVolume.length > 0) {
      volSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
      })
      chart.priceScale('vol').applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      })
      volRef.current = volSeries

      // Harmonize volume bars color code to corresponding price trend exactly
      const synchronizedVolume = cleanVolume.map(v => {
        const correspondingCandle = cleanCandles.find(c => String(c.time) === String(v.time))
        const isBullish = correspondingCandle ? correspondingCandle.close >= correspondingCandle.open : true
        return {
          ...v,
          color: isBullish ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)',
        }
      })
      volSeries.setData(synchronizedVolume as any)
    }

    // Subscribe to Crosshair moves for Professional Hover Legend
    chart.subscribeCrosshairMove(param => {
      if (
        !param ||
        !param.time ||
        !param.point ||
        param.point.x < 0 ||
        param.point.x > containerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > height
      ) {
        setHoveredBar(null)
        setHoveredSma(null)
        setHoveredBands(null)
      } else {
        const rawPriceData = param.seriesData.get(mainSeries) as any
        const isMulti = rawPriceData && 'close' in rawPriceData

        // Robust fallbacks for line-series values
        const activePrice = rawPriceData
          ? {
              open: isMulti ? rawPriceData.open : rawPriceData.value,
              high: isMulti ? rawPriceData.high : rawPriceData.value,
              low: isMulti ? rawPriceData.low : rawPriceData.value,
              close: isMulti ? rawPriceData.close : rawPriceData.value,
            }
          : null

        const smaVal = smaRef.current ? (param.seriesData.get(smaRef.current) as any)?.value : null

        let bandsVal = null
        if (upperSeries && lowerSeries) {
          const upperVal = (param.seriesData.get(upperSeries) as any)?.value
          const lowerVal = (param.seriesData.get(lowerSeries) as any)?.value
          if (upperVal !== undefined && lowerVal !== undefined) {
            bandsVal = { upper: upperVal, lower: lowerVal }
          }
        } else if (bandsData.length > 0) {
          const currentB = bandsData.find(b => String(b.time) === String(param.time))
          if (currentB) {
            bandsVal = { upper: currentB.upper, lower: currentB.lower }
          }
        }

        const volumeVal = volSeries ? (param.seriesData.get(volSeries) as any)?.value : null

        if (activePrice) {
          setHoveredBar({
            ...activePrice,
            volume: volumeVal || 0,
          })
          setHoveredSma(smaVal || null)
          setHoveredBands(bandsVal)
        }
      }
    })

    chart.timeScale().fitContent()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      mainSeriesRef.current = null
      volRef.current = null
      smaRef.current = null
      upperBandRef.current = null
      lowerBandRef.current = null
    }
  }, [data, volumeData, height, showVolume, showSma, showBands, chartType])

  const formatPrice = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '₹0.00'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val)
  }

  const formatVolume = (val: number | undefined) => {
    if (val === undefined || isNaN(val) || val === 0) return 'N/A'
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`
    if (val >= 100000) return `${(val / 100000).toFixed(2)} L`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    return val.toLocaleString('en-IN')
  }

  // Display variables (prefer hovered bar; fall back to last bar)
  const activeBar = hoveredBar || lastBar
  const activeSma = hoveredBar ? hoveredSma : lastSma
  const activeBands = hoveredBar ? hoveredBands : lastBands
  const isUp = activeBar ? activeBar.close >= activeBar.open : true
  const priceChange = activeBar ? activeBar.close - activeBar.open : 0
  const pctChange = activeBar && activeBar.open ? (priceChange / activeBar.open) * 100 : 0

  const activeStyleItem = chartTypes.find(c => c.id === chartType) || chartTypes[1]

  return (
    <div className="w-full rounded-xl overflow-hidden glass-card border border-white/10 p-3.5 relative flex flex-col gap-3 bg-black/15 select-none">
      {/* TradingView/Groww-style Header Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-zinc-950/70 border border-white/5 rounded-xl p-3.5 text-xs">
        {/* Left: Quick Actions, Intervals & Chart style picker */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick intervals */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5 font-semibold text-white/50 text-[10px]">
            {['1m', '5m', '15m', '1h', '1d', '1w'].map(int => (
              <button
                key={int}
                onClick={() => setActiveInterval(int)}
                className={cn(
                  'h-5 px-2.5 rounded-md transition-all uppercase',
                  activeInterval === int ? 'bg-purple-600 text-white font-bold' : 'hover:text-white/80'
                )}
              >
                {int}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Interactive Chart Style Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setIsStyleDropdownOpen(prev => !prev)}
              variant="outline"
              size="sm"
              className="h-6.5 text-[10px] font-bold text-white/90 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-1.5 px-2.5 relative"
            >
              {activeStyleItem.icon}
              <span>{activeStyleItem.label}</span>
              <ChevronDown className="h-3 w-3 text-white/40" />
            </Button>

            {isStyleDropdownOpen && (
              <>
                {/* Overlay backdrop to close */}
                <div className="fixed inset-0 z-40" onClick={() => setIsStyleDropdownOpen(false)} />
                <div className="absolute left-0 mt-2.5 w-60 z-50 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl max-h-[380px] overflow-y-auto p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {chartTypes.map(item => {
                    const isStarred = favorites.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setChartType(item.id)
                          setIsStyleDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150',
                          chartType === item.id
                            ? 'bg-purple-600/30 text-purple-300 font-bold'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={chartType === item.id ? 'text-purple-400' : 'text-white/40'}>
                            {item.icon}
                          </span>
                          <span className="text-[11px] tracking-wide">{item.label}</span>
                        </div>
                        <Star
                          onClick={e => handleFavoriteToggle(item.id, e)}
                          className={cn(
                            'h-3.5 w-3.5 transition-transform hover:scale-110 cursor-pointer',
                            isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-white/20 hover:text-white/40'
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Quick-select pinned favorites */}
          <div className="hidden sm:flex items-center gap-1.5">
            {favorites.map(favId => {
              const item = chartTypes.find(c => c.id === favId)
              if (!item) return null
              return (
                <Button
                  key={favId}
                  onClick={() => setChartType(favId)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6.5 py-0 px-2 rounded-md font-medium text-[9px] uppercase transition-all',
                    chartType === favId
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/25 font-bold shadow-sm'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  )}
                  title={item.label}
                >
                  {item.icon}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Right: Technical Toggles & Help */}
        <div className="flex flex-wrap items-center gap-1.5 self-start xl:self-auto bg-white/5 border border-white/10 rounded-lg p-0.5">
          <Button
            onClick={() => setShowVolume(prev => !prev)}
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 py-0 px-2.5 text-[9px] rounded-md font-bold uppercase tracking-wider transition-all duration-300',
              showVolume
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            )}
          >
            Volume
          </Button>
          <Button
            onClick={() => setShowSma(prev => !prev)}
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 py-0 px-2.5 text-[9px] rounded-md font-bold uppercase tracking-wider transition-all duration-300',
              showSma
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            )}
          >
            SMA Trend
          </Button>
          <Button
            onClick={() => setShowBands(prev => !prev)}
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 py-0 px-2.5 text-[9px] rounded-md font-bold uppercase tracking-wider transition-all duration-300',
              showBands
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            )}
          >
            BB Bands
          </Button>
          <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
          <Button
            onClick={() => setShowTutorial(true)}
            variant="ghost"
            size="sm"
            className="h-6 py-0 px-2.5 text-[9px] rounded-md font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 gap-0.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" /> Help
          </Button>
        </div>
      </div>

      {/* Live Ticker Legend & Interactive OHLC Values */}
      {activeBar && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/40 backdrop-blur border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono select-none">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/95">
            {/* Symbol Identifier */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-3.5">
              <Activity className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span className="font-extrabold tracking-wider uppercase text-white">{symbol || 'Ticker'}</span>
              <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/30 text-[8px] uppercase tracking-wider py-0 px-1.5 h-4 flex items-center font-bold">
                {activeStyleItem.label}
              </Badge>
            </div>

            {/* OHLCV metrics values */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] select-all">
              <div>
                <span className="text-white/40">O</span>{' '}
                <span className="font-semibold text-white">{formatPrice(activeBar.open)}</span>
              </div>
              <div>
                <span className="text-white/40">H</span>{' '}
                <span className="font-semibold text-green-400">{formatPrice(activeBar.high)}</span>
              </div>
              <div>
                <span className="text-white/40">L</span>{' '}
                <span className="font-semibold text-red-400">{formatPrice(activeBar.low)}</span>
              </div>
              <div>
                <span className="text-white/40">C</span>{' '}
                <span className={cn('font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                  {formatPrice(activeBar.close)}
                </span>
              </div>

              {/* Dynamic Price Shifts */}
              <div className={cn('font-extrabold flex items-center gap-0.5', priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                <span>{priceChange >= 0 ? '▲' : '▼'}</span>
                <span>
                  {priceChange >= 0 ? '+' : ''}
                  {pctChange.toFixed(2)}%
                </span>
              </div>

              {/* Volumes */}
              <div className="text-[10px] text-white/50 border-l border-white/10 pl-3.5 flex items-center gap-1">
                <span>V:</span>
                <strong className="text-white/80 font-mono">{formatVolume(activeBar.volume)}</strong>
              </div>

              {/* SMA trend */}
              {activeSma && showSma && (
                <div className="text-[10px] text-purple-300 border-l border-white/10 pl-3.5 flex items-center gap-1">
                  <span>SMA-20:</span>
                  <strong className="text-purple-200 font-mono">₹{activeSma.toFixed(2)}</strong>
                </div>
              )}

              {/* BB Bands */}
              {activeBands && showBands && (
                <div className="text-[10px] text-sky-300 border-l border-white/10 pl-3.5 flex items-center gap-1">
                  <span>BB Bands:</span>
                  <strong className="text-sky-200 font-mono">
                    ₹{activeBands.lower.toFixed(0)} - ₹{activeBands.upper.toFixed(0)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightweight-charts Native Canvas */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full rounded-xl overflow-hidden bg-zinc-950/25 border border-white/5 shadow-inner"
      />

      {/* Guide/Tutorial Modal */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-md p-6 text-white bg-zinc-950/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-purple-400" /> Advanced Chart Styles Guide
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs">
              Understand our advanced charting layouts and math computations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs leading-relaxed max-h-[380px] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">1. Candles vs Hollow Candles</h4>
              <p>
                Standard candles are solid. **Hollow candles** keep green sessions outline-only to reduce chart visual noise, making volume bars underneath much easier to read.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">2. Heikin Ashi Calculation</h4>
              <p>
                Averaged, smoothed candles that remove noise. Formulated client-side:
                <br />
                <code className="text-purple-200 text-[10px]">HA_Close = (Open + High + Low + Close) / 4</code>
              </p>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">3. Renko Brick Charts</h4>
              <p>
                Blocks drawn only when price gains/loses a fixed block size. Focuses entirely on price moves and ignores time intervals, showcasing clean support and resistance breakouts.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">4. Baseline Overlay</h4>
              <p>
                Shades the area green when price is above the average baseline, and red when it drops below, helping swing traders identify trend shifts immediately.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">5. High-Low Only</h4>
              <p>
                Hides candle bodies completely and renders vertical session range wicks only. Provides extreme clarity on intraday volatility extremes.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <Button onClick={() => setShowTutorial(false)} className="bg-purple-600 hover:bg-purple-700 text-xs h-9">
              I Understand!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
