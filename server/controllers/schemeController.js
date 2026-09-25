const Scheme = require('../models/Scheme');

// @desc    Get all schemes with multi-criteria filters & search
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const {
      search,
      category,
      state,
      governmentLevel,
      status = 'Active',
      page = 1,
      limit = 12,
      sortBy = 'newest',
    } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (governmentLevel && governmentLevel !== 'All') {
      filter.governmentLevel = governmentLevel;
    }

    if (state && state !== 'All') {
      filter.$or = [
        { state: 'All' },
        { state: new RegExp(state, 'i') },
        { 'eligibilityCriteria.states': 'All' },
        { 'eligibilityCriteria.states': new RegExp(state, 'i') },
      ];
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchFilter = {
        $or: [
          { schemeName: searchRegex },
          { schemeCode: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { department: searchRegex },
          { benefits: searchRegex },
        ],
      };

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchFilter];
        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'popular') sortOption = { viewCount: -1 };
    if (sortBy === 'name') sortOption = { schemeName: 1 };
    if (sortBy === 'verified') sortOption = { lastVerified: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Scheme.countDocuments(filter);
    const schemes = await Scheme.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      count: schemes.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single scheme details & increment view count
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    // Increment view count asynchronously
    scheme.viewCount = (scheme.viewCount || 0) + 1;
    await scheme.save();

    res.json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured schemes for portal homepage
// @route   GET /api/schemes/featured
// @access  Public
const getFeaturedSchemes = async (req, res) => {
  try {
    const featured = await Scheme.find({ status: 'Active' })
      .sort({ viewCount: -1, lastVerified: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: featured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getFeaturedSchemes,
};
