const mongoose = require('mongoose');

const savedSchemeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    matchPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks by same user
savedSchemeSchema.index({ userId: 1, schemeId: 1 }, { unique: true });

module.exports = mongoose.model('SavedScheme', savedSchemeSchema);
