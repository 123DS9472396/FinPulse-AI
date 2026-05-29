# FinPulse AI — Advanced AI-Powered Financial Assistant & Trading Analytics

FinPulse AI is a privacy-first, state-of-the-art GenAI and machine learning-powered financial platform. It empowers retail investors with high-fidelity market indicators, dynamic double-exponential forecasting trend models, an omnichannel simulated Options Trading Terminal, and an expert semantic RAG-powered Financial Coach.

---

## 🚀 Key Architectural Features

### 📊 Professional TradingView-style Charting
- **13 Interactive Style Toggles**: Seamlessly switch between Bars, Candles, Hollow Candles, Columns, Line, Area, Baseline, High-Low, Heikin Ashi, Renko, Line Break, Kagi, and Point & Figure views.
- **Client-Side Calculations**: High-fidelity mathematical transformations (e.g. Heikin Ashi smoothing, Renko brick grouping, baseline standard deviation offsets) run instantly on the client side.
- **Synchronized Volume Analysis**: Volume histogram bars at the bottom are color-matched to the corresponding price candle closes.

### ⚡ Groww-style Segmented Technical Gauge & Indicators Grid
- **Segmented Verdict Bar**: Displays the aggregated market momentum on a 20-segment color gradient gauge with an active pointer.
- **Quant Metrics Table**: Aggregates real-time calculations from a 9-indicator ensemble (RSI (14), MACD, Stochastic %K, ATR, ADX, SMA 20, SMA 50).
- **Direct Trading Bindings**: Dedicated SIP Setup, Sell, and Buy actions bound straight to the page's transaction dialogs.

### 🧠 Semantic Vector RAG AI Coach & Explainers
- **In-Memory Semantic Search**: An advanced Jaccard & cosine similarity vector RAG engine delivering certified guidelines on Indian Capital Gains Tax (LTCG Section 112A, STCG flat 15%), tax harvesting, and indicator thresholds.
- **Omnipresent AI Coach**: Floating slide-up coach widget powered by Groq and Llama 3 70B for immediate tax advisory, portfolio risk analysis, and market strategies.

### 📈 Predictive ML Holt-Linear Forecaster
- **Double Exponential Smoothing**: Quantitative models fitting trend lines to forecast 5-day boundaries (price channel targets and MAE bounds).
- **Ensemble Hybridization**: Quantitative forecasts are injected directly into Gemini qualitative reports, creating a coordinated model outlook.

### ⚙️ Automation & Webhooks
- **n8n Workflow Integration**: Direct API trigger endpoints (`/api/automation/n8n`) ready to plug into daily briefs, tax warnings, or momentum breakout discord alert systems.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, CSS Variables, Glassmorphism Cards
- **Charting**: Lightweight-Charts (Financial Trading View Engine)
- **Database / Auth**: Supabase, PostgreSQL
- **LLM Engine**: Groq (Llama 3 70B), Gemini Pro (Google GenAI)
- **RAG & ML**: Holt-Linear Smoothing, Keyword Token-Overlap Vectors

---

## 📦 Local Setup Instructions

A new developer can clone and run this project in under 2 minutes:

### 1. Clone the repository
```bash
git clone https://github.com/123DS9472396/FinPulse-AI.git
cd FinPulse-AI
```

### 2. Configure Environment Variables
Copy the environment variables template and configure your API credentials:
```bash
cp .env.example .env.local
```
Edit `.env.local` to insert your Supabase, Gemini, Groq, Finnhub, and Alpha Vantage keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-google-gemini-key
GROQ_API_KEY=your-groq-key
FINNHUB_API_KEY=your-finnhub-news-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard, discover tab, and individual stock details page!

---

## 🤝 Contributing & License
Distributed under the MIT License. Feel free to open issues or submit pull requests.
