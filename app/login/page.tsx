"use client"
import { AuthForm } from "@/components/auth/auth-form"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Shield, Brain } from "lucide-react"
import { Suspense } from "react"

const FEATURES = [
  { icon: <Brain className="h-4 w-4" />, text: "AI Portfolio Coach powered by Groq" },
  { icon: <TrendingUp className="h-4 w-4" />, text: "40+ stock fundamentals — free forever" },
  { icon: <Shield className="h-4 w-4" />, text: "LTCG tax optimizer for Indian investors" },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#060412] text-white flex">

      {/* ── Left Panel — Value Prop ──────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-purple-950 via-[#0a0520] to-pink-950 p-12 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(155,135,245,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(155,135,245,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-sm">F</div>
            <span className="font-bold text-xl">FinPulse <span className="text-purple-400">AI</span></span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              India's Smartest<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Free Fintech Platform
              </span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Groq AI + Real NSE/BSE data + Screener-quality fundamentals. Everything Groww doesn't give you.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-white/70">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Mock dashboard preview */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/40">Live Markets</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "NIFTY 50", val: "24,012", color: "text-green-400", change: "+0.6%" },
                { label: "SENSEX",   val: "79,200", color: "text-green-400", change: "+0.5%" },
                { label: "BANK NIFTY", val: "52,840", color: "text-red-400", change: "-0.3%" },
              ].map((i) => (
                <div key={i.label} className="text-center">
                  <p className="text-[10px] text-white/30">{i.label}</p>
                  <p className={`text-sm font-bold ${i.color}`}>{i.val}</p>
                  <p className={`text-[10px] ${i.color}`}>{i.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/20">
          © 2025 FinPulse AI · Free Forever · Not SEBI registered
        </div>
      </div>

      {/* ── Right Panel — Auth Form ──────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Background glows */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl" />

        <Link href="/" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors absolute top-8 left-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-sm">F</div>
          <span className="font-bold text-xl">FinPulse <span className="text-purple-400">AI</span></span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black mb-1">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your FinPulse AI account</p>
          </div>
          <Suspense fallback={<div className="h-64 rounded-xl bg-white/5 animate-pulse" />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
