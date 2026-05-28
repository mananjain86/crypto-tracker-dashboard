const API_BASE_URL = 'http://localhost:5000/api';

export const aiAPI = {
  // General crypto chat
  chat: async (message, context = '') => {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    if (!res.ok) throw new Error('AI chat failed');
    return res.json();
  },

  // Per-coin analysis
  analyzeCoin: async (coinId, coinData = null) => {
    const res = await fetch(`${API_BASE_URL}/ai/analyze/${coinId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinData })
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  // Market summary
  getMarketSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/ai/market-summary`);
    if (!res.ok) throw new Error('Market summary failed');
    return res.json();
  }
};
