import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Only run middleware on dashboard routes — not API, static, or public pages
const PROTECTED_PREFIXES = ["/dashboard", "/discover", "/analytics", "/education", "/resources", "/expenses", "/admin", "/onboarding"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip completely for API routes, static files, and public pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/auth" ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Only check session for protected routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (
    !supabaseUrl || !supabaseKey ||
    supabaseUrl.includes("dummy") || supabaseKey.includes("dummy") ||
    supabaseUrl.includes("your_") || supabaseKey.includes("your_")
  ) {
    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    // Non-blocking: refresh session cookie without awaiting full validation
    supabase.auth.getSession() // fire-and-forget, don't await
    return res
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Only match dashboard routes — skip everything else
    "/(dashboard|discover|analytics|education|resources|expenses|admin|onboarding)(.*)",
  ],
}
