"use client"

import React from "react"
import Link from "next/link"
import {
  TrendingUp, TrendingDown, BarChart3, Brain, Shield,
  Zap, Star, ChevronRight, ArrowRight, IndianRupee,
  BookOpen, Activity, Check, X
} from "lucide-react"

// ─────────────────────────── static data ───────────────────────────
const FEATURES = [
  { icon: <Brain className="h-6 w-6" />,       color: "purple", title: "AI Portfolio Coach",    desc: "Groq Llama 3 powered chat — answers all your investing questions in real-time, for free." },
  { icon: <BarChart3 className="h-6 w-6" />,    color: "blue",   title: "Fundamental Screener",  desc: "40+ metrics per stock — P/E, ROE, margins, debt — with one-click AI explanations. Beats Screener.in." },
  { icon: <Shield className="h-6 w-6" />,       color: "green",  title: "Red Flag Detector",     desc: "AI scans every stock for financial risks and scores them 0–100 before you invest." },
  { icon: <IndianRupee className="h-6 w-6" />,  color: "yellow", title: "LTCG Tax Optimizer",    desc: "Know exactly when to sell to save maximum tax. India-specific STCG vs LTCG calculator." },
  { icon: <Activity className="h-6 w-6" />,     color: "pink",   title: "Paper Trading",         desc: "Practice with virtual ₹1,00,000 at real NSE/BSE prices. Zero risk, full learning." },
  { icon: <BookOpen className="h-6 w-6" />,     color: "orange", title: "Learning Hub",           desc: "Curated financial education with AI-generated explanations for every concept." },
]

const STATS = [
  { value: "40+",     label: "Stock Metrics" },
  { value: "₹0",      label: "Cost Forever"  },
  { value: "6",       label: "AI Models"     },
  { value: "NSE+BSE", label: "Coverage"      },
]

const TICKERS = [
  { symbol: "RELIANCE", price: "₹2,456", change: "+1.2%", up: true  },
  { symbol: "TCS",      price: "₹3,234", change: "+0.8%", up: true  },
  { symbol: "HDFC",     price: "₹1,567", change: "-0.4%", up: false },
  { symbol: "INFY",     price: "₹1,890", change: "+2.1%", up: true  },
  { symbol: "SBIN",     price: "₹765",   change: "-0.9%", up: false },
  { symbol: "NIFTY 50", price: "24,012", change: "+0.6%", up: true  },
  { symbol: "SENSEX",   price: "79,200", change: "+0.5%", up: true  },
  { symbol: "WIPRO",    price: "₹540",   change: "+1.4%", up: true  },
  { symbol: "BAJFINANCE", price: "₹6,780", change: "-0.6%", up: false },
]

const COMPARE_ROWS = [
  { feature: "Stock Fundamentals",  us: true,  screener: "Paid", groww: false },
  { feature: "AI Explanations",     us: true,  screener: false,   groww: false },
  { feature: "Portfolio AI Coach",  us: true,  screener: false,   groww: false },
  { feature: "LTCG Tax Optimizer",  us: true,  screener: false,   groww: false },
  { feature: "Paper Trading",       us: true,  screener: false,   groww: false },
  { feature: "Red Flag Detector",   us: true,  screener: false,   groww: false },
]

