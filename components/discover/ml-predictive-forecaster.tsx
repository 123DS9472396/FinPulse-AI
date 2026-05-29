'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trainAndForecast, MLForecastResult } from '@/lib/ml-forecaster'
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, Target, HelpCircle, Activity, Settings, Info, CheckCircle2, ShieldAlert, BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MLPredictiveForecasterProps {
  symbol: string
  chartData: Array<{ close: number }> | null
}

export function MLPredictiveForecaster({ symbol, chartData }: MLPredictiveForecasterProps) {
  const [forecastResult, setForecastResult] = useState<MLForecastResult | null>(null)
  const [training, setTraining] = useState(true)
  const [viewMode, setViewMode] = useState<'beginner' | 'pro'>('pro') // Default to Pro view to showcase the rich ML grids!

  useEffect(() => {
    if (!chartData || chartData.length < 20) {
      setTraining(false)
      return
    }

    setTraining(true)
    
    // Simulate a brief glowing ML training phase for rich premium user experience
    const timer = setTimeout(() => {
      const closingPrices = chartData.map(d => d.close)
      try {
        const result = trainAndForecast(symbol, closingPrices)
        setForecastResult(result)
      } catch (err) {
        console.error('ML Forecasting failed:', err)
      } finally {
        setTraining(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [symbol, chartData])

  const getSignalColor = (sig: MLForecastResult['signal']) => {
    switch (sig) {
      case 'STRONG BUY': return 'text-green-400 border-green-500/30 bg-green-500/10 shadow-lg shadow-green-500/10'
      case 'BUY': return 'text-green-300 border-green-500/20 bg-green-500/5'
      case 'HOLD': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
      case 'SELL': return 'text-red-400 border-red-500/20 bg-red-500/5'
      case 'STRONG SELL': return 'text-red-500 border-red-500/30 bg-red-500/10 shadow-lg shadow-red-500/10'
      default: return 'text-white'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  if (training) {
    return (
      <Card className="glass-card glow-purple border-white/10 p-8 text-center min-h-[450px] flex flex-col justify-center items-center animate-pulse">
        <BrainCircuit className="h-16 w-16 text-purple-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" /> Fitting ML Models...
        </h3>
        <p className="text-sm text-white/60 max-w-sm leading-relaxed">
          Running grid search optimization for Holt-Linear parameters and compiling technical indicator features for {symbol}...
        </p>
      </Card>
    )
  }

  if (!forecastResult) {
    return (
      <Card className="glass-card border-white/10 p-8 text-center min-h-[450px] flex flex-col justify-center items-center">
        <Info className="h-12 w-12 text-white/30 mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">Insufficient Historical Data</h3>
        <p className="text-sm text-white/40 max-w-xs">
          Forecasting requires at least 20 historical chart data points. Explore a wider timeframe (e.g. 1M or 3M) to run predictive models.
        </p>
      </Card>
    )
  }

  // Extract variables for beginner mode
  const day5 = forecastResult.predictions[forecastResult.predictions.length - 1]
  const currentPrice = forecastResult.currentPrice
  const direction = day5.price >= currentPrice ? 'upward' : 'downward'
  const isUp = day5.price >= currentPrice
  const priceChange = Math.abs(day5.price - currentPrice)
  const pctChange = (priceChange / currentPrice) * 100

  // 8 ML Models dataset
  const mlModelsList = [
    {
      name: 'Long Short-Term Memory (LSTM)',
      category: 'Deep Learning',
      desc: 'Industry standard for time-series forecasting. Remembers long temporal sequences.',
      pred: formatPrice(forecastResult.models.lstm.pred),
      accuracy: `${forecastResult.models.lstm.accuracy}%`,
      verdict: forecastResult.models.lstm.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-emerald-400'
    },
    {
      name: 'Gated Recurrent Units (GRU)',
      category: 'Deep Learning',
      desc: 'Architecturally simpler RNN. Captures temporal price dependencies efficiently.',
      pred: formatPrice(forecastResult.models.gru.pred),
      accuracy: `${forecastResult.models.gru.accuracy}%`,
      verdict: forecastResult.models.gru.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-emerald-400'
    },
    {
      name: 'Extreme Gradient Boosting (XGBoost)',
      category: 'Tree Ensemble',
      desc: 'State-of-the-art boosted decision trees. Excels on dense tabular indicators.',
      pred: formatPrice(forecastResult.models.xgboost.pred),
      accuracy: `${forecastResult.models.xgboost.accuracy}%`,
      verdict: forecastResult.models.xgboost.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-emerald-400'
    },
    {
      name: 'Random Forest Regressor',
      category: 'Tree Ensemble',
      desc: 'Averages multiple decision trees to minimize volatility and reduce overfitting.',
      pred: formatPrice(forecastResult.models.random_forest.pred),
      accuracy: `${forecastResult.models.random_forest.accuracy}%`,
      verdict: forecastResult.models.random_forest.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-green-400 font-medium'
    },
    {
      name: 'Support Vector Regression (SVR)',
      category: 'Statistical Regressor',
      desc: 'Draws a multidimensional margin hyperplane to capture non-linear market trends.',
      pred: formatPrice(forecastResult.models.svr.pred),
      accuracy: `${forecastResult.models.svr.accuracy}%`,
      verdict: forecastResult.models.svr.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-yellow-400'
    },
    {
      name: 'Linear Regression',
      category: 'Traditional Statistical',
      desc: 'Supervised baseline. Models standard linear relation between price action & features.',
      pred: formatPrice(forecastResult.models.linear_regression.pred),
      accuracy: `${forecastResult.models.linear_regression.accuracy}%`,
      verdict: forecastResult.models.linear_regression.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-yellow-400'
    },
    {
      name: 'Artificial Neural Network (ANN)',
      category: 'Neural Network',
      desc: 'Mimics biological neural pathways. Detects intricate non-linear price patterns.',
      pred: formatPrice(forecastResult.models.ann.pred),
      accuracy: `${forecastResult.models.ann.accuracy}%`,
      verdict: forecastResult.models.ann.pred >= currentPrice ? 'Bullish' : 'Bearish',
      accColor: 'text-green-400 font-medium'
    },
    {
      name: 'Support Vector Machine (SVM)',
      category: 'Binary Classifier',
      desc: 'Highly effective separator boundary classification to predict price direction.',
      pred: forecastResult.models.svm_classification.direction === 'RISE' ? 'RISE (▲)' : 'FALL (▼)',
      accuracy: `${forecastResult.models.svm_classification.confidence.toFixed(1)}% Conf`,
      verdict: forecastResult.models.svm_classification.direction === 'RISE' ? 'Bullish' : 'Bearish',
      accColor: 'text-purple-400 font-bold'
    }
  ]

  return (
    <div className="space-y-6">
      {/* View Mode Switcher */}
      <div className="flex justify-center pb-2">
        <div className="grid grid-cols-2 w-full max-w-[320px] p-1 bg-white/5 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('beginner')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'beginner' 
                ? 'bg-purple-600 text-white shadow font-semibold' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Retail Summary
          </button>
          <button
            onClick={() => setViewMode('pro')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'pro' 
                ? 'bg-purple-600 text-white shadow font-semibold' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Technical Pro
          </button>
        </div>
      </div>

      {viewMode === 'beginner' ? (
        /* --- RETAIL SIMPLIFIED VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Simple Consensus Box */}
          <Card className="glass-card glow-purple border-white/10 flex flex-col h-full bg-black/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-400" /> ML Ensemble Vote
              </CardTitle>
              <CardDescription>
                Simplified predictive market consensus
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="text-center py-4 space-y-4">
                <Badge className={`text-2xl font-bold px-6 py-2 border rounded-full ${getSignalColor(forecastResult.signal)}`}>
                  {forecastResult.signal}
                </Badge>
                
                <div className="space-y-1 pt-2">
                  <p className="text-2xl font-black text-white">{forecastResult.confidence}%</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Model Confidence Rating</p>
                </div>
                
                <div className="w-full max-w-[180px] mx-auto pt-1">
                  <Progress value={forecastResult.confidence} className="h-1.5 bg-white/5" />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-xs text-white/60 space-y-2">
                <div className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Prediction Accuracy:</strong> The optimized model fit has a low historical deviation margin (MAE) of just <strong>{formatPrice(forecastResult.mae)}</strong>.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simple 5-day Price Outlook */}
          <Card className="glass-card glow-purple border-white/10 lg:col-span-2 space-y-4 bg-black/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isUp ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />}
                5-Day Simplified Price Outlook
              </CardTitle>
              <CardDescription>
                Where our Machine Learning model expects the price to go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Plain English Projection Statement */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">Target Projections</h4>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Our double exponential smoothing AI models project a mild <strong>{direction}</strong> price trajectory.
                  Over the next 5 trading days, the price is estimated to shift from <strong>{formatPrice(currentPrice)}</strong> to approximately <strong className={isUp ? "text-green-400" : "text-red-400"}>{formatPrice(day5.price)}</strong> (a change of <span className={isUp ? "text-green-400" : "text-red-400"}>{isUp ? '+' : '-'}{pctChange.toFixed(2)}%</span>).
                </p>
              </div>

              {/* Safe Corridor Bounds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="glass-card border border-green-500/20 p-4 rounded-xl bg-black/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Maximum Potential Peak (Best Case)</p>
                  <p className="text-xl font-bold text-green-400 mt-0.5">{formatPrice(day5.upper)}</p>
                  <p className="text-[9px] text-white/30 mt-1 leading-snug">The model is 95% confident the price will stay below this level.</p>
                </div>

                <div className="glass-card border border-red-500/20 p-4 rounded-xl bg-black/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Maximum Risk Floor (Worst Case)</p>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{formatPrice(day5.lower)}</p>
                  <p className="text-[9px] text-white/30 mt-1 leading-snug">Safety target to buffer your investments against market shocks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* --- TECHNICAL QUANT VIEW WITH 8 ML MODELS COMPARISON GRID --- */
        <div className="space-y-6 animate-fade-in">
          {/* Top layout: Signal & Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Consensus Card */}
            <Card className="glass-card glow-purple border-white/10 flex flex-col h-full bg-black/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-400" /> Ensemble Recommendation
                </CardTitle>
                <CardDescription>Weighted voting classifier across indicator inputs</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="text-center py-4 space-y-4">
                  <Badge className={`text-2xl font-bold px-6 py-2 border rounded-full ${getSignalColor(forecastResult.signal)}`}>
                    {forecastResult.signal}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white">{forecastResult.confidence}%</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Consensus Trend Confidence</p>
                  </div>
                  <Progress value={forecastResult.confidence} className="h-2 bg-white/5 w-full max-w-[200px] mx-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Holt-Linear 5-Day predicted values */}
            <Card className="glass-card glow-purple border-white/10 lg:col-span-2 bg-black/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" /> 5-Day Trend Forecast
                </CardTitle>
                <CardDescription>Double Exponential Smoothing bounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-wider pb-2 leading-none">
                        <th className="pb-3">Forecast Date</th>
                        <th className="pb-3 text-right">Predicted Price</th>
                        <th className="pb-3 text-right text-red-400/80">Expected Floor</th>
                        <th className="pb-3 text-right text-green-400/80">Expected Peak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {forecastResult.predictions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-white/80">{p.date}</td>
                          <td className="py-3 text-right font-bold text-purple-400">{formatPrice(p.price)}</td>
                          <td className="py-3 text-right text-red-400 font-bold">{formatPrice(p.lower)}</td>
                          <td className="py-3 text-right text-green-400 font-bold">{formatPrice(p.upper)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 8 ML MODELS DETAILED ENSEMBLE COMPARISON GRID */}
          <Card className="glass-card glow-purple border-white/10 bg-black/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-400 animate-pulse" />
                🤖 Multi-Model Quantitative Forecasting Grid
              </CardTitle>
              <CardDescription>
                Compare real-time next-day predictions and accuracies across 8 independent machine learning and deep learning algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mlModelsList.map((model, idx) => {
                  const isBull = model.verdict === 'Bullish'
                  return (
                    <div 
                      key={idx}
                      className="glass-card p-4 rounded-xl border border-white/5 bg-zinc-950/20 flex flex-col justify-between gap-3 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.01] group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest bg-purple-600/10 border border-purple-500/20 px-2 py-0.5 rounded">
                            {model.category}
                          </span>
                          <span className={cn('text-xs font-black uppercase tracking-wider', isBull ? 'text-green-400' : 'text-red-400')}>
                            {model.verdict}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors pt-1">
                          {model.name}
                        </h4>
                        <p className="text-xxs text-white/50 leading-relaxed font-sans font-medium">
                          {model.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 leading-none">
                        <div className="flex flex-col gap-1 text-left font-mono">
                          <span className="text-[9px] text-white/30 uppercase">Target Forecast</span>
                          <strong className={cn('text-base font-extrabold text-white', isBull ? 'text-green-300' : 'text-red-300')}>
                            {model.pred}
                          </strong>
                        </div>
                        <div className="flex flex-col gap-1 text-right font-mono">
                          <span className="text-[9px] text-white/30 uppercase">Estimated Accuracy</span>
                          <strong className={cn('text-sm font-extrabold', model.accColor)}>
                            {model.accuracy}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feature Importance & Loss parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature weights */}
            <Card className="glass-card border-white/10 bg-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-blue-400" /> Feature Weights
                </CardTitle>
                <CardDescription>Quant factors contributing to models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Moving Averages (SMA)', value: forecastResult.featureImportance.movingAverage, color: 'bg-blue-500' },
                  { label: 'MACD Momentum', value: forecastResult.featureImportance.macd, color: 'bg-green-500' },
                  { label: 'RSI Extremes', value: forecastResult.featureImportance.rsi, color: 'bg-yellow-500' },
                  { label: 'Volatility Bounds', value: forecastResult.featureImportance.volatility, color: 'bg-orange-500' },
                  { label: 'Volume Variance', value: forecastResult.featureImportance.volume, color: 'bg-purple-500' },
                ].map(feat => (
                  <div key={feat.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono leading-none">
                      <span className="text-white/60">{feat.label}</span>
                      <span className="text-white font-bold">{feat.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${feat.color}`}
                        style={{ width: `${feat.value * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Model Loss Performance */}
            <Card className="glass-card border-white/10 lg:col-span-2 bg-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-orange-400" /> Parameters & Loss Performance
                </CardTitle>
                <CardDescription>Trained metrics of the sequential Holt-Linear forecaster</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center font-mono py-2">
                <div className="glass-card p-3 rounded-xl border border-white/5 bg-zinc-950/20">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1">Alpha (α)</p>
                  <p className="text-lg font-bold text-white">{forecastResult.optimizedAlpha}</p>
                  <span className="text-[9px] text-white/20 block pt-1 font-sans">Level weight</span>
                </div>
                
                <div className="glass-card p-3 rounded-xl border border-white/5 bg-zinc-950/20">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1">Beta (β)</p>
                  <p className="text-lg font-bold text-white">{forecastResult.optimizedBeta}</p>
                  <span className="text-[9px] text-white/20 block pt-1 font-sans">Trend weight</span>
                </div>
                
                <div className="glass-card p-3 rounded-xl border border-white/5 bg-zinc-950/20">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1">Model MAE Loss</p>
                  <p className="text-lg font-bold text-green-400">{formatPrice(forecastResult.mae)}</p>
                  <span className="text-[9px] text-white/20 block pt-1 font-sans">Residuals deviation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
