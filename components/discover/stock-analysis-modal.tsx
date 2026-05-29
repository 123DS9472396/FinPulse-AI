'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { AiStockAnalysis } from '@/components/discover/ai-stock-analysis'
import { LineChart, Activity } from 'lucide-react'

interface Props {
  symbol: string | null
  name?: string
  isOpen: boolean
  onClose: () => void
}

export function StockAnalysisModal({ symbol, name, isOpen, onClose }: Props) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && symbol) {
      loadChartData()
    }
  }, [isOpen, symbol])

  const loadChartData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/market/chart?symbol=${symbol}&period=6mo`)
      const data = await res.json()
      if (data.success) {
        setChartData(data.data)
      } else {
        setError(data.error || 'Failed to load chart data')
      }
    } catch (err) {
      setError('An error occurred while loading chart data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 glass-card border-white/10 overflow-hidden bg-black/90">
        <DialogHeader className="p-4 border-b border-white/10 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-heading">
            <LineChart className="h-6 w-6 text-purple-400" />
            {name ? `${name} (${symbol})` : symbol} - AI Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
            
            {/* Left Column: Candlestick Chart */}
            <div className="lg:col-span-2 flex flex-col h-full space-y-4">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center glass-card border-white/10 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
                  <p className="text-muted-foreground animate-pulse">Loading real-time market data...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center glass-card border-white/10 rounded-xl">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : chartData ? (
                <div className="flex-1 h-full min-h-[470px]">
                  <CandlestickChart 
                    data={chartData.candlestick} 
                    volumeData={chartData.volume} 
                    height={400} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center glass-card border-white/10 rounded-xl">
                  <p className="text-muted-foreground">No chart data available</p>
                </div>
              )}
            </div>

            {/* Right Column: AI Analysis */}
            <div className="h-full flex flex-col">
              {symbol && <AiStockAnalysis symbol={symbol} name={name} />}
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
