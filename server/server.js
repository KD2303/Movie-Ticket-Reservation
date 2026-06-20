const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Validate environment variables on startup
const REQUIRED_ENV = ['MONGODB_URI', 'TMDB_API_KEY'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Critical environment variables missing: ${missingEnv.join(', ')}`);
  console.error(`Please create a 'server/.env' file. See 'server/.env.example' for guidance.`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const IS_PROD = process.env.NODE_ENV === 'production';

// CORS configuration supporting dynamic validation for credentials
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_ORIGIN
].filter(Boolean).map(url => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, postman, curl)
    if (!origin) return callback(null, true);

    // If client origin is not explicitly configured or we are in development, allow the origin
    if (!IS_PROD || !process.env.CLIENT_ORIGIN) {
      return callback(null, true);
    }

    // Match exact origin, wildcard pattern, or any vercel.app subdomain
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed === '*' || allowed === origin) return true;
      if (allowed.startsWith('*.')) {
        return origin.endsWith(allowed.slice(2));
      }
      return false;
    }) || origin.endsWith('.vercel.app') || origin === 'https://vercel.app';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); // block CORS
    }
  },
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/movies', require('./routes/movies'));
app.use('/api/theatres', require('./routes/theatres'));
app.use('/api/showtimes', require('./routes/showtimes'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

// Error handler
app.use(errorHandler);

// Serve React production build (when NODE_ENV=production)
if (IS_PROD) {
  const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  // SPA catch-all — serve index.html for any non-API route (React Router handles it)
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`📦 Serving React build from ${clientDist}`);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`));

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('⚠️  MongoDB unavailable:', err.message));
