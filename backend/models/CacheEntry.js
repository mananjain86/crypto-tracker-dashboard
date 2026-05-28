const { Schema, model } = require('mongoose');

const CacheEntrySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL index: auto-delete after 10 minutes (max)
  }
});

const CacheEntry = model('CacheEntry', CacheEntrySchema);

module.exports = CacheEntry;
