"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface AccountSettingsProps {
  user: any
  userProfile: any
}

export function AccountSettings({ user, userProfile }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(user?.email || "")
  const { toast } = useToast()

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      })

      if (error) throw error

      toast({
        title: "Email updated",
        description: "Please check your new email for confirmation.",
      })
    } catch (error: any) {
      console.error("Error updating email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      // First delete user profile
      await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", user?.id)

      // Delete other user data
      await supabase
        .from("user_watchlist")
        .delete()
        .eq("user_id", user?.id)

      await supabase
        .from("user_interactions")
        .delete()
        .eq("user_id", user?.id)

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })

      // Sign out user
      await supabase.auth.signOut()
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
