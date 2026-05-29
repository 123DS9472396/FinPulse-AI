"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, X, Send, Bot, User, TrendingUp, Shield, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  { icon: <TrendingUp className="h-3 w-3" />, text: "Analyse my portfolio risk" },
  { icon: <Shield className="h-3 w-3" />, text: "Explain LTCG tax in simple terms" },
  { icon: <BookOpen className="h-3 w-3" />, text: "Is it a good time to invest in IT stocks?" },
  { icon: <Clock className="h-3 w-3" />, text: "What is SIP and how does it work?" },
]

export function PortfolioCoach() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "👋 Hi! I'm your FinPulse AI Coach, powered by Groq (Llama 3 70B).\n\nI can help you with portfolio analysis, Indian stock market insights, tax optimization (LTCG/STCG), and investment strategies.\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [open, messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const question = text.trim()
    setInput("")

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "portfolio_advice",
          data: {
            riskTolerance: "moderate",
            investmentGoal: "wealth creation",
            horizon: "long term",
            holdings: [],
          },
          question,
        }),
      })
      const json = await res.json()
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: json.answer || "I apologize — I couldn't process that. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ai",
          content: "Network error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 ${
          open
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-white"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/40"
        } hover:scale-105 active:scale-95`}
        aria-label="Open AI Coach"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold">AI Coach</span>
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-20 right-6 z-50 w-[360px] max-h-[560px] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 border border-white/10 transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        style={{ background: "rgba(10,5,25,0.95)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-purple-900/60 to-pink-900/40 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">FinPulse AI Coach</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/50">Groq · Llama 3 70B</span>
              </div>
            </div>
            <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">Free</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: "340px" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10"
              }`}>
                {msg.role === "user" ? <User className="h-3.5 w-3.5 text-white" /> : <Sparkles className="h-3.5 w-3.5 text-purple-300" />}
              </div>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-sm"
                  : "bg-white/5 border border-white/8 text-white/90 rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              </div>
              <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-white/90 transition-all"
              >
                {s.icon}{s.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-white/10 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask anything about investing..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            size="icon"
            className="shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
