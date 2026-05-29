import { NextResponse } from "next/server"
import { generateLLMResponse } from "@/lib/llm-client"
import { ragService } from "@/lib/rag-service"

export async function POST(request: Request) {
  try {
    const { type, data, question } = await request.json()

    // Query RAG database for matching knowledge snippets to ground the answer in verified fintech rules
    let ragContext = ""
    if (question && (type === "portfolio_advice" || type === "default" || !type)) {
      const searchResults = ragService.search(question, 2)
      if (searchResults.length > 0) {
        ragContext = "\nRELEVANT VERIFIED FINTECH LAWS & METRICS SNIPPETS:\n" + 
          searchResults.map((r, i) => `[Snippet ${i + 1}] ${r.text}`).join("\n") + "\n"
      }
    }

    const prompt = buildPrompt(type, data, question, ragContext)

    // Route through our unified cascading LLM client
    const answer = await generateLLMResponse(prompt)

    return NextResponse.json({ success: true, answer })
  } catch (error: any) {
    console.error("❌ [FinPulse AI Explain] Error in explain route:", error)
    return NextResponse.json({ success: false, error: error?.message || "AI explain failed" }, { status: 500 })
  }
}

function buildPrompt(type: string, data: any, question?: string, ragContext?: string): string {
  const baseContext = `You are FinPulse AI, an expert Indian financial analyst. 
Give concise, plain-English explanations for retail investors. 
Use ₹ for currency. Be specific with numbers. Max 3 sentences unless asked for more.`

  switch (type) {
    case "metric":
      return `${baseContext}
Explain this financial metric for ${data.symbol} (${data.name}):
Metric: ${data.metric}
Value: ${data.value}
Industry context: ${data.industryAvg ? `Industry average is ${data.industryAvg}` : "Not available"}
Company sector: ${data.sector}

Explain what this means for a retail investor in simple terms.`

    case "redflags":
      return `${baseContext}
Analyze these red flags found in ${data.symbol} (${data.name}):
Red Flags: ${JSON.stringify(data.flags)}
Risk Score: ${data.riskScore}/100

Give a 2-3 sentence risk assessment and what the investor should watch out for.`

    case "portfolio_advice":
      return `${baseContext}${ragContext ? `\nUse these verified tax laws/metrics guidelines to answer the question:\n${ragContext}` : ""}
User's portfolio:
- Holdings: ${JSON.stringify(data?.holdings || [])}
- Risk tolerance: ${data?.riskTolerance || "moderate"}
- Investment goal: ${data?.investmentGoal || "wealth growth"}
- Time horizon: ${data?.horizon || "medium term"}

Question: ${question || "Give me a portfolio health assessment and one specific recommendation."}

Be specific with stock names and percentages. Give actionable advice.`

    case "stock_comparison":
      return `${baseContext}
Compare these stocks for a ${data.riskProfile} investor:
${JSON.stringify(data.stocks, null, 2)}

User question: ${question || "Which is the better investment and why?"}

Give a clear recommendation with reasoning in 3-4 sentences.`

    case "annual_report":
      return `${baseContext}
Analyze this section from ${data.company}'s annual report:
"${data.text}"

Question: ${question || "What are the 3 most important things an investor should know from this?"}

Be specific and highlight any risks or opportunities.`

    case "market_briefing":
      return `${baseContext}
Generate a morning market briefing for Indian retail investors based on:
- NIFTY 50: ${data.nifty} (${data.niftyChange}%)
- SENSEX: ${data.sensex} (${data.sensexChange}%)
- US Markets (previous close): ${data.usMarkets}
- Dollar/Rupee: ${data.dollarRupee}
- FII Activity: ${data.fiiActivity}

Write a 4-5 sentence briefing about what to expect today and which sectors to watch.`

    case "screener_results":
      return `${baseContext}
A user searched for stocks with this query: "${question}"
These are the matching stocks: ${JSON.stringify(data.results)}

Summarize the results in 2-3 sentences: which stands out and why.`

    case "news_impact":
      return `${baseContext}
This news article about ${data.symbol}:
"${data.headline}: ${data.summary}"

The user holds ${data.holdingPercent}% of their portfolio in this stock.
Sentiment analysis: ${data.sentiment}

In 2 sentences: what does this news mean for their holding?`

    default:
      return `${baseContext}${ragContext ? `\nUse these verified tax laws/metrics guidelines to answer the question:\n${ragContext}` : ""}
User question about Indian stock market: ${question}
Context: ${JSON.stringify(data || {})}
Answer in 2-3 sentences.`
  }
}

async function tryGroq(prompt: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) return null

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",  // Best free model on Groq
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!res.ok) return null
    const json = await res.json()
    return json.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

async function tryGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    )

    if (!res.ok) return null
    const json = await res.json()
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}
