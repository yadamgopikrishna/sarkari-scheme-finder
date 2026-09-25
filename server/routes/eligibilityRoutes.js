const express = require('express');
const router = express.Router();
const {
  checkEligibility,
  getEligibilityHistory,
} = require('../controllers/eligibilityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/check', optionalAuth, checkEligibility);
router.get('/history', protect, getEligibilityHistory);

module.exports = router;
