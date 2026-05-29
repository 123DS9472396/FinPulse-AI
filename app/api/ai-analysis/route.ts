import { NextRequest, NextResponse } from 'next/server'
import { generateLLMResponse } from '@/lib/llm-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, symbol } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log(`🤖 Generating AI analysis for ${symbol}...`)

    const text = await generateLLMResponse(prompt)

    console.log('✅ AI Analysis generated:', text.length, 'characters')

    // Try to parse as JSON, fallback to structured response
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      // If not valid JSON, create structured response
      analysis = parseTextResponse(text, symbol)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('AI Analysis API error:', error)
    
    // Return fallback analysis
    return NextResponse.json({
      sentiment: 'Neutral',
      score: 50,
      strengths: ['Analyzing market position', 'Reviewing fundamentals'],
      weaknesses: ['Market uncertainty', 'Economic factors'],
      priceTargets: {
        conservative: 'Under analysis',
        optimistic: 'Under analysis'
      },
      risks: ['Market volatility', 'Sector-specific risks'],
      recommendation: 'HOLD',
      timeHorizon: '3-6 months',
      note: 'AI analysis temporarily unavailable, showing basic assessment'
    })
  }
}

function parseTextResponse(text: string, symbol: string) {
  // Extract key information from text response
  const lines = text.split('\n').filter(line => line.trim())
  
  let sentiment = 'Neutral'
  let recommendation = 'HOLD'
  let score = 50
  
  // Simple text analysis
  const bullishWords = ['bullish', 'buy', 'positive', 'strong', 'growth']
  const bearishWords = ['bearish', 'sell', 'negative', 'weak', 'decline']
  
  const textLower = text.toLowerCase()
  const bullishCount = bullishWords.filter(word => textLower.includes(word)).length
  const bearishCount = bearishWords.filter(word => textLower.includes(word)).length
  
  if (bullishCount > bearishCount) {
    sentiment = 'Bullish'
    recommendation = 'BUY'
    score = 70
  } else if (bearishCount > bullishCount) {
    sentiment = 'Bearish'
    recommendation = 'SELL'
    score = 30
  }

  return {
    sentiment,
    score,
    strengths: extractSection(text, ['strength', 'positive', 'advantage']),
    weaknesses: extractSection(text, ['weakness', 'negative', 'risk', 'concern']),
    priceTargets: {
      conservative: 'Analysis in progress',
      optimistic: 'Analysis in progress'
    },
    risks: extractSection(text, ['risk', 'threat', 'challenge']),
    recommendation,
    timeHorizon: extractTimeHorizon(text),
    analysis: text.substring(0, 500) + (text.length > 500 ? '...' : '')
  }
}

function extractSection(text: string, keywords: string[]) {
  const sentences = text.split('.').filter(s => s.trim())
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.toLowerCase().includes(keyword))
  )
  
  return relevantSentences.slice(0, 3).map(s => s.trim()) || ['Analysis in progress']
}

function extractTimeHorizon(text: string) {
  const timePatterns = [
    /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:months?|years?)/i,
    /(?:short|near)\s*term/i,
    /(?:medium|mid)\s*term/i, 
    /(?:long|extended)\s*term/i
  ]
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  
  return '6-12 months'
}
