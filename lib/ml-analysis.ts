import { ChartData } from './market-api'

export interface TechnicalIndicators {
  rsi: number
  macd: { value: number; signal: number; histogram: number }
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  bollingerBands: { upper: number; middle: number; lower: number }
  atr: number          // Average True Range — volatility
  adx: number          // ADX — trend strength (0-100)
  stochastic: { k: number; d: number } // Stochastic oscillator
  obv: number          // On-Balance Volume
  vwap: number         // Volume Weighted Average Price
  trend: 'Bullish' | 'Bearish' | 'Neutral'
  trendStrength: number // 0-100 ensemble confidence score
  momentum: number
  support: number
  resistance: number
  signals: {
    rsiSignal: 'Buy' | 'Sell' | 'Hold'
    macdSignal: 'Buy' | 'Sell' | 'Hold'
    maSignal: 'Buy' | 'Sell' | 'Hold'
    bbSignal: 'Buy' | 'Sell' | 'Hold'
    stochSignal: 'Buy' | 'Sell' | 'Hold'
    volumeSignal: 'Accumulation' | 'Distribution' | 'Neutral'
  }
}

// === CORE MATH UTILITIES ===

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period
}

function calculateEMASeries(prices: number[], period: number): number[] {
  if (prices.length < period) return prices
  const k = 2 / (period + 1)
  const ema = [prices[0]]
  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}

function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  return 100 - (100 / (1 + avgGain / avgLoss))
}

function calculateMACD(prices: number[]) {
  const ema12 = calculateEMASeries(prices, 12)
  const ema26 = calculateEMASeries(prices, 26)
  const macdLine = prices.map((_, i) => ema12[i] - ema26[i])
  const signalLine = calculateEMASeries(macdLine, 9)
  const last = prices.length - 1
  return {
    value: macdLine[last],
    signal: signalLine[last],
    histogram: macdLine[last] - signalLine[last],
    macdLine,
  }
}

function calculateBollingerBands(prices: number[], period = 20, mult = 2) {
  if (prices.length < period) {
    const c = prices[prices.length - 1] || 0
    return { upper: c, middle: c, lower: c }
  }
  const slice = prices.slice(-period)
  const sma = slice.reduce((a, b) => a + b, 0) / period
  const stdDev = Math.sqrt(slice.reduce((acc, p) => acc + (p - sma) ** 2, 0) / period)
  return { upper: sma + stdDev * mult, middle: sma, lower: sma - stdDev * mult }
}

// Average True Range — measures volatility
function calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < period + 1) return 0
  const trueRanges = []
  for (let i = 1; i < highs.length; i++) {
    trueRanges.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ))
  }
  return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period
}

// ADX — Average Directional Index (trend strength 0-100)
function calculateADX(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < period * 2) return 25 // default moderate trend
  const dxValues = []
  for (let i = 1; i < highs.length; i++) {
    const upMove = highs[i] - highs[i - 1]
    const downMove = lows[i - 1] - lows[i]
    const plusDM = upMove > downMove && upMove > 0 ? upMove : 0
    const minusDM = downMove > upMove && downMove > 0 ? downMove : 0
    const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]))
    if (tr === 0) continue
    const plusDI = (plusDM / tr) * 100
    const minusDI = (minusDM / tr) * 100
    if (plusDI + minusDI === 0) continue
    dxValues.push(Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100)
  }
  if (dxValues.length === 0) return 25
  return dxValues.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, dxValues.length)
}

// Stochastic Oscillator %K and %D
function calculateStochastic(closes: number[], highs: number[], lows: number[], period = 14): { k: number; d: number } {
  if (closes.length < period) return { k: 50, d: 50 }
  const recent = closes.slice(-period)
  const recentH = highs.slice(-period)
  const recentL = lows.slice(-period)
  const highestHigh = Math.max(...recentH)
  const lowestLow = Math.min(...recentL)
  const lastClose = recent[recent.length - 1]
  const k = highestHigh === lowestLow ? 50 : ((lastClose - lowestLow) / (highestHigh - lowestLow)) * 100
  // D is 3-period SMA of K (simplified)
  return { k, d: k }
}

