const mongoose = require('mongoose');

const stateDistrictSchema = new mongoose.Schema(
  {
    stateName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['State', 'Union Territory'],
      default: 'State',
    },
    districts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StateDistrict', stateDistrictSchema);
