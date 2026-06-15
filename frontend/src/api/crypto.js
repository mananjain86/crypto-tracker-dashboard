const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * CoinGecko proxy API — all calls routed through backend
 */
export const cryptoAPI = {
  // Get paginated market data
  getMarkets: async (page = 1, perPage = 32, sparkline = true) => {
    const res = await fetch(
      `${API_BASE_URL}/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=${sparkline}`
    );
    if (!res.ok) throw new Error('Failed to fetch markets');
    return res.json();
  },

  // Search markets (for search functionality)
  searchMarkets: async (query) => {
    const res = await fetch(
      `${API_BASE_URL}/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    );
    if (!res.ok) throw new Error('Failed to fetch markets');
    const data = await res.json();
    return data.filter(coin =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get single coin details
  getCoinDetails: async (coinId) => {
    const res = await fetch(`${API_BASE_URL}/coingecko/coin/${coinId}`);
    if (!res.ok) throw new Error('Failed to fetch coin details');
    return res.json();
  },

  // Get price chart data
  getMarketChart: async (coinId, days = 1) => {
    const res = await fetch(
      `${API_BASE_URL}/coingecko/coin/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return res.json();
  },

  // Get global market data
  getGlobalData: async () => {
    const res = await fetch(`${API_BASE_URL}/coingecko/global`);
    if (!res.ok) throw new Error('Failed to fetch global data');
    return res.json();
  },

  // Get trending coins
  getTrending: async () => {
    const res = await fetch(`${API_BASE_URL}/coingecko/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  },

  // Search coins
  searchCoins: async (query) => {
    const res = await fetch(`${API_BASE_URL}/coingecko/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search coins');
    return res.json();
  }
};

/**
 * Binance proxy API — per-symbol fetching (not bulk)
 */
export const binanceAPI = {
  // Get single ticker
  getTicker: async (symbol) => {
    const res = await fetch(`${API_BASE_URL}/binance/ticker/${symbol}USDT`);
    if (!res.ok) return null;
    return res.json();
  },

  // Get batch tickers for specific symbols
  getTickers: async (symbols) => {
    if (!symbols || symbols.length === 0) return {};
    const res = await fetch(`${API_BASE_URL}/binance/tickers?symbols=${symbols.join(',')}`);
    if (!res.ok) return {};
    return res.json();
  }
};
