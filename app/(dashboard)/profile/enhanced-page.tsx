'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, TrendingUp, Settings, Brain, Target, PieChart, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  risk_tolerance: string
  investment_goal: string
  current_portfolio_value: number
  target_portfolio_value: number
  investment_horizon: string
  ai_preferences: any
}

export default function EnhancedProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile({ ...profileData, email: user.email })
      } else {
        // Create default profile
        const defaultProfile = {
          id: crypto.randomUUID(),
          user_id: user.id,
          email: user.email || '',
          first_name: 'Dipesh',
          last_name: 'Sharma',
          risk_tolerance: 'moderate',
          investment_goal: 'balanced_growth',
          current_portfolio_value: 245680,
          target_portfolio_value: 500000,
          investment_horizon: 'medium_term',
          ai_preferences: {
            notifications: true,
            insights: true,
            recommendations: true
          }
        }
        
        setProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: profile.user_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          risk_tolerance: profile.risk_tolerance,
          investment_goal: profile.investment_goal,
          current_portfolio_value: profile.current_portfolio_value,
          target_portfolio_value: profile.target_portfolio_value,
          investment_horizon: profile.investment_horizon,
          ai_preferences: profile.ai_preferences,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Save error:', error)
      } else {
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: string, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>Unable to load profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const recommendations = [
    {
      type: 'diversification',
      title: 'Optimize Your Portfolio',
      description: 'Consider rebalancing your investments to reduce risk by 15%',
      priority: 'high' as const,
      action: 'View Recommendations'
    },
    {
      type: 'expense',
      title: 'Expense Analysis',
      description: "You've spent 23% more on dining out this month",
      priority: 'medium' as const,
      action: 'Track Expenses'
    },
    {
      type: 'learning',
      title: 'Learning Opportunity',
      description: 'Complete 2 more lessons to unlock advanced trading strategies',
      priority: 'low' as const,
      action: 'Continue Learning'
    }
  ]

  const portfolio = [
    {
      symbol: 'RELIANCE',
      company_name: 'Reliance Industries Ltd',
      shares: 10,
      current_price: 2456,
      sector: 'Energy',
      ai_score: 78
    },
    {
      symbol: 'TCS',
      company_name: 'Tata Consultancy Services',
      shares: 5,
      current_price: 3234,
      sector: 'Technology',
      ai_score: 82
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600">Manage your investment profile and preferences</p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profile.first_name || ''}
                      onChange={(e) => updateProfile('first_name', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name || ''}
                      onChange={(e) => updateProfile('last_name', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>Configure your investment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Risk Tolerance</Label>
                  <Select
                    value={profile.risk_tolerance}
                    onValueChange={(value) => updateProfile('risk_tolerance', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Investment Goal</Label>
                  <Select
                    value={profile.investment_goal}
                    onValueChange={(value) => updateProfile('investment_goal', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wealth_preservation">Wealth Preservation</SelectItem>
                      <SelectItem value="balanced_growth">Balanced Growth</SelectItem>
                      <SelectItem value="aggressive_growth">Aggressive Growth</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Investment Horizon</Label>
                  <Select
                    value={profile.investment_horizon}
                    onValueChange={(value) => updateProfile('investment_horizon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short Term (1-3 years)</SelectItem>
                      <SelectItem value="medium_term">Medium Term (3-7 years)</SelectItem>
                      <SelectItem value="long_term">Long Term (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Set your portfolio targets</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Current Portfolio Value</Label>
                <Input
                  type="number"
                  value={profile.current_portfolio_value}
                  onChange={(e) => updateProfile('current_portfolio_value', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Target Portfolio Value</Label>
                <Input
                  type="number"
                  value={profile.target_portfolio_value}
                  onChange={(e) => updateProfile('target_portfolio_value', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{profile.current_portfolio_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolio.length}</div>
                <p className="text-xs text-muted-foreground">Across 2 sectors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">80</div>
                <p className="text-xs text-muted-foreground">High confidence</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
              <CardDescription>Current portfolio positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{holding.symbol}</div>
                      <div className="text-sm text-gray-600">{holding.company_name}</div>
                      <div className="text-xs text-gray-500">{holding.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{holding.shares} shares</div>
                      <div className="text-sm">₹{holding.current_price}</div>
                      <Badge variant={holding.ai_score > 70 ? 'default' : 'secondary'}>
                        AI: {holding.ai_score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Personalized insights based on your portfolio and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    <Button variant="outline" size="sm">
                      {rec.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>Customize your AI experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Notifications</Label>
                  <p className="text-sm text-gray-600">Receive AI-powered market alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.ai_preferences?.notifications || false}
                  onChange={(e) => updateProfile('ai_preferences', {
                    ...profile.ai_preferences,
                    notifications: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Insights</Label>
                  <p className="text-sm text-gray-600">Get daily AI market insights</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.ai_preferences?.insights || false}
                  onChange={(e) => updateProfile('ai_preferences', {
                    ...profile.ai_preferences,
                    insights: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Portfolio Recommendations</Label>
                  <p className="text-sm text-gray-600">Receive AI portfolio suggestions</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.ai_preferences?.recommendations || false}
                  onChange={(e) => updateProfile('ai_preferences', {
                    ...profile.ai_preferences,
                    recommendations: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
