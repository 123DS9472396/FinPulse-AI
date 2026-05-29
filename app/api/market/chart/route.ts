import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'

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

    // Format data for lightweight-charts
    const formattedData = chartData.data.map(d => ({
      time: d.timestamp.split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    const volumeData = chartData.data.map(d => ({
      time: d.timestamp.split('T')[0],
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
    }))

    return NextResponse.json({
      success: true,
      data: { candlestick: formattedData, volume: volumeData },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
