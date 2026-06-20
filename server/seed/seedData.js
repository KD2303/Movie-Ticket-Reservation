const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const COLS = 12;

function buildSeatMatrix() {
  return ROWS.map((row) =>
    Array.from({ length: COLS }, (_, i) => ({ row, col: i + 1, status: 'available' }))
  );
}

// Generate showtimes for the next 7 days
function getDates(count = 7) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

const theatresData = [
  {
    name: 'PVR Phoenix',
    location: 'Phoenix Mall, Bangalore',
    screens: [
      { screenNumber: 1, totalSeats: 156 },
      { screenNumber: 2, totalSeats: 156 },
    ],
    basePrice: 280,
  },
  {
    name: 'INOX Orion',
    location: 'Orion Mall, Bangalore',
    screens: [
      { screenNumber: 1, totalSeats: 156 },
      { screenNumber: 2, totalSeats: 156 },
    ],
    basePrice: 250,
  },
];

// Real TMDB movie IDs
const tmdbMovies = [
  { id: 1022789, title: 'Inside Out 2' },
  { id: 653346, title: 'Kingdom of the Planet of the Apes' },
  { id: 519182, title: 'Despicable Me 4' },
  { id: 748783, title: 'The Garfield Movie' },
];

const times = ['10:00', '13:30', '18:00', '21:30'];
const formats = ['2D', '3D', 'IMAX'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Theatre.deleteMany({});
    await Showtime.deleteMany({});
    console.log('Cleared existing data');

    // Insert theatres
    const theatres = await Theatre.insertMany(theatresData);
    console.log(`Inserted ${theatres.length} theatres`);

    const dates = getDates(7);
    const showtimeDocs = [];

    theatres.forEach((theatre) => {
      theatre.screens.forEach((screen) => {
        dates.forEach((date) => {
          tmdbMovies.forEach((movie, mi) => {
            // Pick 2 times per movie per day
            const movieTimes = [times[mi % 4], times[(mi + 2) % 4]];
            movieTimes.forEach((time, ti) => {
              const format = formats[(screen.screenNumber - 1 + ti) % formats.length];
              const basePrice = theatre.basePrice;
              const price = format === 'IMAX' ? basePrice + 100 : format === '3D' ? basePrice + 50 : basePrice;
              showtimeDocs.push({
                tmdbMovieId: movie.id,
                theatreId: theatre._id,
                screen: screen.screenNumber,
                format,
                date,
                time,
                price,
                seatMatrix: buildSeatMatrix(),
              });
            });
          });
        });
      });
    });

    await Showtime.insertMany(showtimeDocs);
    console.log(`Inserted ${showtimeDocs.length} showtimes`);
    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
