# CryptoTracker Overhaul — Implementation Plan

Complete overhaul addressing all identified bugs, performance issues, and missing features.

## Problems Confirmed

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **Port mismatch** | Backend `.env` has `PORT=3000`, backend code defaults to `5000`, frontend `auth.js` hardcodes `http://localhost:3000` — inconsistent |
| 2 | **Direct CoinGecko calls from frontend** | `Home.jsx`, `CoinPage.jsx`, `Watchlist.jsx`, `coinList.js` all call `api.coingecko.com` directly → CORS issues + 429 rate limits |
| 3 | **Binance fetches ALL tickers** | Both `Home.jsx` and `CoinPage.jsx` fetch `api.binance.com/api/v3/ticker/24hr` (1000+ tickers) every 5 seconds |
| 4 | **4 empty stub pages** | Overview, Trending, News, Vote are all placeholder `<p>` tags |

---

## Proposed Changes

### Component 1: Backend — Cache Proxy & API Layer

All CoinGecko and Binance calls will be routed through the Express backend with MongoDB TTL caching. This eliminates CORS issues and drastically reduces rate-limit 429 errors.

#### [MODIFY] [.env](file:///Users/mananjain/Desktop/CryptoTracker/backend/.env)
- Change `PORT = 3000` → `PORT = 5000` to match the backend code default and fix the mismatch
- Add `ANTHROPIC_API_KEY` placeholder for AI agent features

#### [MODIFY] [index.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/index.js)
- Register new route modules: `coingecko`, `binance`, `vote`, `ai`
- Add error handling middleware

#### [NEW] [models/CacheEntry.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/models/CacheEntry.js)
- MongoDB schema with `key` (unique string), `data` (Mixed), `createdAt` (Date with TTL index)
- TTL index on `createdAt` with `expireAfterSeconds: 600` (10 min max, individual endpoints control freshness)

#### [NEW] [models/Vote.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/models/Vote.js)
- Schema: `coinId`, `userId`, `sentiment` (bullish/bearish), `walletAddress` (optional), `createdAt`
- Compound unique index on `coinId + userId` to prevent duplicate votes

#### [NEW] [routes/coingecko.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/routes/coingecko.js)
Proxy endpoints with MongoDB TTL caching + stale fallback on 429:
- `GET /api/coingecko/markets` — paginated coin list (60s cache)
- `GET /api/coingecko/coin/:id` — single coin details (60s cache)
- `GET /api/coingecko/coin/:id/market_chart` — price history (120s cache)
- `GET /api/coingecko/global` — global market stats (120s cache)
- `GET /api/coingecko/trending` — trending coins (300s/5min cache)
- `GET /api/coingecko/search` — search coins (60s cache)

Cache strategy: Try cache first → if stale, fetch fresh → if 429, return stale data with `X-Cache: stale` header.

#### [NEW] [routes/binance.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/routes/binance.js)
- `GET /api/binance/ticker/:symbol` — single symbol ticker (e.g., `BTCUSDT`), 10s cache
- `GET /api/binance/tickers?symbols=BTC,ETH,SOL` — batch query for specific symbols only (not all 1000+), 10s cache

#### [NEW] [routes/vote.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/routes/vote.js)
- `POST /api/vote` — cast vote (auth required, optional wallet address)
- `GET /api/vote/:coinId` — get vote tallies for a coin
- `GET /api/vote/top` — get top voted coins

#### [NEW] [routes/ai.js](file:///Users/mananjain/Desktop/CryptoTracker/backend/routes/ai.js)
- `POST /api/ai/chat` — general crypto chat (Claude-powered)
- `POST /api/ai/analyze/:coinId` — per-coin AI analysis
- `GET /api/ai/market-summary` — AI-generated market overview (cached 5min)

---

### Component 2: Frontend — API Layer Refactor

#### [MODIFY] [api/auth.js](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/api/auth.js)
- Fix `API_BASE_URL` from `http://localhost:3000/api` → `http://localhost:5000/api`

#### [NEW] [api/crypto.js](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/api/crypto.js)
- All CoinGecko calls routed through backend proxy (`/api/coingecko/*`)
- All Binance calls routed through backend proxy (`/api/binance/*`)
- Individual symbol Binance requests instead of bulk fetch
- Export functions: `getMarkets()`, `getCoinDetails()`, `getMarketChart()`, `getGlobalData()`, `getTrending()`, `getBinanceTicker()`, `getBinanceTickers()`

#### [NEW] [api/ai.js](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/api/ai.js)
- `chatWithAI()`, `analyzeCoin()`, `getMarketSummary()`

#### [NEW] [api/vote.js](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/api/vote.js)
- `castVote()`, `getVotes()`, `getTopVoted()`

---

### Component 3: Frontend Pages — Refactor Existing

#### [MODIFY] [pages/Home.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/Home.jsx)
- Replace direct CoinGecko fetch with `crypto.getMarkets()`
- Replace bulk Binance fetch with `crypto.getBinanceTickers()` for only visible coins
- Keep existing card UI, sparkline charts, and pagination

