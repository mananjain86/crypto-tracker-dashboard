import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { watchlistAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chart from 'chart.js/auto';

const timeframes = [
  { label: '24h', value: 1 },
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '1y', value: 365 },
];

function CoinPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [coin, setCoin] = useState(null);
  const [binanceTicker, setBinanceTicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({ labels: [], prices: [] });
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);
  const chartRef = useRef();
  const chartInstance = useRef();

  // Fetch coin details (CoinGecko)
  useEffect(() => {
    setLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
      .then(res => res.json())
      .then(data => {
        setCoin(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load coin details.');
        setLoading(false);
      });
  }, [id]);

  // Fetch Binance ticker for this coin (every 5s)
  useEffect(() => {
    if (!coin) return;
    let interval;
    const fetchBinance = () => {
      fetch('https://api.binance.com/api/v3/ticker/24hr')
        .then(res => res.json())
        .then(data => {
          // Try to find the USDT pair for this coin's symbol
          const symbol = coin.symbol.toUpperCase();
          const ticker = data.find(t => t.symbol === symbol + 'USDT');
          setBinanceTicker(ticker || null);
        })
        .catch(() => setBinanceTicker(null));
    };
    fetchBinance();
    interval = setInterval(fetchBinance, 5000);
    return () => clearInterval(interval);
  }, [coin]);

  // Fetch chart data
  useEffect(() => {
    if (!id) return;
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${selectedTimeframe}`)
      .then(res => res.json())
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
          borderColor: 'hsl(219, 88%, 57%)',
          fill: true,
          backgroundColor: 'hsla(219, 88.10%, 57.10%, 0.13)',
          tension: 0.1,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'nearest', intersect: false },
        },
        scales: {
          x: { grid: { display: false }, title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Price (USD)' }, ticks: { callback: value => '$' + value.toLocaleString() } },
        },
        animation: { duration: 500, easing: 'easeIn' },
      },
    });
  }, [chartData, chartRef, id]);

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
    if (!user) return alert('You must be logged in to use the watchlist.');
    
    try {
      const token = localStorage.getItem('token');
      if (inWatchlist) {
        await watchlistAPI.removeFromWatchlist(token, id);
      } else {
        await watchlistAPI.addToWatchlist(token, id);
      }
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : coin ? (
          <div className="coin-overview glass-bg rounded-3xl shadow-xl p-8 fade-in slide-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
              <h3 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent">
                <img src={coin.image.large} alt={coin.name} width={48} className="drop-shadow-lg" />
                {coin.name} <span className="text-lg font-semibold text-blue-400">({coin.symbol.toUpperCase()})</span>
              </h3>
              <button
                onClick={() => { handleWatchlistToggle(); }}
                className="text-2xl rounded-full p-2 bg-white/70 dark:bg-gray-800/70 shadow hover:bg-blue-100 dark:hover:bg-blue-900 transition-all border border-blue-200 dark:border-blue-800"
                aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                title={user ? (inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist') : 'Login to use Watchlist'}
              >
                {inWatchlist ? (
                  <i className="fa-solid fa-star text-yellow-400"></i>
                ) : (
                  <i className="fa-regular fa-star"></i>
                )}
              </button>
            </div>
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent">
              ${binanceTicker ? parseFloat(binanceTicker.lastPrice).toLocaleString() : coin.market_data.current_price.usd.toLocaleString()}
            </h1>
            <span className={((binanceTicker ? parseFloat(binanceTicker.priceChangePercent) : coin.market_data.price_change_percentage_24h) >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold')}>
              {(binanceTicker ? parseFloat(binanceTicker.priceChangePercent) : coin.market_data.price_change_percentage_24h) >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}
              {Math.abs(binanceTicker ? parseFloat(binanceTicker.priceChangePercent) : coin.market_data.price_change_percentage_24h).toFixed(2)}%
            </span>
            <small><p className="py-4 text-gray-500 dark:text-gray-300">{coin.description.en}</p></small>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 mt-6">
              <div className='md:col-span-1'>
                <div className='flex flex-col gap-4 glass-bg rounded-2xl p-4 shadow-md'>
                  <div>
                    <h4 className="font-semibold mb-2 text-lg text-blue-700 dark:text-blue-300">Market Data</h4>
                    <ul className="text-sm space-y-1">
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Market Cap Rank: <span className="float-right font-bold">{coin.market_cap_rank}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Current Price: <span className="float-right font-bold">${binanceTicker ? parseFloat(binanceTicker.lastPrice).toLocaleString() : coin.market_data.current_price.usd.toLocaleString()}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Market Cap: <span className="float-right font-bold">${coin.market_data.market_cap.usd.toLocaleString()}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>FDV: <span className="float-right font-bold">${coin.market_data.fully_diluted_valuation.usd?.toLocaleString() || 'N/A'}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Market Cap/FDV: <span className="float-right font-bold">{coin.market_data.market_cap_fdv_ratio}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Total Volume: <span className="float-right font-bold">${binanceTicker ? parseFloat(binanceTicker.quoteVolume).toLocaleString() : coin.market_data.total_volume.usd.toLocaleString()}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Circulating Supply: <span className="float-right font-bold">{coin.market_data.circulating_supply.toLocaleString()}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Total Supply: <span className="float-right font-bold">{coin.market_data.total_supply?.toLocaleString() || 'N/A'}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>Max Supply: <span className="float-right font-bold">{coin.market_data.max_supply ? coin.market_data.max_supply.toLocaleString() : '∞'}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>All Time High: <span className="float-right font-bold">${coin.market_data.ath.usd.toLocaleString()}</span></li>
                      <li>All Time Low: <span className="float-right font-bold">${coin.market_data.atl.usd.toLocaleString()}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-lg text-blue-700 dark:text-blue-300">Price Change</h4>
                    <ul className="text-sm space-y-1">
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>1 HOUR: <span className="float-right font-bold">${coin.market_data.price_change_percentage_1h_in_currency.usd}</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>1 DAY: <span className={coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-600 float-right font-bold' : 'text-red-600 float-right font-bold'}>{coin.market_data.price_change_percentage_24h >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}{Math.abs(coin.market_data.price_change_percentage_24h).toFixed(2)}%</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>1 WEEK: <span className={coin.market_data.price_change_percentage_7d >= 0 ? 'text-green-600 float-right font-bold' : 'text-red-600 float-right font-bold'}>{coin.market_data.price_change_percentage_7d >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}{Math.abs(coin.market_data.price_change_percentage_7d).toFixed(2)}%</span></li>
                      <li className='border-b border-gray-200 dark:border-gray-700 pb-1'>1 MONTH: <span className={coin.market_data.price_change_percentage_30d >= 0 ? 'text-green-600 float-right font-bold' : 'text-red-600 float-right font-bold'}>{coin.market_data.price_change_percentage_30d >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}{Math.abs(coin.market_data.price_change_percentage_30d).toFixed(2)}%</span></li>
                      <li>1 YEAR: <span className={coin.market_data.price_change_percentage_1y >= 0 ? 'text-green-600 float-right font-bold' : 'text-red-600 float-right font-bold'}>{coin.market_data.price_change_percentage_1y >= 0 ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}{Math.abs(coin.market_data.price_change_percentage_1y).toFixed(2)}%</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full h-[32rem] md:h-[40rem] md:col-span-2 glass-bg rounded-2xl shadow-lg flex flex-col items-center justify-center p-6">
                {chartData.labels && chartData.labels.length > 0 && (
                  <canvas ref={chartRef} width={1000} height={500} className="w-full h-full mx-4 mt-4" />
                )}
                <div className='flex justify-center mt-4'>
                  {timeframes.map(tf => (
                    <button
                      key={tf.value}
                      className={`chartDuration m-2 px-8 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md border-2 border-blue-200 dark:border-blue-800 ${selectedTimeframe === tf.value ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white' : 'bg-white/70 dark:bg-gray-800/70 text-blue-700 dark:text-blue-200'}`}
                      onClick={() => setSelectedTimeframe(tf.value)}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default CoinPage; 