// On-Balance Volume
function calculateOBV(closes: number[], volumes: number[]): number {
  let obv = 0
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i]
    else if (closes[i] < closes[i - 1]) obv -= volumes[i]
  }
  return obv
}

// Volume Weighted Average Price
function calculateVWAP(closes: number[], volumes: number[]): number {
  const slice = Math.min(closes.length, 20)
  const c = closes.slice(-slice)
  const v = volumes.slice(-slice)
  const totalVolume = v.reduce((a, b) => a + b, 0)
  if (totalVolume === 0) return c[c.length - 1]
  return c.reduce((acc, price, i) => acc + price * v[i], 0) / totalVolume
}

// === SIGNAL GENERATORS ===

function getRSISignal(rsi: number): 'Buy' | 'Sell' | 'Hold' {
  if (rsi < 35) return 'Buy'
  if (rsi > 65) return 'Sell'
  return 'Hold'
}

function getMACDSignal(histogram: number, prevHistogram: number): 'Buy' | 'Sell' | 'Hold' {
  if (histogram > 0 && prevHistogram <= 0) return 'Buy'
  if (histogram < 0 && prevHistogram >= 0) return 'Sell'
  if (histogram > 0) return 'Buy'
  if (histogram < 0) return 'Sell'
  return 'Hold'
}

function getMASignal(price: number, sma20: number, sma50: number): 'Buy' | 'Sell' | 'Hold' {
  if (price > sma20 && sma20 > sma50) return 'Buy'
  if (price < sma20 && sma20 < sma50) return 'Sell'
  return 'Hold'
}

function getBBSignal(price: number, bb: { upper: number; lower: number; middle: number }): 'Buy' | 'Sell' | 'Hold' {
  if (price <= bb.lower) return 'Buy'
  if (price >= bb.upper) return 'Sell'
  return 'Hold'
}

function getStochSignal(k: number): 'Buy' | 'Sell' | 'Hold' {
  if (k < 20) return 'Buy'
  if (k > 80) return 'Sell'
  return 'Hold'
}

function getVolumeSignal(obv: number): 'Accumulation' | 'Distribution' | 'Neutral' {
  if (obv > 0) return 'Accumulation'
  if (obv < 0) return 'Distribution'
  return 'Neutral'
}

// === ENSEMBLE ML VOTING ENGINE ===
// Weighted voting across 6 independent technical algorithms
function ensembleVote(signals: {
  rsiSignal: string; macdSignal: string; maSignal: string;
  bbSignal: string; stochSignal: string; volumeSignal: string
}, adx: number): { trend: 'Bullish' | 'Bearish' | 'Neutral'; trendStrength: number } {
  
  // Weights: higher weight = more reliable signal
  const weights = {
    maSignal: 3.0,       // Moving Average crossover is most reliable
    macdSignal: 2.5,     // MACD is highly respected
    rsiSignal: 2.0,      // RSI good for reversals
    bbSignal: 1.5,       // Bollinger Bands good for extremes
    stochSignal: 1.5,    // Stochastic good for overbought/sold
    volumeSignal: 1.0,   // Volume confirmation
  }

  let bullScore = 0
  let bearScore = 0
  let totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

  const toBull = (sig: string) => sig === 'Buy' || sig === 'Accumulation' ? 1 : 0
  const toBear = (sig: string) => sig === 'Sell' || sig === 'Distribution' ? 1 : 0

  bullScore += weights.maSignal * toBull(signals.maSignal)
  bullScore += weights.macdSignal * toBull(signals.macdSignal)
  bullScore += weights.rsiSignal * toBull(signals.rsiSignal)
  bullScore += weights.bbSignal * toBull(signals.bbSignal)
  bullScore += weights.stochSignal * toBull(signals.stochSignal)
  bullScore += weights.volumeSignal * toBull(signals.volumeSignal)

  bearScore += weights.maSignal * toBear(signals.maSignal)
  bearScore += weights.macdSignal * toBear(signals.macdSignal)
  bearScore += weights.rsiSignal * toBear(signals.rsiSignal)
  bearScore += weights.bbSignal * toBear(signals.bbSignal)
  bearScore += weights.stochSignal * toBear(signals.stochSignal)
  bearScore += weights.volumeSignal * toBear(signals.volumeSignal)

  const bullPct = (bullScore / totalWeight) * 100
  const bearPct = (bearScore / totalWeight) * 100
  
  // ADX amplifies confidence when trend is strong (ADX > 25)
  const adxBoost = adx > 25 ? 1.2 : 1.0

  let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral'
  let trendStrength = 50

  if (bullPct > bearPct + 10) {
    trend = 'Bullish'
    trendStrength = Math.min(95, Math.round(bullPct * adxBoost))
  } else if (bearPct > bullPct + 10) {
    trend = 'Bearish'
    trendStrength = Math.min(95, Math.round(bearPct * adxBoost))
  } else {
    trend = 'Neutral'
    trendStrength = Math.round(50 - Math.abs(bullPct - bearPct))
  }

  return { trend, trendStrength }
}

