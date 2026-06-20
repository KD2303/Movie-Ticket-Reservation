const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: { type: Number, required: true },
  totalSeats: { type: Number, default: 156 },
});

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  screens: [screenSchema],
  basePrice: { type: Number, required: true },
});

module.exports = mongoose.model('Theatre', theatreSchema);
