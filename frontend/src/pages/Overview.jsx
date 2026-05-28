import { useEffect, useState, useRef } from 'react';
import { cryptoAPI } from '../api/crypto';
import { aiAPI } from '../api/ai';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chart from 'chart.js/auto';

function Overview() {
  const [globalData, setGlobalData] = useState(null);
  const [topCoins, setTopCoins] = useState([]);
  const [marketSummary, setMarketSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef();
  const chartInstance = useRef();

  // Fetch global data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      cryptoAPI.getGlobalData(),
      cryptoAPI.getMarkets(1, 10, false)
    ]).then(([global, coins]) => {
      setGlobalData(global.data);
      setTopCoins(coins);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch AI market summary
  useEffect(() => {
    setSummaryLoading(true);
    aiAPI.getMarketSummary()
      .then(res => {
        setMarketSummary(res.summary);
        setSummaryLoading(false);
      })
      .catch(() => {
        setMarketSummary('Market summary unavailable at the moment.');
        setSummaryLoading(false);
      });
  }, []);

  // Render dominance chart
  useEffect(() => {
    if (!chartRef.current || !globalData) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const mcp = globalData.market_cap_percentage;
    const labels = Object.keys(mcp).slice(0, 8).map(k => k.toUpperCase());
    const values = Object.values(mcp).slice(0, 8);
    const otherVal = 100 - values.reduce((a, b) => a + b, 0);
    if (otherVal > 0) {
      labels.push('Other');
      values.push(otherVal);
    }

    const colors = [
      '#f7931a', '#627eea', '#26a17b', '#e84142', '#2775ca',
      '#8247e5', '#00d4aa', '#23292f', '#888888'
    ];

    chartInstance.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values.map(v => v.toFixed(2)),
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, family: 'Inter' }, padding: 16 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        },
        cutout: '60%',
        animation: { animateScale: true, animateRotate: true }
      }
    });
  }, [globalData]);

  const formatNum = (n) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  // Sort top coins for gainers/losers
  const gainers = [...topCoins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
  const losers = [...topCoins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent text-center">
          <i className="fa-solid fa-chart-pie mr-2"></i>Market Overview
        </h1>

        {loading ? (
          <div className="text-center py-16 text-lg">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div>Loading market data...</div>
          </div>
        ) : globalData ? (
          <>
            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Market Cap</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatNum(globalData.total_market_cap.usd)}</div>
                <div className={`text-sm mt-1 font-semibold ${globalData.market_cap_change_percentage_24h_usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {globalData.market_cap_change_percentage_24h_usd >= 0 ? <i className="fa-solid fa-caret-up mr-1"></i> : <i className="fa-solid fa-caret-down mr-1"></i>}
                  {Math.abs(globalData.market_cap_change_percentage_24h_usd).toFixed(2)}% (24h)
                </div>
              </div>
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">24h Trading Volume</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatNum(globalData.total_volume.usd)}</div>
              </div>
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">BTC Dominance</div>
                <div className="text-2xl font-bold text-orange-500">{globalData.market_cap_percentage.btc.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">ETH: {globalData.market_cap_percentage.eth.toFixed(1)}%</div>
              </div>
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Cryptocurrencies</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{globalData.active_cryptocurrencies.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Markets: {globalData.markets.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Dominance Chart */}
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
                  <i className="fa-solid fa-chart-pie mr-2"></i>Market Dominance
                </h2>
                <div style={{ height: '320px' }}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* AI Market Summary */}
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20">
                <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <i className="fa-solid fa-robot"></i>AI Market Summary
                  <span className="text-xs font-normal text-gray-500 ml-auto">Powered by Gemini</span>
                </h2>
                {summaryLoading ? (
                  <div className="flex items-center gap-3 py-8">
                    <i className="fa-solid fa-spinner fa-spin text-purple-500"></i>
                    <span className="text-gray-500">Generating market summary...</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{marketSummary}</div>
                )}
              </div>
            </div>

            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800">
                <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
                  <i className="fa-solid fa-arrow-trend-up mr-2"></i>Top Gainers (24h)
                </h2>
                <div className="space-y-3">
                  {gainers.map(coin => (
                    <div key={coin.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-all" onClick={() => window.location.href = `/coin/${coin.id}`}>
                      <img src={coin.image} width={28} height={28} alt={coin.name} className="rounded-full" />
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{coin.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{coin.symbol.toUpperCase()}</span>
                      </div>
                      <span className="text-green-600 font-bold text-sm">
                        <i className="fa-solid fa-caret-up mr-1"></i>{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-bg rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800">
                <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-300">
                  <i className="fa-solid fa-arrow-trend-down mr-2"></i>Top Losers (24h)
                </h2>
                <div className="space-y-3">
                  {losers.map(coin => (
                    <div key={coin.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-all" onClick={() => window.location.href = `/coin/${coin.id}`}>
                      <img src={coin.image} width={28} height={28} alt={coin.name} className="rounded-full" />
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{coin.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{coin.symbol.toUpperCase()}</span>
                      </div>
                      <span className="text-red-600 font-bold text-sm">
                        <i className="fa-solid fa-caret-down mr-1"></i>{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-600">Failed to load market data.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Overview;