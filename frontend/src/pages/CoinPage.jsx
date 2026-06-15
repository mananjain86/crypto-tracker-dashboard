import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { watchlistAPI } from '../api/auth';
import { cryptoAPI } from '../api/crypto';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chart from 'chart.js/auto';
import { toast } from 'react-hot-toast';

const timeframes = [
  { label: '24H', value: 1 },
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '1Y', value: 365 },
];

function CoinPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({ labels: [], prices: [] });
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Fetch coin details via backend proxy
  useEffect(() => {
    setLoading(true);
    cryptoAPI.getCoinDetails(id)
      .then(data => {
        setCoin(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load coin details.');
        setLoading(false);
      });
  }, [id]);

  // WebSocket for live price
  const coinSymbol = coin?.symbol?.toUpperCase();
  const { prices: wsPrices, connected: wsConnected } = useBinanceWebSocket(
    coinSymbol ? [coinSymbol] : [],
    !!coin
  );
  const binanceTicker = coinSymbol ? wsPrices[coinSymbol] : null;

  // Fetch chart data via backend proxy
  useEffect(() => {
    if (!id) return;
    cryptoAPI.getMarketChart(id, selectedTimeframe)
      .then(data => {
        setChartData({
          labels: data.prices.map(price => new Date(price[0]).toLocaleDateString()),
          prices: data.prices.map(price => price[1]),
        });
      });
  }, [id, selectedTimeframe]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current || !chartData.labels || chartData.labels.length === 0) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: `${id?.toUpperCase()} Price (USD)`,
          data: chartData.prices,
          borderColor: '#3b82f6', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          x: { 
            display: false,
            grid: { display: false }
          },
          y: { 
            display: true,
            position: 'right',
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { 
              callback: value => '$' + (value >= 1000 ? (value/1000).toFixed(1) + 'k' : value.toLocaleString()),
              color: '#94a3b8'
            }
          },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        animation: { duration: 800, easing: 'easeOutQuart' },
      },
    });
  }, [chartData, id, loading]);

  // Watchlist logic
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user) return setInWatchlist(false);
      try {
        const token = localStorage.getItem('token');
        const response = await watchlistAPI.getWatchlist(token);
        const watchlistIds = response.watchlist || [];
        setInWatchlist(watchlistIds.includes(id));
      } catch (error) {
        console.error('Error checking watchlist:', error);
        setInWatchlist(false);
      }
    };
    checkWatchlist();
  }, [id, user]);

  const handleWatchlistToggle = async () => {
    if (!user) return toast.error('You must be logged in to use the watchlist.');
    try {
      const token = localStorage.getItem('token');
      if (inWatchlist) {
        await watchlistAPI.removeFromWatchlist(token, id);
        toast.success(`${coin?.name} removed from watchlist`);
      } else {
        await watchlistAPI.addToWatchlist(token, id);
        toast.success(`${coin?.name} added to watchlist`);
      }
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error(error.message || 'Failed to update watchlist.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading asset details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Asset Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">{error || "We couldn't load this coin's data."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = binanceTicker ? parseFloat(binanceTicker.lastPrice) : coin.market_data.current_price.usd;
  const priceChange = binanceTicker ? parseFloat(binanceTicker.priceChangePercent) : coin.market_data.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 selection:bg-blue-500/30">
      <Header />
      
      {/* Premium Hero Section */}
      <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="relative">
                <img src={coin.image.large} alt={coin.name} className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shadow-lg border-2 border-white dark:border-gray-700 bg-white dark:bg-gray-800 p-1" />
                <span className="absolute -bottom-2 -right-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-white dark:border-gray-800 shadow-sm">
                  #{coin.market_cap_rank}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{coin.name}</h1>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-lg uppercase tracking-wider">
                    {coin.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <button onClick={handleWatchlistToggle} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <i className={`${inWatchlist ? 'fa-solid text-yellow-400' : 'fa-regular'} fa-star text-lg`}></i>
                    {inWatchlist ? 'On Watchlist' : 'Add to Watchlist'}
                  </button>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                  <a href={coin.links?.homepage[0]} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <i className="fa-solid fa-link"></i> Website
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:items-end">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                Current Price
                {wsConnected && <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>LIVE</span>}
              </div>
              <div className="flex items-baseline gap-4">
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </h2>
                <span className={`text-lg lg:text-xl font-bold flex items-center gap-1 px-3 py-1 rounded-xl ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                  <i className={`fa-solid fa-caret-${isPositive ? 'up' : 'down'}`}></i>
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content (Chart & AI) */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            
            {/* Chart Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-blue-500"></i> Price History
                </h3>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  {timeframes.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setSelectedTimeframe(tf.value)}
                      className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${selectedTimeframe === tf.value ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full h-[350px] lg:h-[450px]">
                {/* Canvas is always rendered so chartRef is immediately available */}
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </div>

            {/* About Section */}
            {coin.description?.en && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {coin.name}</h3>
                <div 
                  className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: coin.description.en }}
                />
              </div>
            )}
            
          </div>

          {/* Sidebar (Stats) */}
          <div className="flex flex-col gap-6">
            
            {/* Market Stats Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Market Statistics</h3>
              
              <div className="flex flex-col gap-5">
                <StatRow label="Market Cap" value={`$${coin.market_data.market_cap.usd.toLocaleString()}`} />
                <StatRow label="Fully Diluted Valuation" value={coin.market_data.fully_diluted_valuation?.usd ? `$${coin.market_data.fully_diluted_valuation.usd.toLocaleString()}` : 'N/A'} />
                <StatRow label="24h Trading Volume" value={`$${coin.market_data.total_volume.usd.toLocaleString()}`} />
                <StatRow label="24h High" value={`$${coin.market_data.high_24h?.usd?.toLocaleString() || 'N/A'}`} />
                <StatRow label="24h Low" value={`$${coin.market_data.low_24h?.usd?.toLocaleString() || 'N/A'}`} />
                <StatRow label="Circulating Supply" value={coin.market_data.circulating_supply.toLocaleString()} />
                <StatRow label="Total Supply" value={coin.market_data.total_supply?.toLocaleString() || '∞'} />
                <StatRow label="Max Supply" value={coin.market_data.max_supply?.toLocaleString() || '∞'} />
              </div>
            </div>

            {/* Performance Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Price Performance</h3>
              
              <div className="flex flex-col gap-5">
                <StatRow label="7 Days" value="" subValue={<span className={`${coin.market_data.price_change_percentage_7d >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>{coin.market_data.price_change_percentage_7d?.toFixed(2) || 0}%</span>} />
                <StatRow label="14 Days" value="" subValue={<span className={`${coin.market_data.price_change_percentage_14d >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>{coin.market_data.price_change_percentage_14d?.toFixed(2) || 0}%</span>} />
                <StatRow label="30 Days" value="" subValue={<span className={`${coin.market_data.price_change_percentage_30d >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>{coin.market_data.price_change_percentage_30d?.toFixed(2) || 0}%</span>} />
                <StatRow label="1 Year" value="" subValue={<span className={`${coin.market_data.price_change_percentage_1y >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>{coin.market_data.price_change_percentage_1y?.toFixed(2) || 0}%</span>} />
              </div>
            </div>

            {/* Community & Dev Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Community & Development</h3>
              
              <div className="flex flex-col gap-5">
                <StatRow label="Twitter Followers" value={coin.community_data?.twitter_followers?.toLocaleString() || 'N/A'} />
                <StatRow label="Reddit Subscribers" value={coin.community_data?.reddit_subscribers?.toLocaleString() || 'N/A'} />
                <StatRow label="GitHub Stars" value={coin.developer_data?.stars?.toLocaleString() || 'N/A'} />
                <StatRow label="GitHub Forks" value={coin.developer_data?.forks?.toLocaleString() || 'N/A'} />
              </div>
            </div>

            {/* Historical Stats Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Historical Highs & Lows</h3>
              
              <div className="flex flex-col gap-5">
                <StatRow label="All-Time High" value={`$${coin.market_data.ath.usd.toLocaleString()}`} subValue={<span className="text-red-500 font-medium ml-2">{coin.market_data.ath_change_percentage.usd.toFixed(1)}%</span>} />
                <div className="text-xs text-gray-400 dark:text-gray-500 text-right -mt-4 mb-2">{new Date(coin.market_data.ath_date.usd).toLocaleDateString()}</div>
                
                <StatRow label="All-Time Low" value={`$${coin.market_data.atl.usd.toLocaleString()}`} subValue={<span className="text-green-500 font-medium ml-2">+{coin.market_data.atl_change_percentage.usd.toFixed(1)}%</span>} />
                <div className="text-xs text-gray-400 dark:text-gray-500 text-right -mt-4 mb-2">{new Date(coin.market_data.atl_date.usd).toLocaleDateString()}</div>
              </div>
            </div>

          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

// Helper component for stat rows
function StatRow({ label, value, subValue }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{label}</span>
      <div className="text-right">
        <span className="text-gray-900 dark:text-white font-bold">{value}</span>
        {subValue}
      </div>
    </div>
  );
}

export default CoinPage;