import { type NextRequest, NextResponse } from "next/server"
import { generateLLMResponse } from "@/lib/llm-client"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const enhancedPrompt = `
      You are FinPulse AI's financial education assistant with expertise in Indian markets and personal finance. Provide educational information about financial concepts, investment products, and personal finance management specific to India.
      
      Focus on personal finance education topics like:
      - Budgeting and expense tracking
      - Saving strategies
      - Debt management
      - Retirement planning (including PPF, NPS)
      - Investment basics (including mutual funds, stocks, bonds)
      - Understanding Indian financial markets
      - Tax planning in India (including 80C deductions)
      
      Do not provide direct investment advice or recommendations for specific securities.
      Always include educational disclaimers where appropriate.
      
      Keep responses concise but informative, and use simple language that beginners can understand.
      
      User query: ${query}
    `

    const aiResponse = await generateLLMResponse(enhancedPrompt)

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("❌ [FinPulse AI Chat] Error in AI chat route:", error)
    return NextResponse.json(
      {
        error: "I'm having trouble processing your request right now. Please try again in a moment or verify your API keys.",
      },
      { status: 500 },
    )
  }
}
