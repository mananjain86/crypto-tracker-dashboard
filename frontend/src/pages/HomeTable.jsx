import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';

function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // NEW: track login/signup
  const [hasNextPage, setHasNextPage] = useState(true);

  // Fetch crypto data for the current page
  useEffect(() => {
    if (searchTerm) return; // Don't fetch paginated data if searching
    setIsLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=${currentPage}`)
      .then(res => res.json())
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

  // Search handler
  useEffect(() => {
    if (!searchTerm) return;
    setIsLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(crypto =>
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded mt-2 border-collapse overflow-hidden">
            <thead>
              <tr >
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">24h Change</th>
                <th className="px-4 py-2">Market Cap</th>
                <th className="px-4 py-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
              ) : cryptoData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8">Failed to load data. Try again later.</td></tr>
              ) : (
                cryptoData.map(crypto => (
                  <tr key={crypto.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <td>{crypto.market_cap_rank}</td>
                    <td onClick={() => window.location.href = `/coin/${crypto.id}`} className="flex items-center gap-2">
                      <img src={crypto.image} width={25} alt={crypto.name} />
                      <b>{crypto.name}</b> <small>({crypto.symbol.toUpperCase()})</small>
                    </td>
                    <td>${crypto.current_price.toLocaleString()}</td>
                    <td className={crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {crypto.price_change_percentage_24h >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </td>
                    <td>${crypto.market_cap.toLocaleString()}</td>
                    <td>${crypto.total_volume.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded"
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
                  className={`px-3 py-1 border rounded ${currentPage === i ? 'bg-blue-600 text-white' : ''}`}
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
            className="px-3 py-1 border rounded"
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