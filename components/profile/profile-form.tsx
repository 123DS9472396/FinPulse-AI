"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ProfileFormProps {
  user: any
  userProfile: any
  onUpdate?: () => void
}

export function ProfileForm({ user, userProfile, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || "",
    phone: userProfile?.phone || "",
    investment_experience: userProfile?.investment_experience || "",
    risk_tolerance: userProfile?.risk_tolerance || "",
    investment_goals: userProfile?.investment_goals || "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user?.id,
          ...formData,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      onUpdate?.()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and investment preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_experience">Investment Experience</Label>
            <Select
              value={formData.investment_experience}
              onValueChange={(value) =>
                setFormData({ ...formData, investment_experience: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your investment experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
            <Select
              value={formData.risk_tolerance}
              onValueChange={(value) =>
                setFormData({ ...formData, risk_tolerance: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_goals">Investment Goals</Label>
            <Select
              value={formData.investment_goals}
              onValueChange={(value) =>
                setFormData({ ...formData, investment_goals: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary investment goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wealth_creation">Wealth Creation</SelectItem>
                <SelectItem value="retirement">Retirement Planning</SelectItem>
                <SelectItem value="tax_saving">Tax Saving</SelectItem>
                <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
