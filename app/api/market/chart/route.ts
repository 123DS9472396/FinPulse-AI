import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'

/** Merge multiple intraday candles that fall on the same calendar date into one daily bar */
function mergeToDailyBars(rawData: { timestamp: string; open: number; high: number; low: number; close: number; volume: number }[]) {
  // Group by YYYY-MM-DD (UTC date of the timestamp)
  const dayMap = new Map<string, { open: number; high: number; low: number; close: number; volume: number }>()

  for (const d of rawData) {
    const dateKey = d.timestamp.split('T')[0] // "2026-05-29"
    const existing = dayMap.get(dateKey)
    if (!existing) {
      dayMap.set(dateKey, { open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume })
    } else {
      // Merge: keep first open, update high/low extremes, update close (last wins), sum volume
      existing.high   = Math.max(existing.high, d.high)
      existing.low    = Math.min(existing.low,  d.low)
      existing.close  = d.close
      existing.volume = existing.volume + d.volume
    }
  }

  // Convert to sorted array (ascending by date)
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bar]) => ({ time: date, ...bar }))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const period = searchParams.get('period') || '6mo'

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const chartData = await marketDataService.getChartData(symbol, period)

    if (!chartData) {
      return NextResponse.json({ success: false, error: 'Failed to fetch chart data' }, { status: 404 })
    }

    // Merge any intraday candles sharing the same calendar date into single daily bars.
    // This prevents the lightweight-charts "data must be asc ordered / duplicate time" assertion error.
    const mergedBars = mergeToDailyBars(chartData.data)

    const candlestick = mergedBars.map(d => ({
      time: d.time,
      open:   +d.open.toFixed(2),
      high:   +d.high.toFixed(2),
      low:    +d.low.toFixed(2),
      close:  +d.close.toFixed(2),
    }))

    const volume = mergedBars.map(d => ({
      time:  d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }))

    return NextResponse.json({
      success: true,
      data: { candlestick, volume },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
