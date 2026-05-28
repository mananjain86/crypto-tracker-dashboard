const express = require('express');
const axios = require('axios');
const CacheEntry = require('../models/CacheEntry');
const mongoose = require('mongoose');

const router = express.Router();

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Check if MongoDB is connected
 */
function isDBReady() {
  return mongoose.connection.readyState === 1;
}

/**
 * Generic cache-first fetcher with stale fallback on 429
 */
async function cachedFetch(cacheKey, url, maxAgeSeconds = 60) {
  try {
    // Check cache first (only if DB is ready)
    if (isDBReady()) {
      const cached = await CacheEntry.findOne({ key: cacheKey });
      if (cached) {
        const ageMs = Date.now() - cached.createdAt.getTime();
        if (ageMs < maxAgeSeconds * 1000) {
          return { data: cached.data, source: 'cache' };
        }
      }
    }

    // Fetch fresh data
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });

    // Update cache (upsert) — only if DB is ready
    if (isDBReady()) {
      try {
        await CacheEntry.findOneAndUpdate(
          { key: cacheKey },
          { key: cacheKey, data: response.data, createdAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (e) {
        // Cache write failed, not critical
      }
    }

    return { data: response.data, source: 'fresh' };
  } catch (error) {
    // On 429 or network error, return stale cache if available
    if (isDBReady() && (error.response?.status === 429 || error.code === 'ECONNABORTED')) {
      const stale = await CacheEntry.findOne({ key: cacheKey });
      if (stale) {
        return { data: stale.data, source: 'stale' };
      }
    }
    throw error;
  }
}

/**
 * @route   GET /api/coingecko/markets
 * @desc    Paginated coin list (proxied + cached)
 */
router.get('/markets', async (req, res) => {
  try {
    const { vs_currency = 'usd', order = 'market_cap_desc', per_page = 32, page = 1, sparkline = 'true' } = req.query;
    const url = `${COINGECKO_BASE}/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}`;
    const cacheKey = `markets:${vs_currency}:${order}:${per_page}:${page}:${sparkline}`;

    const result = await cachedFetch(cacheKey, url, 60);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko markets error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch markets data' });
  }
});

/**
 * @route   GET /api/coingecko/coin/:id
 * @desc    Single coin details (proxied + cached)
 */
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${COINGECKO_BASE}/coins/${id}`;
    const cacheKey = `coin:${id}`;

    const result = await cachedFetch(cacheKey, url, 60);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko coin error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch coin data' });
  }
});

/**
 * @route   GET /api/coingecko/coin/:id/market_chart
 * @desc    Price history chart data (proxied + cached)
 */
router.get('/coin/:id/market_chart', async (req, res) => {
  try {
    const { id } = req.params;
    const { vs_currency = 'usd', days = 1 } = req.query;
    const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=${vs_currency}&days=${days}`;
    const cacheKey = `chart:${id}:${vs_currency}:${days}`;

    const result = await cachedFetch(cacheKey, url, 120);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko chart error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch chart data' });
  }
});

/**
 * @route   GET /api/coingecko/global
 * @desc    Global market stats (proxied + cached)
 */
router.get('/global', async (req, res) => {
  try {
    const url = `${COINGECKO_BASE}/global`;
    const cacheKey = 'global';

    const result = await cachedFetch(cacheKey, url, 120);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko global error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch global data' });
  }
});

/**
 * @route   GET /api/coingecko/trending
 * @desc    Trending coins (proxied + cached 5 min)
 */
router.get('/trending', async (req, res) => {
  try {
    const url = `${COINGECKO_BASE}/search/trending`;
    const cacheKey = 'trending';

    const result = await cachedFetch(cacheKey, url, 300);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko trending error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch trending data' });
  }
});

/**
 * @route   GET /api/coingecko/search
 * @desc    Search coins (proxied + cached)
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter required' });

    const url = `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`;
    const cacheKey = `search:${query.toLowerCase()}`;

    const result = await cachedFetch(cacheKey, url, 60);
    res.set('X-Cache', result.source);
    res.json(result.data);
  } catch (error) {
    console.error('CoinGecko search error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to search coins' });
  }
});

module.exports = router;
