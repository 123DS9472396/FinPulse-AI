import { NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-api"
import { analyzeTechnicalIndicators } from "@/lib/ml-analysis"
import { trainAndForecast } from "@/lib/ml-forecaster"

// n8n / SaaS workflow automation webhook triggers
// Secure, standard POST endpoints for executing financial logic triggers.
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { action, symbol = "RELIANCE", data = {} } = payload

    if (!action) {
      return NextResponse.json({ success: false, error: "Action parameter is required." }, { status: 400 })
    }

    switch (action) {
      case "daily_summary": {
        const summary = await marketDataService.getMarketSummary()
        const alertTriggered = summary.niftyChange <= -1.0 || summary.niftyChange >= 1.0

        return NextResponse.json({
          success: true,
          trigger: "daily_market_briefing",
          timestamp: new Date().toISOString(),
          n8n_metadata: {
            alert_state: alertTriggered ? "active" : "nominal",
            severity: alertTriggered ? "warning" : "info",
            event_type: "market_close_report"
          },
          data: {
            indices: {
              nifty: { price: summary.nifty50, change: summary.niftyChange },
              sensex: { price: summary.sensex, change: summary.sensexChange },
              niftyBank: { price: summary.niftyBank, change: summary.niftyBankChange }
            },
            market_sentiment: summary.niftyChange >= 0.5 ? "BULLISH" : summary.niftyChange <= -0.5 ? "BEARISH" : "CONSOLIDATING",
            top_gainer: summary.topGainers?.[0] || null,
            top_loser: summary.topLosers?.[0] || null
          }
        })
      }

      case "price_signal": {
        // Fetch 6-month history for indicator calculations
        const chartData = await marketDataService.getChartData(symbol, "6mo")
        if (!chartData || chartData.data.length < 20) {
          return NextResponse.json({ success: false, error: "Insufficient historical data for symbol." }, { status: 400 })
        }

        const ml = analyzeTechnicalIndicators(chartData)
        const forecast = trainAndForecast(symbol, chartData.data.map(d => d.close))
        
        // Trigger alerts on high momentum breakouts
        const triggerBreakout = ml.rsi > 70 || ml.rsi < 30 || ml.trendStrength >= 75

        return NextResponse.json({
          success: true,
          trigger: "technical_price_signal",
          symbol,
          timestamp: new Date().toISOString(),
          n8n_metadata: {
            alert_state: triggerBreakout ? "active" : "nominal",
            severity: triggerBreakout ? "warning" : "info",
            event_type: "trend_alert"
          },
          data: {
            current_price: forecast.currentPrice,
            verdict: ml.trend,
            confidence: ml.trendStrength,
            oscillator_state: ml.rsi > 70 ? "OVERBOUGHT" : ml.rsi < 30 ? "OVERSOLD" : "NEUTRAL",
            rsi: ml.rsi,
            levels: { support: ml.support, resistance: ml.resistance },
            forecast: {
              signal: forecast.signal,
              confidence: forecast.confidence,
              predictions_5d: forecast.predictions
            }
          }
        })
      }

      case "tax_alerts": {
        const holdings = data.holdings || []
        const taxSavingsTriggers: any[] = []

        holdings.forEach((h: any) => {
          const buyDate = new Date(h.purchaseDate)
          const diffTime = Math.abs(new Date().getTime() - buyDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          // Flag items approaching LTCG tax boundary (365 days)
          if (diffDays >= 330 && diffDays < 365) {
            taxSavingsTriggers.push({
              symbol: h.symbol,
              holdingDays: diffDays,
              daysRemaining: 365 - diffDays,
              potentialSavingsPercent: 5.0, // STCG 15% vs LTCG 10%
              advice: `Hold ${h.symbol} for ${365 - diffDays} more days to qualify for 10% LTCG instead of 15% STCG.`
            })
          }
        })

        return NextResponse.json({
          success: true,
          trigger: "ltcg_tax_optimizer",
          timestamp: new Date().toISOString(),
          n8n_metadata: {
            alert_state: taxSavingsTriggers.length > 0 ? "active" : "nominal",
            severity: "info",
            event_type: "tax_planning_reminder"
          },
          data: {
            optimization_opportunities: taxSavingsTriggers.length,
            actions_required: taxSavingsTriggers
          }
        })
      }

      default:
        return NextResponse.json({ success: false, error: `Action '${action}' is not supported by n8n automations.` }, { status: 400 })
    }
  } catch (error: any) {
    console.error("❌ [FinPulse AI n8n Webhook] Automation webhook failed:", error)
    return NextResponse.json({ success: false, error: error?.message || "Webhook execution failed" }, { status: 500 })
  }
}
