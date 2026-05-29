import { NextRequest, NextResponse } from 'next/server'
import { marketDataService } from '@/lib/market-api'
import { analyzeTechnicalIndicators } from '@/lib/ml-analysis'
import { generateLLMResponse } from '@/lib/llm-client'
import { trainAndForecast } from '@/lib/ml-forecaster'

export async function POST(request: NextRequest) {
  try {
    const { symbol, name } = await request.json()
    if (!symbol) {
      return NextResponse.json({ success: false, error: 'Stock symbol is required.' }, { status: 400 })
    }

    // 1. Fetch live 6-month OHLC data
    const chartData = await marketDataService.getChartData(symbol, '6mo')
    if (!chartData || chartData.data.length < 20) {
      return NextResponse.json({ success: false, error: 'Insufficient historical data for analysis.' }, { status: 400 })
    }

    // 2. Fetch live quote
    const currentStock = await marketDataService.getStockPrice(symbol)

    // 3. Run the full 9-indicator ML Ensemble
    const ml = analyzeTechnicalIndicators(chartData)

    // Run Holt-Linear Double Exponential Smoothing forecast model (Ensemble)
    const pricesHistory = chartData.data.map(d => d.close)
    const forecast = trainAndForecast(symbol, pricesHistory)

    // 4. Build rich Gemini prompt
    const signalSummary = Object.entries(ml.signals)
      .map(([k, v]) => `${k.replace('Signal', '')}: ${v}`)
      .join(', ')

    const prompt = `You are FinPulse AI's elite AI Financial Analyst. Provide a sharp, data-driven stock analysis for ${name || symbol} (${symbol}).

LIVE ML ENSEMBLE DATA (computed from ${chartData.data.length} data points):
━━━ Price ━━━
• Current Price: ₹${currentStock?.price?.toFixed(2) || 'N/A'} | Change: ${currentStock?.changePercent?.toFixed(2) || '0'}%
• VWAP (20-day): ₹${ml.vwap.toFixed(2)} | Price vs VWAP: ${currentStock?.price ? (currentStock.price > ml.vwap ? 'Above (Bullish)' : 'Below (Bearish)') : 'N/A'}

━━━ Double Exponential Smoothing ML Forecast ━━━
• Forecast Signal: ${forecast.signal} (Confidence: ${forecast.confidence}%)
• Fit Mean Absolute Error (MAE): ₹${forecast.mae}
• Alpha (level smoothing): ${forecast.optimizedAlpha} | Beta (trend smoothing): ${forecast.optimizedBeta}
• Predicted Next 5 Days (Close, 95% Confidence bounds):
${forecast.predictions.map((p, i) => `  - Day ${i+1} (${p.date}): ₹${p.price} (Range: ₹${p.lower} - ₹${p.upper})`).join('\n')}

━━━ Trend & Momentum ━━━
• ML Ensemble Verdict: ${ml.trend} (Confidence: ${ml.trendStrength}%)
• ADX (Trend Strength): ${ml.adx.toFixed(1)} ${ml.adx > 25 ? '— Strong Trend' : '— Weak/No Trend'}
• 20-Day Momentum: ${ml.momentum > 0 ? '+' : ''}${ml.momentum.toFixed(2)}%
• Moving Averages: SMA20=₹${ml.sma20.toFixed(2)}, SMA50=₹${ml.sma50.toFixed(2)}, EMA12=₹${ml.ema12.toFixed(2)}, EMA26=₹${ml.ema26.toFixed(2)}

━━━ Oscillators ━━━
• RSI (14): ${ml.rsi.toFixed(2)} ${ml.rsi > 70 ? '— OVERBOUGHT' : ml.rsi < 30 ? '— OVERSOLD' : '— Neutral zone'}
• MACD Histogram: ${ml.macd.histogram.toFixed(4)} ${ml.macd.histogram > 0 ? '(Bullish divergence)' : '(Bearish divergence)'}
• Stochastic %K: ${ml.stochastic.k.toFixed(1)} ${ml.stochastic.k > 80 ? '— Overbought' : ml.stochastic.k < 20 ? '— Oversold' : ''}

━━━ Volatility & Volume ━━━
• ATR (14-day): ₹${ml.atr.toFixed(2)} — daily volatility range
• Bollinger Bands: Upper=₹${ml.bollingerBands.upper.toFixed(2)}, Mid=₹${ml.bollingerBands.middle.toFixed(2)}, Lower=₹${ml.bollingerBands.lower.toFixed(2)}
• OBV Signal: ${ml.signals.volumeSignal}

━━━ Key Levels ━━━
• Support: ₹${ml.support.toFixed(2)} | Resistance: ₹${ml.resistance.toFixed(2)}

━━━ Individual Signal Votes ━━━
${signalSummary}

Write a professional 4-section analysis in Markdown:
1. **📊 Verdict** — One clear sentence: Bullish/Bearish/Neutral based on the ML technical indicators and Double Exponential Smoothing forecast with confidence %
2. **🔍 Technical & Forecast Breakdown** — Interpret RSI, MACD, Stochastic, ADX, Bollinger Bands, and the ML Double Exponential Smoothing forecast values (next 5 days trend) together
3. **📈 Trade Setup** — Specific entry zone, stop-loss (based on ATR), and 2 price targets (incorporating forecast confidence bounds)
4. **⚠️ Risk Factors** — 2-3 specific risks (e.g., sector headwinds, macro, overbought conditions, forecast spread width)

Be specific, use the numbers above, be concise (max 300 words). No generic disclaimers.`

    // 5. Generate content using our robust, unified LLM client
    let responseText = ''
    try {
      responseText = await generateLLMResponse(prompt)
    } catch (err: any) {
      console.warn('⚠️ [FinPulse AI] Unified LLM call failed, falling back to ML indicators:', err?.message || err)
    }

    // 6. If all LLM models fail, generate a data-driven fallback text
    if (!responseText) {
      const bullOrBear = ml.trend === 'Bullish' ? '📈' : ml.trend === 'Bearish' ? '📉' : '➡️'
      responseText = `## ${bullOrBear} ML Ensemble Verdict: **${ml.trend}** (Confidence: ${ml.trendStrength}%)

> ⚠️ *Generative AI is temporarily unavailable. The analysis below is fully computed by our ML algorithms.*

### 🔍 Technical Breakdown
- **RSI (${ml.rsi.toFixed(1)})**: ${ml.rsi > 70 ? 'Overbought — watch for pullback' : ml.rsi < 30 ? 'Oversold — potential reversal zone' : 'Neutral momentum, no extreme reading'}
- **MACD Histogram (${ml.macd.histogram.toFixed(3)})**: ${ml.macd.histogram > 0 ? 'Positive — bullish momentum building' : 'Negative — bearish pressure active'}
- **ADX (${ml.adx.toFixed(1)})**: ${ml.adx > 25 ? 'Strong directional trend confirmed' : 'Weak trend — choppy price action likely'}
- **Bollinger Bands**: Price is ${currentStock?.price ? (currentStock.price > ml.bollingerBands.upper ? 'above upper band (overbought)' : currentStock.price < ml.bollingerBands.lower ? 'below lower band (oversold)' : 'within normal range') : 'within range'}

### 📈 Trade Setup
- **Entry Zone**: ₹${ml.sma20.toFixed(0)} – ₹${(ml.sma20 * 1.01).toFixed(0)}
- **Stop Loss**: ₹${(ml.support * 0.99).toFixed(0)} (1% below support)
- **Target 1**: ₹${(ml.resistance * 0.97).toFixed(0)} | **Target 2**: ₹${ml.resistance.toFixed(0)}

### ⚠️ Risk Factors
- ${ml.rsi > 65 ? 'RSI approaching overbought territory — momentum may fade' : 'RSI neutral — limited directional conviction'}
- ATR of ₹${ml.atr.toFixed(1)} indicates ${ml.atr > 50 ? 'high' : 'moderate'} daily volatility — size positions accordingly
- OBV: ${ml.signals.volumeSignal} — ${ml.signals.volumeSignal === 'Accumulation' ? 'Smart money appears to be buying' : 'Potential distribution by institutional sellers'}`
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: responseText,
        mlIndicators: ml,
        dataPoints: chartData.data.length,
        generatedAt: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('AI Stock Analysis Error:', error)
    return NextResponse.json({ success: false, error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
