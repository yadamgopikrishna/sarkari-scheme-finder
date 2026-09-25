const express = require('express');
const router = express.Router();
const { getStates, getCategories } = require('../controllers/metaController');

router.get('/states', getStates);
router.get('/categories', getCategories);

module.exports = router;
