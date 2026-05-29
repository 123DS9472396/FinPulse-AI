import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Unified LLM helper that cascades between:
 * 1. Google Gemini SDK (if GEMINI_API_KEY is present)
 * 2. Raw Gemini API fetch (as fallback)
 * 3. OpenRouter Free API (if OPENROUTER_API_KEY is present)
 * 
 * Supports both standard and system prompts.
 */
export async function generateLLMResponse(prompt: string, systemPrompt?: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const openRouterKey = process.env.OPENROUTER_API_KEY

  // 1. Try Groq first (lightning fast, free, high rate limits)
  if (groqKey) {
    try {
      console.log('🤖 [FinPulse LLM] Attempting generation with Groq Llama 3.3...')
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const text = json.choices?.[0]?.message?.content
        if (text && text.trim()) {
          console.log('✅ [FinPulse LLM] Successful response using Groq (llama-3.3-70b-versatile)')
          return text
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        console.warn(`⚠️ [FinPulse LLM] Groq returned status ${res.status}:`, errJson)
      }
    } catch (err: any) {
      console.warn('⚠️ [FinPulse LLM] Groq generation failed:', err?.message || err)
    }
  }

  // 2. Try Gemini SDK first if key is present and not 'demo'
  if (geminiKey && geminiKey !== 'demo') {
    try {
      console.log('🤖 [FinPulse LLM] Attempting generation with Gemini SDK...')
      const genAI = new GoogleGenerativeAI(geminiKey)
      const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
      
      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            ...(systemPrompt ? { systemInstruction: systemPrompt } : {})
          })
          const result = await model.generateContent(prompt)
          const text = result.response.text()
          if (text && text.trim()) {
            console.log(`✅ [FinPulse LLM] Successful response using Gemini model: ${modelName}`)
            return text
          }
        } catch (err: any) {
          console.warn(`⚠️ [FinPulse LLM] Gemini SDK model ${modelName} failed:`, err?.message || err)
        }
      }
    } catch (e: any) {
      console.error('❌ [FinPulse LLM] Gemini SDK initialization failed:', e.message)
    }

    // Fallback: Direct raw HTTP fetch for Gemini
    try {
      console.log('🤖 [FinPulse LLM] Attempting raw fetch for Gemini API...')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...(systemPrompt ? [{ role: 'system', parts: [{ text: systemPrompt }] }] : []),
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      })
      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text && text.trim()) {
          console.log('✅ [FinPulse LLM] Successful response via Gemini raw HTTP fetch.')
          return text
        }
      }
    } catch (e: any) {
      console.error('❌ [FinPulse LLM] Gemini raw fetch failed:', e.message)
    }
  }

  // 3. Try OpenRouter if key is present (Perfect for Free LLM keys!)
  if (openRouterKey) {
    try {
      console.log('🤖 [FinPulse LLM] Attempting generation with OpenRouter...')
      const models = [
        'google/gemini-2.5-flash',
        'google/gemini-2.5-pro',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-chat:free',
        'meta-llama/llama-3.2-3b-instruct:free'
      ]

      for (const modelName of models) {
        try {
          console.log(`🤖 [FinPulse LLM] Trying OpenRouter model: ${modelName}...`)
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://finpulse.ai',
              'X-Title': 'FinPulse AI'
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt }
              ],
              max_tokens: 1000 // EXTREMELY IMPORTANT: Limits credits reservation to prevent 402 errors!
            })
          })

          if (response.ok) {
            const data = await response.json()
            const text = data.choices?.[0]?.message?.content
            if (text && text.trim()) {
              console.log(`✅ [FinPulse LLM] Successful response with OpenRouter model: ${modelName}`)
              return text
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.warn(`⚠️ [FinPulse LLM] OpenRouter ${modelName} returned status ${response.status}:`, errorData)
          }
        } catch (err: any) {
          console.warn(`⚠️ [FinPulse LLM] OpenRouter model ${modelName} failed:`, err?.message || err)
        }
      }
    } catch (e: any) {
      console.error('❌ [FinPulse LLM] OpenRouter integration failed:', e.message)
    }
  }

  throw new Error('All configured AI LLM providers failed or no API keys are present. Please check your GROQ_API_KEY, GEMINI_API_KEY or OPENROUTER_API_KEY in your .env.local file.')
}
