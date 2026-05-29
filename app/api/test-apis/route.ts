import { NextResponse } from "next/server"

// Tests all configured APIs and returns status for the dashboard status bar
export async function GET() {
  const start = Date.now()

  const [yahoo, finnhub, groq, alphaVantage] = await Promise.allSettled([
    testYahooFinance(),
    testFinnhub(),
    testGroq(),
    testAlphaVantage(),
  ])

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    apis: {
      yahooFinance: yahoo.status === "fulfilled" ? yahoo.value : { status: "error" },
      finnhub:      finnhub.status === "fulfilled" ? finnhub.value : { status: "error" },
      groq:         groq.status === "fulfilled" ? groq.value : { status: "error" },
      alphaVantage: alphaVantage.status === "fulfilled" ? alphaVantage.value : { status: "error" },
    }
  })
}

async function testYahooFinance() {
  try {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS", {
      signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" }
    })
    const json = await res.json()
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice
    return { status: price ? "working" : "error", price, symbol: "RELIANCE.NS" }
  } catch { return { status: "error" } }
}

async function testFinnhub() {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return { status: "no_key" }
  try {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${key}`, { signal: ctrl.signal })
    const json = await res.json()
    return { status: json?.c ? "working" : "error", price: json?.c, symbol: "AAPL" }
  } catch { return { status: "error" } }
}

async function testGroq() {
  const key = process.env.GROQ_API_KEY
  if (!key) return { status: "no_key" }
  try {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${key}` },
      signal: ctrl.signal
    })
    const json = await res.json()
    return { status: json?.data ? "working" : "error", models: json?.data?.length }
  } catch { return { status: "error" } }
}

async function testAlphaVantage() {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) return { status: "no_key" }
  try {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${key}`,
      { signal: ctrl.signal }
    )
    const json = await res.json()
    return { status: json?.["Global Quote"]?.["05. price"] ? "working" : "limited", data: json }
  } catch { return { status: "error" } }
}
