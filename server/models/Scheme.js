const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      index: true,
    },
    schemeCode: {
      type: String,
      required: [true, 'Scheme code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    governmentLevel: {
      type: String,
      enum: ['Central', 'State', 'UT'],
      required: [true, 'Government level is required'],
      index: true,
    },
    state: {
      type: String,
      default: 'All',
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    benefits: {
      type: [String],
      default: [],
    },
    benefitAmount: {
      type: String,
      default: '',
    },
    eligibilityCriteria: {
      age: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 120 },
      },
      income: {
        max: { type: Number, default: 0 }, // 0 means no income restriction
      },
      genders: {
        type: [String],
        default: ['All'],
      },
      maritalStatus: {
        type: [String],
        default: ['Any'],
      },
      states: {
        type: [String],
        default: ['All'],
      },
      area: {
        type: [String],
        default: ['All'], // 'All', 'Rural', 'Urban'
      },
      occupations: {
        type: [String],
        default: ['All'],
      },
      educationLevels: {
        type: [String],
        default: ['All'],
      },
      bplOnly: {
        type: Boolean,
        default: false,
      },
      rationCardCategories: {
        type: [String],
        default: ['Any'],
      },
      disabilityOnly: {
        type: Boolean,
        default: false,
      },
      minDisabilityPercentage: {
        type: Number,
        default: 0,
      },
      seniorCitizenOnly: {
        type: Boolean,
        default: false,
      },
      studentOnly: {
        type: Boolean,
        default: false,
      },
      farmerSpecific: {
        landRequired: { type: Boolean, default: false },
        maxLandAcres: { type: Number, default: 0 }, // 0 means no limit
        farmerCategories: { type: [String], default: ['Any'] },
      },
      specialCategories: {
        type: [String],
        default: [],
      },
      housingSpecific: {
        noPuccaHouse: { type: Boolean, default: false },
        homelessOnly: { type: Boolean, default: false },
      },
      customConditions: {
        type: [String],
        default: [],
      },
    },
    ineligibilityCriteria: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    applicationProcess: {
      type: [String],
      default: [],
    },
    applicationMode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online',
    },
    officialWebsite: {
      type: String,
      default: '',
    },
    applicationLink: {
      type: String,
      required: [true, 'Application link is required'],
    },
    helplineNumber: {
      type: String,
      default: '1800-111-555',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Upcoming'],
      default: 'Active',
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastVerified: {
      type: Date,
      default: Date.now,
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for global search
schemeSchema.index({
  schemeName: 'text',
  description: 'text',
  category: 'text',
  department: 'text',
  state: 'text',
});

module.exports = mongoose.model('Scheme', schemeSchema);
