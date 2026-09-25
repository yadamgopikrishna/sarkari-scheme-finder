const StateDistrict = require('../models/StateDistrict');
const Category = require('../models/Category');
const Scheme = require('../models/Scheme');

// @desc    Get all Indian States, Union Territories and their key districts
// @route   GET /api/states
// @access  Public
const getStates = async (req, res) => {
  try {
    const states = await StateDistrict.find().sort({ stateName: 1 }).lean();
    res.json({
      success: true,
      count: states.length,
      data: states,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all scheme categories with live scheme count
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Dynamically augment with current live active scheme count
    const schemeCounts = await Scheme.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    schemeCounts.forEach((sc) => {
      countMap[sc._id] = sc.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      schemeCount: countMap[cat.name] || 0,
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStates,
  getCategories,
};
