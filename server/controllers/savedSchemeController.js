const SavedScheme = require('../models/SavedScheme');

// @desc    Save/bookmark a scheme
// @route   POST /api/saved-schemes
// @access  Private
const saveScheme = async (req, res) => {
  try {
    const { schemeId, notes, matchPercentage } = req.body;

    if (!schemeId) {
      return res.status(400).json({ success: false, message: 'Scheme ID is required.' });
    }

    const existing = await SavedScheme.findOne({
      userId: req.user._id,
      schemeId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Scheme is already saved in your bookmarks.' });
    }

    const saved = await SavedScheme.create({
      userId: req.user._id,
      schemeId,
      notes: notes || '',
      matchPercentage: matchPercentage || 0,
    });

    const populated = await SavedScheme.findById(saved._id).populate('schemeId');

    res.status(201).json({
      success: true,
      message: 'Scheme saved to your bookmarks.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all saved schemes for logged-in citizen
// @route   GET /api/saved-schemes
// @access  Private
const getSavedSchemes = async (req, res) => {
  try {
    const saved = await SavedScheme.find({ userId: req.user._id })
      .populate('schemeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a saved scheme
// @route   DELETE /api/saved-schemes/:id
// @access  Private
const removeSavedScheme = async (req, res) => {
  try {
    const { id } = req.params;

    // Check by SavedScheme ID or Scheme ID
    const saved = await SavedScheme.findOne({
      userId: req.user._id,
      $or: [{ _id: id }, { schemeId: id }],
    });

    if (!saved) {
      return res.status(404).json({ success: false, message: 'Saved scheme record not found.' });
    }

    await saved.deleteOne();

    res.json({
      success: true,
      message: 'Scheme removed from saved list.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveScheme,
  getSavedSchemes,
  removeSavedScheme,
};
