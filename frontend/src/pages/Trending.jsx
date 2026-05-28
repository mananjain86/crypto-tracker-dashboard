import { useEffect, useState } from 'react';
import { cryptoAPI } from '../api/crypto';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Trending() {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    cryptoAPI.getTrending()
      .then(data => {
        setTrendingCoins(data.coins || []);
        setLoading(false);
      })
      .catch(() => {
        setTrendingCoins([]);
        setLoading(false);
      });
  }, []);

  const filtered = filter
    ? trendingCoins.filter(c =>
        c.item.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.item.symbol.toLowerCase().includes(filter.toLowerCase())
      )
    : trendingCoins;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent text-center">
          <i className="fa-solid fa-fire mr-2 text-orange-500"></i>Trending Coins
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Most searched coins on CoinGecko in the last 24 hours</p>

        {/* Search filter */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Filter trending coins..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full max-w-md px-5 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 border-2 border-blue-200 dark:border-blue-800 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div>Loading trending coins...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No trending coins found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((coinWrapper, idx) => {
              const coin = coinWrapper.item;
              return (
                <div
                  key={coin.id}
                  className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-blue-200 dark:border-blue-800 rounded-3xl shadow-xl p-6 flex flex-col items-center cursor-pointer transition-all duration-200 overflow-hidden group hover:scale-[1.04] hover:shadow-2xl hover:border-orange-400 dark:hover:border-orange-500 hover:ring-2 hover:ring-orange-300/40"
                  onClick={() => window.location.href = `/coin/${coin.id}`}
                >
                  {/* Rank badge */}
                  <div className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {coin.score + 1}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-200/20 via-blue-100/10 to-orange-400/10 pointer-events-none z-0"></div>

                  {/* Coin image */}
                  <div className="mb-3 z-20">
                    <img
                      src={coin.large || coin.thumb}
                      width={64}
                      height={64}
                      alt={coin.name}
                      className="rounded-full shadow-lg"
                    />
                  </div>

                  <h3 className="text-lg font-bold z-20 mb-1">{coin.name}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 z-20 mb-2">{coin.symbol.toUpperCase()}</span>

                  <div className="flex flex-col items-center gap-1 z-20">
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Market Cap Rank: <span className="font-bold text-blue-600">#{coin.market_cap_rank || 'N/A'}</span>
                    </div>
                    {coin.data && coin.data.price && (
                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        ${parseFloat(coin.data.price).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </div>
                    )}
                    {coin.data && coin.data.price_change_percentage_24h && (
                      <div className={`text-xs font-bold ${Object.values(coin.data.price_change_percentage_24h)[0] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Object.values(coin.data.price_change_percentage_24h)[0] >= 0 ? (
                          <i className="fa-solid fa-caret-up mr-1"></i>
                        ) : (
                          <i className="fa-solid fa-caret-down mr-1"></i>
                        )}
                        {Math.abs(Object.values(coin.data.price_change_percentage_24h)[0]).toFixed(2)}%
                      </div>
                    )}
                    {coin.data && coin.data.sparkline && (
                      <div className="mt-2">
                        <img src={coin.data.sparkline} alt="sparkline" className="h-8 opacity-80" />
                      </div>
                    )}
                  </div>

                  {/* Hover effects */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none z-30 group-hover:shadow-[inset_0_0_32px_0_rgba(251,146,60,0.12)]"></div>
                  <div className="absolute inset-0 rounded-3xl pointer-events-none z-40 group-hover:ring-4 group-hover:ring-orange-300/20 transition-all"></div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Trending;