const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  createScheme,
  updateScheme,
  deleteScheme,
  getAdminUsers,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/analytics', getAdminAnalytics);
router.post('/schemes', createScheme);
router.put('/schemes/:id', updateScheme);
router.delete('/schemes/:id', deleteScheme);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