#### [MODIFY] [pages/CoinPage.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/CoinPage.jsx)
- Replace direct CoinGecko fetch with `crypto.getCoinDetails()`
- Replace bulk Binance fetch with `crypto.getBinanceTicker(symbol)` — single symbol
- Replace direct chart data fetch with `crypto.getMarketChart()`
- Add "AI Analysis" button that calls `/api/ai/analyze/:coinId`

#### [MODIFY] [pages/Watchlist.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/Watchlist.jsx)
- Replace direct CoinGecko fetch with `crypto.getCoinDetails()` for each watchlist coin

---

### Component 4: Frontend Pages — Build 4 New Pages

#### [MODIFY] [pages/Overview.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/Overview.jsx)
Full rebuild with:
- **Global stats cards** — total market cap, 24h volume, BTC dominance, active cryptos (from `/api/coingecko/global`)
- **BTC Dominance pie/donut chart** — Chart.js doughnut showing BTC/ETH/Other dominance
- **AI Market Summary** — Claude-generated market summary panel (from `/api/ai/market-summary`)
- **Top gainers/losers** — mini cards derived from markets data

#### [MODIFY] [pages/Trending.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/Trending.jsx)
Full rebuild with:
- **Trending coins grid** — from CoinGecko trending endpoint (`/api/coingecko/trending`)
- Each card shows: coin icon, name, symbol, market cap rank, price in BTC, 24h sparkline
- **Search/filter bar** at top
- Premium card design with glassmorphism consistent with Home page

#### [MODIFY] [pages/News.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/News.jsx)
Full rebuild with:
- **Curated news feed** — aggregated from CoinGecko status updates and trending data
- **AI Insights panel** — Claude-generated commentary on current market trends
- Cards with title, summary, source, timestamp, and sentiment indicator
- Category filters (DeFi, NFT, Layer 1, Meme coins, etc.)

#### [MODIFY] [pages/Vote.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/pages/Vote.jsx)
Full rebuild with:
- **Community sentiment voting** — bullish/bearish vote per coin
- **MetaMask wallet connect** — native `window.ethereum` integration (no extra library)
  - Connect wallet button
  - Display connected wallet address
  - Wallet-gated voting (optional — users can vote with login OR wallet)
- **Top voted coins leaderboard** — ranked by community sentiment
- **Vote results visualization** — bullish vs bearish bar charts per coin

---

### Component 5: AI Chat Agent (Floating Widget)

#### [NEW] [components/AIChatWidget.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/components/AIChatWidget.jsx)
- Floating chat button (bottom-right corner) that expands into a chat panel
- Claude-powered conversational AI about crypto markets
- Message history within session
- Typing indicator animation
- Can ask about any coin, market trends, portfolio advice
- Glassmorphism design consistent with app theme

#### [MODIFY] [App.jsx](file:///Users/mananjain/Desktop/CryptoTracker/frontend/src/App.jsx)
- Add `<AIChatWidget />` globally (visible on all pages)

---

## User Review Required

> [!IMPORTANT]
> **Anthropic API Key**: The AI Agent features (chat, per-coin analysis, market summary) require a Claude API key. You'll need to add `ANTHROPIC_API_KEY=sk-ant-...` to `backend/.env`. Without this key, AI features will gracefully degrade and show placeholder messages.

> [!IMPORTANT]
> **MongoDB**: The cache proxy and vote system use your existing MongoDB connection. No additional database setup is needed — new collections will be auto-created.

> [!WARNING]
> **MetaMask on Vote page**: This uses the native `window.ethereum` provider. It will only work if the user has MetaMask (or another EVM wallet) browser extension installed. A graceful fallback message is shown if no wallet is detected.

## Open Questions

1. **News data source**: CoinGecko's free API doesn't have a dedicated news endpoint. I'll use trending data + status updates to construct a news-like feed, supplemented with AI-generated insights. Is this acceptable, or do you have a specific news API key (e.g., CryptoPanic, NewsAPI)?

2. **AI model**: I'll use `claude-sonnet-4-20250514` for the chat agent (good balance of speed + quality). Should I use a different model?

3. **Rate limiting on your own backend**: Should I add rate limiting middleware to prevent abuse of your proxy endpoints?

---

## Verification Plan

### Automated Tests
- Start backend with `npm run dev` in `/backend`
- Start frontend with `npm run dev` in `/frontend`
- Test each proxy endpoint manually via browser/curl
- Verify MongoDB cache entries are created with correct TTL
- Verify Binance calls are per-symbol (not bulk)
- Verify all 4 pages render with real data

### Manual Verification
- Open browser, navigate through all pages
- Check Network tab — no direct CoinGecko/Binance calls from frontend
- Test MetaMask connect on Vote page
- Test AI chat widget
- Verify 429 stale fallback by rate-limiting the backend
