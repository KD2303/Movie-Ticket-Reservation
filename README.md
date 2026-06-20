# 🎬 CineBook — Movie Ticket Reservation

> React + Redux + Node.js/Express + MongoDB · 390px mobile web · TMDB live movie data

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Free TMDB API key from [themoviedb.org](https://www.themoviedb.org/)

### 2. Configure environment
Edit `.env` in the project root:
```
TMDB_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/movietickets
PORT=5000
```

### 3. Install dependencies
```bash
# Root (backend)
npm install

# Frontend
cd client && npm install && cd ..
```

### 4. Seed the database
```bash
npm run seed
```
This inserts 2 theatres and 7 days of showtimes linked to real TMDB movie IDs.

### 5. Run the app

**Terminal 1 — Backend:**
```bash
npm start
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Screens

| # | Screen | Route |
|---|--------|-------|
| 1 | Home (hero banner + carousels) | `/` |
| 2 | Movie Detail (banner, format tabs, cast) | `/movie/:id` |
| 3 | Schedule (date strip + time slots) | `/schedule` |
| 4 | Seat Selection (A–M × 1–12 grid) ⭐ | `/seats` |
| 5 | Booking Summary | `/summary` |
| 6 | Mock Payment | `/payment` |
| 7 | My Bookings + QR codes ⭐ | `/bookings` |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/movies/now-playing` | TMDB proxy — Now Showing |
| GET | `/api/movies/upcoming` | TMDB proxy — Coming Soon |
| GET | `/api/movies/:tmdbId` | Movie detail + cast |
| GET | `/api/theatres` | Theatre list |
| GET | `/api/showtimes?tmdbMovieId=&date=` | Filtered showtimes |
| GET | `/api/showtimes/:id/seats` | Seat matrix |
| POST | `/api/bookings` | Create booking (atomic seat lock) |
| GET | `/api/bookings?userId=` | Booking history |
| PATCH | `/api/bookings/:id/cancel` | Cancel + free seats |
