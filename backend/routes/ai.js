const express = require('express');
const CacheEntry = require('../models/CacheEntry');

const router = express.Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.9
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', response.status, errorData);
    
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

/**
 * @route   POST /api/ai/chat
 * @desc    General crypto chat powered by Gemini
 * @access  Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const prompt = `You are CryptoGaze AI, an expert cryptocurrency market assistant. You help users understand crypto markets, explain concepts, analyze trends, and provide educational insights.

IMPORTANT: You do NOT provide financial advice. Always remind users to do their own research (DYOR).

${context ? `Context: ${context}\n` : ''}
User: ${message}

Respond concisely and helpfully. Use markdown formatting for readability. Keep responses under 300 words.`;

    const reply = await callGemini(prompt);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('AI chat error:', error.message);
    const fallback = error.message === 'RATE_LIMITED'
      ? "I'm currently rate-limited. Please try again in about 30 seconds! 🤖"
      : "I'm having trouble connecting right now. Please try again in a moment! 🤖";
    res.json({ success: true, reply: fallback });
  }
});

/**
 * @route   POST /api/ai/analyze/:coinId
 * @desc    AI analysis for a specific coin
 * @access  Public
 */
router.post('/analyze/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const { coinData } = req.body;

    let dataContext = '';
    if (coinData) {
      dataContext = `
Current Price: $${coinData.price}
24h Change: ${coinData.change24h}%
Market Cap: $${coinData.marketCap}
Volume: $${coinData.volume}
Market Cap Rank: #${coinData.rank}
ATH: $${coinData.ath}
ATL: $${coinData.atl}`;
    }

    const prompt = `You are CryptoGaze AI, an expert cryptocurrency analyst. Analyze the following coin:

Coin: ${coinId}
${dataContext}

Provide a brief but insightful analysis covering:
1. **Current Status**: Brief assessment of price action
2. **Key Metrics**: Notable observations about the data
3. **Market Context**: How this fits in the broader market
4. **Risk Factors**: Key risks to be aware of

IMPORTANT: This is NOT financial advice. This is educational analysis only.

Keep the response concise (under 250 words). Use markdown formatting.`;

    const reply = await callGemini(prompt);
    res.json({ success: true, analysis: reply, coinId });
  } catch (error) {
    console.error('AI analyze error:', error.message);
    const fallback = error.message === 'RATE_LIMITED'
      ? `Rate limited — please try the analysis for ${req.params.coinId} again in about 30 seconds.`
      : `Unable to generate analysis for ${req.params.coinId} right now. Please try again later.`;
    res.json({ success: true, analysis: fallback, coinId: req.params.coinId });
  }
});

/**
 * @route   GET /api/ai/market-summary
 * @desc    AI-generated market overview (cached 5 min)
 * @access  Public
 */
router.get('/market-summary', async (req, res) => {
  try {
    const cacheKey = 'ai:market-summary';
    
    try {
      const cached = await CacheEntry.findOne({ key: cacheKey });
      if (cached && (Date.now() - cached.createdAt.getTime() < 300000)) {
        res.set('X-Cache', 'cache');
        return res.json({ success: true, summary: cached.data, cached: true });
      }
    } catch (e) {
      // MongoDB not connected yet — skip cache
    }

    // Fetch global data for context
    let globalContext = '';
    try {
      const axios = require('axios');
      const globalRes = await axios.get('https://api.coingecko.com/api/v3/global', { timeout: 5000 });
      const g = globalRes.data.data;
      globalContext = `
Total Market Cap: $${(g.total_market_cap.usd / 1e12).toFixed(2)} trillion
24h Volume: $${(g.total_volume.usd / 1e9).toFixed(2)} billion
BTC Dominance: ${g.market_cap_percentage.btc.toFixed(1)}%
ETH Dominance: ${g.market_cap_percentage.eth.toFixed(1)}%
Active Cryptocurrencies: ${g.active_cryptocurrencies}
Market Cap Change 24h: ${g.market_cap_change_percentage_24h_usd.toFixed(2)}%`;
    } catch (e) {
      globalContext = 'Global market data unavailable.';
    }

    const prompt = `You are CryptoGaze AI, a crypto market analyst. Generate a brief daily market summary based on this data:

${globalContext}

Write a concise, engaging market summary (under 200 words) that:
1. Summarizes the current market state
2. Highlights notable trends
3. Provides context on BTC dominance and market sentiment

Use markdown formatting. Be professional but conversational. Do NOT provide financial advice.`;

    const summary = await callGemini(prompt);

    try {
      await CacheEntry.findOneAndUpdate(
        { key: cacheKey },
        { key: cacheKey, data: summary, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (e) {
      // MongoDB not connected — skip caching
    }

    res.json({ success: true, summary, cached: false });
  } catch (error) {
    console.error('AI market summary error:', error.message);
    const fallback = error.message === 'RATE_LIMITED'
      ? "📊 Market summary is temporarily rate-limited. Please try again in about 30 seconds!"
      : "Market summary is temporarily unavailable. Check back shortly! 📊";
    res.json({ success: true, summary: fallback, cached: false });
  }
});

module.exports = router;
