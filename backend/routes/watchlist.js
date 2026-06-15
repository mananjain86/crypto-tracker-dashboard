const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      watchlist: user.watchlist
    });
  } catch (err) {
    console.error('Get watchlist error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/watchlist/add
// @desc    Add coin to watchlist
// @access  Private
router.post('/add', auth, async (req, res) => {
  try {
    const { coinId } = req.body;
    
    if (!coinId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coin ID is required' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { watchlist: coinId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Console log when coin is added to watchlist
    console.log(`➕ Coin added to watchlist: ${coinId} by user ${user.email} (ID: ${user._id})`);
    
    res.json({
      success: true,
      watchlist: user.watchlist,
      message: 'Coin added to watchlist'
    });
  } catch (err) {
    console.error('Add to watchlist error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + err.message
    });
  }
});

// @route   POST /api/watchlist/remove
// @desc    Remove coin from watchlist
// @access  Private
router.post('/remove', auth, async (req, res) => {
  try {
    const { coinId } = req.body;
    
    if (!coinId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coin ID is required' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { $pull: { watchlist: coinId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Console log when coin is removed from watchlist
    console.log(`➖ Coin removed from watchlist: ${coinId} by user ${user.email} (ID: ${user._id})`);
    
    res.json({
      success: true,
      watchlist: user.watchlist,
      message: 'Coin removed from watchlist'
    });
  } catch (err) {
    console.error('Remove from watchlist error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + err.message
    });
  }
});

// @route   DELETE /api/watchlist/clear
// @desc    Clear entire watchlist
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.watchlist = [];
    await user.save();
    
    res.json({
      success: true,
      watchlist: user.watchlist,
      message: 'Watchlist cleared'
    });
  } catch (err) {
    console.error('Clear watchlist error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 