// ─────────────────────────── component ─────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060412] text-white overflow-x-hidden">

      {/* ── Animated Background ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2.4s" }} />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(155,135,245,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(155,135,245,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-black/25 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-sm shadow-lg shadow-purple-500/30">
              F
            </div>
            <span className="font-bold text-lg tracking-tight">
              FinPulse <span className="text-purple-400">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-white/50 flex-1">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#compare"  className="hover:text-white transition-colors">Compare</a>
            <Link href="/education" className="hover:text-white transition-colors">Learn</Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <Link href="/login" className="hidden sm:block text-sm text-white/55 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-purple-500/25 whitespace-nowrap"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Live Ticker Tape ─────────────────────────────────────── */}
      <div className="relative z-40 border-b border-white/[0.05] bg-black/30 py-2 overflow-hidden">
        {/* Left + right fade masks */}
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

        <div
          className="flex items-center gap-0"
          style={{
            display: "flex",
            animation: "ticker-scroll 28s linear infinite",
            width: "max-content",
          }}
        >
          {/* Render twice for seamless loop */}
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs px-4 shrink-0">
              <span className="text-white/40 font-medium">{t.symbol}</span>
              <span className="font-bold tabular-nums">{t.price}</span>
              <span className={`font-semibold tabular-nums ${t.up ? "text-green-400" : "text-red-400"}`}>
                {t.up ? "▲" : "▼"} {t.change}
              </span>
              <span className="text-white/10 select-none">│</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pt-20 pb-14 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8 backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 shrink-0" />
          India's Most Advanced Free Fintech Platform · Powered by Groq AI
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-[1.05]">
          <span className="block text-white">Invest Smarter</span>
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mt-1">
            with AI Superpowers
          </span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Get <strong className="text-white/80 font-semibold">screener.in-quality</strong> fundamentals,
          AI portfolio coaching, LTCG tax optimization, and paper trading —
          all <strong className="text-white/80 font-semibold">completely free</strong>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/login"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-base shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
          >
            Start for Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 font-medium text-white/60 hover:text-white transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            View Dashboard
          </Link>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="relative max-w-4xl mx-auto">
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#060412] to-transparent z-10 pointer-events-none rounded-b-2xl" />

          <div className="rounded-2xl border border-white/10 bg-[#0a0518]/90 backdrop-blur-xl shadow-2xl shadow-purple-900/40 p-5 text-left">
            {/* Status Bar */}
            <div className="flex items-center gap-4 mb-4 pb-3.5 border-b border-white/[0.07] flex-wrap">
              {["Yahoo Finance ✓", "Finnhub ✓", "Groq AI ✓", "Alpha Vantage ✓"].map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-white/35">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />
                  {s}
                </span>
              ))}
              <span className="ml-auto text-xs text-white/20 hidden sm:block">FinPulse AI Dashboard</span>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Portfolio Value",   val: "₹1,23,450",   sub: "+18.2% total",       color: "text-green-400"  },
                { label: "NIFTY 50",          val: "24,012",       sub: "+0.6% today",        color: "text-green-400"  },
                { label: "Tax Saved",         val: "₹8,200",       sub: "LTCG optimised",     color: "text-yellow-400" },
                { label: "Watchlisted",       val: "12 stocks",    sub: "AI monitored",       color: "text-purple-400" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <p className="text-[11px] text-white/30 mb-1">{k.label}</p>
                  <p className={`text-base font-bold ${k.color}`}>{k.val}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Fundamentals Strip */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-3.5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold shrink-0">R</div>
                <span className="text-sm font-semibold">RELIANCE — Fundamentals</span>
                <span className="ml-auto text-[10px] text-green-400 bg-green-500/15 border border-green-500/25 rounded-full px-2 py-0.5 shrink-0">✅ No Red Flags</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[
                  ["P/E",     "24.3×",  "text-blue-400"   ],
                  ["ROE",     "16.2%",  "text-green-400"  ],
                  ["D/E",     "38%",    "text-green-400"  ],
                  ["Net Mgn", "9.1%",   "text-green-400"  ],
                  ["P/B",     "2.1×",   "text-white/55"   ],
                  ["Beta",    "0.82",   "text-green-400"  ],
                  ["Div Yld", "0.4%",   "text-yellow-400" ],
                  ["EV/EBIT", "11.2×",  "text-white/55"   ],
                ].map(([label, val, color]) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
                    <p className={`text-xs font-bold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section id="stats" className="relative z-10 border-y border-white/[0.05] bg-white/[0.015] py-10">
        <div className="max-w-3xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-sm text-white/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">Why FinPulse AI</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Everything Groww Doesn't Give You</h2>
          <p className="text-white/40 mt-3 max-w-lg mx-auto text-sm">
            We combine the best of Screener.in, Groww, and Zerodha Varsity — completely free.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                style={{
                  background:
                    f.color === "purple" ? "rgba(168,85,247,0.15)" :
                    f.color === "blue"   ? "rgba(59,130,246,0.15)" :
                    f.color === "green"  ? "rgba(34,197,94,0.15)"  :
                    f.color === "yellow" ? "rgba(234,179,8,0.15)"  :
                    f.color === "pink"   ? "rgba(236,72,153,0.15)" :
                                          "rgba(249,115,22,0.15)",
                  color:
                    f.color === "purple" ? "#c084fc" :
                    f.color === "blue"   ? "#60a5fa" :
                    f.color === "green"  ? "#4ade80" :
                    f.color === "yellow" ? "#facc15" :
                    f.color === "pink"   ? "#f472b6" :
                                          "#fb923c",
                  border: `1px solid ${
                    f.color === "purple" ? "rgba(168,85,247,0.25)" :
                    f.color === "blue"   ? "rgba(59,130,246,0.25)" :
                    f.color === "green"  ? "rgba(34,197,94,0.25)"  :
                    f.color === "yellow" ? "rgba(234,179,8,0.25)"  :
                    f.color === "pink"   ? "rgba(236,72,153,0.25)" :
                                          "rgba(249,115,22,0.25)"
                  }`,
                }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────────── */}
      <section id="compare" className="relative z-10 max-w-3xl mx-auto px-5 pb-20">
        <h2 className="text-3xl font-black text-center mb-10">How We Stack Up</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/10">
            <div className="p-4 text-xs font-semibold text-white/30 uppercase tracking-wide">Feature</div>
            <div className="p-4 text-center">
              <span className="text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FinPulse AI
              </span>
            </div>
            <div className="p-4 text-center text-xs text-white/30 font-medium">Screener.in</div>
            <div className="p-4 text-center text-xs text-white/30 font-medium">Groww</div>
          </div>

          {/* Rows — use React.Fragment with key to avoid the missing-key error */}
          {COMPARE_ROWS.map((row) => (
            <React.Fragment key={row.feature}>
              <div className="grid grid-cols-4 border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                <div className="px-4 py-3 text-xs text-white/55">{row.feature}</div>
                {/* FinPulse — always true */}
                <div className="px-4 py-3 flex justify-center items-center">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                {/* Screener */}
                <div className="px-4 py-3 flex justify-center items-center">
                  {row.screener === "Paid" ? (
                    <span className="text-[10px] text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 bg-yellow-500/10">Paid</span>
                  ) : row.screener ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-white/20" />
                  )}
                </div>
                {/* Groww */}
                <div className="px-4 py-3 flex justify-center items-center">
                  {row.groww ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-white/20" />
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/20 p-10 md:p-14 text-center">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-white/35 ml-2">Loved by investors</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
              Start Your AI-Powered<br />Investing Journey
            </h2>
            <p className="text-white/45 mb-8 text-sm">Free forever. No credit card. No hidden fees.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg shadow-2xl shadow-purple-500/30 transition-all hover:scale-105"
            >
              Create Free Account <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-white/20">
          © 2025 FinPulse AI · Powered by Groq, Finnhub, Yahoo Finance
          · Not SEBI registered · For educational purposes only
        </p>
      </footer>

      {/* ── Ticker animation ─────────────────────────────────────── */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
