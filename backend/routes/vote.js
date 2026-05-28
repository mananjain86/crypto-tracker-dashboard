const express = require('express');
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/vote
 * @desc    Cast a vote (bullish/bearish) on a coin
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { coinId, sentiment, walletAddress } = req.body;

    if (!coinId || !sentiment) {
      return res.status(400).json({ success: false, message: 'coinId and sentiment are required' });
    }

    if (!['bullish', 'bearish'].includes(sentiment)) {
      return res.status(400).json({ success: false, message: 'sentiment must be bullish or bearish' });
    }

    // Upsert: update if exists, create if not
    const vote = await Vote.findOneAndUpdate(
      { coinId, userId: req.user },
      { coinId, userId: req.user, sentiment, walletAddress: walletAddress || null, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`🗳️ Vote cast: ${sentiment} on ${coinId} by user ${req.user}`);

    res.json({ success: true, vote });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/vote/:coinId
 * @desc    Get vote tallies for a specific coin
 * @access  Public
 */
router.get('/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;

    const [bullish, bearish] = await Promise.all([
      Vote.countDocuments({ coinId, sentiment: 'bullish' }),
      Vote.countDocuments({ coinId, sentiment: 'bearish' })
    ]);

    // Get user's vote if authenticated
    let userVote = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existing = await Vote.findOne({ coinId, userId: decoded.id });
        if (existing) userVote = existing.sentiment;
      } catch (e) {
        // Ignore auth errors for public endpoint
      }
    }

    res.json({
      success: true,
      coinId,
      bullish,
      bearish,
      total: bullish + bearish,
      bullishPercent: bullish + bearish > 0 ? Math.round((bullish / (bullish + bearish)) * 100) : 50,
      userVote
    });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/vote/top/coins
 * @desc    Get top voted coins
 * @access  Public
 */
router.get('/top/coins', async (req, res) => {
  try {
    const topCoins = await Vote.aggregate([
      {
        $group: {
          _id: '$coinId',
          totalVotes: { $sum: 1 },
          bullish: { $sum: { $cond: [{ $eq: ['$sentiment', 'bullish'] }, 1, 0] } },
          bearish: { $sum: { $cond: [{ $eq: ['$sentiment', 'bearish'] }, 1, 0] } }
        }
      },
      { $sort: { totalVotes: -1 } },
      { $limit: 20 },
      {
        $project: {
          coinId: '$_id',
          totalVotes: 1,
          bullish: 1,
          bearish: 1,
          bullishPercent: {
            $round: [{ $multiply: [{ $divide: ['$bullish', '$totalVotes'] }, 100] }, 0]
          },
          _id: 0
        }
      }
    ]);

    res.json({ success: true, coins: topCoins });
  } catch (error) {
    console.error('Top votes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
