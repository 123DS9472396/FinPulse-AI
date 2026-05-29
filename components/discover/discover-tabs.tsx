"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstrumentList } from "@/components/discover/instrument-list"
import { MutualFundsList } from "@/components/discover/mutual-funds-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense, useEffect } from "react"
import type { CachedMutualFund } from "@/lib/market-data-cache"

function DiscoverTabsContent({ mutualFunds }: { mutualFunds: CachedMutualFund[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("filterType") || "stocks"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("filterType", value)
    router.push(`/discover?${params.toString()}`, { scroll: false })
  }



  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="glass-card w-full mb-6">
        <TabsTrigger value="stocks" className="flex-1">Stocks</TabsTrigger>
        <TabsTrigger value="mutual-funds" className="flex-1">Mutual Funds</TabsTrigger>
        <TabsTrigger value="etfs" className="flex-1">ETFs</TabsTrigger>
        <TabsTrigger value="bonds" className="flex-1">Bonds</TabsTrigger>
      </TabsList>

      <TabsContent value="stocks">
        <InstrumentList />
      </TabsContent>

      <TabsContent value="mutual-funds">
        <MutualFundsList funds={mutualFunds} />
      </TabsContent>

      <TabsContent value="etfs">
        <Card className="glass-card glow glow-purple glass-highlight hover-float">
          <CardHeader>
            <CardTitle className="text-xl text-white">ETFs</CardTitle>
            <CardDescription className="text-white/60">
              Exchange-Traded Funds for diversified investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/60">
              <div className="glass-card p-6 rounded-xl">
                <p className="text-lg mb-3 text-white">Explore all ETFs →</p>
                <p className="text-sm mb-4">Index ETFs, Sectoral ETFs, Gold ETFs and more</p>
                <a href="/discover/investments" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Browse ETFs
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bonds">
        <Card className="glass-card glow glow-purple glass-highlight hover-float">
          <CardHeader>
            <CardTitle className="text-xl text-white">Bonds</CardTitle>
            <CardDescription className="text-white/60">
              Fixed income securities for stable returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/60">
              <div className="glass-card p-6 rounded-xl">
                <p className="text-lg mb-3 text-white">Explore all Bonds →</p>
                <p className="text-sm mb-4">Government bonds, PSU bonds, corporate bonds and more</p>
                <a href="/discover/investments" className="inline-block bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Browse Bonds
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export function DiscoverTabs({ mutualFunds }: { mutualFunds: CachedMutualFund[] }) {
  return (
    <Suspense fallback={<div className="glass-card p-8 text-center text-white/60">Loading investments...</div>}>
      <DiscoverTabsContent mutualFunds={mutualFunds} />
    </Suspense>
  )
}
