"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Info, TrendingUp, TrendingDown, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CachedMutualFund } from "@/lib/market-data-cache"

interface MutualFundsListProps {
  funds: CachedMutualFund[]
}

import { useSearchParams } from "next/navigation"

export function MutualFundsList({ funds }: MutualFundsListProps) {
  const searchParams = useSearchParams()
  const [selectedFund, setSelectedFund] = useState<CachedMutualFund | null>(null)
  const [watchlist, setWatchlist] = useState<string[]>([])

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const getRatingStars = (rating: string | null) => {
    if (!rating) return null

    const numRating = Number.parseFloat(rating)
    if (isNaN(numRating)) return null

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < numRating ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
        ))}
      </div>
    )
  }

  const getFundTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-500/20 text-gray-300 border-gray-500/30"

    const lowerType = type.toLowerCase()
    if (lowerType.includes("equity")) {
      if (lowerType.includes("large")) return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      if (lowerType.includes("mid")) return "bg-green-500/20 text-green-300 border-green-500/30"
      if (lowerType.includes("small")) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      return "bg-purple-500/20 text-purple-300 border-purple-500/30"
    }

    if (lowerType.includes("debt") || lowerType.includes("bond")) {
      return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }

    if (lowerType.includes("hybrid")) {
      return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    }

    return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  }

  let displayFunds = [...funds]

  // Apply filters from searchParams
  const searchQ = searchParams.get("search")
  if (searchQ) {
    const term = searchQ.toLowerCase()
    displayFunds = displayFunds.filter((fund) => fund.fund_name?.toLowerCase().includes(term))
  }
  const fundTypeQ = searchParams.get("fund_type")
  if (fundTypeQ && fundTypeQ !== "all") {
    const t = fundTypeQ.toLowerCase()
    displayFunds = displayFunds.filter((fund) => {
      const type = fund.fund_type?.toLowerCase() || ""
      if (t === "equity_large") return type.includes("equity") && type.includes("large")
      if (t === "equity_mid") return type.includes("equity") && type.includes("mid")
      if (t === "equity_small") return type.includes("equity") && type.includes("small")
      if (t === "hybrid") return type.includes("hybrid")
      if (t === "debt") return type.includes("debt") || type.includes("bond")
      if (t === "index") return type.includes("index")
      return true
    })
  }
  const minRatingQ = searchParams.get("min_rating")
  if (minRatingQ && minRatingQ !== "any") {
    const minRating = Number(minRatingQ)
    if (!isNaN(minRating)) {
      displayFunds = displayFunds.filter((fund) => {
        const rating = Number(fund.rating) || 0
        return rating >= minRating
      })
    }
  }
  const minReturnQ = searchParams.get("min_return")
  if (minReturnQ) {
    const minRet = Number(minReturnQ)
    if (!isNaN(minRet)) {
      displayFunds = displayFunds.filter((fund) => (fund.change_percent || 0) >= minRet)
    }
  }

  // Apply sorting
  const sortQ = searchParams.get("mf_sort")
  if (sortQ) {
    const [field, order] = sortQ.split(":")
    displayFunds.sort((a, b) => {
      if (field === "name") {
        const nameA = a.fund_name || ""
        const nameB = b.fund_name || ""
        return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (field === "nav") {
        const navA = a.nav || 0
        const navB = b.nav || 0
        return order === "asc" ? navA - navB : navB - navA
      } else if (field === "return") {
        const retA = a.change_percent || 0
        const retB = b.change_percent || 0
        return order === "asc" ? retA - retB : retB - retA
      } else if (field === "rating") {
        const ratA = Number(a.rating) || 0
        const ratB = Number(b.rating) || 0
        return order === "asc" ? ratA - ratB : ratB - ratA
      }
      return 0
    })
  }

  if (displayFunds.length === 0) {
    return (
      <Card className="glass-card glow glow-purple glass-highlight hover-float">
        <CardHeader>
          <CardTitle className="text-xl text-white">Mutual Funds</CardTitle>
          <CardDescription className="text-white/60">
            Explore top-performing mutual funds for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-white/60">
            <div className="glass-card p-8 rounded-xl">
              <p className="text-lg mb-2">No mutual funds found</p>
              <p className="text-sm">Check back later for updates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card glow glow-purple glass-highlight hover-float">
      <CardHeader>
        <CardTitle className="text-xl text-white">Mutual Funds</CardTitle>
        <CardDescription className="text-white/60">
          Explore top-performing mutual funds for your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayFunds.map((fund) => (
            <div
              key={fund.id}
              className="glass-card p-4 rounded-xl transition-all duration-300 hover:bg-white/20 group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg">{fund.fund_name}</h3>
                    <Badge className={getFundTypeColor(fund.fund_type)}>{fund.fund_type || "Mixed"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-white/80">NAV: ₹{fund.nav?.toFixed(2) || "N/A"}</p>
                    {fund.change_percent !== null && (
                      <span
                        className={`text-sm font-medium flex items-center ${
                          (fund.change_percent || 0) >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {(fund.change_percent || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(fund.change_percent || 0).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">{getRatingStars(fund.rating)}</div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="glass-card hover-glow"
                        onClick={() => setSelectedFund(fund)}
                      >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">{selectedFund?.fund_name}</DialogTitle>
                        <DialogDescription className="text-white/60">
                          {selectedFund?.fund_type || "Mutual Fund"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-white">NAV</h4>
                            <p className="text-sm text-white/60 mt-1">₹{selectedFund?.nav?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Change</h4>
                            <p
                              className={`text-sm mt-1 ${
                                (selectedFund?.change_percent || 0) >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {(selectedFund?.change_percent || 0) >= 0 ? "+" : ""}
                              {selectedFund?.change_percent?.toFixed(2) || 0}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Fund Type</h4>
                          <Badge className={getFundTypeColor(selectedFund?.fund_type)}>
                            {selectedFund?.fund_type || "Mixed"}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Rating</h4>
                          <div className="mt-1">{getRatingStars(selectedFund?.rating)}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="icon"
                    className={`glass-card hover-glow ${
                      watchlist.includes(fund.id)
                        ? "text-red-400 border-red-500/30"
                        : "text-green-400 border-green-500/30"
                    }`}
                    onClick={() => toggleWatchlist(fund.id)}
                  >
                    {watchlist.includes(fund.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {watchlist.includes(fund.id) ? "Remove from watchlist" : "Add to watchlist"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
