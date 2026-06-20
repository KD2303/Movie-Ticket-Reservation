const Showtime = require('../models/Showtime');

exports.getShowtimes = async (req, res) => {
  try {
    const { tmdbMovieId, date } = req.query;
    const filter = {};
    if (tmdbMovieId) filter.tmdbMovieId = Number(tmdbMovieId);
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const d = new Date(year, month - 1, day, 0, 0, 0, 0);
      const next = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
      filter.date = { $gte: d, $lt: next };
    }
    const showtimes = await Showtime.find(filter).populate('theatreId');
    res.json({ success: true, data: showtimes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSeats = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).select('seatMatrix price');
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.json({ success: true, data: { seatMatrix: showtime.seatMatrix, price: showtime.price } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