// === MAIN ANALYSIS FUNCTION ===
export function analyzeTechnicalIndicators(chartData: ChartData): TechnicalIndicators {
  const closes = chartData.data.map(d => d.close)
  const highs = chartData.data.map(d => d.high)
  const lows = chartData.data.map(d => d.low)
  const volumes = chartData.data.map(d => d.volume)

  const currentPrice = closes[closes.length - 1]
  const prevPrice = closes[closes.length - 2] || currentPrice

  // Core indicators
  const rsi = calculateRSI(closes)
  const macd = calculateMACD(closes)
  const prevHistogram = macd.macdLine ? macd.macdLine[macd.macdLine.length - 2] ?? 0 : 0
  const sma20 = calculateSMA(closes, 20)
  const sma50 = calculateSMA(closes, 50)
  const ema12Series = calculateEMASeries(closes, 12)
  const ema26Series = calculateEMASeries(closes, 26)
  const bollingerBands = calculateBollingerBands(closes)
  const atr = calculateATR(highs, lows, closes)
  const adx = calculateADX(highs, lows, closes)
  const stochastic = calculateStochastic(closes, highs, lows)
  const obv = calculateOBV(closes, volumes)
  const vwap = calculateVWAP(closes, volumes)

  // Support & Resistance (pivot point method)
  const recentHighs = highs.slice(-20)
  const recentLows = lows.slice(-20)
  const resistance = Math.max(...recentHighs)
  const support = Math.min(...recentLows)

  // 1-month momentum
  const monthAgoPrice = closes[Math.max(0, closes.length - 20)]
  const momentum = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100

  // Generate individual signals
  const signals = {
    rsiSignal: getRSISignal(rsi),
    macdSignal: getMACDSignal(macd.histogram, prevHistogram),
    maSignal: getMASignal(currentPrice, sma20, sma50),
    bbSignal: getBBSignal(currentPrice, bollingerBands),
    stochSignal: getStochSignal(stochastic.k),
    volumeSignal: getVolumeSignal(obv),
  }

  // Weighted ensemble ML vote
  const { trend, trendStrength } = ensembleVote(signals, adx)

  return {
    rsi,
    macd: { value: macd.value, signal: macd.signal, histogram: macd.histogram },
    sma20,
    sma50,
    ema12: ema12Series[ema12Series.length - 1],
    ema26: ema26Series[ema26Series.length - 1],
    bollingerBands,
    atr,
    adx,
    stochastic,
    obv,
    vwap,
    trend,
    trendStrength,
    momentum,
    support,
    resistance,
    signals,
  }
}
