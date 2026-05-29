'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Calculator, TrendingUp, Home, Car, PiggyBank, Target, DollarSign, Percent, Calendar, BarChart3, CreditCard, Building2, Briefcase, Heart, GraduationCap } from 'lucide-react'

interface CalculatorResult {
  value: number
  breakdown?: Array<{ label: string; value: number | string }>
  chartData?: Array<{ year: number; value: number }>
}

const calculators = [
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Calculate future value of Systematic Investment Plan',
    icon: TrendingUp,
    category: 'investment'
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Calculate Equated Monthly Installments for loans',
    icon: Home,
    category: 'loan'
  },
  {
    id: 'retirement',
    title: 'Retirement Calculator',
    description: 'Plan your retirement corpus and monthly savings',
    icon: PiggyBank,
    category: 'investment'
  },
  {
    id: 'compound',
    title: 'Compound Interest Calculator',
    description: 'Calculate compound interest and investment growth',
    icon: Target,
    category: 'investment'
  },
  {
    id: 'fd',
    title: 'Fixed Deposit Calculator',
    description: 'Calculate FD maturity amount and interest',
    icon: DollarSign,
    category: 'investment'
  },
  {
    id: 'car-loan',
    title: 'Car Loan Calculator',
    description: 'Calculate car loan EMI and total interest',
    icon: Car,
    category: 'loan'
  },
  {
    id: 'home-loan',
    title: 'Home Loan Calculator',
    description: 'Calculate home loan EMI and affordability',
    icon: Building2,
    category: 'loan'
  },
  {
    id: 'education-loan',
    title: 'Education Loan Calculator',
    description: 'Calculate education loan EMI and repayment',
    icon: GraduationCap,
    category: 'loan'
  },
  {
    id: 'personal-loan',
    title: 'Personal Loan Calculator',
    description: 'Calculate personal loan EMI and cost',
    icon: CreditCard,
    category: 'loan'
  },
  {
    id: 'ppf',
    title: 'PPF Calculator',
    description: 'Calculate Public Provident Fund returns',
    icon: Briefcase,
    category: 'investment'
  },
  {
    id: 'nps',
    title: 'NPS Calculator',
    description: 'Calculate National Pension Scheme returns',
    icon: Heart,
    category: 'investment'
  },
  {
    id: 'tax-saver',
    title: 'Tax Saver Calculator',
    description: 'Calculate tax savings through investments',
    icon: Percent,
    category: 'tax'
  },
  {
    id: 'goal',
    title: 'Goal Calculator',
    description: 'Calculate monthly savings for financial goals',
    icon: Target,
    category: 'planning'
  },
  {
    id: 'inflation',
    title: 'Inflation Calculator',
    description: 'Calculate impact of inflation on purchasing power',
    icon: BarChart3,
    category: 'planning'
  },
  {
    id: 'lumpsum',
    title: 'Lumpsum Calculator',
    description: 'Calculate returns on one-time investment',
    icon: Calendar,
    category: 'investment'
  }
]

