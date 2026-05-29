import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'

// ── Module-level cache: symbol+period → response ─────────────────────────────
const stockCache = new Map<string, { data: any; expiresAt: number }>()
const priceCache = new Map<string, { data: any; expiresAt: number }>()
const PRICE_TTL  = 30_000   // 30 sec — price refreshes often
const CHART_TTL  = 300_000  // 5 min  — chart data is heavier, cache longer

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '1mo'
  const chartKey = `${symbol}::${period}`
  const priceKey = symbol

  // Check price cache (30s TTL)
  const cachedPrice = priceCache.get(priceKey)
  const freshPrice = cachedPrice && Date.now() < cachedPrice.expiresAt ? cachedPrice.data : null

  // Check chart cache (5min TTL)
  const cachedChart = stockCache.get(chartKey)
  const freshChart = cachedChart && Date.now() < cachedChart.expiresAt ? cachedChart.data : null

  // If both are fresh, return immediately
  if (freshPrice && freshChart) {
    return NextResponse.json({ success: true, data: { stock: freshPrice, chart: freshChart.chart, news: freshChart.news, period }, cached: true })
  }

  try {
    // Fetch what is stale in parallel
    const [stockData, chartData] = await Promise.all([
      freshPrice ? Promise.resolve(freshPrice) : marketDataService.getStockPrice(symbol),
      freshChart ? Promise.resolve(freshChart.chart) : marketDataService.getChartData(symbol, period),
    ])

    if (!stockData) {
      return NextResponse.json({ success: false, error: 'Stock not found' }, { status: 404 })
    }

    // Fetch news without blocking the main response
    let newsData: any[] = freshChart?.news || []
    if (!freshChart) {
      try {
        const news = await Promise.race([
          marketDataService.getStockNews(symbol),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
        ])
        newsData = news || []
      } catch { /* ignore news failure */ }
    }

    // Update caches independently
    if (!freshPrice) priceCache.set(priceKey, { data: stockData, expiresAt: Date.now() + PRICE_TTL })
    if (!freshChart) stockCache.set(chartKey, { data: { chart: chartData, news: newsData }, expiresAt: Date.now() + CHART_TTL })

    const responseData = { stock: stockData, chart: chartData, news: newsData, period }
    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('Stock detail error:', error)
    // Return stale cached data on error if any is available
    if (cachedPrice || cachedChart) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          stock: cachedPrice?.data || null, 
          chart: cachedChart?.data?.chart || null, 
          news: cachedChart?.data?.news || [], 
          period 
        }, 
        stale: true 
      })
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
  // Bust all period caches + price cache for this symbol
  for (const key of stockCache.keys()) {
    if (key.startsWith(`${symbol}::`)) stockCache.delete(key)
  }
  priceCache.delete(symbol)
  try {
    const stockData = await marketDataService.getStockPrice(symbol)
    if (!stockData) return NextResponse.json({ success: false, error: 'Stock not found' }, { status: 404 })
    await marketDataService.cacheStockData([stockData])
    // Update price cache with fresh data
    priceCache.set(symbol, { data: stockData, expiresAt: Date.now() + PRICE_TTL })
    return NextResponse.json({ success: true, data: stockData, refreshed: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to refresh stock data' }, { status: 500 })
  }
}
