const { Schema, model } = require('mongoose');

const VoteSchema = new Schema({
  coinId: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentiment: {
    type: String,
    enum: ['bullish', 'bearish'],
    required: true
  },
  walletAddress: {
    type: String,
    default: null
  },
  network: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate votes: one vote per user per coin
VoteSchema.index({ coinId: 1, userId: 1 }, { unique: true });

const Vote = model('Vote', VoteSchema);

module.exports = Vote;
