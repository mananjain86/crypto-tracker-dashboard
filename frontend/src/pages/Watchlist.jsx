import { useEffect, useState } from 'react';
import { watchlistAPI } from '../api/auth';
import { cryptoAPI } from '../api/crypto';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';

function Watchlist() {
  const { user } = useAuth();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleRemove = async (coinId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await watchlistAPI.removeFromWatchlist(token, coinId);
      setCoins(prev => prev.filter(c => c.id !== coinId));
    } catch (err) {
      console.error('Remove from watchlist error:', err);
    }
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError('');
      try {
        if (!user) {
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
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header
        onLoginClick={() => openModal('login')}
        onSignupClick={() => openModal('signup')}
      />
      <main className="flex-1 container px-4 sm:px-8 lg:px-16 py-8 min-w-full">
        <div className="text-center max-w-3xl mx-auto mb-10 fade-in">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <i className="fa-solid fa-star text-yellow-400"></i>
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Watchlist</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Keep track of your favorite cryptocurrencies in one place.</p>
        </div>

        {/* Not logged in state */}
        {!user && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-lock text-3xl text-blue-500"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Create an account or login to build and manage your crypto watchlist.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => openModal('login')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:scale-105 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => openModal('signup')}
                className="px-6 py-2.5 rounded-xl border-2 border-blue-400 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {/* Logged in content */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              </div>
            ) : coins.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-regular fa-star text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No coins yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Browse the <a href="/home" className="text-blue-600 hover:underline">dashboard</a> and click the star icon to add coins.</p>
              </div>
            ) : (
              coins.map((crypto) => (
                <div
                  key={crypto.id}
                  className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col items-center cursor-pointer transition-all duration-200 overflow-hidden group hover:scale-[1.03] hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500"
                  onClick={() => window.location.href = `/coin/${crypto.id}`}
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(crypto.id, e)}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Remove from Watchlist"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>

                  <div className="mb-3">
                    <img src={crypto.image?.large} width={40} height={40} alt={crypto.name} className="rounded-full shadow-md" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1">
                    {crypto.name} <span className="text-gray-500 dark:text-gray-400 text-xs">({crypto.symbol?.toUpperCase()})</span>
                  </h3>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">${crypto.market_data?.current_price?.usd?.toLocaleString()}</div>
                  <div className={`mb-2 text-sm font-semibold ${(crypto.market_data?.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <i className={`fa-solid fa-caret-${(crypto.market_data?.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down'} mr-0.5`}></i>
                    {Math.abs(crypto.market_data?.price_change_percentage_24h || 0).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">MCap: <span className="font-semibold text-gray-700 dark:text-gray-300">${crypto.market_data?.market_cap?.usd?.toLocaleString()}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Vol: <span className="font-semibold text-gray-700 dark:text-gray-300">${crypto.market_data?.total_volume?.usd?.toLocaleString()}</span></div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
      <Modal isOpen={showModal} onClose={closeModal}>
        <AuthForm onSuccess={() => { closeModal(); window.location.reload(); }} initialMode={authMode} />
      </Modal>
    </div>
  );
}

export default Watchlist;