import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'

// ── Module-level cache: symbol+period → response ─────────────────────────────
const stockCache = new Map<string, { data: any; expiresAt: number }>()
const PRICE_TTL = 60_000    // 1 min for price
const CHART_TTL = 300_000   // 5 min for chart data

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '1mo'
  const cacheKey = `${symbol}::${period}`

  // Check cache
  const cached = stockCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({ success: true, data: cached.data, cached: true })
  }

  try {
    // Fetch price and chart in parallel (news is optional, don't block on it)
    const [stockData, chartData] = await Promise.all([
      marketDataService.getStockPrice(symbol),
      marketDataService.getChartData(symbol, period),
    ])

    if (!stockData) {
      return NextResponse.json({ success: false, error: 'Stock not found' }, { status: 404 })
    }

    // Fetch news without blocking the main response
    let newsData: any[] = []
    try {
      const news = await Promise.race([
        marketDataService.getStockNews(symbol),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)), // 2s timeout
      ])
      newsData = news || []
    } catch { /* ignore news failure */ }

    const responseData = { stock: stockData, chart: chartData, news: newsData, period }
    stockCache.set(cacheKey, { data: responseData, expiresAt: Date.now() + PRICE_TTL })

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('Stock detail error:', error)
    // Return stale cached data on error
    if (cached) {
      return NextResponse.json({ success: true, data: cached.data, stale: true })
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch stock details' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()
  // Bust all period caches for this symbol
  for (const key of stockCache.keys()) {
    if (key.startsWith(`${symbol}::`)) stockCache.delete(key)
  }
  try {
    const stockData = await marketDataService.getStockPrice(symbol)
    if (!stockData) return NextResponse.json({ success: false, error: 'Stock not found' }, { status: 404 })
    await marketDataService.cacheStockData([stockData])
    return NextResponse.json({ success: true, data: stockData, refreshed: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to refresh stock data' }, { status: 500 })
  }
}
