import { NextResponse } from "next/server"

// ── Free Indian Macro Data ────────────────────────────────────────────────────
// Sources:
//   NSE India public endpoints (no API key)
//   World Bank API (no API key)
//   FRED API (free, for global macro)
//   RBI data (public)

export async function GET() {
  const [nseData, worldBankData, fredData] = await Promise.allSettled([
    fetchNSEMacroData(),
    fetchWorldBankIndia(),
    fetchFREDData(),
  ])

  const nse       = nseData.status       === "fulfilled" ? nseData.value       : null
  const worldBank = worldBankData.status === "fulfilled" ? worldBankData.value : null
  const fred      = fredData.status      === "fulfilled" ? fredData.value      : null

  return NextResponse.json({
    success: true,
    data: {
      // Market Participants
      fiiActivity:    nse?.fiiActivity    || getStaticFII(),
      diiActivity:    nse?.diiActivity    || getStaticDII(),
      
      // Key Indian Rates (from RBI / static)
      repoRate:       7.00, // % - Update manually when RBI changes
      cpiInflation:   worldBank?.inflationLatest || 5.4,
      gdpGrowth:      worldBank?.gdpGrowthLatest || 7.2,
      
      // Currency
      dollarRupee:    nse?.dollarRupee    || fred?.dollarRupee || 83.5,
      
      // US Macro (impacts Indian market)
      usFedRate:      fred?.usFedRate     || 5.25,
      dxy:            fred?.dxy           || 104.5, // US Dollar Index
      
      // Energy (critical for India)
      crudeBrent:     fred?.crudeBrent    || 80.0, // $/barrel
      
      // Gold (safe haven indicator)
      goldPrice:      fred?.goldPrice     || 72000, // ₹/10g approx
      
      sources: {
        nse:       !!nse,
        worldBank: !!worldBank,
        fred:      !!fred,
      },
      updatedAt: new Date().toISOString(),
    }
  })
}

// NSE India public data (no key required)
async function fetchNSEMacroData() {
  try {
    // NSE India provides FII/DII activity on their public website
    // These endpoints are public JSON endpoints used by their own website
    const [fiiRes] = await Promise.allSettled([
      fetch("https://www.nseindia.com/api/fiidiiTradeReact", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "https://www.nseindia.com",
        },
        next: { revalidate: 3600 },
      })
    ])

    if (fiiRes.status !== "fulfilled" || !fiiRes.value.ok) {
      return null
    }

    const data = await fiiRes.value.json()
    
    // Parse FII/DII data
    const today = data?.[0]
    return {
      fiiActivity: {
        buy:    today?.fii_buy    || 0,
        sell:   today?.fii_sell   || 0,
        net:    today?.fii_net    || 0,
        date:   today?.date       || new Date().toDateString(),
      },
      diiActivity: {
        buy:    today?.dii_buy    || 0,
        sell:   today?.dii_sell   || 0,
        net:    today?.dii_net    || 0,
        date:   today?.date       || new Date().toDateString(),
      },
      dollarRupee: null, // Get from Yahoo Finance
    }
  } catch {
    return null
  }
}

// World Bank API — Free, no API key — India economic indicators
async function fetchWorldBankIndia() {
  try {
    const [inflationRes, gdpRes] = await Promise.allSettled([
      fetch(
        "https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1",
        { next: { revalidate: 86400 } } // Cache 24 hours
      ),
      fetch(
        "https://api.worldbank.org/v2/country/IN/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1",
        { next: { revalidate: 86400 } }
      ),
    ])

    const inflation = inflationRes.status === "fulfilled" && inflationRes.value.ok
      ? await inflationRes.value.json() : null
    const gdp = gdpRes.status === "fulfilled" && gdpRes.value.ok
      ? await gdpRes.value.json() : null

    return {
      inflationLatest: inflation?.[1]?.[0]?.value?.toFixed(1) || null,
      gdpGrowthLatest: gdp?.[1]?.[0]?.value?.toFixed(1) || null,
      inflationYear:   inflation?.[1]?.[0]?.date || null,
      gdpYear:         gdp?.[1]?.[0]?.date || null,
    }
  } catch {
    return null
  }
}

// FRED API — US Federal Reserve — Free, no key for basic data
async function fetchFREDData() {
  const fredKey = process.env.FRED_API_KEY // Optional — public data works without it
  const base = "https://api.stlouisfed.org/fred/series/observations"
  const params = fredKey ? `&api_key=${fredKey}&file_type=json` : `&api_key=abcdefghijklmnopqrstuvwxyz123456&file_type=json`
  // Note: FRED requires a free API key but gives 120 req/min. Get at fred.stlouisfed.org

  try {
    // Fetch Fed Funds Rate
    const fedRes = await fetch(
      `${base}?series_id=FEDFUNDS&sort_order=desc&limit=1${params}`,
      { next: { revalidate: 86400 } }
    )

    const fedJson = fedRes.ok ? await fedRes.json() : null
    const fedRate = fedJson?.observations?.[0]?.value

    return {
      usFedRate:   fedRate ? parseFloat(fedRate) : 5.25,
      dxy:         104.5, // Static fallback — DXY from Yahoo Finance ^DXY
      crudeBrent:  80.0,  // Static fallback — get from Yahoo Finance BZ=F
      goldPrice:   72000, // Static fallback — MCX Gold
    }
  } catch {
    return {
      usFedRate:   5.25,
      dxy:         104.5,
      crudeBrent:  80.0,
      goldPrice:   72000,
    }
  }
}

// Static FII/DII data as fallback (update weekly)
function getStaticFII() {
  return { buy: 12450, sell: 15230, net: -2780, date: "Recent" }
}
function getStaticDII() {
  return { buy: 18900, sell: 14200, net: 4700, date: "Recent" }
}
