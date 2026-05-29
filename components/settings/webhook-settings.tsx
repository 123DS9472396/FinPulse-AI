'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Copy, Play, Server, Cpu, AlertTriangle, Sparkles, Terminal } from 'lucide-react'
import { toast } from 'sonner'

export function WebhookSettings() {
  const [selectedAction, setSelectedAction] = useState<'daily_summary' | 'price_signal' | 'tax_alerts'>('daily_summary')
  const [testSymbol, setTestSymbol] = useState('RELIANCE')
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)

  // Get active URL
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/automation/n8n` 
    : 'http://localhost:3000/api/automation/n8n'

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedUrl(true)
    toast.success("Webhook API Endpoint URL copied to clipboard!", { icon: '📋' })
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const getPayload = () => {
    switch (selectedAction) {
      case 'daily_summary':
        return JSON.stringify({ action: 'daily_summary' }, null, 2)
      case 'price_signal':
        return JSON.stringify({ action: 'price_signal', symbol: testSymbol }, null, 2)
      case 'tax_alerts':
        return JSON.stringify({
          action: 'tax_alerts',
          data: {
            holdings: [
              { symbol: 'TCS', purchaseDate: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], purchasePrice: 3800, quantity: 15, currentPrice: 3950 },
              { symbol: 'RELIANCE', purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], purchasePrice: 2400, quantity: 10, currentPrice: 2500 }
            ]
          }
        }, null, 2)
    }
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getPayload())
    setCopiedPayload(true)
    toast.success("Payload template copied to clipboard!", { icon: '📋' })
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleTestWebhook = async () => {
    setIsLoading(true)
    setApiResponse(null)
    try {
      const parsedBody = JSON.parse(getPayload())
      const res = await fetch('/api/automation/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody)
      })
      const data = await res.json()
      setApiResponse(data)
      if (res.ok && data.success) {
        toast.success("Webhook simulation completed successfully!", {
          description: `Engine returned alert state: ${data.n8n_metadata.alert_state.toUpperCase()}`,
          icon: '🚀'
        })
      } else {
        toast.error("Webhook endpoint returned an error.", {
          description: data.error || "Execution failed"
        })
      }
    } catch (err: any) {
      toast.error("Failed to execute webhook test.", {
        description: err.message || "Network error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 text-white">
      
      {/* Overview Block */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-400" /> n8n & SaaS Workflow Automations
            </h3>
            <p className="text-sm text-white/60">
              Trigger instant Discord alerts, Telegram summaries, and Resend email cards when market momentum shifts or tax saving opportunities emerge.
            </p>
          </div>
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 w-fit self-start md:self-auto py-1">
            🟢 Active & Secure API
          </Badge>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed max-w-4xl">
          <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-300 block mb-1">Open Financial Automation Protocol</span>
            <p className="text-white/80">
              Unlike traditional brokerage platforms that block programmatic data access, FinPulse AI provides a dedicated, highly secure, fully structured JSON webhook endpoint. Any workflow engine (n8n, Make.com, Zapier, or local cron scripts) can poll or POST to this route to retrieve real-time alerts fueled by our double-exponential Holt-Linear ML smoothing indicators and capital gains tax rules.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Setup & Playground */}
        <Card className="glass-card border-white/10 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-white/70">Webhook Setup Playground</CardTitle>
            <CardDescription className="text-xxs">Configure action payloads, copy request URLs, and simulate triggers live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* API Endpoint Input */}
            <div className="space-y-2">
              <Label className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                API Endpoint Route <Terminal className="h-3 w-3 text-purple-400" />
              </Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={webhookUrl} 
                  className="glass-card border-white/15 bg-black/35 font-mono text-[11px] text-purple-300 select-all"
                />
                <Button 
                  onClick={handleCopyUrl} 
                  variant="outline" 
                  size="icon" 
                  className="glass-card border-white/10 shrink-0 hover:bg-white/5 hover:text-white"
                >
                  {copiedUrl ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-white/40">Secure standard Next.js route accepting POST requests with standard JSON headers.</p>
            </div>

            {/* Select Automation Action */}
            <div className="space-y-2">
              <Label className="text-xs text-white/80 font-medium">Trigger Action</Label>
              <Select 
                value={selectedAction} 
                onValueChange={(val: any) => setSelectedAction(val)}
              >
                <SelectTrigger className="glass-card border-white/15 bg-black/25 text-xs text-white">
                  <SelectValue placeholder="Select automated action" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/15 bg-[#090518] text-white">
                  <SelectItem value="daily_summary" className="text-xs hover:bg-purple-950/40">Daily Market Summary (daily_summary)</SelectItem>
                  <SelectItem value="price_signal" className="text-xs hover:bg-purple-950/40">Technical Breakout Signals (price_signal)</SelectItem>
                  <SelectItem value="tax_alerts" className="text-xs hover:bg-purple-950/40">LTCG Tax Harvesting Optimization (tax_alerts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Signal Conditional Input */}
            {selectedAction === 'price_signal' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-xs text-white/80 font-medium">Analysis Target Symbol (Indian Market)</Label>
                <Input 
                  value={testSymbol}
                  onChange={(e) => setTestSymbol(e.target.value.toUpperCase())}
                  className="glass-card border-white/15 bg-black/20 text-xs uppercase"
                  placeholder="e.g. RELIANCE, TCS, INFY"
                />
              </div>
            )}

            {/* Request Payload Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-white/80 font-medium">Request Payload (JSON)</Label>
                <Button 
                  onClick={handleCopyPayload}
                  variant="ghost" 
                  size="xs" 
                  className="text-xxs text-purple-400 hover:text-purple-300 flex items-center gap-1 p-0 h-auto"
                >
                  {copiedPayload ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  Copy JSON Template
                </Button>
              </div>
              <pre className="p-3 bg-black/45 rounded-lg border border-white/5 text-[10px] font-mono text-white/70 overflow-x-auto leading-relaxed max-h-[140px]">
                {getPayload()}
              </pre>
            </div>

            {/* Action buttons */}
            <Button 
              onClick={handleTestWebhook}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 text-xs shadow-lg shadow-purple-600/20 font-semibold py-2.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin text-purple-200" /> 
                  Querying FinPulse AI Engine...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" /> 
                  Simulate Webhook Trigger
                </>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Right Side: Live JSON Inspector */}
        <Card className="glass-card border-white/10 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Live JSON Inspector Output
            </CardTitle>
            <CardDescription className="text-xxs">Real-time webhook API responses populated by live ML forecasting calculators.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {apiResponse ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xxs border-green-500/20 text-green-400 font-bold bg-green-500/5">
                    HTTP 200 OK
                  </Badge>
                  <span className="text-[10px] text-white/40">Timestamp: {new Date(apiResponse.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <pre className="p-4 bg-black/50 rounded-xl border border-white/5 font-mono text-[10px] text-green-400 overflow-y-auto max-h-[300px] leading-relaxed shadow-inner">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>

                {apiResponse.n8n_metadata && (
                  <div className="glass-card p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-2.5">
                    <AlertTriangle className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${apiResponse.n8n_metadata.alert_state === 'active' ? 'text-yellow-400 animate-pulse' : 'text-purple-400'}`} />
                    <div>
                      <span className="text-xxs font-bold text-white/80 block uppercase tracking-wider">
                        Engine Metadata Event: {apiResponse.n8n_metadata.event_type}
                      </span>
                      <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                        Active Alert State: <span className={apiResponse.n8n_metadata.alert_state === 'active' ? 'text-yellow-400 font-bold' : 'text-green-400'}>{apiResponse.n8n_metadata.alert_state.toUpperCase()}</span>. Workflow severity set to <span className="text-purple-300 font-semibold">{apiResponse.n8n_metadata.severity}</span>. Perfect for mapping direct alerts to Discord/Telegram!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-white/40 space-y-3">
                <Terminal className="h-10 w-10 text-white/20" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/60">Webhook Not Executed Yet</p>
                  <p className="text-[10px] max-w-[280px]">Click the "Simulate Webhook Trigger" button to run the active backend code and view results.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Documentation */}
      <div className="border-t border-white/5 pt-8 space-y-4">
        <div>
          <h3 className="text-lg font-bold">n8n / SaaS Workflow Integration Architecture</h3>
          <p className="text-xs text-white/50">Map the parsed webhook triggers inside your favorite visual automation designer in three easy steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
            <Badge className="bg-purple-600/10 text-purple-300 border border-purple-500/20 text-xxs font-bold">STEP 1</Badge>
            <h4 className="text-xs font-bold">Visual HTTP Node</h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Add an **HTTP Request** node inside n8n or Make. Set the URL to our automation route endpoint, method to `POST`, and specify the action key in the JSON body.
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
            <Badge className="bg-purple-600/10 text-purple-300 border border-purple-500/20 text-xxs font-bold">STEP 2</Badge>
            <h4 className="text-xs font-bold">Payload Data Mapping</h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              The engine responds with fully typed market parameters, Holt ML predictions, or tax savings warnings. n8n parses these values automatically into dynamic flow variables.
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
            <Badge className="bg-purple-600/10 text-purple-300 border border-purple-500/20 text-xxs font-bold">STEP 3</Badge>
            <h4 className="text-xs font-bold">Action Deliverables</h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Wire a conditional IF node testing if `n8n_metadata.alert_state === 'active'`. If true, branch the flow directly to **Discord**, **Telegram Channel**, or **Resend Email cards**.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
