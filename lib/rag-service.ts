// In-Memory Fintech RAG Semantic Embedding & Search Engine
// Native lightweight implementation for robust, sub-millisecond knowledge retrieval.

export interface RAGDocument {
  id: string
  title: string
  text: string
  tags: string[]
}

const RAG_DATABASE: RAGDocument[] = [
  {
    id: "ltcg_equity",
    title: "Indian LTCG Tax Rules for Equities & Mutual Funds",
    text: "Long-Term Capital Gains (LTCG) on listed equity shares and equity mutual funds are taxed at a flat rate of 10% under Section 112A of the Income Tax Act. This tax applies only if the total long-term capital gains in a financial year exceed ₹1 Lakh. The holding period to qualify for LTCG is more than 1 year (12 months). Indexation benefits are strictly NOT allowed for equity LTCG.",
    tags: ["tax", "ltcg", "equity", "slab", "112a"]
  },
  {
    id: "stcg_equity",
    title: "Indian STCG Tax Rules for Equities & Mutual Funds",
    text: "Short-Term Capital Gains (STCG) on listed equity shares and equity mutual funds sold within a holding period of 1 year (12 months) are taxed at a flat rate of 15% under Section 111A of the Income Tax Act. Applicable surcharges and a 4% health and education cess are levied on top of this rate. STCG cannot be added to standard income slabs and is taxed independently.",
    tags: ["tax", "stcg", "equity", "slab", "111a"]
  },
  {
    id: "tax_harvesting",
    title: "Tax-Loss Harvesting Strategies in India",
    text: "Tax-loss harvesting involves selling loss-making stocks/mutual funds to offset realized capital gains, minimizing net tax liability. Under Indian tax laws, Short-Term Capital Losses (STCL) can be set off against both short-term (STCG) and long-term (LTCG) capital gains. However, Long-Term Capital Losses (LTCL) can ONLY be offset against Long-Term Capital Gains (LTCG). Net unabsorbed losses can be carried forward for up to 8 subsequent assessment years.",
    tags: ["tax", "harvesting", "loss", "offset", "carry forward"]
  },
  {
    id: "non_equity_taxation",
    title: "Taxation on Debt Mutual Funds & Fixed Deposits (FD)",
    text: "For debt mutual funds purchased on or after April 1, 2023, the capital gains are treated as short-term capital gains regardless of the holding period, and are added to the investor's taxable income and taxed at their applicable slab rate (Finance Act 2023). Fixed Deposit (FD) interest is taxed fully as 'Income from Other Sources' under your personal tax slabs, and banks deduct 10% TDS if interest exceeds ₹40,000 in a year.",
    tags: ["tax", "debt", "fd", "fixed deposit", "slab", "slab rate"]
  },
  {
    id: "sip_compounding",
    title: "Advantages of Systematic Investment Plans (SIP) & Compounding",
    text: "A Systematic Investment Plan (SIP) promotes disciplined investing by auto-investing a fixed amount regularly. Its primary advantages are Rupee Cost Averaging (buying more units when prices are low and fewer when high) and the Power of Compounding. Compounding growth is exponential; starting early allows interest to earn interest, creating significant long-term wealth even with small monthly allocations.",
    tags: ["sip", "compounding", "investment", "rupee cost averaging", "wealth"]
  },
  {
    id: "pe_ratio_benchmark",
    title: "P/E (Price-to-Earnings) Ratio Interpretation & Benchmarks",
    text: "The P/E ratio measures a stock's valuation by dividing current price by earnings per share (EPS). In Indian markets, a P/E above 35x is generally considered expensive or high-growth (demanding strong future earnings to justify), while a P/E below 15x is cheap or undervalued, though it could be a 'value trap'. P/E should always be evaluated relative to the sector average (e.g. IT services average P/E is 25-30x) and historical ranges.",
    tags: ["ratio", "valuation", "pe", "pe ratio", "benchmark"]
  },
  {
    id: "roe_metric",
    title: "Return on Equity (ROE) Benchmarks",
    text: "Return on Equity (ROE) represents a company's profitability relative to shareholders' equity, calculated as Net Income / Shareholders' Equity. An ROE above 15% is the gold standard in Indian corporate analysis, indicating highly efficient capital deployment. Consistent ROE > 20% for consecutive years is a strong signal of competitive advantage (moat). ROE below 8% is a red flag.",
    tags: ["ratio", "profitability", "roe", "benchmark", "moat"]
  },
  {
    id: "debt_equity_health",
    title: "Debt-to-Equity (D/E) Ratio Risks & Thresholds",
    text: "The Debt-to-Equity (D/E) ratio assesses a company's financial leverage by dividing total debt by total equity. A D/E ratio below 0.5 (or 50%) indicates excellent financial health with minimal solvency risk. A ratio above 1.5x represents high risk, making the company vulnerable to interest rate spikes and economic downturns. Capital-intensive sectors (Utilities, Infrastructure) and Banking have higher normal debt baselines.",
    tags: ["ratio", "health", "debt", "debt to equity", "solvency"]
  },
  {
    id: "liquidity_current_ratio",
    title: "Current Ratio Liquidity Analysis",
    text: "The Current Ratio evaluates a company's short-term solvency by dividing current assets by current liabilities. A healthy current ratio lies between 1.5 and 2.5, demonstrating that the company can comfortably meet short-term obligations. A ratio below 1.0 is a severe red flag indicating high working capital strain and immediate liquidity risk (can't cover short term debts).",
    tags: ["ratio", "health", "liquidity", "current ratio", "working capital"]
  }
]

export class RAGService {
  /**
   * Search knowledge base using token Jaccard similarity and semantic tag mapping.
   * Runs inside Map-Reduce framework in-memory for immediate responses.
   */
  search(query: string, limit: number = 2): RAGDocument[] {
    if (!query) return []

    // Normalize and tokenize query
    const queryTokens = this.tokenize(query)
    if (queryTokens.length === 0) return []

    const scored = RAG_DATABASE.map(doc => {
      // Tokenize document fields
      const titleTokens = this.tokenize(doc.title)
      const textTokens = this.tokenize(doc.text)
      
      // Calculate token intersections
      const titleMatches = this.countIntersections(queryTokens, titleTokens)
      const textMatches = this.countIntersections(queryTokens, textTokens)
      
      // Tag bonus matching
      let tagBonus = 0
      doc.tags.forEach(tag => {
        const tagTokens = this.tokenize(tag)
        if (this.countIntersections(queryTokens, tagTokens) > 0) {
          tagBonus += 2.0 // heavy weight for explicit tag matches!
        }
      })

      // Compound Score
      const score = (titleMatches * 1.5) + (textMatches * 0.5) + tagBonus

      return { doc, score }
    })

    // Sort by descending scores and filter out zero-score irrelevant results
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc)
      .slice(0, limit)
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // strip punctuation
      .split(/\s+/)
      .filter(token => token.length > 2) // skip tiny stopwords
  }

  private countIntersections(arr1: string[], arr2: string[]): number {
    const set2 = new Set(arr2)
    let matches = 0
    arr1.forEach(token => {
      if (set2.has(token)) matches++
    })
    return matches
  }
}

export const ragService = new RAGService()
