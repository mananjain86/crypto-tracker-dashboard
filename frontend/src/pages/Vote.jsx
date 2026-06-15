import { useEffect, useState } from 'react';
import { cryptoAPI } from '../api/crypto';
import { voteAPI } from '../api/vote';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

const VOTING_CONTRACT_ADDRESS = import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const VOTING_ABI = [
  "function vote(string coinId, string sentiment) public"
];

const SUPPORTED_TESTNETS = {
  '0xaa36a7': 'Sepolia',
  '0x13882': 'Polygon Amoy',
  '0x61': 'BSC Testnet',
};

function Vote() {
  const { user } = useAuth();
  const [topCoins, setTopCoins] = useState([]);
  const [topVoted, setTopVoted] = useState([]);
  const [voteData, setVoteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [votingCoin, setVotingCoin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

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

  // Detect current network
  const detectNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentNetwork(chainId);
      setNetworkName(SUPPORTED_TESTNETS[chainId?.toLowerCase()] || null);
    } catch (e) {
      console.error('Network detection error:', e);
    }
  };

  // Listen for network changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleChainChanged = (chainId) => {
      setCurrentNetwork(chainId);
      setNetworkName(SUPPORTED_TESTNETS[chainId?.toLowerCase()] || null);
    };
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => window.ethereum.removeListener('chainChanged', handleChainChanged);
  }, []);

  // MetaMask wallet connect
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install the MetaMask browser extension.');
      return;
    }
    setWalletConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await detectNetwork();
        toast.success('Wallet connected!');
        console.log('🦊 Wallet connected:', accounts[0]);
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
      if (err.code === 4001) {
        toast.error('Connection rejected by user.');
      } else {
        toast.error('Failed to connect wallet.');
      }
    } finally {
      setWalletConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Modern way to force disconnect from MetaMask
      if (window.ethereum && window.ethereum.request) {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
      }
    } catch (error) {
      console.error("Revoke permissions error:", error);
    }
    setWalletAddress(null);
    setCurrentNetwork(null);
    setNetworkName(null);
    toast.success('Wallet disconnected.');
  };

  const switchToTestnet = async (targetChainId) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        toast.error('Please add this testnet to MetaMask manually.');
      } else {
        console.error('Network switch error:', err);
      }
    }
  };


  // Cast vote
  const handleVote = async (coinId, sentiment) => {
    if (!user) {
      openModal('login');
      return;
    }
    if (!walletAddress || !window.ethereum) {
      toast.error('Please connect your Web3 Wallet (MetaMask) first to cast a verifiable on-chain vote!');
      return;
    }
    
    setVotingCoin(coinId);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Web3 Transaction
      if (walletAddress && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          if (VOTING_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
             // Fallback: Send 0 ETH transaction to the burn address with data (so it records on-chain without error)
             try {
               const tx = await signer.sendTransaction({
                 to: "0x000000000000000000000000000000000000dEaD",
                 value: 0,
                 data: ethers.hexlify(ethers.toUtf8Bytes(`VOTE:${coinId}:${sentiment}`))
               });
               toast('Waiting for transaction confirmation...', { icon: '⏳' });
               await tx.wait();
             } catch (web3Err) {
                throw web3Err;
             }
          } else {
             // Execute Smart Contract call
             const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, signer);
             const tx = await contract.vote(coinId, sentiment);
             await tx.wait(); // Wait for confirmation
          }
        } catch (web3Err) {
          console.error("Web3 Transaction failed:", web3Err);
          if (web3Err.code === 'ACTION_REJECTED' || web3Err.code === 4001) {
             toast.error('Transaction rejected by user.');
          } else {
             toast.error('Smart contract transaction failed. See console for details.');
          }
          setVotingCoin(null);
          return; // Abort backend recording if transaction fails
        }
      }

      // 2. Record in Backend
      await voteAPI.castVote(token, coinId, sentiment, walletAddress, currentNetwork);
      
      // Refresh vote data for this coin
      const data = await voteAPI.getVotes(coinId, token);
      setVoteData(prev => ({ ...prev, [coinId]: data }));
      
      toast.success(`Vote cast successfully: ${sentiment}!`);
    } catch (err) {
      console.error('Vote error:', err);
      // Backend error (e.g. duplicate vote)
      toast.error(err.message || 'Failed to cast vote. Please try again.');
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
      <Header
        onLoginClick={() => openModal('login')}
        onSignupClick={() => openModal('signup')}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto mb-10 fade-in">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Crypto Sentiment <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Voting</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Cast a verifiable on-chain vote to signal your market sentiment for top cryptocurrencies.</p>
          </div>

        {/* Wallet Connect Section */}
        <div className="glass-bg rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-wallet text-xl text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300">Web3 Wallet</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect your wallet for verified voting on testnets</p>
              </div>
            </div>
            {walletAddress ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-mono font-semibold text-green-700 dark:text-green-300">{shortenAddress(walletAddress)}</span>
                </div>
                {networkName ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-300 dark:border-blue-700">
                    <i className="fa-solid fa-network-wired mr-1"></i>{networkName}
                  </span>
                ) : currentNetwork ? (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold border border-yellow-300 dark:border-yellow-700">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>Mainnet / Unknown
                  </span>
                ) : null}
                <button
                  onClick={disconnectWallet}
                  className="text-sm px-3 py-1 rounded-full border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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

          {/* Testnet selector */}
          {walletAddress && !networkName && (
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <i className="fa-solid fa-info-circle mr-1 text-blue-500"></i>
                Switch to a supported testnet for verified voting:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUPPORTED_TESTNETS).map(([chainId, name]) => (
                  <button
                    key={chainId}
                    onClick={() => switchToTestnet(chainId)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
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
                    idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                  }`}>{idx + 1}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm capitalize text-gray-900 dark:text-white">{coin.coinId.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{coin.totalVotes} votes</div>
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
            className="w-full max-w-md px-5 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 border-2 border-blue-200 dark:border-blue-800 shadow-md focus:ring-2 focus:ring-blue-400 outline-none transition-all text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Voting Cards */}
        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div className="text-gray-500 dark:text-gray-400">Loading coins...</div>
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
                  className="glass-bg rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img src={coin.image} width={36} height={36} alt={coin.name} className="rounded-full" />
                    <div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">{coin.name} <span className="text-gray-500 dark:text-gray-400 text-xs">({coin.symbol.toUpperCase()})</span></h3>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">${coin.current_price.toLocaleString()}</div>
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
                      <div className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500" style={{ width: `${bullishPct}%` }}></div>
                      <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500" style={{ width: `${bearishPct}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{totalVotes} total votes</div>
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
                    <div className="text-xs text-center mt-2 flex items-center justify-center gap-1">
                      <i className="fa-solid fa-check-circle text-purple-600"></i>
                      <span className="text-purple-600 dark:text-purple-400">
                        Wallet-verified vote
                        {networkName && <span className="ml-1">({networkName})</span>}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <Modal isOpen={showModal} onClose={closeModal}>
        <AuthForm onSuccess={closeModal} initialMode={authMode} />
      </Modal>
    </div>
  );
}

export default Vote;