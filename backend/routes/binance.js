const express = require('express');
const axios = require('axios');
const CacheEntry = require('../models/CacheEntry');

const router = express.Router();

const BINANCE_BASE = 'https://api.binance.com/api/v3';

/**
 * @route   GET /api/binance/ticker/:symbol
 * @desc    Single symbol ticker (e.g., BTCUSDT) — 10s cache
 */
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `binance:ticker:${upperSymbol}`;

    // Check cache (10s freshness)
    const cached = await CacheEntry.findOne({ key: cacheKey });
    if (cached) {
      const ageMs = Date.now() - cached.createdAt.getTime();
      if (ageMs < 10000) {
        res.set('X-Cache', 'cache');
        return res.json(cached.data);
      }
    }

    const response = await axios.get(`${BINANCE_BASE}/ticker/24hr`, {
      params: { symbol: upperSymbol },
      timeout: 5000
    });

    await CacheEntry.findOneAndUpdate(
      { key: cacheKey },
      { key: cacheKey, data: response.data, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.set('X-Cache', 'fresh');
    res.json(response.data);
  } catch (error) {
    // Try stale cache
    const stale = await CacheEntry.findOne({ key: `binance:ticker:${req.params.symbol.toUpperCase()}` });
    if (stale) {
      res.set('X-Cache', 'stale');
      return res.json(stale.data);
    }
    console.error('Binance ticker error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch ticker' });
  }
});

/**
 * @route   GET /api/binance/tickers
 * @desc    Batch tickers for specific symbols only (e.g., ?symbols=BTC,ETH,SOL)
 *          Much more efficient than fetching all 1000+ tickers
 */
router.get('/tickers', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.status(400).json({ error: 'symbols query parameter required (e.g., BTC,ETH,SOL)' });

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    const results = {};
    const toFetch = [];

    // Check cache for each symbol
    for (const sym of symbolList) {
      const cacheKey = `binance:ticker:${sym}USDT`;
      const cached = await CacheEntry.findOne({ key: cacheKey });
      if (cached && (Date.now() - cached.createdAt.getTime() < 10000)) {
        results[sym] = cached.data;
      } else {
        toFetch.push(sym);
      }
    }

    // Fetch missing symbols individually (much cheaper than full ticker list)
    if (toFetch.length > 0) {
      const fetchPromises = toFetch.map(async (sym) => {
        try {
          const response = await axios.get(`${BINANCE_BASE}/ticker/24hr`, {
            params: { symbol: `${sym}USDT` },
            timeout: 5000
          });
          const cacheKey = `binance:ticker:${sym}USDT`;
          await CacheEntry.findOneAndUpdate(
            { key: cacheKey },
            { key: cacheKey, data: response.data, createdAt: new Date() },
            { upsert: true, new: true }
          );
          results[sym] = response.data;
        } catch (err) {
          // Try stale cache for this symbol
          const stale = await CacheEntry.findOne({ key: `binance:ticker:${sym}USDT` });
          if (stale) results[sym] = stale.data;
        }
      });
      await Promise.all(fetchPromises);
    }

    res.json(results);
  } catch (error) {
    console.error('Binance tickers error:', error.message);
    res.status(500).json({ error: 'Failed to fetch tickers' });
  }
});

module.exports = router;
