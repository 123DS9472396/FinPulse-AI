"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface NotificationSettingsProps {
  user: any
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
    frequency: "daily",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchNotificationSettings()
    }
  }, [user?.id])

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("notification_preferences")
        .eq("user_id", user?.id)
        .single()

      if (error) throw error

      if (data?.notification_preferences) {
        setSettings({ ...settings, ...data.notification_preferences })
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user?.id,
          notification_preferences: settings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error: any) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional and marketing emails
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings.marketing_emails}
              onCheckedChange={(checked) => updateSetting("marketing_emails", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your activity
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={settings.weekly_digest}
              onCheckedChange={(checked) => updateSetting("weekly_digest", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={settings.frequency} onValueChange={(value) => updateSetting("frequency", value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