export default function FinancialCalculators() {
  const [activeCalculator, setActiveCalculator] = useState('sip')
  const [results, setResults] = useState<Record<string, CalculatorResult>>({})

  const calculateSIP = (monthly: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12
    const months = years * 12
    const futureValue = monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate)
    const totalInvestment = monthly * months
    const totalReturns = futureValue - totalInvestment
    
    return {
      value: futureValue,
      breakdown: [
        { label: 'Total Investment', value: `₹${Math.round(totalInvestment).toLocaleString('en-IN')}` },
        { label: 'Total Returns', value: `₹${Math.round(totalReturns).toLocaleString('en-IN')}` },
        { label: 'Maturity Amount', value: `₹${Math.round(futureValue).toLocaleString('en-IN')}` }
      ]
    }
  }

  const calculateEMI = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12
    const months = years * 12
    const emi = (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1)
    const totalAmount = emi * months
    const totalInterest = totalAmount - principal
    
    return {
      value: emi,
      breakdown: [
        { label: 'Monthly EMI', value: `₹${Math.round(emi).toLocaleString('en-IN')}` },
        { label: 'Total Interest', value: `₹${Math.round(totalInterest).toLocaleString('en-IN')}` },
        { label: 'Total Amount', value: `₹${Math.round(totalAmount).toLocaleString('en-IN')}` }
      ]
    }
  }

  const calculateRetirement = (currentAge: number, retirementAge: number, monthlyExpenses: number, inflation: number, returns: number) => {
    const workingYears = retirementAge - currentAge
    const retirementYears = 25 // Assumed post-retirement life
    
    // Future monthly expenses at retirement
    const futureExpenses = monthlyExpenses * (1 + inflation / 100) ** workingYears
    
    // Annual expenses at retirement
    const annualExpenses = futureExpenses * 12
    
    // Required corpus (considering post-retirement returns)
    const requiredCorpus = annualExpenses * retirementYears / (1 + returns / 100)
    
    // Monthly SIP required
    const monthlyRate = returns / 100 / 12
    const months = workingYears * 12
    const monthlySIP = (requiredCorpus * monthlyRate) / (((1 + monthlyRate) ** months - 1) * (1 + monthlyRate))
    
    return {
      value: requiredCorpus,
      breakdown: [
        { label: 'Required Corpus', value: `₹${Math.round(requiredCorpus).toLocaleString('en-IN')}` },
        { label: 'Monthly SIP Needed', value: `₹${Math.round(monthlySIP).toLocaleString('en-IN')}` },
        { label: 'Future Monthly Expenses', value: `₹${Math.round(futureExpenses).toLocaleString('en-IN')}` }
      ]
    }
  }

  const calculateCompound = (principal: number, rate: number, years: number, frequency: number = 1) => {
    const amount = principal * (1 + rate / 100 / frequency) ** (frequency * years)
    const interest = amount - principal
    
    return {
      value: amount,
      breakdown: [
        { label: 'Principal Amount', value: `₹${Math.round(principal).toLocaleString('en-IN')}` },
        { label: 'Compound Interest', value: `₹${Math.round(interest).toLocaleString('en-IN')}` },
        { label: 'Maturity Amount', value: `₹${Math.round(amount).toLocaleString('en-IN')}` }
      ]
    }
  }

  const calculateFD = (principal: number, rate: number, years: number) => {
    const amount = principal * (1 + rate / 100) ** years
    const interest = amount - principal
    
    return {
      value: amount,
      breakdown: [
        { label: 'Principal Amount', value: `₹${Math.round(principal).toLocaleString('en-IN')}` },
        { label: 'Interest Earned', value: `₹${Math.round(interest).toLocaleString('en-IN')}` },
        { label: 'Maturity Amount', value: `₹${Math.round(amount).toLocaleString('en-IN')}` }
      ]
    }
  }

  const renderCalculatorForm = (calculatorId: string) => {
    const [formData, setFormData] = useState<Record<string, number>>({})

    const handleCalculate = () => {
      let result: CalculatorResult

      switch (calculatorId) {
        case 'sip':
          result = calculateSIP(formData.monthly || 0, formData.rate || 0, formData.years || 0)
          break
        case 'emi':
        case 'car-loan':
        case 'home-loan':
        case 'education-loan':
        case 'personal-loan':
          result = calculateEMI(formData.principal || 0, formData.rate || 0, formData.years || 0)
          break
        case 'retirement':
          result = calculateRetirement(
            formData.currentAge || 0,
            formData.retirementAge || 0,
            formData.monthlyExpenses || 0,
            formData.inflation || 0,
            formData.returns || 0
          )
          break
        case 'compound':
        case 'lumpsum':
          result = calculateCompound(formData.principal || 0, formData.rate || 0, formData.years || 0)
          break
        case 'fd':
        case 'ppf':
        case 'nps':
          result = calculateFD(formData.principal || 0, formData.rate || 0, formData.years || 0)
          break
        default:
          result = { value: 0 }
      }

      setResults(prev => ({ ...prev, [calculatorId]: result }))
    }

    const renderForm = () => {
      switch (calculatorId) {
        case 'sip':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthly">Monthly Investment (₹)</Label>
                <Input
                  id="monthly"
                  type="number"
                  placeholder="5000"
                  value={formData.monthly || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="rate">Expected Annual Return (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="12"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="years">Investment Period (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  placeholder="10"
                  value={formData.years || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, years: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )

        case 'emi':
        case 'car-loan':
        case 'home-loan':
        case 'education-loan':
        case 'personal-loan':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="principal">Loan Amount (₹)</Label>
                <Input
                  id="principal"
                  type="number"
                  placeholder="1000000"
                  value={formData.principal || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="rate">Interest Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="8.5"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="years">Loan Tenure (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  placeholder="20"
                  value={formData.years || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, years: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )

        case 'retirement':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentAge">Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  placeholder="30"
                  value={formData.currentAge || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAge: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="retirementAge">Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  placeholder="60"
                  value={formData.retirementAge || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, retirementAge: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="monthlyExpenses">Current Monthly Expenses (₹)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  placeholder="50000"
                  value={formData.monthlyExpenses || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="inflation">Expected Inflation (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  placeholder="6"
                  value={formData.inflation || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, inflation: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="returns">Expected Returns (%)</Label>
                <Input
                  id="returns"
                  type="number"
                  placeholder="12"
                  value={formData.returns || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, returns: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )

        case 'compound':
        case 'lumpsum':
        case 'fd':
        case 'ppf':
        case 'nps':
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="principal">Principal Amount (₹)</Label>
                <Input
                  id="principal"
                  type="number"
                  placeholder="100000"
                  value={formData.principal || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="8"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="years">Investment Period (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  placeholder="5"
                  value={formData.years || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, years: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )

        default:
          return (
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>Calculator form will be displayed here</p>
            </div>
          )
      }
    }

    return (
      <div className="space-y-6">
        {renderForm()}
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        
        {results[calculatorId] && (
          <Card className="glass-card border-white/10 mt-6 glow-purple">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white">Calculation Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results[calculatorId].breakdown?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-b-0">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const categories = Array.from(new Set(calculators.map(calc => calc.category)))

  return (
    <div className="container mx-auto p-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gradient-heading">Financial Calculators</h2>
        <p className="text-white/60 text-sm max-w-2xl">
          Use these interactive calculators to plan your financial future and make informed decisions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Calculator List Sidebar */}
        <div className="w-full lg:w-1/4 space-y-4 shrink-0">
          {categories.map(category => (
            <Card key={category} className="glass-card border-white/10 p-4">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-purple-400 mb-3 px-1">
                {category}
              </h3>
              <div className="space-y-1.5">
                {calculators
                  .filter(calc => calc.category === category)
                  .map(calculator => {
                    const isActive = activeCalculator === calculator.id
                    return (
                      <Button
                        key={calculator.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start h-auto p-3 text-left transition-all duration-300 rounded-lg group",
                          isActive 
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25" 
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => setActiveCalculator(calculator.id)}
                      >
                        <calculator.icon className={cn("mr-3 h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-purple-400")} />
                        <div className="truncate">
                          <div className="font-medium text-sm">{calculator.title}</div>
                          <div className="text-xxs text-white/40 truncate mt-0.5 max-w-[200px]">
                            {calculator.description}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
              </div>
            </Card>
          ))}
        </div>

        {/* Calculator Content Card */}
        <div className="w-full lg:w-3/4 flex-grow">
          <Card className="glass-card glow glow-purple glass-highlight border-white/10 p-6 flex flex-col h-full min-h-[500px]">
            <CardHeader className="p-0 pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                  {(() => {
                    const calculator = calculators.find(calc => calc.id === activeCalculator)
                    const Icon = calculator?.icon || Calculator
                    return <Icon className="h-6 w-6" />
                  })()}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {calculators.find(calc => calc.id === activeCalculator)?.title}
                  </CardTitle>
                  <CardDescription className="text-white/60 mt-1">
                    {calculators.find(calc => calc.id === activeCalculator)?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {renderCalculatorForm(activeCalculator)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
