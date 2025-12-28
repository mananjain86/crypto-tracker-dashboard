import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header isLandingPage />
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[90vh] w-full overflow-hidden fade-in">
          {/* Animated Particle Background (SVG, less dense, gentle movement) */}
          <svg className="absolute inset-0 w-full h-full z-0 animate-particles" style={{ pointerEvents: 'none' }}>
            <defs>
              <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </radialGradient>
            </defs>
            {[...Array(10)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100 + '%'}
                cy={Math.random() * 100 + '%'}
                r={Math.random() * 40 + 18}
                fill="url(#particleGradient)"
                opacity={Math.random() * 0.2 + 0.08}
                className={`animate-particle-move${i % 3}`}
              />
            ))}
          </svg>
          {/* Subtitle */}
          <div className="text-base sm:text-lg text-blue-500 dark:text-blue-300 font-semibold tracking-widest uppercase mb-2 z-10 animate-fadein-slow">Next-Gen Crypto Dashboard</div>
          {/* Decorative Icon with Gradient Border and Glow */}
          <div className="mb-4 flex justify-center relative z-10">
            <span className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-blue-400 to-blue-700 shadow-2xl ring-8 ring-blue-400/40 dark:ring-blue-900/60 animate-pulse border-4 border-gradient-to-tr from-blue-300 via-blue-500 to-blue-700">
              <i className="fa-solid fa-coins text-6xl text-white drop-shadow-xl"></i>
            </span>
          </div>
          {/* Multi-layered Glassmorphism Card with Floating Animation, more transparent, border glow */}
          <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-2 border-blue-200 dark:border-blue-800 rounded-3xl shadow-2xl px-8 py-14 max-w-2xl mx-auto flex flex-col items-center relative z-10 animate-float-slow before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-blue-200/40 before:to-blue-400/10 before:pointer-events-none before:z-[-1] before:shadow-[0_0_32px_8px_rgba(59,130,246,0.15)]">
            <h1 className="text-4xl font-extrabold mb-2 text-blue-900 dark:text-blue-200 drop-shadow-2xl animate-fadein">Welcome to <span className="text-blue-700 dark:text-blue-300">CryptoGaze</span></h1>
            <div className="text-base mb-3 font-medium tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 animate-gradient-slow">Empowering your crypto journey</div>
            <p className="text-base text-blue-900/80 dark:text-blue-100 mb-6 max-w-xl mx-auto animate-fadein-slow">Your ultimate destination for tracking cryptocurrency trends and insights. Stay ahead with real-time data, analytics, and a beautiful, user-friendly interface.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
              <button
                onClick={() => navigate('/home')}
                className="px-16 py-5 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl text-2xl font-bold shadow-xl hover:scale-105 hover:from-blue-800 hover:to-blue-600 transition-all duration-200"
              >
                Enter App
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 border-2 border-blue-400 text-blue-700 dark:text-blue-200 rounded-2xl text-xl font-semibold shadow hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 bg-white/70 dark:bg-gray-800/70"
              >
                <i className="fa-solid fa-arrow-down-right"></i> Learn More
              </button>
            </div>
          </div>
          {/* Decorative gradient border ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-blue-400/30 via-blue-200/10 to-blue-700/30 blur-2xl z-0"></div>
        </section>

        {/* Section Divider */}
        <div className="section-divider"></div>
        {/* Features Section */}
        <section id="features" className="max-w-5xl mx-auto py-16 px-4 slide-up glass-bg rounded-3xl shadow-xl mt-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-chart-line text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">Real-Time Data Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Get up-to-the-second prices and market data for thousands of cryptocurrencies.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-chart-pie text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">Intuitive Charts & Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Visualize trends and analyze performance with beautiful, interactive charts.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-wallet text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">Portfolio Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Track your holdings and watchlist in one place, with easy management tools.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-bell text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">Customizable Alerts</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Set price alerts and never miss a market move that matters to you.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-user-friends text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">User-Friendly Interface</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Enjoy a clean, modern design that works beautifully on any device.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-code-branch text-3xl text-blue-600 mb-4"></i>
              <h3 className="font-semibold text-lg mb-2">Open-Source Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Join our community and help shape the future of crypto tracking.</p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="bg-blue-50 dark:bg-gray-800 py-16 px-4 glass-bg rounded-3xl shadow-xl mt-8 slide-up">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-6 text-center">Our Mission & Vision</h2>
            <div className="text-lg text-gray-700 dark:text-gray-200 mb-4 text-center">
              <p className="mb-2"><strong>Mission:</strong> To provide accurate, real-time data and insights to crypto enthusiasts and investors worldwide.</p>
              <p><strong>Vision:</strong> To become the go-to platform for cryptocurrency analysis and tracking, empowering users to navigate the crypto market with confidence.</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="max-w-5xl mx-auto py-16 px-4 glass-bg rounded-3xl shadow-xl mt-8 slide-up">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-user-circle text-4xl text-blue-600 mb-2"></i>
              <p className="italic text-gray-700 dark:text-gray-200 mb-2 text-center">“CryptoGaze makes tracking my portfolio effortless. The real-time data and charts are top-notch!”</p>
              <span className="font-semibold text-blue-700 dark:text-blue-300">— Priya S.</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-user-circle text-4xl text-blue-600 mb-2"></i>
              <p className="italic text-gray-700 dark:text-gray-200 mb-2 text-center">“I love the alerts and the clean design. CryptoGaze is my go-to for crypto news and prices.”</p>
              <span className="font-semibold text-blue-700 dark:text-blue-300">— Alex R.</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <i className="fa-solid fa-user-circle text-4xl text-blue-600 mb-2"></i>
              <p className="italic text-gray-700 dark:text-gray-200 mb-2 text-center">“The best crypto dashboard I’ve used. Highly recommended for beginners and pros alike!”</p>
              <span className="font-semibold text-blue-700 dark:text-blue-300">— Meera T.</span>
            </div>
          </div>
        </section>

        {/* Call to Action Section (repeated at bottom) */}
        <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-400 text-center glass-bg rounded-3xl shadow-xl mt-8 slide-up">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore the crypto market like never before?</h2>
          <button
            onClick={() => navigate('/home')}
            className="mt-2 px-10 py-3 bg-white text-blue-700 rounded-lg text-lg font-semibold shadow hover:bg-blue-100 transition"
          >
            Enter App
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Landing; 