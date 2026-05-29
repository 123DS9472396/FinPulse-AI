import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'

// ── Module-level server-side cache (60 seconds) ──────────────────────────────
// The in-memory MarketDataService cache only survives a single request in serverless.
// This module cache persists across requests in the same Node.js process.
let cachedOverview: any = null
let cacheExpiry = 0
const CACHE_TTL = 60_000 // 60 seconds

export async function GET(_req: NextRequest) {
  // Serve from cache if fresh
  if (cachedOverview && Date.now() < cacheExpiry) {
    return NextResponse.json({
      success: true,
      data: cachedOverview,
      cached: true,
      timestamp: new Date().toISOString()
    })
  }

  try {
    const marketSummary = await marketDataService.getMarketSummary()
    cachedOverview = marketSummary
    cacheExpiry    = Date.now() + CACHE_TTL

    return NextResponse.json({
      success: true,
      data: marketSummary,
      cached: false,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Market overview error:', error)
    // Return cached stale data if available during an error
    if (cachedOverview) {
      return NextResponse.json({ success: true, data: cachedOverview, stale: true, timestamp: new Date().toISOString() })
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch market overview' }, { status: 500 })
  }
}

export async function POST(_req: NextRequest) {
  // Force refresh — bust cache
  cachedOverview = null
  cacheExpiry    = 0
  try {
    const marketSummary = await marketDataService.getMarketSummary()
    cachedOverview = marketSummary
    cacheExpiry    = Date.now() + CACHE_TTL
    return NextResponse.json({ success: true, data: marketSummary, refreshed: true, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to refresh market data' }, { status: 500 })
  }
}
