import { useEffect, useState } from 'react';
import { watchlistAPI } from '../api/auth';
import { cryptoAPI } from '../api/crypto';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Watchlist() {
  const { user } = useAuth();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError('');
      try {
        if (!user) {
          setError('You must be logged in to view your watchlist.');
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('token');
        
        const response = await watchlistAPI.getWatchlist(token);
        const watchlistIds = response.watchlist;
        
        if (!watchlistIds || watchlistIds.length === 0) {
          setCoins([]);
          setLoading(false);
          return;
        }
        
        // Fetch coin data for each id via backend proxy
        const coinData = await Promise.all(
          watchlistIds.map(async (coinid) => {
            return cryptoAPI.getCoinDetails(coinid);
          })
        );
        setCoins(coinData);
      } catch (err) {
        console.error('Watchlist fetch error:', err);
        setError('Failed to load watchlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container px-16 py-8 min-w-full">
        <center><h2 className="text-2xl font-bold mb-6">Your Watchlist</h2></center>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {/* Card grid instead of table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {loading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
              ) : coins.length === 0 ? (
            <div className="col-span-full text-center py-8">No coins in your watchlist.</div>
              ) : (
                coins.map((crypto, idx) => (
              <div
                key={crypto.id}
                className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-blue-200 dark:border-blue-800 rounded-3xl shadow-xl min-w-[200px] min-h-[260px] p-7 flex flex-col items-center cursor-pointer transition-all duration-200 overflow-hidden group hover:scale-[1.04] hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-300/40"
                onClick={() => window.location.href = `/coin/${crypto.id}`}
              >
                {/* Gradient Accent Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-200/30 via-blue-100/10 to-blue-400/20 pointer-events-none z-0"></div>
                {/* Glass Reflection Overlay */}
                <div className="absolute left-2 top-2 w-3/4 h-1/5 bg-white/30 rounded-t-2xl blur-sm opacity-60 pointer-events-none z-10"></div>
                {/* Floating Coin Icon */}
                <div className="absolute left-4 top-4 z-20">
                  <img src={crypto.image.large} width={36} height={36} alt={crypto.name} />
                </div>
                <div className="flex flex-col items-center z-20 mt-10">
                  <h3 className="text-base font-bold flex items-center gap-2 mb-1">
                    {crypto.name} <span className="text-gray-500 text-xs">({crypto.symbol.toUpperCase()})</span>
                  </h3>
                  <div className="text-xl font-semibold mb-1">${crypto.market_data.current_price.usd.toLocaleString()}</div>
                  <div className={`mb-1 text-sm ${crypto.market_data.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {crypto.market_data.price_change_percentage_24h >= 0 ? (
                      <i className="fa-solid fa-caret-up"></i>
                    ) : (
                      <i className="fa-solid fa-caret-down"></i>
                    )}
                      {Math.abs(crypto.market_data.price_change_percentage_24h).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Market Cap: <span className="font-bold">${crypto.market_data.market_cap.usd.toLocaleString()}</span></div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Volume: <span className="font-bold">${crypto.market_data.total_volume.usd.toLocaleString()}</span></div>
                </div>
                {/* Inner shadow for glass effect */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none z-30 group-hover:shadow-[inset_0_0_32px_0_rgba(59,130,246,0.12)]"></div>
                {/* Faint glow on hover */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none z-40 group-hover:ring-4 group-hover:ring-blue-300/20 transition-all"></div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Watchlist;