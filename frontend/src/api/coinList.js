// Utility to fetch and cache CoinGecko coin list
// Usage: import { getCoinList } from './api/coinList';

let cachedList = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getCoinList() {
  const now = Date.now();
  if (cachedList && (now - cacheTime < CACHE_DURATION)) {
    return cachedList;
  }
  // Fetch from CoinGecko
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false');
  if (!res.ok) throw new Error('Failed to fetch CoinGecko coin list');
  const data = await res.json();
  cachedList = data;
  cacheTime = now;
  return cachedList;
} 