const Scheme = require('../models/Scheme');
const EligibilityCheck = require('../models/EligibilityCheck');
const User = require('../models/User');
const { evaluateSchemeEligibility } = require('../services/eligibilityEngine');

// @desc    Check citizen eligibility against all schemes in the database
// @route   POST /api/eligibility/check
// @access  Public (Optionally authenticated)
const checkEligibility = async (req, res) => {
  try {
    const userInputs = req.body;

    if (!userInputs || Object.keys(userInputs).length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide user eligibility details.' });
    }

    // Fetch all active schemes
    const schemes = await Scheme.find({ status: 'Active' }).lean();

    // Evaluate each scheme through the core Eligibility Engine
    const results = schemes.map((scheme) => evaluateSchemeEligibility(userInputs, scheme));

    // Sort: highest match score first
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Filter into potentially eligible (>= 60%) and other schemes
    const eligibleSchemes = results.filter((r) => r.isEligible);
    const lowMatchSchemes = results.filter((r) => !r.isEligible);

    // Summary statistics for citizen dashboard
    const centralCount = eligibleSchemes.filter((r) => r.governmentLevel === 'Central').length;
    const stateCount = eligibleSchemes.filter((r) => r.governmentLevel === 'State' || r.governmentLevel === 'UT').length;

    // Log the eligibility check for portal analytics
    try {
      await EligibilityCheck.create({
        userId: req.user?._id || null,
        userInputs,
        eligibleSchemeCount: eligibleSchemes.length,
        stateQueried: userInputs.state || '',
        categoryQueried: userInputs.category || userInputs.occupation || '',
        topMatchedSchemes: eligibleSchemes.slice(0, 5).map((s) => ({
          schemeId: s.schemeId,
          schemeName: s.schemeName,
          matchScore: s.matchPercentage,
        })),
      });

      // If user is authenticated, update their profile details with latest responses
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $set: { profileDetails: userInputs },
        });
      }
    } catch (logErr) {
      console.error('[EligibilityCheck Log Error]', logErr.message);
    }

    res.json({
      success: true,
      totalEvaluated: schemes.length,
      eligibleCount: eligibleSchemes.length,
      stats: {
        central: centralCount,
        state: stateCount,
        total: eligibleSchemes.length,
      },
      eligibleSchemes,
      lowMatchSchemes: lowMatchSchemes.slice(0, 10), // provide a few for reference
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent eligibility results for logged-in user
// @route   GET /api/eligibility/history
// @access  Private
const getEligibilityHistory = async (req, res) => {
  try {
    const history = await EligibilityCheck.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkEligibility,
  getEligibilityHistory,
};
