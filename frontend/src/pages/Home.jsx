import { useState, useEffect } from 'react';
import { cryptoAPI, binanceAPI } from '../api/crypto';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';

function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [binanceData, setBinanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // NEW: track login/signup
  const [hasNextPage, setHasNextPage] = useState(true);

  // Fetch CoinGecko data via backend proxy
  useEffect(() => {
    if (searchTerm) return; // Don't fetch paginated data if searching
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

  // Fetch Binance data for visible coins only (not all 1000+)
  useEffect(() => {
    if (!cryptoData || cryptoData.length === 0) return;
    let interval;
    const fetchBinance = () => {
      // Only fetch tickers for coins currently visible on the page
      const symbols = cryptoData.map(c => c.symbol.toUpperCase());
      binanceAPI.getTickers(symbols)
        .then(data => setBinanceData(data))
        .catch(() => setBinanceData({}));
    };
    fetchBinance();
    interval = setInterval(fetchBinance, 5000);
    return () => clearInterval(interval);
  }, [cryptoData]);

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

  // Debug: log modal open/close
  useEffect(() => {
    console.log('Login modal open:', showModal);
  }, [showModal]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (hasNextPage) setCurrentPage(currentPage + 1);
  };

  // Modal open/close handlers (for login/signup)
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
      <main className="flex-1 container px-16 py-8 min-w-full">
        <center><h2 className="text-3xl font-bold mb-6">Cryptocurrency Prices by Market Cap</h2></center>
        {/* Card grid instead of table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : cryptoData.length === 0 ? (
            <div className="col-span-full text-center py-8">Failed to load data. Try again later.</div>
          ) : (
            cryptoData.map(crypto => {
              // Try to get Binance data for this coin (by symbol)
              const binance = binanceData[crypto.symbol.toUpperCase()];
              // Fallback to CoinGecko if not found
              const price = binance ? parseFloat(binance.lastPrice) : crypto.current_price;
              const change = binance ? parseFloat(binance.priceChangePercent) : crypto.price_change_percentage_24h;
              const volume = binance ? parseFloat(binance.quoteVolume) : crypto.total_volume;
              return (
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
                    <img src={crypto.image} width={36} height={36} alt={crypto.name} />
                  </div>
                  <div className="flex flex-col items-center z-20 mt-10">
                    <h3 className="text-base font-bold flex items-center gap-2 mb-1">
                      {crypto.name} <span className="text-gray-500 text-xs">({crypto.symbol.toUpperCase()})</span>
                    </h3>
                    <div className="text-xl font-semibold mb-1">${price.toLocaleString()}</div>
                    <div className={`mb-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {change >= 0 ? (
                        <i className="fa-solid fa-caret-up"></i>
                      ) : (
                        <i className="fa-solid fa-caret-down"></i>
                      )}
                      {Math.abs(change).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Market Cap: <span className="font-bold">${crypto.market_cap.toLocaleString()}</span></div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Volume: <span className="font-bold">${Number(volume).toLocaleString()}</span></div>
                    {/* 1-week sparkline chart */}
                    {crypto.sparkline_in_7d && crypto.sparkline_in_7d.price && (
                      <div className="w-full flex justify-center my-2">
                        <svg width="160" height="48" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {(() => {
                            const prices = crypto.sparkline_in_7d.price;
                            const min = Math.min(...prices);
                            const max = Math.max(...prices);
                            const points = prices.map((p, i) => {
                              const x = (i / (prices.length - 1)) * 160;
                              const y = 48 - ((p - min) / (max - min || 1)) * 42 - 3;
                              return `${x.toFixed(2)},${y.toFixed(2)}`;
                            }).join(' ');
                            return <polyline points={points} fill="none" stroke="url(#sparklineGradient)" strokeWidth="2.5" />;
                          })()}
                          <defs>
                            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#60a5fa" />
                              <stop offset="1" stopColor="#2563eb" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Inner shadow for glass effect */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none z-30 group-hover:shadow-[inset_0_0_32px_0_rgba(59,130,246,0.12)]"></div>
                  {/* Faint glow on hover */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none z-40 group-hover:ring-4 group-hover:ring-blue-300/20 transition-all"></div>
                </div>
              );
            })
          )}
        </div>
        <div className="pagination flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-all disabled:opacity-40"
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {/* Page numbers */}
          {(() => {
            const pageButtons = [];
            const totalPages = 333; // 10,000/30 ≈ 333, but CoinGecko may have less; adjust as needed
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);
            if (currentPage <= 3) {
              end = 5;
            }
            if (currentPage >= totalPages - 2) {
              start = totalPages - 4;
            }
            start = Math.max(1, start);
            end = Math.min(totalPages, end);
            for (let i = start; i <= end; i++) {
              pageButtons.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1 mx-1 font-semibold focus:outline-none transition-all duration-150
                    ${currentPage === i ? 'text-blue-700 underline underline-offset-4 scale-110' : 'text-blue-500 hover:text-blue-700 hover:scale-105'}`}
                  style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }}
                  disabled={currentPage === i}
                >
                  {i}
                </button>
              );
            }
            return pageButtons;
          })()}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-all disabled:opacity-40"
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