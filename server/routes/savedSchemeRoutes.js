const express = require('express');
const router = express.Router();
const {
  saveScheme,
  getSavedSchemes,
  removeSavedScheme,
} = require('../controllers/savedSchemeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', saveScheme);
router.get('/', getSavedSchemes);
router.delete('/:id', removeSavedScheme);

module.exports = router;
