const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Routes
app.use('/api/movies', require('./routes/movies'));
app.use('/api/theatres', require('./routes/theatres'));
app.use('/api/showtimes', require('./routes/showtimes'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

// Start HTTP server immediately — TMDB movie routes work without MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Connect MongoDB in background — DB-dependent routes (showtimes, bookings, theatres)
// will return 500 errors if MongoDB is unavailable, but movie routes still work.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('⚠️  MongoDB unavailable — showtimes/bookings routes inactive:', err.message);
    // Do NOT exit — TMDB movie routes remain functional
  });
