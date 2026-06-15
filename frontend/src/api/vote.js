const API_BASE_URL = 'http://localhost:5000/api';

export const voteAPI = {
  // Cast a vote
  castVote: async (token, coinId, sentiment, walletAddress = null, networkChainId = null) => {
    const res = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ coinId, sentiment, walletAddress, networkChainId })
    });
    if (!res.ok) throw new Error('Vote failed');
    return res.json();
  },

  // Get votes for a coin
  getVotes: async (coinId, token = null) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/vote/${coinId}`, { headers });
    if (!res.ok) throw new Error('Failed to get votes');
    return res.json();
  },

  // Get top voted coins
  getTopVoted: async () => {
    const res = await fetch(`${API_BASE_URL}/vote/top/coins`);
    if (!res.ok) throw new Error('Failed to get top voted');
    return res.json();
  }
};
