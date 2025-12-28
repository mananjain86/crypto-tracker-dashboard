const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current user
  getCurrentUser: async (token) => {
    return apiRequest('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Logout user
  logout: async (token) => {
    return apiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Watchlist API functions
export const watchlistAPI = {
  // Get user's watchlist
  getWatchlist: async (token) => {
    return apiRequest('/watchlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add coin to watchlist
  addToWatchlist: async (token, coinId) => {
    return apiRequest('/watchlist/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coinId }),
    });
  },

  // Remove coin from watchlist
  removeFromWatchlist: async (token, coinId) => {
    return apiRequest('/watchlist/remove', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coinId }),
    });
  },

  // Clear watchlist
  clearWatchlist: async (token) => {
    return apiRequest('/watchlist/clear', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
}; 