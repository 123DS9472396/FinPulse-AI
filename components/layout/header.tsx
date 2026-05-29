"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { UserNav } from "./user-nav"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser]               = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  // ── NO blocking loading state — render header immediately ──────────────
  // User/profile data loads in background and UserNav updates when ready

  useEffect(() => {
    // Fast path: check if we already have session in localStorage
    let cancelled = false

    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        setUser(user)

        if (user) {
          // Fetch profile in background — don't block header rendering
          supabase
            .from("user_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("user_id", user.id)
            .single()
            .then(({ data }) => {
              if (!cancelled && data) setUserProfile(data)
            })
            .catch(() => {}) // silently ignore profile errors
        }
      } catch (error) {
        // Header still shows, just without user data
        console.error("Header: error fetching user:", error)
      }
    }

    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("user_profiles")
          .select("first_name, last_name, avatar_url")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => { if (!cancelled && data) setUserProfile(data) })
          .catch(() => {})
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ── Always render the full header immediately (no skeleton) ────────────
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Mobile Nav */}
        <div className="flex items-center gap-6 mr-8 border-r border-white/10 pr-8">
          <MobileNav />
          <a href="/dashboard" className="flex items-center gap-3 transition-all duration-300 hover:opacity-90">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Image
                src="/images/finpulse-logo.png"
                alt="FinPulse AI Logo"
                width={36}
                height={36}
                className="object-contain filter brightness-0 invert"
                priority
              />
            </div>
            <span className="font-bold text-xl font-heading hidden sm:block">FinPulse <span className="text-purple-400">AI</span></span>
          </a>
        </div>

        {/* Main Navigation */}
        <MainNav />

        {/* User Avatar — shows placeholder until user loads */}
        <UserNav user={user} userProfile={userProfile} />
      </div>
    </header>
  )
}
