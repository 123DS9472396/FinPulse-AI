"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface InteractionHistoryProps {
  user: any
}

export function InteractionHistory({ user }: InteractionHistoryProps) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchInteractions()
    }
  }, [user?.id])

  const fetchInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_interactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      setInteractions(data || [])
    } catch (error) {
      console.error("Error fetching interactions:", error)
      toast({
        title: "Error",
        description: "Failed to load interaction history.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "view":
        return "secondary"
      case "complete":
        return "default"
      case "bookmark":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>
          Your recent learning activities and interactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity recorded yet. Start exploring to see your history here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => (
                <TableRow key={interaction.id}>
                  <TableCell>
                    <Badge variant={getActionBadgeColor(interaction.interaction_type)}>
                      {interaction.interaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {interaction.content_title || interaction.content_id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {interaction.content_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {interaction.interaction_details && (
                      <div className="text-sm text-muted-foreground">
                        {typeof interaction.interaction_details === 'object' 
                          ? JSON.stringify(interaction.interaction_details)
                          : interaction.interaction_details
                        }
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(interaction.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleTimeString()}
                    </div>
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
