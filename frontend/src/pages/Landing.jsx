import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import AuthForm from '../components/AuthForm';
import { cryptoAPI } from '../api/crypto';

function Landing() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [tickerCoins, setTickerCoins] = useState([]);

  // Fetch a few coins for the ticker strip
  useEffect(() => {
    cryptoAPI.getMarkets(1, 12, false)
      .then(data => setTickerCoins(data || []))
      .catch(() => setTickerCoins([]));
  }, []);

  const openModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleAuthSuccess = () => {
    closeModal();
    navigate('/home');
  };

  const features = [
    { icon: 'fa-chart-line', title: 'Real-Time Tracking', desc: 'Live prices powered by Binance WebSocket and CoinGecko for 10,000+ cryptocurrencies.' },
    { icon: 'fa-robot', title: 'AI-Powered Insights', desc: 'Get intelligent market analysis, trend summaries, and coin-specific reports on demand.' },
    { icon: 'fa-star', title: 'Smart Watchlist', desc: 'Build and track your personalized portfolio with one-click add/remove across any coin.' },
    { icon: 'fa-check-to-slot', title: 'Community Voting', desc: 'Cast bullish or bearish votes on coins and see real-time community sentiment.' },
    { icon: 'fa-chart-pie', title: 'Market Overview', desc: 'Dominance charts, top gainers/losers, global stats and market cap breakdowns.' },
    { icon: 'fa-bolt', title: 'Trending & News', desc: 'Discover trending coins and AI-generated market news digests updated in real-time.' },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up with email, Google, or connect your MetaMask wallet in seconds.', icon: 'fa-user-plus' },
    { num: '02', title: 'Build Your Watchlist', desc: 'Browse thousands of coins and add your favorites with one click.', icon: 'fa-list-check' },
    { num: '03', title: 'Track & Analyze', desc: 'Get real-time prices, AI insights, charts, and community sentiment.', icon: 'fa-chart-mixed' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header
        isLandingPage
        onLoginClick={() => openModal('login')}
        onSignupClick={() => openModal('signup')}
      />

      <main className="flex-1 w-full">
        {/* ═══════════════════ HERO SECTION ═══════════════════ */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[85vh] w-full overflow-hidden px-4">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="mesh-blob absolute w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20 blur-3xl -top-32 -left-32"
              style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}></div>
            <div className="mesh-blob-2 absolute w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15 blur-3xl top-1/4 right-0"
              style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}></div>
            <div className="mesh-blob-3 absolute w-[400px] h-[400px] rounded-full opacity-25 dark:opacity-15 blur-3xl bottom-0 left-1/3"
              style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Data · 10,000+ Coins
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-gray-900 dark:text-white">Track. Analyze.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">Invest Smarter.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              The intelligent crypto dashboard with real-time prices, AI-powered market analysis, community voting, and everything you need to navigate the crypto market with confidence.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openModal('signup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                id="hero-signup-btn"
              >
                Get Started Free
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-lg font-semibold hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                id="hero-explore-btn"
              >
                <i className="fa-solid fa-compass mr-2"></i>
                Explore Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════ TICKER STRIP ═══════════════════ */}
        {tickerCoins.length > 0 && (
          <section className="w-full overflow-hidden py-4 bg-gray-50/80 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            <div className="flex animate-ticker" style={{ width: 'max-content' }}>
              {[...tickerCoins, ...tickerCoins].map((coin, idx) => (
                <div key={`${coin.id}-${idx}`} className="flex items-center gap-2 px-6 py-1 whitespace-nowrap">
                  <img src={coin.image} width={20} height={20} alt={coin.symbol} className="rounded-full" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{coin.symbol.toUpperCase()}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${coin.current_price?.toLocaleString()}</span>
                  <span className={`text-xs font-bold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════ STATS BAR ═══════════════════ */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10,000+', label: 'Coins Tracked', icon: 'fa-coins' },
              { value: 'Real-Time', label: 'WebSocket Prices', icon: 'fa-bolt' },
              { value: 'AI', label: 'Market Analysis', icon: 'fa-brain' },
              { value: 'Web3', label: 'Wallet Support', icon: 'fa-wallet' },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-counter-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3">
                  <i className={`fa-solid ${stat.icon} text-blue-600 dark:text-blue-400`}></i>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
        <section id="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
                <i className="fa-solid fa-sparkles"></i> Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Track Crypto</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Powerful tools and insights to help you stay ahead of the market.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group glass-bg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:scale-[1.02]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                    <i className={`fa-solid ${f.icon} text-white text-lg`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <section className="py-16 px-4 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
                <i className="fa-solid fa-route"></i> How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Get Started in 3 Simple Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-700 z-0"></div>
                  )}
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                      <i className={`fa-solid ${step.icon} text-white text-2xl`}></i>
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 tracking-widest">{step.num}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ BENEFITS SECTION ═══════════════════ */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold mb-4">
                  <i className="fa-solid fa-shield-check"></i> Why CryptoGaze
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">Built for Traders Who Want an Edge</h2>
                <div className="space-y-5">
                  {[
                    { icon: 'fa-gauge-high', title: 'Lightning Fast', desc: 'WebSocket-powered live prices with sub-second updates directly from Binance.' },
                    { icon: 'fa-shield-halved', title: 'Secure & Private', desc: 'JWT authentication, encrypted passwords, and Web3 wallet integration.' },
                    { icon: 'fa-mobile-screen-button', title: 'Works Everywhere', desc: 'Fully responsive design that looks beautiful on desktop, tablet, and mobile.' },
                    { icon: 'fa-code-branch', title: 'Open Source', desc: 'Transparent, community-driven development. Contribute and shape the future.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${item.icon} text-blue-600 dark:text-blue-400`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Visual side — gradient card mockup */}
              <div className="relative">
                <div className="glass-bg rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">cryptogaze.app</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">₿</div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Bitcoin</div>
                          <div className="text-xs text-gray-500">BTC</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">$104,521</div>
                        <div className="text-xs font-bold text-green-600">+2.34%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Ξ</div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Ethereum</div>
                          <div className="text-xs text-gray-500">ETH</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">$3,892</div>
                        <div className="text-xs font-bold text-green-600">+1.87%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">◎</div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Solana</div>
                          <div className="text-xs text-gray-500">SOL</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">$178.42</div>
                        <div className="text-xs font-bold text-red-600">-0.92%</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -z-10 inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-600/20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ FINAL CTA ═══════════════════ */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center glass-bg rounded-3xl p-12 border border-blue-200 dark:border-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-blue-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-blue-600/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Tracking?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of crypto enthusiasts who trust CryptoGaze for real-time data, AI insights, and market intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => openModal('signup')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                  id="cta-signup-btn"
                >
                  Create Free Account
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-lg font-semibold hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50"
                  id="cta-explore-btn"
                >
                  Explore Without Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Auth Modal */}
      <Modal isOpen={showModal} onClose={closeModal}>
        <AuthForm onSuccess={handleAuthSuccess} initialMode={authMode} />
      </Modal>
    </div>
  );
}

export default Landing;