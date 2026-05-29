"use client"

import type React from "react"
import { Header } from "@/components/layout/header"
import { PortfolioCoach } from "@/components/ai/portfolio-coach"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"

// ── Supabase localStorage key (project ref from NEXT_PUBLIC_SUPABASE_URL) ──────
const SB_TOKEN_KEY = "sb-jieqnsvaecmqbvzlkbos-auth-token"

// ── Check session synchronously from localStorage (zero network call) ──────────
function hasLocalSession(): boolean {
  try {
    const raw = localStorage.getItem(SB_TOKEN_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    // Check token is not expired
    const expiresAt = parsed?.expires_at ?? 0
    if (expiresAt && Date.now() / 1000 > expiresAt) return false
    return !!parsed?.access_token
  } catch {
    return false
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── Always null on first render (SSR + client both agree) ────────────────
  // If we initialize from localStorage in useState(), server gets null but
  // client gets true → hydration mismatch. useEffect only runs on client.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()
  const verified = useRef(false)

  useEffect(() => {
    if (verified.current) return
    verified.current = true

    // ── Step 1: Check localStorage synchronously (zero network) ─────────
    if (hasLocalSession()) {
      // User has a valid token locally — show dashboard immediately
      setIsAuthenticated(true)

      // ── Step 2: Silently verify in background ───────────────────────
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setIsAuthenticated(false)
          router.push("/login")
        }
      }).catch(() => {
        // Network error — keep showing dashboard optimistically
      })
      return
    }

    // ── No local token: do real network check with 2s timeout ───────────
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setIsAuthenticated(false)
      router.push("/login")
    }, 2000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (timedOut) return
      clearTimeout(timeout)
      if (session) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push("/login")
      }
    }).catch(() => {
      if (timedOut) return
      clearTimeout(timeout)
      setIsAuthenticated(false)
      router.push("/login")
    })

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false)
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // ── null = SSR or initial check pending → show skeleton briefly ──────────
  if (isAuthenticated === null) {
    return <QuickSkeleton />
  }

  // ── false = not authenticated → null (redirect fired) ────────────────────
  if (isAuthenticated === false) {
    return null
  }

  // ── true = authenticated → show full layout immediately ──────────────────
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">{children}</main>
      <PortfolioCoach />
    </div>
  )
}

// ── Minimal skeleton — only shows if there's truly no local session ───────────
// If user IS logged in, this never renders (isAuthenticated = true on first render)
function QuickSkeleton() {
  return (
    <div className="min-h-screen bg-[#060412] text-white">
      {/* Header bar */}
      <div className="border-b border-white/5 bg-black/30 h-14 flex items-center px-6 gap-4">
        <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
        <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Status strip */}
      <div className="border-b border-white/5 bg-black/20 h-8 flex items-center px-6 gap-6">
        {[80, 64, 72, 88].map((w, i) => (
          <div key={i} className="h-2.5 bg-white/8 rounded animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Content placeholders */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 animate-pulse">
          <div className="w-44 h-5 bg-white/10 rounded-lg mb-4" />
          <div className="w-72 h-10 bg-white/10 rounded-lg mb-3" />
          <div className="w-48 h-5 bg-white/6 rounded mb-6" />
          <div className="flex gap-3">
            <div className="w-36 h-11 bg-purple-500/20 rounded-xl" />
            <div className="w-36 h-11 bg-white/8 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-5 animate-pulse">
              <div className="w-9 h-9 bg-white/10 rounded-xl mb-3" />
              <div className="w-20 h-3 bg-white/8 rounded mb-2" />
              <div className="w-24 h-7 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-64 rounded-xl border border-white/8 bg-white/[0.02] animate-pulse" />
            <div className="h-36 rounded-xl border border-white/8 bg-white/[0.02] animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-52 rounded-xl border border-white/8 bg-white/[0.02] animate-pulse" />
            <div className="h-36 rounded-xl border border-white/8 bg-white/[0.02] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
