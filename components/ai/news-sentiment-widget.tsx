"use client"

import { useState, useEffect } from "react"
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NewsItem {
  id: number
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  sentiment: "positive" | "negative" | "neutral"
}

function timeAgo(ts: number): string {
  const secs = Math.floor(Date.now() / 1000 - ts)
  if (secs < 60) return "just now"
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

const SENTIMENT_CONFIG = {
  positive: { label: "POSITIVE", color: "text-green-400",  bg: "bg-green-500/15 border-green-500/30", icon: <TrendingUp  className="h-3 w-3" /> },
  negative: { label: "NEGATIVE", color: "text-red-400",    bg: "bg-red-500/15 border-red-500/30",     icon: <TrendingDown className="h-3 w-3" /> },
  neutral:  { label: "NEUTRAL",  color: "text-white/50",   bg: "bg-white/5 border-white/10",          icon: <Minus        className="h-3 w-3" /> },
}

export function NewsSentimentWidget() {
  const [news, setNews]       = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res  = await fetch("/api/news/sentiment")
      const json = await res.json()
      if (json.success) setNews(json.news)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchNews() }, [])

  const positive = news.filter((n) => n.sentiment === "positive").length
  const negative = news.filter((n) => n.sentiment === "negative").length
  const overall  = positive > negative ? "positive" : negative > positive ? "negative" : "neutral"

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      {/* Top bar */}
      <div className={`h-0.5 w-full ${overall === "positive" ? "bg-gradient-to-r from-green-500 to-emerald-400" : overall === "negative" ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-white/20 to-white/10"}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-blue-400" />
            Market Pulse 📰
          </CardTitle>
          <div className="flex items-center gap-2">
            {!loading && (
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="text-green-400 font-medium">{positive}↑</span>
                <span className="text-white/20">·</span>
                <span className="text-red-400 font-medium">{negative}↓</span>
              </div>
            )}
            <button
              onClick={() => fetchNews(true)}
              disabled={refreshing}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="w-12 h-4 bg-white/10 rounded" />
              <div className="flex-1 h-4 bg-white/5 rounded" />
            </div>
          ))
        ) : (
          news.slice(0, 6).map((item) => {
            const s = SENTIMENT_CONFIG[item.sentiment]
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/85 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {item.headline}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-white/30">{item.source}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-[10px] text-white/30">{timeAgo(item.datetime)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge className={`text-[9px] px-1.5 py-0.5 ${s.bg} ${s.color} border font-semibold flex items-center gap-0.5`}>
                    {s.icon}{s.label}
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </a>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
