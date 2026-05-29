import { supabase } from "./supabase"
import type { Article } from "@/types/articles"

// Default high-quality educational modules (fallback if database table is not seeded)
const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    "Module Name": "Introduction to Stock Markets",
    "No. of Chapters": 15,
    "Description": "The stock market can play a pivotal role in ensuring your financial security. In this module, you will learn how to get started in the stock market, its fundamentals, how it functions, and the various intermediaries.",
    "PDF Link": "https://zerodha.com/varsity/module/introduction-to-stock-markets/"
  },
  {
    id: 2,
    "Module Name": "Technical Analysis",
    "No. of Chapters": 22,
    "Description": "Technical Analysis (TA) helps in developing a point of view. In this module, we will discover the complex attributes, various patterns, indicators, and theories of TA that will help you as a trader to find upright trading opportunities.",
    "PDF Link": "https://zerodha.com/varsity/module/technical-analysis/"
  },
  {
    id: 3,
    "Module Name": "Fundamental Analysis",
    "No. of Chapters": 16,
    "Description": "The Fundamental Analysis (FA) module explores Equity research by reading financial statements and annual reports, calculating and analyzing Financial Ratios, and evaluating the intrinsic value of a stock to find long-term investing opportunities.",
    "PDF Link": "https://zerodha.com/varsity/module/fundamental-analysis/"
  },
  {
    id: 4,
    "Module Name": "Futures Trading",
    "No. of Chapters": 13,
    "Description": "Futures trading allows you to leverage your positions and hedge your equity portfolio. This module covers margins, pricing mechanisms, leverage, and basic to advanced trading strategies using futures contracts.",
    "PDF Link": "https://zerodha.com/varsity/module/futures-trading/"
  },
  {
    id: 5,
    "Module Name": "Options Theory for Professional Trading",
    "No. of Chapters": 25,
    "Description": "Options are powerful instruments to generate income and hedge risks. In this module, we cover option Greeks, options pricing theory, and how to analyze options chains and volatility.",
    "PDF Link": "https://zerodha.com/varsity/module/options-theory-for-professional-trading/"
  },
  {
    id: 6,
    "Module Name": "Personal Finance & Wealth Management",
    "No. of Chapters": 10,
    "Description": "Personal finance is the cornerstone of wealth creation. Learn about budgeting, building emergency funds, selection of health/life insurance, tax planning (80C/80D), and asset allocation strategies for financial freedom.",
    "PDF Link": "https://zerodha.com/varsity/module/personal-finance/"
  }
]

// Get all articles (server-side)
export async function getArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase.from("articles").select("*")

    if (error) {
      console.warn("⚠️ [FinPulse Articles] Table not found or failed to fetch, using high-fidelity local fallbacks:", error.message)
      return FALLBACK_ARTICLES
    }

    return data && data.length > 0 ? data : FALLBACK_ARTICLES
  } catch (error: any) {
    console.warn("⚠️ [FinPulse Articles] Exception fetching articles, using local fallbacks:", error.message)
    return FALLBACK_ARTICLES
  }
}

// Get single article by ID
export async function getArticleById(id: number): Promise<Article | null> {
  try {
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single()

    if (error) {
      const fallback = FALLBACK_ARTICLES.find(a => a.id === id)
      if (fallback) return fallback
      
      console.warn("⚠️ [FinPulse Articles] Failed to get article, fallback not found:", error.message)
      return null
    }

    return data
  } catch (error: any) {
    const fallback = FALLBACK_ARTICLES.find(a => a.id === id)
    if (fallback) return fallback
    
    console.warn("⚠️ [FinPulse Articles] Exception in getArticleById:", error.message)
    return null
  }
}
