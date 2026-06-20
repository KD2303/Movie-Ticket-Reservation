const express = require('express');
const router = express.Router();
const { getNowPlaying, getUpcoming, getMovieById } = require('../controllers/movieController');

router.get('/now-playing', getNowPlaying);
router.get('/upcoming', getUpcoming);
router.get('/:tmdbId', getMovieById);

module.exports = router;
