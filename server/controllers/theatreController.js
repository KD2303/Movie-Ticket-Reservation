const Theatre = require('../models/Theatre');

exports.getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    res.json({ success: true, data: theatres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
