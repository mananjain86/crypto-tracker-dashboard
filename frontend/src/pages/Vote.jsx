import { useEffect, useState } from 'react';
import { cryptoAPI } from '../api/crypto';
import { voteAPI } from '../api/vote';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Vote() {
  const { user } = useAuth();
  const [topCoins, setTopCoins] = useState([]);
  const [topVoted, setTopVoted] = useState([]);
  const [voteData, setVoteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [votingCoin, setVotingCoin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch top coins for voting
  useEffect(() => {
    setLoading(true);
    Promise.all([
      cryptoAPI.getMarkets(1, 20, false),
      voteAPI.getTopVoted().catch(() => ({ coins: [] }))
    ]).then(([coins, voted]) => {
      setTopCoins(coins);
      setTopVoted(voted.coins || []);
      setLoading(false);

      // Fetch vote data for each coin
      const token = localStorage.getItem('token');
      coins.forEach(coin => {
        voteAPI.getVotes(coin.id, token).then(data => {
          setVoteData(prev => ({ ...prev, [coin.id]: data }));
        }).catch(() => {});
      });
    }).catch(() => setLoading(false));
  }, []);

  // MetaMask wallet connect
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected! Please install the MetaMask browser extension.');
      return;
    }
    setWalletConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log('🦊 Wallet connected:', accounts[0]);
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
      if (err.code === 4001) {
        alert('Connection rejected by user.');
      }
    } finally {
      setWalletConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  // Cast vote
  const handleVote = async (coinId, sentiment) => {
    if (!user) {
      alert('Please login to vote!');
      return;
    }
    setVotingCoin(coinId);
    try {
      const token = localStorage.getItem('token');
      await voteAPI.castVote(token, coinId, sentiment, walletAddress);
      // Refresh vote data for this coin
      const data = await voteAPI.getVotes(coinId, token);
      setVoteData(prev => ({ ...prev, [coinId]: data }));
    } catch (err) {
      console.error('Vote error:', err);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setVotingCoin(null);
    }
  };

  const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const filteredCoins = searchTerm
    ? topCoins.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : topCoins;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent text-center">
          <i className="fa-solid fa-check-to-slot mr-2"></i>Community Sentiment Vote
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Vote on your favorite coins — bullish or bearish!</p>

        {/* Wallet Connect Section */}
        <div className="glass-bg rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-wallet text-2xl text-purple-600"></i>
            <div>
              <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300">Web3 Wallet</h3>
              <p className="text-xs text-gray-500">Connect your MetaMask wallet for verified voting</p>
            </div>
          </div>
          {walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-mono font-semibold text-green-700 dark:text-green-300">{shortenAddress(walletAddress)}</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-sm px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={walletConnecting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {walletConnecting ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Connecting...</>
              ) : (
                <><i className="fa-brands fa-ethereum"></i> Connect MetaMask</>
              )}
            </button>
          )}
        </div>

        {/* Top Voted Leaderboard */}
        {topVoted.length > 0 && (
          <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 mb-8">
            <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <i className="fa-solid fa-trophy text-yellow-500"></i>Community Sentiment Leaderboard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topVoted.slice(0, 8).map((coin, idx) => (
                <div key={coin.coinId} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-blue-100 dark:border-blue-900">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-blue-200 text-blue-700'
                  }`}>{idx + 1}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm capitalize">{coin.coinId.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-gray-500">{coin.totalVotes} votes</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 text-xs font-bold">🐂 {coin.bullishPercent}%</div>
                    <div className="text-red-600 text-xs font-bold">🐻 {100 - coin.bullishPercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search coins to vote..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-5 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 border-2 border-blue-200 dark:border-blue-800 shadow-md focus:ring-2 focus:ring-blue-400 outline-none transition-all"
          />
        </div>

        {/* Voting Cards */}
        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div>Loading coins...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoins.map(coin => {
              const votes = voteData[coin.id];
              const bullishPct = votes ? votes.bullishPercent : 50;
              const bearishPct = 100 - bullishPct;
              const userVote = votes?.userVote;
              const totalVotes = votes?.total || 0;

              return (
                <div
                  key={coin.id}
                  className="glass-bg rounded-2xl p-5 shadow-lg border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img src={coin.image} width={36} height={36} alt={coin.name} className="rounded-full" />
                    <div>
                      <h3 className="font-bold text-base">{coin.name} <span className="text-gray-500 text-xs">({coin.symbol.toUpperCase()})</span></h3>
                      <div className="text-sm font-semibold text-blue-600">${coin.current_price.toLocaleString()}</div>
                    </div>
                    <div className={`ml-auto text-sm font-bold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                  </div>

                  {/* Sentiment bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-600 font-bold">🐂 Bullish {bullishPct}%</span>
                      <span className="text-red-600 font-bold">Bearish {bearishPct}% 🐻</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                        style={{ width: `${bullishPct}%` }}
                      ></div>
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                        style={{ width: `${bearishPct}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-1">{totalVotes} total votes</div>
                  </div>

                  {/* Vote buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(coin.id, 'bullish')}
                      disabled={votingCoin === coin.id}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                        userVote === 'bullish'
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-300 dark:border-green-700'
                      } disabled:opacity-50`}
                    >
                      <i className="fa-solid fa-arrow-up mr-1"></i>
                      Bullish
                    </button>
                    <button
                      onClick={() => handleVote(coin.id, 'bearish')}
                      disabled={votingCoin === coin.id}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                        userVote === 'bearish'
                          ? 'bg-red-600 text-white ring-2 ring-red-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-700'
                      } disabled:opacity-50`}
                    >
                      <i className="fa-solid fa-arrow-down mr-1"></i>
                      Bearish
                    </button>
                  </div>
                  {walletAddress && userVote && (
                    <div className="text-xs text-center text-purple-600 mt-2 flex items-center justify-center gap-1">
                      <i className="fa-solid fa-check-circle"></i> Wallet-verified vote
                    </div>
                  )}
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

export default Vote;