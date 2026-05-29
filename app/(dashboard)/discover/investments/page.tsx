'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Star, TrendingUp, TrendingDown, Info, Shield, BarChart3, Clock, Award, DollarSign, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const MUTUAL_FUNDS = [
  {
    id: 'SBIBCF', name: 'SBI Bluechip Fund - Direct Growth', category: 'Large Cap',
    nav: '₹83.45', returns1Y: '+18.4%', returns3Y: '+14.2%', returns5Y: '+12.8%',
    rating: 5, risk: 'Moderately High', aum: '₹42,183 Cr', minSIP: '₹500', minLump: '₹5,000',
    manager: 'Sohini Andani', expense: '0.87%', trending: true,
    description: 'Invests primarily in large cap companies that have a consistent track record of performance and are known blue chip companies in India.'
  },
  {
    id: 'HDFCEQ', name: 'HDFC Equity Fund - Direct Growth', category: 'Large & Mid Cap',
    nav: '₹1,432.20', returns1Y: '+22.1%', returns3Y: '+18.7%', returns5Y: '+15.3%',
    rating: 5, risk: 'High', aum: '₹38,120 Cr', minSIP: '₹500', minLump: '₹5,000',
    manager: 'Roshi Jain', expense: '0.91%', trending: true,
    description: 'A flexicap fund investing across market capitalizations in high-growth Indian companies.'
  },
  {
    id: 'AXISMID', name: 'Axis Midcap Fund - Direct Growth', category: 'Mid Cap',
    nav: '₹96.78', returns1Y: '+31.2%', returns3Y: '+22.5%', returns5Y: '+19.1%',
    rating: 4, risk: 'High', aum: '₹21,904 Cr', minSIP: '₹500', minLump: '₹5,000',
    manager: 'Shreyash Devalkar', expense: '0.52%', trending: false,
    description: 'Focuses on mid-sized Indian companies with strong growth potential and sustainable competitive advantages.'
  },
]

const ETFS = [
  {
    id: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', category: 'Index ETF',
    price: '₹248.50', returns1Y: '+19.2%', aum: '₹22,104 Cr',
    expense: '0.04%', tracking: 'NIFTY 50', exchange: 'NSE/BSE',
    description: 'Passively tracks the Nifty 50 index and is one of the most liquid ETFs in India.'
  },
  {
    id: 'BANKBEES', name: 'Nippon India ETF Bank BeES', category: 'Sectoral ETF',
    price: '₹492.30', returns1Y: '+14.8%', aum: '₹7,345 Cr',
    expense: '0.07%', tracking: 'NIFTY BANK', exchange: 'NSE/BSE',
    description: 'Tracks the Nifty Bank index, giving focused exposure to India\'s top banking sector stocks.'
  },
  {
    id: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', category: 'Commodity ETF',
    price: '₹58.72', returns1Y: '+12.4%', aum: '₹8,912 Cr',
    expense: '0.59%', tracking: 'Gold Price', exchange: 'NSE/BSE',
    description: 'Tracks domestic gold prices, providing a cost-efficient digital gold investment alternative.'
  },
]

const BONDS = [
  {
    id: 'GB2030', name: 'Government of India Bond 2030', category: 'Government Bond',
    coupon: '7.26%', maturity: '2030', ytm: '7.18%', rating: 'AAA (Sovereign)',
    minInv: '₹10,000', face: '₹1,000', tax: 'Taxable',
    description: 'Sovereign bond backed by the Government of India with guaranteed returns. Safest fixed income instrument.'
  },
  {
    id: 'SBI2028', name: 'SBI Senior Bond Series III', category: 'PSU Bond',
    coupon: '7.95%', maturity: '2028', ytm: '7.88%', rating: 'AAA',
    minInv: '₹10,000', face: '₹1,000', tax: 'Taxable',
    description: 'State Bank of India senior secured bond offering attractive yields with highest credit quality.'
  },
]

