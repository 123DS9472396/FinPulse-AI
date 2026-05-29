"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface WatchlistTableProps {
  user: any
}

export function WatchlistTable({ user }: WatchlistTableProps) {
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchWatchlist()
    }
  }, [user?.id])

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from("user_watchlist")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setWatchlist(data || [])
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to load watchlist.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (instrumentId: string) => {
    try {
      const { error } = await supabase
        .from("user_watchlist")
        .delete()
        .eq("user_id", user?.id)
        .eq("instrument_id", instrumentId)

      if (error) throw error

      setWatchlist(prev => prev.filter(item => item.instrument_id !== instrumentId))
      
      toast({
        title: "Removed",
        description: "Instrument removed from watchlist.",
      })
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove from watchlist.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Watchlist</CardTitle>
        <CardDescription>
          Track your favorite stocks and investments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Your watchlist is empty. Add some instruments to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.instrument_symbol}
                  </TableCell>
                  <TableCell>{item.instrument_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.instrument_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(item.instrument_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
