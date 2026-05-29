import { NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-api"

// Simple price lookup route used by Paper Trading page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const sym = symbol.toUpperCase()
  try {
    const data = await marketDataService.getStockPrice(sym)
    if (!data) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, symbol: data.symbol, price: data.price, change: data.change, changePercent: data.changePercent })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 })
  }
}
