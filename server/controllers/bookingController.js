const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

const BOOKING_FEE = 30;

// ─────────────────────────────────────────────────────────────────────────────
// WHY native driver?
// Mongoose 8 throws "Parameter 'obj' to Document() must be an object, got 'A'
// (type string)" when arrayFilters are used on a [[seatSchema]] (2-D nested
// subdocument array), even with { strict: false }.  The schema-cast runs before
// the strict flag is checked.  Using the raw MongoDB collection bypasses all
// Mongoose schema casting and lets MongoDB execute $[row]/$[cell] correctly.
// ─────────────────────────────────────────────────────────────────────────────
function getCol() {
  return mongoose.connection.db.collection('showtimes');
}

exports.createBooking = async (req, res) => {
  const { showtimeId, seats, totalAmount } = req.body;
  const userId = req.user.id;
  if (!showtimeId || !seats || seats.length === 0) {
    return res.status(400).json({ success: false, message: 'showtimeId and seats are required' });
  }

  let oid;
  try {
    oid = new mongoose.Types.ObjectId(showtimeId);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid showtimeId format' });
  }

  try {
    // Use Mongoose just to fetch price — no arrayFilters involved
    const showtime = await Showtime.findById(oid);
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });

    const col = getCol();
    const lockedSeats = [];

    try {
      for (const seat of seats) {
        // Native driver: atomically flip one seat available → occupied.
        // $[row] matches any inner array whose .row === seat.row
        // $[cell] matches the element in that row whose .col === seat.col AND .status === 'available'
        const result = await col.updateOne(
          {
            _id: oid,
            seatMatrix: {
              $elemMatch: {
                $elemMatch: { row: seat.row, col: seat.col, status: 'available' },
              },
            },
          },
          { $set: { 'seatMatrix.$[row].$[cell].status': 'occupied' } },
          {
            arrayFilters: [
              { 'row.row': seat.row },
              { 'cell.col': seat.col, 'cell.status': 'available' },
            ],
          }
        );

        if (result.modifiedCount === 0) {
          // Seat was already taken — roll back previously locked seats
          for (const locked of lockedSeats) {
            await col.updateOne(
              { _id: oid },
              { $set: { 'seatMatrix.$[row].$[cell].status': 'available' } },
              {
                arrayFilters: [
                  { 'row.row': locked.row },
                  { 'cell.col': locked.col },
                ],
              }
            );
          }
          return res.status(409).json({
            success: false,
            message: `Seat ${seat.row}${seat.col} is already occupied or unavailable`,
          });
        }

        lockedSeats.push(seat);
      }
    } catch (lockErr) {
      // DB error mid-loop — try to roll back whatever we locked
      for (const locked of lockedSeats) {
        await col.updateOne(
          { _id: oid },
          { $set: { 'seatMatrix.$[row].$[cell].status': 'available' } },
          {
            arrayFilters: [
              { 'row.row': locked.row },
              { 'cell.col': locked.col },
            ],
          }
        );
      }
      throw lockErr;
    }

    const calculated = seats.length * showtime.price + BOOKING_FEE;
    const booking = await Booking.create({
      userId,
      showtimeId: oid,
      seats,
      totalAmount: totalAmount || calculated,
      status: 'active',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('createBooking error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId })
      .populate({ path: 'showtimeId', populate: { path: 'theatreId' } })
      .sort({ createdAt: -1 });
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

    const col = getCol();
    const oid = booking.showtimeId;

    // Free all seats using native driver (same reason — avoids Mongoose 2D cast bug)
    for (const seat of booking.seats) {
      await col.updateOne(
        { _id: oid },
        { $set: { 'seatMatrix.$[row].$[cell].status': 'available' } },
        {
          arrayFilters: [
            { 'row.row': seat.row },
            { 'cell.col': seat.col },
          ],
        }
      );
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('cancelBooking error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
