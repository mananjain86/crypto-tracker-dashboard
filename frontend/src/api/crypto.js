const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const CG_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

const fetchCG = async (url) => {
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  if (CG_API_KEY) {
    options.headers['x-cg-demo-api-key'] = CG_API_KEY;
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('CoinGecko API Error');
  return res.json();
};

/**
 * CoinGecko proxy API — all calls routed through backend
 */
export const cryptoAPI = {
  // Get paginated market data
  getMarkets: async (page = 1, perPage = 32, sparkline = true) => {
    return fetchCG(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=${sparkline}`
    );
  },

  // Search markets (for search functionality)
  searchMarkets: async (query) => {
    const data = await fetchCG(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    );
    return data.filter(coin =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get single coin details
  getCoinDetails: async (coinId) => {
    return fetchCG(`https://api.coingecko.com/api/v3/coins/${coinId}`);
  },

  // Get price chart data
  getMarketChart: async (coinId, days = 1) => {
    return fetchCG(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
  },

  // Get global market data
  getGlobalData: async () => {
    return fetchCG(`https://api.coingecko.com/api/v3/global`);
  },

  // Get trending coins
  getTrending: async () => {
    return fetchCG(`https://api.coingecko.com/api/v3/search/trending`);
  },

  // Search coins
  searchCoins: async (query) => {
    return fetchCG(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
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
