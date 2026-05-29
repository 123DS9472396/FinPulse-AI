"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Star, TrendingUp, TrendingDown, ArrowRight, Search } from "lucide-react"
import type { FinancialInstrument } from "@/types/financial"
import { useSearchParams } from "next/navigation"

interface InstrumentListProps {
  instruments?: FinancialInstrument[]
  userId?: string
  watchlistIds?: string[]
}

const ALL_MOCK_INSTRUMENTS: FinancialInstrument[] = [
  // ── Stocks ─────────────────────────────────────────────────────────────────
  { id: "1",  name: "Reliance Industries Ltd",        symbol: "RELIANCE",   type: "stock",       risk_level: "medium",   min_investment: 2500,  description: "India's largest private sector company in petrochemicals, oil & gas, telecom and retail.", created_at: "", updated_at: "" },
  { id: "2",  name: "Tata Consultancy Services",      symbol: "TCS",        type: "stock",       risk_level: "low",      min_investment: 3500,  description: "Global leader in IT services, consulting and business solutions.", created_at: "", updated_at: "" },
  { id: "3",  name: "HDFC Bank Ltd",                  symbol: "HDFCBANK",   type: "stock",       risk_level: "low",      min_investment: 1500,  description: "One of India's premier private sector banks with pan-India presence.", created_at: "", updated_at: "" },
  { id: "4",  name: "Infosys Ltd",                    symbol: "INFY",       type: "stock",       risk_level: "low",      min_investment: 1600,  description: "Global IT leader providing business consulting and outsourcing services.", created_at: "", updated_at: "" },
  { id: "5",  name: "ICICI Bank Ltd",                 symbol: "ICICIBANK",  type: "stock",       risk_level: "medium",   min_investment: 1300,  description: "India's leading private sector bank offering a wide range of financial products.", created_at: "", updated_at: "" },
  { id: "6",  name: "Hindustan Unilever Ltd",         symbol: "HINDUNILVR", type: "stock",       risk_level: "low",      min_investment: 2200,  description: "India's largest FMCG company with iconic brands across home care, beauty and food.", created_at: "", updated_at: "" },
  { id: "7",  name: "State Bank of India",            symbol: "SBIN",       type: "stock",       risk_level: "medium",   min_investment: 970,   description: "India's largest public sector banking and financial services company.", created_at: "", updated_at: "" },
  { id: "8",  name: "Bharti Airtel Ltd",              symbol: "BHARTIARTL", type: "stock",       risk_level: "medium",   min_investment: 1700,  description: "India's largest telecom company operating in 18 countries across South Asia and Africa.", created_at: "", updated_at: "" },
  { id: "9",  name: "Wipro Ltd",                      symbol: "WIPRO",      type: "stock",       risk_level: "low",      min_investment: 550,   description: "Global information technology, consulting and business process services company.", created_at: "", updated_at: "" },
  { id: "10", name: "Asian Paints Ltd",               symbol: "ASIANPAINT", type: "stock",       risk_level: "low",      min_investment: 2900,  description: "India's largest paint company and Asia's third largest paint company.", created_at: "", updated_at: "" },
  { id: "11", name: "Maruti Suzuki India Ltd",        symbol: "MARUTI",     type: "stock",       risk_level: "medium",   min_investment: 12500, description: "India's largest passenger car manufacturer with over 40% market share.", created_at: "", updated_at: "" },
  { id: "12", name: "Sun Pharmaceutical Industries", symbol: "SUNPHARMA",  type: "stock",       risk_level: "medium",   min_investment: 1900,  description: "India's largest and world's 4th largest specialty generic pharmaceutical company.", created_at: "", updated_at: "" },
  // Low-risk high-value stocks (for Min ₹5000+ filtering)
  { id: "19", name: "Nestle India Ltd",               symbol: "NESTLEIND",  type: "stock",       risk_level: "low",      min_investment: 22000, description: "India's largest food & beverage company with iconic brands like Maggi, KitKat and Munch.", created_at: "", updated_at: "" },
  { id: "20", name: "Abbott India Ltd",               symbol: "ABBOTINDIA", type: "stock",       risk_level: "low",      min_investment: 26000, description: "Leading pharmaceutical company known for diagnostics, nutrition, and branded generics.", created_at: "", updated_at: "" },
  { id: "21", name: "Bajaj Finance Ltd",              symbol: "BAJFINANCE", type: "stock",       risk_level: "low",      min_investment: 7000,  description: "India's largest NBFC offering consumer finance, SME finance, and commercial lending.", created_at: "", updated_at: "" },
  { id: "22", name: "Kotak Mahindra Bank",            symbol: "KOTAKBANK",  type: "stock",       risk_level: "low",      min_investment: 1900,  description: "One of India's premier private sector banks with strong retail and corporate banking.", created_at: "", updated_at: "" },
  { id: "23", name: "Eicher Motors Ltd",              symbol: "EICHERMOT",  type: "stock",       risk_level: "low",      min_investment: 5200,  description: "Maker of Royal Enfield motorcycles and commercial vehicles; strong export growth.", created_at: "", updated_at: "" },
  { id: "24", name: "Page Industries Ltd",            symbol: "PAGEIND",    type: "stock",       risk_level: "low",      min_investment: 43000, description: "Exclusive licensee of Jockey International in India; dominant innerwear & leisurewear brand.", created_at: "", updated_at: "" },
  { id: "25", name: "HCL Technologies Ltd",           symbol: "HCLTECH",    type: "stock",       risk_level: "low",      min_investment: 1650,  description: "Global IT services company with expertise in cloud, AI, and digital transformation.", created_at: "", updated_at: "" },
  { id: "26", name: "Pidilite Industries Ltd",        symbol: "PIDILITIND", type: "stock",       risk_level: "low",      min_investment: 2950,  description: "India's leading adhesives & sealants company, maker of Fevicol and M-Seal brands.", created_at: "", updated_at: "" },
  // Medium-high risk stocks
  { id: "27", name: "Adani Enterprises Ltd",          symbol: "ADANIENT",   type: "stock",       risk_level: "high",     min_investment: 2800,  description: "India's largest integrated infrastructure conglomerate in energy, ports, and airports.", created_at: "", updated_at: "" },
  { id: "28", name: "Tata Motors Ltd",                symbol: "TATAMOTORS", type: "stock",       risk_level: "medium-high", min_investment: 1000, description: "India's largest automobile company, including Jaguar Land Rover international operations.", created_at: "", updated_at: "" },
  // ── ETFs ───────────────────────────────────────────────────────────────────
  { id: "13", name: "Nifty 50 ETF",                  symbol: "NIFTYBEES",  type: "etf",         risk_level: "low",      min_investment: 240,   description: "Exchange traded fund that tracks the Nifty 50 index for diversified exposure.", created_at: "", updated_at: "" },
  { id: "14", name: "Nifty Next 50 ETF",             symbol: "JUNIORBEES", type: "etf",         risk_level: "medium",   min_investment: 610,   description: "ETF tracking Nifty Next 50 index, offering exposure to the next set of large-cap stocks.", created_at: "", updated_at: "" },
  { id: "15", name: "Liquid BeES ETF",               symbol: "LIQUIDBEES", type: "etf",         risk_level: "very_low", min_investment: 1000,  description: "A money market ETF that invests in treasury bills, repo and reverse repo agreements.", created_at: "", updated_at: "" },
  { id: "29", name: "Bank Nifty ETF",                symbol: "BANKBEES",   type: "etf",         risk_level: "medium",   min_investment: 480,   description: "ETF tracking the Bank Nifty index, investing across India's top banking stocks.", created_at: "", updated_at: "" },
  { id: "30", name: "Gold ETF",                      symbol: "GOLDBEES",   type: "etf",         risk_level: "low",      min_investment: 580,   description: "ETF that tracks domestic gold prices, ideal for inflation hedging.", created_at: "", updated_at: "" },
  // ── Mutual Funds ───────────────────────────────────────────────────────────
  { id: "16", name: "SBI Bluechip Fund",             symbol: "SBIBCF",     type: "mutual_fund", risk_level: "medium",   min_investment: 1000,  description: "A large cap equity mutual fund that invests in blue chip companies.", created_at: "", updated_at: "" },
  { id: "31", name: "Mirae Asset Large Cap Fund",    symbol: "MIRAEMLC",   type: "mutual_fund", risk_level: "low",      min_investment: 5000,  description: "Top-rated large cap fund investing in market leaders with consistent returns.", created_at: "", updated_at: "" },
  { id: "32", name: "Axis Midcap Fund",              symbol: "AXISMID",    type: "mutual_fund", risk_level: "medium-high", min_investment: 1000, description: "High-growth mid cap fund focused on emerging market leaders in India.", created_at: "", updated_at: "" },
  // ── Bonds ──────────────────────────────────────────────────────────────────
  { id: "17", name: "Government Bond 2030",          symbol: "GB2030",     type: "bond",        risk_level: "very_low", min_investment: 10000, description: "Government of India bond with 7.5% coupon rate maturing in 2030.", created_at: "", updated_at: "" },
  { id: "18", name: "REC Infrastructure Bond",       symbol: "RECBOND",    type: "bond",        risk_level: "low",      min_investment: 5000,  description: "AAA-rated infrastructure bond by REC Limited offering stable fixed income.", created_at: "", updated_at: "" },
  { id: "33", name: "NHAI Sovereign Gold Bond",      symbol: "SGB2028",    type: "bond",        risk_level: "very_low", min_investment: 6000,  description: "Sovereign Gold Bond issued by RBI, earning 2.5% interest + gold price appreciation.", created_at: "", updated_at: "" },
]

