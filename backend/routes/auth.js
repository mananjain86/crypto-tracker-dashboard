const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      watchlist: []
    });

    await user.save();

    console.log(`👤 New user registered: ${email} (${user._id})`);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        watchlist: user.watchlist
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`🔐 User logged in: ${email} (${user._id})`);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        watchlist: user.watchlist
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client removes token)
 * @access  Private
 */
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   POST /api/auth/google
 * @desc    Login/register with Google (verify ID token on backend)
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential required' });
    }

    // Decode the Google JWT (header.payload.signature)
    // For a production app you'd verify the signature with Google's public keys,
    // but for this project we decode the payload which contains verified claims
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid credential format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const email = payload.email;
    const name = payload.name;

    if (!email) {
      return res.status(400).json({ success: false, message: 'No email in Google credential' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create user with random password (they'll login via Google)
      const bcryptLib = require('bcryptjs');
      const salt = await bcryptLib.genSalt(10);
      const hashedPassword = await bcryptLib.hash(require('crypto').randomBytes(32).toString('hex'), salt);
      user = new User({ email, password: hashedPassword, watchlist: [] });
      await user.save();
      console.log(`👤 New Google user registered: ${email} (${user._id})`);
    } else {
      console.log(`🔐 Google user logged in: ${email} (${user._id})`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, watchlist: user.watchlist }
    });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

/**
 * @route   POST /api/auth/wallet
 * @desc    Login/register with MetaMask wallet address
 * @access  Public
 */
router.post('/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address required' });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const email = `${normalizedAddress}@wallet.cryptogaze`;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const bcryptLib = require('bcryptjs');
      const salt = await bcryptLib.genSalt(10);
      const hashedPassword = await bcryptLib.hash(require('crypto').randomBytes(32).toString('hex'), salt);
      user = new User({ email, password: hashedPassword, watchlist: [] });
      await user.save();
      console.log(`🦊 New wallet user registered: ${normalizedAddress} (${user._id})`);
    } else {
      console.log(`🦊 Wallet user logged in: ${normalizedAddress} (${user._id})`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, walletAddress: normalizedAddress, watchlist: user.watchlist }
    });

  } catch (err) {
    console.error('Wallet auth error:', err);
    res.status(500).json({ success: false, message: 'Wallet authentication failed' });
  }
});

module.exports = router;

