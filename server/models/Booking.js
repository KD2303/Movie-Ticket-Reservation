const mongoose = require('mongoose');

const seatRefSchema = new mongoose.Schema({
  row: { type: String, required: true },
  col: { type: Number, required: true },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'guest' },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [seatRefSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
