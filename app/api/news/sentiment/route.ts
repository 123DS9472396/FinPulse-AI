import { NextResponse } from "next/server"

// Returns Finnhub general market news with keyword-based sentiment
export async function GET() {
  const key = process.env.FINNHUB_API_KEY

  if (!key) {
    // Return sample news if no key
    return NextResponse.json({ success: true, news: SAMPLE_NEWS })
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&minId=0&token=${key}`,
      { next: { revalidate: 1800 } } // cache 30 min
    )
    if (!res.ok) throw new Error("Finnhub error")
    const data = await res.json()

    const news = data.slice(0, 10).map((item: any) => ({
      id:        item.id,
      headline:  item.headline,
      summary:   item.summary?.slice(0, 200) || "",
      url:       item.url,
      source:    item.source,
      image:     item.image || null,
      datetime:  item.datetime,
      sentiment: classifySentiment(item.headline + " " + (item.summary || "")),
    }))

    return NextResponse.json({ success: true, news })
  } catch {
    return NextResponse.json({ success: true, news: SAMPLE_NEWS })
  }
}

function classifySentiment(text: string): "positive" | "negative" | "neutral" {
  const t = text.toLowerCase()
  const positiveWords = ["surge", "gain", "rise", "rally", "profit", "growth", "beat", "record", "high", "bull", "strong", "up", "increase", "boost", "win", "approve", "positive", "green", "advance", "soar"]
  const negativeWords = ["fall", "drop", "crash", "loss", "decline", "down", "bear", "weak", "miss", "recession", "inflation", "concern", "risk", "fear", "plunge", "cut", "layoff", "sell", "negative", "red", "slump", "warning"]

  let positiveScore = 0
  let negativeScore = 0

  for (const word of positiveWords) {
    if (t.includes(word)) positiveScore++
  }
  for (const word of negativeWords) {
    if (t.includes(word)) negativeScore++
  }

  if (positiveScore > negativeScore) return "positive"
  if (negativeScore > positiveScore) return "negative"
  return "neutral"
}

const SAMPLE_NEWS = [
  { id: 1, headline: "NIFTY 50 Hits Record High as IT Sector Leads Rally", summary: "Indian markets scaled new highs with Nifty 50 crossing 24,000 mark.", source: "Economic Times", datetime: Date.now() / 1000, sentiment: "positive", url: "https://economictimes.com" },
  { id: 2, headline: "RBI Keeps Repo Rate Steady at 6.5%, Focus on Inflation", summary: "The Reserve Bank of India maintained its key policy rate unchanged.", source: "Business Standard", datetime: (Date.now() - 3600000) / 1000, sentiment: "neutral", url: "https://business-standard.com" },
  { id: 3, headline: "Reliance Industries Reports 18% Growth in Q4 Net Profit", summary: "Reliance Industries posted strong quarterly results beating analyst estimates.", source: "LiveMint", datetime: (Date.now() - 7200000) / 1000, sentiment: "positive", url: "https://livemint.com" },
  { id: 4, headline: "FII Outflows Continue as Global Uncertainty Weighs on Markets", summary: "Foreign institutional investors pulled out funds from emerging markets.", source: "Moneycontrol", datetime: (Date.now() - 10800000) / 1000, sentiment: "negative", url: "https://moneycontrol.com" },
  { id: 5, headline: "India GDP Growth Forecast Raised to 7.4% for FY25", summary: "IMF raises India growth forecast citing strong domestic consumption.", source: "Reuters", datetime: (Date.now() - 14400000) / 1000, sentiment: "positive", url: "https://reuters.com" },
  { id: 6, headline: "TCS, Infosys Outlook Cautious Amid IT Slowdown in US Market", summary: "Top Indian IT companies flag cautious outlook for FY26 amid US budget cuts.", source: "Bloomberg", datetime: (Date.now() - 18000000) / 1000, sentiment: "negative", url: "https://bloomberg.com" },
]
