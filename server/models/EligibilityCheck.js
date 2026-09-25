const mongoose = require('mongoose');

const eligibilityCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userInputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    eligibleSchemeCount: {
      type: Number,
      default: 0,
    },
    stateQueried: {
      type: String,
      default: '',
      index: true,
    },
    categoryQueried: {
      type: String,
      default: '',
    },
    topMatchedSchemes: [
      {
        schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
        schemeName: String,
        matchScore: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EligibilityCheck', eligibilityCheckSchema);
