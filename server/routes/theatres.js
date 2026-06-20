const express = require('express');
const router = express.Router();
const { getAllTheatres } = require('../controllers/theatreController');

router.get('/', getAllTheatres);

module.exports = router;
