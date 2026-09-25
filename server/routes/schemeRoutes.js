const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  getFeaturedSchemes,
} = require('../controllers/schemeController');

router.get('/featured', getFeaturedSchemes);
router.get('/', getSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
