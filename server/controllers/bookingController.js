const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

const BOOKING_FEE = 30;

exports.createBooking = async (req, res) => {
  const { userId = 'guest', showtimeId, seats, totalAmount } = req.body;
  if (!showtimeId || !seats || seats.length === 0) {
    return res.status(400).json({ success: false, message: 'showtimeId and seats are required' });
  }
  try {
    // Atomically lock seats
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });

    // Verify all requested seats are still available
    for (const seat of seats) {
      const rowArr = showtime.seatMatrix.find((r) => r[0]?.row === seat.row);
      if (!rowArr) return res.status(400).json({ success: false, message: `Row ${seat.row} not found` });
      const cell = rowArr.find((c) => c.col === seat.col);
      if (!cell || cell.status === 'occupied') {
        return res.status(409).json({ success: false, message: `Seat ${seat.row}${seat.col} already occupied` });
      }
    }

    // Mark seats as occupied
    for (const seat of seats) {
      await Showtime.updateOne(
        { _id: showtimeId, 'seatMatrix.row': seat.row, 'seatMatrix.col': seat.col },
        { $set: { 'seatMatrix.$[row].$[cell].status': 'occupied' } },
        { arrayFilters: [{ 'row.row': seat.row }, { 'cell.col': seat.col }] }
      );
    }

    const calculated = seats.length * showtime.price + BOOKING_FEE;
    const booking = await Booking.create({
      userId,
      showtimeId,
      seats,
      totalAmount: totalAmount || calculated,
      status: 'active',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('createBooking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { userId = 'guest' } = req.query;
    const bookings = await Booking.find({ userId }).populate({
      path: 'showtimeId',
      populate: { path: 'theatreId' },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showtimeId',
      populate: { path: 'theatreId' },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Free seats
    for (const seat of booking.seats) {
      await Showtime.updateOne(
        { _id: booking.showtimeId },
        { $set: { 'seatMatrix.$[row].$[cell].status': 'available' } },
        { arrayFilters: [{ 'row.row': seat.row }, { 'cell.col': seat.col }] }
      );
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('cancelBooking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
