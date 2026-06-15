import { useState, useEffect } from 'react';
import { cryptoAPI } from '../api/crypto';
import { watchlistAPI } from '../api/auth';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';

function Home() {
  const { user } = useAuth();
  const [cryptoData, setCryptoData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [hasNextPage, setHasNextPage] = useState(true);
  const [watchlist, setWatchlist] = useState([]);

  // Get symbols for WebSocket
  const symbols = cryptoData.map(c => c.symbol.toUpperCase());
  const { prices: wsPrices, connected: wsConnected } = useBinanceWebSocket(symbols, cryptoData.length > 0);

  // Fetch CoinGecko data via backend proxy
  useEffect(() => {
    if (searchTerm) return;
    setIsLoading(true);
    cryptoAPI.getMarkets(currentPage, 32, true)
      .then(data => {
        setCryptoData(data);
        setIsLoading(false);
        setHasNextPage(data && data.length > 0);
      })
      .catch(() => {
        setCryptoData([]);
        setIsLoading(false);
        setHasNextPage(false);
      });
  }, [currentPage, searchTerm]);

  // Search handler via backend proxy
  useEffect(() => {
    if (!searchTerm) return;
    setIsLoading(true);
    cryptoAPI.searchMarkets(searchTerm)
      .then(filtered => {
        setCryptoData(filtered);
        setIsLoading(false);
        setHasNextPage(false);
      })
      .catch(() => {
        setCryptoData([]);
        setIsLoading(false);
        setHasNextPage(false);
      });
  }, [searchTerm]);

  // Fetch watchlist
  useEffect(() => {
    if (!user) { setWatchlist([]); return; }
    const token = localStorage.getItem('token');
    if (token) {
      watchlistAPI.getWatchlist(token)
        .then(res => setWatchlist(res.watchlist || []))
        .catch(() => setWatchlist([]));
    }
  }, [user]);

  const toggleWatchlist = async (coinId, e) => {
    e.stopPropagation();
    if (!user) {
      openModal('login');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      if (watchlist.includes(coinId)) {
        await watchlistAPI.removeFromWatchlist(token, coinId);
        setWatchlist(prev => prev.filter(id => id !== coinId));
      } else {
        await watchlistAPI.addToWatchlist(token, coinId);
        setWatchlist(prev => [...prev, coinId]);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  // Modal open/close handlers
  const openModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header
        onLoginClick={() => openModal('login')}
        onSignupClick={() => openModal('signup')}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <main className="flex-1 container px-4 sm:px-8 lg:px-16 py-8 min-w-full">
        <div className="flex flex-col items-center justify-center mb-10 text-center fade-in">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Overview</span>
            </h2>
            {wsConnected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Data
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm sm:text-base">Track real-time prices, market capitalization, and performance of the top cryptocurrencies globally.</p>
        </div>
        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : cryptoData.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">Failed to load data. Try again later.</div>
          ) : (
            cryptoData.map(crypto => {
              const ws = wsPrices[crypto.symbol.toUpperCase()];
              const price = ws ? parseFloat(ws.lastPrice) : crypto.current_price;
              const change = ws ? parseFloat(ws.priceChangePercent) : crypto.price_change_percentage_24h;
              const volume = ws ? parseFloat(ws.quoteVolume) : crypto.total_volume;
              const isInWatchlist = watchlist.includes(crypto.id);

              return (
                <div
                  key={crypto.id}
                  className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg min-w-[200px] p-5 flex flex-col items-center cursor-pointer transition-all duration-200 overflow-hidden group hover:scale-[1.03] hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500"
                  onClick={() => window.location.href = `/coin/${crypto.id}`}
                >
                  {/* Watchlist star */}
                  <button
                    onClick={(e) => toggleWatchlist(crypto.id, e)}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-125"
                    title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    aria-label={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <i className={`${isInWatchlist ? 'fa-solid' : 'fa-regular'} fa-star ${isInWatchlist ? 'text-yellow-400' : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500'} text-lg`}></i>
                  </button>

                  {/* Coin Icon */}
                  <div className="mb-3">
                    <img src={crypto.image} width={40} height={40} alt={crypto.name} className="rounded-full shadow-md" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1">
                    {crypto.name} <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">({crypto.symbol.toUpperCase()})</span>
                  </h3>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">${price?.toLocaleString()}</div>
                  <div className={`mb-2 text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <i className={`fa-solid fa-caret-${change >= 0 ? 'up' : 'down'} mr-0.5`}></i>
                    {Math.abs(change || 0).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">MCap: <span className="font-semibold text-gray-700 dark:text-gray-300">${crypto.market_cap?.toLocaleString()}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Vol: <span className="font-semibold text-gray-700 dark:text-gray-300">${Number(volume)?.toLocaleString()}</span></div>
                  {/* Sparkline */}
                  {crypto.sparkline_in_7d && crypto.sparkline_in_7d.price && (
                    <div className="w-full flex justify-center mt-2">
                      <svg width="140" height="40" viewBox="0 0 140 40" fill="none">
                        {(() => {
                          const prices = crypto.sparkline_in_7d.price;
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          const isUp = prices[prices.length - 1] >= prices[0];
                          const points = prices.map((p, i) => {
                            const x = (i / (prices.length - 1)) * 140;
                            const y = 38 - ((p - min) / (max - min || 1)) * 34 - 2;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          }).join(' ');
                          return <polyline points={points} fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />;
                        })()}
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-all disabled:opacity-40 text-sm"
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {(() => {
            const btns = [];
            const total = 333;
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(total, currentPage + 2);
            if (currentPage <= 3) end = Math.min(total, 5);
            if (currentPage >= total - 2) start = Math.max(1, total - 4);
            for (let i = start; i <= end; i++) {
              btns.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1.5 mx-0.5 font-semibold text-sm transition-all duration-150 rounded-lg ${
                    currentPage === i
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                  disabled={currentPage === i}
                >
                  {i}
                </button>
              );
            }
            return btns;
          })()}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-all disabled:opacity-40 text-sm"
            disabled={!hasNextPage}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <Modal isOpen={showModal} onClose={closeModal}>
          <AuthForm onSuccess={closeModal} initialMode={authMode} />
        </Modal>
      </main>
      <Footer />
    </div>
  );
}

export default Home;