const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, createBooking);
router.get('/', auth, getBookings);
router.get('/:id', auth, getBookingById);
router.patch('/:id/cancel', auth, cancelBooking);

module.exports = router;

