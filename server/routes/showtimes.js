const express = require('express');
const router = express.Router();
const { getShowtimes, getSeats } = require('../controllers/showtimeController');

router.get('/', getShowtimes);
router.get('/:id/seats', getSeats);

module.exports = router;
