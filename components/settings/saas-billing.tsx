'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Star, Shield, Award, Sparkles, BookOpen, ExternalLink, Activity, Target } from 'lucide-react'
import { toast } from 'sonner'

interface SaasBillingProps {
  user: any
}

export function SaasBilling({ user }: SaasBillingProps) {
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'premium'>('free')
  const [arnCode, setArnCode] = useState('')
  const [isArnRegistered, setIsArnRegistered] = useState(false)
  const [registeredArn, setRegisteredArn] = useState('')
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem('finpulse_subscription_plan') as any
      if (savedPlan) {
        setActivePlan(savedPlan)
      }
      const savedArn = localStorage.getItem('finpulse_amfi_arn')
      if (savedArn) {
        setArnCode(savedArn)
        setRegisteredArn(savedArn)
        setIsArnRegistered(true)
      }
      const savedCourses = JSON.parse(localStorage.getItem('finpulse_enrolled_courses') || '[]')
      setEnrolledCourses(savedCourses)
    }
  }, [])

  const handleUpgradePlan = (plan: 'free' | 'pro' | 'premium') => {
    setActivePlan(plan)
    localStorage.setItem('finpulse_subscription_plan', plan)
    
    if (plan === 'free') {
      toast.info("Plan downgraded to Free Tier.")
    } else {
      toast.success(`Upgraded to ${plan.toUpperCase()} Tier successfully!`, {
        description: `All ${plan === 'pro' ? 'Pro' : 'Premium'} indicators and AI features are now unlocked.`,
        icon: '🚀'
      })
    }
  }

  const handleRegisterArn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!arnCode.trim()) {
      toast.error("Please enter a valid ARN code.")
      return
    }

    setRegisteredArn(arnCode)
    setIsArnRegistered(true)
    localStorage.setItem('finpulse_amfi_arn', arnCode)
    
    toast.success("AMFI ARN Registered successfully!", {
      description: `Broker commissions are now linked to ARN code: ${arnCode}.`,
      icon: '✅'
    })
  }

  const handleDeregisterArn = () => {
    setIsArnRegistered(false)
    setRegisteredArn('')
    setArnCode('')
    localStorage.removeItem('finpulse_amfi_arn')
    toast.info("AMFI ARN unregistered.")
  }

  const handleEnrollCourse = (courseId: string, courseName: string, price: string) => {
    if (enrolledCourses.includes(courseId)) {
      toast.info(`You are already enrolled in "${courseName}"!`)
      return
    }

    const updatedCourses = [...enrolledCourses, courseId]
    setEnrolledCourses(updatedCourses)
    localStorage.setItem('finpulse_enrolled_courses', JSON.stringify(updatedCourses))
    
    toast.success(`Purchase successful!`, {
      description: `Enrolled in "${courseName}" (${price}). Lifetime access is granted.`,
      icon: '🎓'
    })
  }

  const plans = [
    {
      id: 'free' as const,
      name: 'Free Starter',
      price: '₹0',
      period: 'forever',
      description: 'Explore market indices and run core analysis tools.',
      features: [
        '3 AI stock analyses per day',
        'Holt-Linear Smoothed forecasts',
        'Live Indian Indices (Nifty, Sensex)',
        'Basic candlestick interactive charts',
      ],
      color: 'border-white/10 text-white/80',
      badge: 'Current Limits'
    },
    {
      id: 'pro' as const,
      name: 'Pro Trader',
      price: '₹499',
      period: 'month',
      description: 'Unlock advanced analytics, live news, and comprehensive engines.',
      features: [
        'Unlimited AI stock reports',
        'All 9 technical indicators visible',
        'Ensemble Signal Classifier weights',
        'Direct PDF report exporting',
        'Auto-refreshing Live news hub'
      ],
      color: 'border-purple-500/40 glow-purple bg-purple-500/5',
      badge: 'Most Popular'
    },
    {
      id: 'premium' as const,
      name: 'Premium Quant',
      price: '₹1,499',
      period: 'month',
      description: 'Institutional-grade forecasting parameters and complete alerts.',
      features: [
        'Everything in Pro Tier',
        'Real-time automated price alerts',
        'Advanced Portfolio Optimization',
        'Client-side grid-search hyperparameters',
        'Bayesian standard error margins'
      ],
      color: 'border-yellow-500/40 glow-yellow bg-yellow-500/5',
      badge: 'Ultimate Access'
    }
  ]

  const brokerPartners = [
    { name: 'Zerodha', rate: '₹10 / executed trade', detail: '₹0 account opening fee. Free delivery trades. Instant onboarding API integrations.', link: 'https://zerodha.com' },
    { name: 'Upstox', rate: '₹500 / account activation', detail: '100% paperless demat account setup. Earn flat ₹500 referral commission payouts.', link: 'https://upstox.com' },
    { name: 'Groww', rate: '₹150 - ₹300 / signup conversion', detail: 'Simple direct mutual funds and shares onboarding. Zero maintenance fees.', link: 'https://groww.in' }
  ]

  const academyCourses = [
    { id: 'tech-ai', name: 'Technical Analysis with AI', price: '₹1,999', rating: '4.9/5.0', desc: 'Learn to build automated quantitative indicators and backtest double exponential trends.', badge: 'AI-Recommended' },
    { id: 'sip-wealth', name: 'Building a SIP Portfolio', price: '₹999', rating: '4.8/5.0', desc: 'Master mutual funds selection, assets diversification, and automated SIP allocations.', badge: 'Best Seller' }
  ]

  return (
    <div className="space-y-10 text-white">
      
      {/* 1. SaaS Plans Pricing Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" /> SaaS Subscription Tiers
          </h3>
          <p className="text-sm text-white/60">Choose the perfect plan to scale your financial research and intelligence.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map(p => {
            const isActive = activePlan === p.id
            return (
              <Card key={p.id} className={`glass-card border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${p.color}`}>
                <CardHeader className="relative">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{p.name}</span>
                    <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-purple-600 hover:bg-purple-600" : "text-white/40 border-white/10"}>
                      {isActive ? 'Active Plan' : p.badge}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className="text-sm text-white/60">/{p.period}</span>
                  </div>
                  <CardDescription className="text-white/60 text-xs mt-2 leading-relaxed">
                    {p.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-xs text-white/80 border-t border-white/5 pt-4">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleUpgradePlan(p.id)}
                    variant={isActive ? "secondary" : "default"}
                    disabled={isActive}
                    className={`w-full mt-4 text-xs font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white hover:bg-white/20 cursor-default' 
                        : p.id === 'pro' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg shadow-purple-600/20' 
                          : p.id === 'premium' 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg shadow-yellow-600/20'
                            : 'glass-card border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive ? 'Current Subscription' : p.id === 'free' ? 'Downgrade to Free' : 'Upgrade Plan'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 2. AMFI Mutual Fund Distribution Channel */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" /> AMFI Mutual Fund Distribution Channel
          </h3>
          <p className="text-sm text-white/60">
            Register your active **AMFI ARN Code** to earn 0.5% – 1.0% trail commissions per year on every SIP executed via the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="glass-card border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-white/60">ARN Code Registration</CardTitle>
            </CardHeader>
            <CardContent>
              {isArnRegistered ? (
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Active ARN Registry</p>
                      <p className="text-lg font-bold text-green-400">{registeredArn}</p>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-600">✅ Registered & Active</Badge>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Commissions tracking active! Every direct SBI Bluechip or HDFC Equity transaction placed will automatically register under your distributor credentials.
                  </p>
                  <Button onClick={handleDeregisterArn} variant="outline" size="sm" className="glass-card border-white/10 text-xs hover:bg-red-500/20 hover:text-white">
                    Unregister ARN Code
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegisterArn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="arn-input" className="text-xs font-semibold text-white/80">AMFI ARN Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="arn-input"
                        placeholder="e.g. ARN-123456"
                        value={arnCode}
                        onChange={(e) => setArnCode(e.target.value)}
                        className="glass-card border-white/15 bg-black/20 text-white text-xs max-w-sm"
                      />
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white border-0 text-xs shadow-lg shadow-purple-600/20">
                        Link Distributor ARN
                      </Button>
                    </div>
                  </div>
                  <p className="text-xxs text-white/40 leading-normal">
                    Don't have an ARN? Register at <a href="https://amfiindia.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">amfiindia.com</a>. Onboarding takes approximately 2 weeks.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 glow-purple">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-purple-300">Commission Projection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed">
              <p>
                By recommending mutual fund portfolio models to your users, you accumulate annual compounding trail income completely passively:
              </p>
              <div className="bg-black/25 p-3 rounded-lg border border-white/5 space-y-1 pt-2 font-mono text-white/90">
                <p>100 active users</p>
                <p>× ₹5,000 avg SIP / month</p>
                <p>× 12 months = ₹60,00,000 AUM</p>
                <p>× 0.50% trail commission</p>
                <p className="text-green-400 font-bold border-t border-white/10 mt-1 pt-1">₹30,000 / year passive income</p>
              </div>
              <p className="text-[10px] text-white/40 leading-snug">
                Projections are calculated based on conservative industry base averages. Commission rises proportionally as users compound assets over years.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Broker Referral Affiliates */}
      <div className="border-t border-white/5 pt-8 space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" /> Broker Referral Affiliates
          </h3>
          <p className="text-sm text-white/60">Onboard users to top stock brokers via referral links and generate recurring affiliate revenue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brokerPartners.map(bp => (
            <Card key={bp.name} className="glass-card border-white/10 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/20 hover:scale-[1.005]">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-semibold">{bp.name} Partner</CardTitle>
                  <Badge variant="outline" className="text-green-400 border-green-500/20 text-xxs font-bold uppercase">{bp.rate}</Badge>
                </div>
                <CardDescription className="text-xxs text-white/50 leading-relaxed mt-2">{bp.detail}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button 
                  asChild
                  variant="outline" 
                  size="sm"
                  className="w-full text-xxs glass-card border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <a href={bp.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 font-medium">
                    Test Partner Link <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. AI-Powered Course Academy Store */}
      <div className="border-t border-white/5 pt-8 space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" /> AI Financial Academy
          </h3>
          <p className="text-sm text-white/60">Premium structured finance courses dynamically recommended to active researchers.</p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed max-w-3xl">
          <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-300 block mb-0.5">FinPulse AI Intelligent Recommendation</span>
            <p className="text-white/80">
              Based on your active research of stock indices and double exponential smoothed ML forecasts, the platform highly recommends enrolling in **"Technical Analysis with AI"** to learn how to compile these indicators into automated trading bots!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {academyCourses.map(course => {
            const isEnrolled = enrolledCourses.includes(course.id)
            return (
              <Card key={course.id} className="glass-card border-white/10 flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-semibold">{course.name}</CardTitle>
                    <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xxs">{course.badge}</Badge>
                  </div>
                  <CardDescription className="text-xxs text-white/50 mt-1">Course Price: <span className="text-white font-semibold">{course.price}</span> · Student Rating: <span className="text-yellow-400 font-semibold">{course.rating}</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-white/80 leading-relaxed">{course.desc}</p>
                  
                  <Button 
                    onClick={() => handleEnrollCourse(course.id, course.name, course.price)}
                    variant={isEnrolled ? "outline" : "default"}
                    disabled={isEnrolled}
                    className={`w-full text-xs font-semibold ${
                      isEnrolled 
                        ? 'border-green-500/20 bg-green-500/5 text-green-300 cursor-default hover:bg-green-500/5 hover:text-green-300' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg shadow-purple-600/20'
                    }`}
                  >
                    {isEnrolled ? '✅ Enrolled — View Materials' : `Enroll in Course for ${course.price}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
    </div>
  )
}
