const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['Resource', 'Course'],
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType',
  },
}, {
  timestamps: true,
});

WishlistSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