function InstrumentListContent({ instruments = [], userId = "", watchlistIds = [] }: InstrumentListProps) {
  const [localWatchlist, setLocalWatchlist] = useState<string[]>(watchlistIds || [])
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const searchParams = useSearchParams()

  let displayInstruments = instruments.length > 0 ? instruments : ALL_MOCK_INSTRUMENTS

  // — Search —
  const searchQ = (searchParams.get("search") || "").trim().toLowerCase()
  if (searchQ) {
    displayInstruments = displayInstruments.filter(
      (i) => i.name.toLowerCase().includes(searchQ) || i.symbol.toLowerCase().includes(searchQ)
    )
  }

  // — Type filter (case-insensitive, "all" = no filter) —
  const typeQ = (searchParams.get("type") || "").toLowerCase()
  if (typeQ && typeQ !== "all") {
    displayInstruments = displayInstruments.filter((i) => i.type.toLowerCase() === typeQ)
  }

  // — Risk filter (case-insensitive, "any" = no filter) —
  const riskQ = (searchParams.get("risk") || "").toLowerCase()
  if (riskQ && riskQ !== "any") {
    displayInstruments = displayInstruments.filter((i) => (i.risk_level || "").toLowerCase() === riskQ)
  }

  // — Min investment filter —
  const minQ = searchParams.get("min")
  if (minQ) {
    const minVal = Number(minQ)
    if (!isNaN(minVal) && minVal > 0) {
      displayInstruments = displayInstruments.filter((i) => (i.min_investment || 0) >= minVal)
    }
  }

  // — Max investment filter —
  const maxQ = searchParams.get("max")
  if (maxQ) {
    const maxVal = Number(maxQ)
    if (!isNaN(maxVal) && maxVal > 0) {
      displayInstruments = displayInstruments.filter((i) => (i.min_investment || 0) <= maxVal)
    }
  }

  // — Sort —
  const sortQ = searchParams.get("sort") || "name:asc"
  const [sortField, sortOrder] = sortQ.split(":")
  displayInstruments = [...displayInstruments].sort((a, b) => {
    if (sortField === "min_investment") {
      const diff = (a.min_investment || 0) - (b.min_investment || 0)
      return sortOrder === "desc" ? -diff : diff
    }
    // default: name
    const diff = a.name.localeCompare(b.name)
    return sortOrder === "desc" ? -diff : diff
  })

  const handleWatchlistToggle = async (e: React.MouseEvent, instrumentId: string) => {
    e.preventDefault()
    if (!userId) return
    setIsLoading((prev) => ({ ...prev, [instrumentId]: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setLocalWatchlist((prev) =>
        prev.includes(instrumentId) ? prev.filter((id) => id !== instrumentId) : [...prev, instrumentId]
      )
    } finally {
      setIsLoading((prev) => ({ ...prev, [instrumentId]: false }))
    }
  }

  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case "very_low":   return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "low":        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "medium":     return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "medium-high":return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "high":       return "bg-red-500/20 text-red-300 border-red-500/30"
      default:           return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock":       return "Stock"
      case "mutual_fund": return "Mutual Fund"
      case "etf":         return "ETF"
      case "bond":        return "Bond"
      default:            return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock":       return <TrendingUp  className="h-5 w-5 text-purple-400" />
      case "mutual_fund": return <Star        className="h-5 w-5 text-yellow-400" />
      case "etf":         return <TrendingDown className="h-5 w-5 text-blue-400"  />
      case "bond":        return <TrendingUp  className="h-5 w-5 text-green-400"  />
      default:            return <TrendingUp  className="h-5 w-5 text-gray-400"   />
    }
  }

  const getHref = (instrument: FinancialInstrument) =>
    instrument.type === "stock" ? `/discover/stock/${instrument.symbol}` : `/discover/investments`

  // Build an active-filter summary for the "no results" message
  const activeFilters = [
    typeQ && typeQ !== "all" ? `Type: ${typeQ}` : "",
    riskQ && riskQ !== "any" ? `Risk: ${riskQ}` : "",
    minQ && Number(minQ) > 0 ? `Min ₹${Number(minQ).toLocaleString("en-IN")}` : "",
    maxQ && Number(maxQ) > 0 ? `Max ₹${Number(maxQ).toLocaleString("en-IN")}` : "",
    searchQ ? `"${searchQ}"` : "",
  ].filter(Boolean)

  return (
    <Card className="glass-card glow glow-purple glass-highlight hover-float">
      <CardHeader>
        <CardTitle className="text-xl text-white">Investment Products</CardTitle>
        <CardDescription className="text-white/60">
          {displayInstruments.length > 0
            ? `${displayInstruments.length} product${displayInstruments.length !== 1 ? "s" : ""} found`
            : "No products match your criteria"}
          {activeFilters.length > 0 && (
            <span className="ml-2 text-purple-400 text-xs">
              ({activeFilters.join(", ")})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayInstruments.length > 0 ? (
          <div className="space-y-3">
            {displayInstruments.map((instrument) => (
              <Link href={getHref(instrument)} key={instrument.id} className="block group">
                <div className="glass-card p-4 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30 border border-transparent group-hover:scale-[1.01]">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        {getTypeIcon(instrument.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-white truncate">{instrument.name}</h3>
                          <Badge className="bg-white/10 text-white border-white/20 text-xs shrink-0">
                            {getTypeLabel(instrument.type)}
                          </Badge>
                          <Badge className={`${getRiskColor(instrument.risk_level)} text-xs shrink-0`}>
                            {instrument.risk_level?.replace(/_/g, " ") || "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50 font-mono mb-1">{instrument.symbol}</p>
                        {instrument.description && (
                          <p className="text-xs text-white/60 line-clamp-1">{instrument.description}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1">
                          Min: <span className="text-white/70 font-medium">₹{instrument.min_investment?.toLocaleString("en-IN") || "N/A"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${localWatchlist.includes(instrument.id) ? "text-yellow-400 bg-yellow-400/10" : "text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10"}`}
                        onClick={(e) => handleWatchlistToggle(e, instrument.id)}
                        disabled={isLoading[instrument.id]}
                        title={localWatchlist.includes(instrument.id) ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        {localWatchlist.includes(instrument.id) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      {instrument.type === "stock" && (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white/30 group-hover:text-purple-400 group-hover:bg-purple-400/10 transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <div className="glass-card p-8 rounded-xl">
              <Search className="h-12 w-12 mx-auto mb-4 text-white/20" />
              <p className="text-lg mb-2 text-white">No products found</p>
              <p className="text-sm mb-1">Your active filters returned no results.</p>
              {activeFilters.length > 0 && (
                <p className="text-xs text-purple-400 mt-2">
                  Filtering by: {activeFilters.join(" · ")}
                </p>
              )}
              <p className="text-sm mt-3 text-white/40">Try broadening your search or clicking Reset Filters.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InstrumentList(props: InstrumentListProps) {
  return (
    <Suspense fallback={
      <Card className="glass-card glow-purple">
        <CardContent className="p-8 text-center text-white/60 animate-pulse">Loading investment products...</CardContent>
      </Card>
    }>
      <InstrumentListContent {...props} />
    </Suspense>
  )
}
