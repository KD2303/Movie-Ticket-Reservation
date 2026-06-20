const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  col: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  tmdbMovieId: { type: Number, required: true },
  theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  screen: { type: Number, required: true },
  format: { type: String, enum: ['2D', '3D', 'IMAX'], default: '2D' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  seatMatrix: [[seatSchema]],
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
