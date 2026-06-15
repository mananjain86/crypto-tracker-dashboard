const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://crypto-tracker-dashboard-tau-ten.vercel.app',
    'https://crypto-gaze-tracker.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// MongoDB connection — don't crash on failure, retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const coingeckoRoutes = require('./routes/coingecko');
const binanceRoutes = require('./routes/binance');
const voteRoutes = require('./routes/vote');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/coingecko', coingeckoRoutes);
app.use('/api/binance', binanceRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => res.send('API Running'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