export default function InvestmentsDetailPage() {
  const router = useRouter()
  const [arnCode, setArnCode] = useState('')
  const [selectedFund, setSelectedFund] = useState<typeof MUTUAL_FUNDS[0] | null>(null)
  const [isSipOpen, setIsSipOpen] = useState(false)
  const [sipAmount, setSipAmount] = useState('5000')
  const [sipDate, setSipDate] = useState('5')

  const [isBrokerOpen, setIsBrokerOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string; type: string } | null>(null)
  const [redirectingBroker, setRedirectingBroker] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedArn = localStorage.getItem('finpulse_amfi_arn')
      if (savedArn) {
        setArnCode(savedArn)
      }
    }
  }, [])

  const handleOpenSip = (fund: typeof MUTUAL_FUNDS[0]) => {
    setSelectedFund(fund)
    setIsSipOpen(true)
  }

  const handlePlaceSip = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(sipAmount)
    if (isNaN(amount) || amount < 500) {
      toast.error("Minimum SIP amount is ₹500.")
      return
    }

    toast.success(`SIP Registered successfully!`, {
      description: `Invested ₹${amount.toLocaleString('en-IN')} monthly on the ${sipDate}th in ${selectedFund?.name}. ${
        arnCode 
          ? `Linked to AMFI ARN: ${arnCode} (Commission tracked)` 
          : '⚠️ No ARN registered. Pro-bono transaction.'
      }`,
      icon: '💼',
    })
    setIsSipOpen(false)
  }

  const handleOpenBroker = (asset: { id: string; name: string; type: string }) => {
    setSelectedAsset(asset)
    setIsBrokerOpen(true)
  }

  const handleRedirectBroker = (brokerName: string) => {
    setRedirectingBroker(brokerName)
    
    // Simulate high-fidelity partner redirection
    setTimeout(() => {
      setRedirectingBroker(null)
      setIsBrokerOpen(false)
      toast.success(`Redirected to ${brokerName}!`, {
        description: `Your order for "${selectedAsset?.name}" is open in ${brokerName} portal. ${
          brokerName === 'Zerodha' 
            ? 'Commission track: ₹10 referral fee active.' 
            : brokerName === 'Upstox' 
              ? 'Referral active: ₹500 account reward tracked.' 
              : 'Groww direct referral active.'
        }`,
        icon: '🔗'
      })
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 text-white">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 glass-card border-white/10 text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gradient-heading">Investment Universe</h1>
          <p className="text-sm text-muted-foreground">Explore Mutual Funds, ETFs & Bonds</p>
        </div>
      </div>

      {/* AMFI ARN Status Alert Banner */}
      <Card className={`glass-card border ${arnCode ? 'border-green-500/20 bg-green-500/5' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
        <CardContent className="p-4 flex items-start gap-3">
          <Award className={`h-5 w-5 ${arnCode ? 'text-green-400' : 'text-yellow-400'} shrink-0 mt-0.5`} />
          <div>
            <span className="font-bold text-sm block mb-1">
              {arnCode ? '✅ AMFI ARN Distributor Active' : '⚠️ AMFI Distributor ARN Missing'}
            </span>
            <p className="text-xs text-white/70 leading-relaxed">
              {arnCode 
                ? `SIP allocations are linked to registered AMFI ARN: ${arnCode}. You are currently earning trail commissions (0.5%–1.0% per year) on all client investments.`
                : 'You have not registered an AMFI ARN number in Settings! Recommending mutual funds without an ARN is restricted. Register your ARN under Settings -> ⚡ SaaS Plans & Partnerships to link passive compounding trail commissions on every client SIP.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* MUTUAL FUNDS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" /> Top Mutual Funds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MUTUAL_FUNDS.map(fund => (
            <Card key={fund.id} className="glass-card border-white/10 hover:border-purple-500/40 transition-all hover-float flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-semibold leading-tight">{fund.name}</CardTitle>
                      <CardDescription className="mt-1">{fund.category}</CardDescription>
                    </div>
                    {fund.trending && <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs shrink-0">Trending</Badge>}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < fund.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">1Y Returns</p>
                      <p className="font-bold text-green-400 text-sm">{fund.returns1Y}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">3Y Returns</p>
                      <p className="font-bold text-green-400 text-sm">{fund.returns3Y}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">5Y Returns</p>
                      <p className="font-bold text-green-400 text-sm">{fund.returns5Y}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">NAV</span><span className="font-medium">{fund.nav}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">AUM</span><span className="font-medium">{fund.aum}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Min SIP</span><span className="font-medium">{fund.minSIP}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Expense</span><span className="font-medium">{fund.expense}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${fund.risk === 'High' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                      {fund.risk}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">Fund Manager: {fund.manager}</span>
                  </div>
                  <p className="text-xxs text-white/50 leading-relaxed line-clamp-2">{fund.description}</p>
                </CardContent>
              </div>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleOpenSip(fund)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 font-semibold border-0 shadow-lg shadow-purple-600/20"
                >
                  Start SIP
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ETFS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" /> Exchange Traded Funds (ETFs)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ETFS.map(etf => (
            <Card key={etf.id} className="glass-card border-white/10 hover:border-blue-500/40 transition-all hover-float flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{etf.name}</CardTitle>
                  <CardDescription>{etf.category} · Tracks: {etf.tracking}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass-card p-2 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-bold text-sm">{etf.price}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">1Y Return</p>
                      <p className="font-bold text-green-400 text-sm">{etf.returns1Y}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">AUM</span><span className="font-medium">{etf.aum}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Expense</span><span className="font-medium">{etf.expense}</span></div>
                    <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Exchange</span><span className="font-medium">{etf.exchange}</span></div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{etf.description}</p>
                </CardContent>
              </div>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleOpenBroker({ id: etf.id, name: etf.name, type: 'ETF' })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold border-0 shadow-lg shadow-blue-600/20"
                >
                  Buy ETF via Partner Broker
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* BONDS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" /> Fixed Income Bonds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BONDS.map(bond => (
            <Card key={bond.id} className="glass-card border-white/10 hover:border-green-500/40 transition-all hover-float flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">{bond.name}</CardTitle>
                      <CardDescription>{bond.category}</CardDescription>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">{bond.rating}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">Coupon</p>
                      <p className="font-bold text-green-400 text-sm">{bond.coupon}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">YTM</p>
                      <p className="font-bold text-blue-400 text-sm">{bond.ytm}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">Maturity</p>
                      <p className="font-bold text-sm">{bond.maturity}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Min. Investment</span><span className="font-medium">{bond.minInv}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Face Value</span><span className="font-medium">{bond.face}</span></div>
                    <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Tax Treatment</span><span className="font-medium">{bond.tax}</span></div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{bond.description}</p>
                </CardContent>
              </div>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleOpenBroker({ id: bond.id, name: bond.name, type: 'Bond' })}
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-xs h-9 font-semibold border-0 shadow-lg shadow-green-600/20"
                >
                  Invest in Bond via Partner Broker
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 1. START SIP MODAL (Mutual Fund ARN tracking) */}
      <Dialog open={isSipOpen} onOpenChange={setIsSipOpen}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-md p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" /> Start SIP — AMFI Registry Link
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs">
              Configure your monthly compounding allocation for **{selectedFund?.name}**.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePlaceSip} className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="sip-amount" className="text-xs font-medium text-white/80">Monthly SIP Amount (₹)</Label>
              <Input
                id="sip-amount"
                type="number"
                min="500"
                required
                value={sipAmount}
                onChange={(e) => setSipAmount(e.target.value)}
                className="glass-card border-white/15 bg-black/20 text-white font-medium text-xs"
                placeholder="5000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sip-date" className="text-xs font-medium text-white/80">SIP Installment Date (Day of Month)</Label>
              <select
                id="sip-date"
                value={sipDate}
                onChange={(e) => setSipDate(e.target.value)}
                className="w-full h-9 rounded-md glass-card border border-white/15 bg-black/20 text-white text-xs px-2.5"
              >
                {[1, 5, 10, 15, 20, 25, 28].map(day => (
                  <option key={day} value={day} className="bg-zinc-900 text-white">{day}th of every month</option>
                ))}
              </select>
            </div>

            {/* ARN Status inside Modal */}
            <div className={`p-3 rounded-lg border text-xxs leading-relaxed ${
              arnCode 
                ? 'border-green-500/20 bg-green-500/5 text-green-300' 
                : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-300'
            }`}>
              {arnCode 
                ? `✅ Commission active: Linked to registered AMFI ARN code "${arnCode}". You will earn trail commission on this SIP.`
                : '⚠️ No registered AMFI ARN code detected. Commission tracking is disabled. Register your AMFI ARN under Settings -> ⚡ SaaS Plans & Partnerships to earn compounding trail commissions.'
              }
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsSipOpen(false)} className="glass-card border-white/10 text-white/80 hover:text-white text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white border-0 text-xs h-9 shadow-lg shadow-purple-600/20">
                Setup SIP Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. BROKER REFERRAL REDIRECTION MODAL (Broker referral tracking) */}
      <Dialog open={isBrokerOpen} onOpenChange={setIsBrokerOpen}>
        <DialogContent className="glass-card glow glow-purple border-white/10 max-w-md p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <ExternalLink className="h-5 w-5 text-blue-400" /> Direct Broker Integration
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs">
              Complete your buy order for **{selectedAsset?.name}** ({selectedAsset?.type}) via our partner broker integrations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 pt-2">
            <p className="text-xxs text-white/60 leading-relaxed">
              Select one of our partner brokers to direct your order. Transactions executed through these links earn platform referral bonuses and cash rewards!
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Zerodha', rate: '₹10 / executed trade', info: 'Direct integration. Earn per-trade cashback.', color: 'hover:border-orange-500/30' },
                { name: 'Upstox', rate: '₹500 flat reward', info: 'Fast 100% digital demat setup.', color: 'hover:border-blue-500/30' },
                { name: 'Groww', rate: '₹150 - ₹300 bonus', info: 'Easiest checkout for direct mutual funds.', color: 'hover:border-green-500/30' }
              ].map(bp => {
                const isRedirecting = redirectingBroker === bp.name
                return (
                  <button
                    key={bp.name}
                    disabled={redirectingBroker !== null}
                    onClick={() => handleRedirectBroker(bp.name)}
                    className={`w-full text-left p-3 rounded-lg glass-card border border-white/5 flex items-center justify-between group transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${bp.color}`}
                  >
                    <div>
                      <span className="font-semibold text-xs text-white group-hover:text-purple-400 transition-colors block">{bp.name}</span>
                      <span className="text-[10px] text-white/40">{bp.info}</span>
                    </div>
                    <div className="text-right flex items-center gap-2 shrink-0">
                      <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px]">{bp.rate}</Badge>
                      {isRedirecting ? (
                        <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ArrowLeft className="h-4 w-4 text-white/20 group-hover:text-purple-400 rotate-180 transition-all shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <DialogFooter className="pt-2">
              <Button 
                onClick={() => setIsBrokerOpen(false)} 
                variant="ghost" 
                className="w-full glass-card border-white/10 text-white/80 hover:text-white text-xs h-9"
              >
                Close Portal
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
