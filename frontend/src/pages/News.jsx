import { useEffect, useState } from 'react';
import { cryptoAPI } from '../api/crypto';
import { aiAPI } from '../api/ai';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CATEGORIES = ['All', 'Layer 1', 'DeFi', 'Meme', 'NFT', 'Stablecoin'];

// Map coins to categories (simplified mapping)
const COIN_CATEGORIES = {
  'bitcoin': 'Layer 1', 'ethereum': 'Layer 1', 'solana': 'Layer 1', 'cardano': 'Layer 1',
  'avalanche-2': 'Layer 1', 'polkadot': 'Layer 1', 'near': 'Layer 1', 'cosmos': 'Layer 1',
  'uniswap': 'DeFi', 'aave': 'DeFi', 'chainlink': 'DeFi', 'maker': 'DeFi', 'lido-dao': 'DeFi',
  'dogecoin': 'Meme', 'shiba-inu': 'Meme', 'pepe': 'Meme', 'floki': 'Meme', 'bonk': 'Meme',
  'tether': 'Stablecoin', 'usd-coin': 'Stablecoin', 'dai': 'Stablecoin',
};

function News() {
  const [marketData, setMarketData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      cryptoAPI.getMarkets(1, 50, false),
      cryptoAPI.getTrending()
    ]).then(([markets, trending]) => {
      setMarketData(markets);
      setTrendingData(trending.coins || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch AI insights
  useEffect(() => {
    setInsightsLoading(true);
    aiAPI.chat(
      'Generate a brief crypto market news digest. Cover the most important trends, notable price movements, and emerging narratives in the crypto market. Format as 4-5 short news items with emoji headers.',
      'This is for a crypto dashboard news page'
    ).then(res => {
      setAiInsights(res.reply);
      setInsightsLoading(false);
    }).catch(() => {
      setAiInsights('AI insights temporarily unavailable.');
      setInsightsLoading(false);
    });
  }, []);

  // Generate "news items" from market data
  const generateNewsItems = () => {
    const items = [];

    // Big movers
    const sorted = [...marketData].sort((a, b) => Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0));
    const bigMovers = sorted.slice(0, 8);

    bigMovers.forEach(coin => {
      const change = coin.price_change_percentage_24h || 0;
      const isUp = change >= 0;
      const category = COIN_CATEGORIES[coin.id] || 'Other';
      items.push({
        id: coin.id,
        title: `${coin.name} (${coin.symbol.toUpperCase()}) ${isUp ? 'surges' : 'drops'} ${Math.abs(change).toFixed(2)}% in 24 hours`,
        summary: `${coin.name} is currently trading at $${coin.current_price.toLocaleString()} with a market cap of $${coin.market_cap.toLocaleString()}. The ${isUp ? 'upward momentum' : 'selling pressure'} reflects ongoing market dynamics.`,
        source: 'Market Data',
        timestamp: new Date().toLocaleString(),
        sentiment: isUp ? 'bullish' : 'bearish',
        change: change,
        image: coin.image,
        category
      });
    });

    // Trending as news
    trendingData.slice(0, 5).forEach(tw => {
      const coin = tw.item;
      items.push({
        id: coin.id,
        title: `${coin.name} (${coin.symbol.toUpperCase()}) is trending on CoinGecko`,
        summary: `${coin.name} has entered the trending list, ranked #${coin.score + 1} by search interest. Market cap rank: #${coin.market_cap_rank || 'N/A'}.`,
        source: 'Trending',
        timestamp: new Date().toLocaleString(),
        sentiment: 'neutral',
        change: 0,
        image: coin.large || coin.thumb,
        category: COIN_CATEGORIES[coin.id] || 'Other'
      });
    });

    return items;
  };

  const newsItems = loading ? [] : generateNewsItems();
  const filteredNews = selectedCategory === 'All'
    ? newsItems
    : newsItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent text-center">
          <i className="fa-solid fa-newspaper mr-2"></i>Crypto News & Insights
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Market intelligence powered by real-time data & AI</p>

        {/* AI Insights Panel */}
        <div className="glass-bg rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 mb-8">
          <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <i className="fa-solid fa-brain"></i>AI Market Insights
            <span className="text-xs font-normal text-gray-500 ml-auto">Powered by Gemini</span>
          </h2>
          {insightsLoading ? (
            <div className="flex items-center gap-3 py-6">
              <i className="fa-solid fa-spinner fa-spin text-purple-500"></i>
              <span className="text-gray-500">Generating market insights...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm border-2 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-500'
                  : 'bg-white/70 dark:bg-gray-800/70 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Feed */}
        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div>Loading news...</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No news items in this category.</div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="glass-bg rounded-2xl p-5 shadow-md border border-blue-200 dark:border-blue-800 flex gap-4 items-start hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
                onClick={() => window.location.href = `/coin/${item.id}`}
              >
                <img src={item.image} width={48} height={48} alt={item.title} className="rounded-full shadow mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.sentiment === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      item.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.sentiment === 'bullish' ? <i className="fa-solid fa-arrow-up mr-1"></i> : item.sentiment === 'bearish' ? <i className="fa-solid fa-arrow-down mr-1"></i> : <i className="fa-solid fa-fire mr-1"></i>}
                      {item.sentiment}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{item.category}</span>
                    <span className="text-xs text-gray-400 ml-auto">{item.source}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                </div>
                {item.change !== 0 && (
                  <div className={`text-right flex-shrink-0 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-lg font-bold">
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default News;