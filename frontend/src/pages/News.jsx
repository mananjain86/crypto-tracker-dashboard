import { useEffect, useState } from 'react';
import { cryptoAPI } from '../api/crypto';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Map coins to categories (simplified mapping)
const COIN_CATEGORIES = {
  'bitcoin': 'Layer 1', 'ethereum': 'Layer 1', 'solana': 'Layer 1', 'cardano': 'Layer 1',
  'avalanche-2': 'Layer 1', 'polkadot': 'Layer 1', 'near': 'Layer 1', 'cosmos': 'Layer 1',
  'uniswap': 'DeFi', 'aave': 'DeFi', 'chainlink': 'DeFi', 'maker': 'DeFi', 'lido-dao': 'DeFi',
  'dogecoin': 'Meme', 'shiba-inu': 'Meme', 'pepe': 'Meme', 'floki': 'Meme', 'bonk': 'Meme',
  'tether': 'Stablecoin', 'usd-coin': 'Stablecoin', 'dai': 'Stablecoin',
};

function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss')
      .then(res => res.json())
      .then(data => {
         if (data.status === 'ok') {
            const items = data.items.map((item, index) => {
              // Extract text from HTML description
              const temp = document.createElement('div');
              temp.innerHTML = item.description;
              const textContent = temp.textContent || temp.innerText || '';
              
              // Find an image from the content if thumbnail is missing
              let imgUrl = item.thumbnail;
              if (!imgUrl) {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgUrl = imgMatch[1];
              }

              return {
                id: item.guid || index.toString(),
                title: item.title,
                summary: textContent.substring(0, 150) + '...',
                source: 'Cointelegraph',
                timestamp: new Date(item.pubDate).toLocaleString(),
                url: item.link,
                image: imgUrl || 'https://s3.cointelegraph.com/storage/uploads/view/b9ea15d46738b4df64e6e100ab59b373.png',
                category: item.categories && item.categories.length > 0 ? item.categories[0] : 'General',
                sentiment: 'neutral',
                change: 0
              };
            });
            setNewsItems(items);
         }
         setLoading(false);
      })
      .catch((err) => {
        console.error("News fetch error:", err);
        setLoading(false);
      });
  }, []);



  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-700 bg-clip-text text-transparent text-center">
          <i className="fa-solid fa-newspaper mr-2"></i>Crypto News & Insights
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Market intelligence powered by real-time data</p>

        {/* News Feed */}
        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <div>Loading news...</div>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No news items found.</div>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="glass-bg rounded-2xl p-5 shadow-md border border-blue-200 dark:border-blue-800 flex gap-4 items-start hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                <img src={item.image} width={64} height={64} alt={item.title} className="rounded-xl shadow object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.sentiment === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      item.sentiment === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.sentiment === 'bullish' ? <i className="fa-solid fa-arrow-up mr-1"></i> : item.sentiment === 'bearish' ? <i className="fa-solid fa-arrow-down mr-1"></i> : <i className="fa-solid fa-fire mr-1"></i>}
                      {item.sentiment}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{item.category}</span>
                    <span className="text-xs text-gray-400 ml-auto">{item.source}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                </div>
                {item.change !== 0 && (
                  <div className={`text-right flex-shrink-0 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-lg font-bold">
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default News;