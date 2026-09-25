const Scheme = require('../models/Scheme');
const User = require('../models/User');
const EligibilityCheck = require('../models/EligibilityCheck');

// @desc    Get Admin Portal Analytics & Statistics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res) => {
  try {
    const totalSchemes = await Scheme.countDocuments();
    const centralSchemes = await Scheme.countDocuments({ governmentLevel: 'Central' });
    const stateSchemes = await Scheme.countDocuments({ governmentLevel: { $in: ['State', 'UT'] } });
    const activeSchemes = await Scheme.countDocuments({ status: 'Active' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalEligibilityChecks = await EligibilityCheck.countDocuments();

    // Most viewed schemes
    const mostViewedSchemes = await Scheme.find({ status: 'Active' })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('schemeName schemeCode category governmentLevel viewCount');

    // Schemes distribution by category
    const categoryAgg = await Scheme.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Most searched states in eligibility checks
    const stateAgg = await EligibilityCheck.aggregate([
      { $match: { stateQueried: { $ne: '' } } },
      { $group: { _id: '$stateQueried', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      data: {
        totalSchemes,
        centralSchemes,
        stateSchemes,
        activeSchemes,
        totalCitizens,
        totalEligibilityChecks,
        mostViewedSchemes,
        categoryDistribution: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
        topQueriedStates: stateAgg.map((s) => ({ state: s._id, count: s.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new scheme with structured rules
// @route   POST /api/admin/schemes
// @access  Private (Admin)
const createScheme = async (req, res) => {
  try {
    const schemeData = req.body;

    if (!schemeData.schemeName || !schemeData.schemeCode || !schemeData.category || !schemeData.applicationLink) {
      return res.status(400).json({ success: false, message: 'Please provide Scheme Name, Code, Category, and Application Link.' });
    }

    const existing = await Scheme.findOne({ schemeCode: schemeData.schemeCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A scheme with this scheme code already exists.' });
    }

    schemeData.lastVerified = new Date();
    schemeData.lastUpdated = new Date();

    const newScheme = await Scheme.create(schemeData);

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully with active verification stamp.',
      data: newScheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing scheme and verification timestamp
// @route   PUT /api/admin/schemes/:id
// @access  Private (Admin)
const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    updateData.lastUpdated = new Date();
    if (req.body.setVerified) {
      updateData.lastVerified = new Date();
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedScheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    res.json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updatedScheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete or Deactivate a scheme
// @route   DELETE /api/admin/schemes/:id
// @access  Private (Admin)
const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      const deleted = await Scheme.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Scheme not found.' });
      return res.json({ success: true, message: 'Scheme permanently deleted.' });
    }

    // Soft delete / deactivate
    const scheme = await Scheme.findByIdAndUpdate(
      id,
      { status: 'Inactive', lastUpdated: new Date() },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    res.json({
      success: true,
      message: 'Scheme marked as Inactive.',
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user list for administrative management
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle citizen account active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  createScheme,
  updateScheme,
  deleteScheme,
  getAdminUsers,
  toggleUserStatus,
};
