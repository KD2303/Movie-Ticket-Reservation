# 🎬 Movie Ticket Reservation — Implementation Plan

> **Stack:** React + Redux + Node.js/Express + MongoDB  
> **Viewport:** 390px mobile web (no responsiveness required)  
> **Assignment:** Figma-matched UI · Seat grid matrix engine · Persistent booking data  
> **Movie Data:** TMDB API (free, IMDb-equivalent — posters, cast, ratings, genres)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Redux Toolkit, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Movie Data | TMDB API (free tier — `api.themoviedb.org/3`) |
| State Persistence | redux-persist → localStorage |
| Bonus | qrcode.react (mock QR codes) |

---

## TMDB API Integration

IMDb doesn't have a public API, but **TMDB (The Movie Database)** is the standard free alternative — it returns IMDb IDs, posters, cast, ratings, genres, and more.

### Setup

1. Register at [themoviedb.org](https://www.themoviedb.org/) → get a free API key
2. Add to `.env`:
   ```
   TMDB_API_KEY=your_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
   ```

### TMDB Endpoints Used

| TMDB Endpoint | Used For |
|---|---|
| `GET /movie/now_playing` | "Now Showing" carousel on Home |
| `GET /movie/upcoming` | "Coming Soon" row on Home |
| `GET /movie/{id}` | Movie detail (title, desc, rating, genres, runtime) |
| `GET /movie/{id}/credits` | Cast list for Movie Detail screen |
| `GET /movie/{id}/images` | Backdrop/banner image |

### Data Flow Architecture

```
Frontend (React)
     ↓ requests movie data
Backend (Express) — acts as a proxy
     ↓ calls TMDB with API key (key stays server-side, never exposed)
TMDB API
     ↓ returns movie metadata
Backend maps + forwards response
     ↓
Frontend renders movie cards, banners, cast
```

> **Why proxy through backend?** Keeps the TMDB API key out of the client bundle and lets you normalise the response shape before it hits Redux.

### Backend TMDB Service (`server/services/tmdbService.js`)

```js
const axios = require('axios');

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL,
  params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' }
});

const getNowPlaying = () => tmdb.get('/movie/now_playing', { params: { page: 1 } });
const getUpcoming   = () => tmdb.get('/movie/upcoming',   { params: { page: 1 } });
const getMovieById  = (id) => tmdb.get(`/movie/${id}`);
const getCredits    = (id) => tmdb.get(`/movie/${id}/credits`);

module.exports = { getNowPlaying, getUpcoming, getMovieById, getCredits };
```

### Backend Movie Routes (proxy layer)

```
GET /api/movies/now-playing   → calls TMDB /movie/now_playing
GET /api/movies/upcoming      → calls TMDB /movie/upcoming
GET /api/movies/:tmdbId       → calls TMDB /movie/:id + /movie/:id/credits
```

### Response Mapping (normalised shape sent to frontend)

```js
// movieController.js — map TMDB response to app shape
const mapMovie = (m) => ({
  id:          m.id,
  title:       m.title,
  description: m.overview,
  banner:      `${process.env.TMDB_IMAGE_BASE}${m.backdrop_path}`,
  poster:      `${process.env.TMDB_IMAGE_BASE}${m.poster_path}`,
  rating:      m.vote_average.toFixed(1),
  genres:      m.genres?.map(g => g.name) || [],
  runtime:     m.runtime,
  imdbId:      m.imdb_id,
});

const mapCast = (c) => ({
  name:      c.name,
  character: c.character,
  image:     c.profile_path
               ? `${process.env.TMDB_IMAGE_BASE}${c.profile_path}`
               : null,
});
```

### What's Still in MongoDB

Only booking-related data lives in your DB — movie metadata is always fetched live from TMDB:

| MongoDB | TMDB |
|---|---|
| Theatre | Movie title, desc, poster |
| Showtime (seat matrix, price, time) | Cast list |
| Booking (seats, amount, status) | Genres, rating, runtime |

### Showtime Schema Update

Since movies come from TMDB, the `Showtime` model stores `tmdbMovieId` (number) instead of a MongoDB `ObjectId` ref:

```js
// Updated Showtime model
{
  tmdbMovieId: Number,       // TMDB movie ID (replaces movieId ObjectId ref)
  theatreId: ObjectId,       // still refs Theatre in MongoDB
  screen: Number,
  format: String,
  date: Date,
  time: String,
  price: Number,
  seatMatrix: [[{ row, col, status }]]
}
```

### Seed Script Update

Instead of seeding static movie data, the seed script links showtimes to real TMDB IDs:

```js
// seed/seedData.js
const showtimes = [
  { tmdbMovieId: 1022789, /* Inside Out 2 */ theatreId: ..., time: '10:00', ... },
  { tmdbMovieId: 653346,  /* Kingdom of the Planet of the Apes */ ... },
];
```

---

## Screen Map & User Flow

```
Home → Movie Detail → Schedule → Seat Selection → Booking Summary → Payment (mock) → My Bookings
 [1]        [2]           [3]          [4]               [5]               [6]             [7]
```

Bottom nav (Home / Search / Tickets / Profile) persists on Screens 1–3. Hidden on Screens 4–6.

---

## Screen-by-Screen Breakdown

### Screen 1 — Home `Route: /`

- Scrollable hero section
- **"Now Showing"** — horizontal movie carousel
- **"Coming Soon"** — horizontal movie row
- **Theatre list** with base pricing per venue
- Fixed bottom navigation bar

**Components:** `MovieCard`, `HorizontalScroller`, `TheatreCard`, `BottomNav`  
**Data source:** `GET /api/movies/now-playing` + `GET /api/movies/upcoming` → proxied from TMDB

---

### Screen 2 — Movie Detail `Route: /movie/:id`

- Full-bleed banner image with title overlay
- Rating badge, genre tags
- Description paragraph
- **Format tabs** (2D / 3D / IMAX)
- Cast horizontal scroll strip
- "Book Now" CTA → dispatches `setSelectedMovie` to Redux

**Components:** `MovieBanner`, `FormatSelector`, `CastScroller`  
**Redux:** `setSelectedMovie`, `setSelectedFormat`  
**Data source:** `GET /api/movies/:tmdbId` → returns movie detail + cast (proxied from TMDB)

---

### Screen 3 — Schedule `Route: /schedule`

- Horizontal **date selector** — next 7 days, scrollable
- Theatre list with expandable time slot chips per screen (e.g. Screen 1: 10:00, 13:30, 18:00)
- Tap a time slot → dispatches date + time + theatre → navigates to seat map

**Components:** `DateStrip`, `TheatreTimeSlots`, `TimeChip`  
**Redux:** `setSelectedDate`, `setSelectedTime`, `setSelectedTheatre`

---

### Screen 4 — Seat Selection `Route: /seats` ⭐ Core Feature

- Curved **SCREEN** indicator arc at top (SVG)
- **Grid matrix: Rows A–M × Columns 1–12** (156 seats total)
- Aisle gaps after Row D and Row I
- Live **price ticker** in top-right — updates on every select/deselect
- Maximum **6 seats** per transaction (enforced in Redux)
- Seat state legend at bottom

**Seat States:**

| State | Visual |
|---|---|
| Available | Outlined white border, transparent fill |
| Occupied | Solid gray (#888780) — not clickable |
| Selected | Solid purple (#7B61FF) |

**Components:** `SeatGrid`, `SeatCell`, `ScreenArc` (SVG), `PriceSummary`  
**Redux:** `toggleSeat`, `clearSeats`  
**Price formula:** `totalPrice = selectedSeats.length × seatPrice + ₹30 (booking fee)`

---

### Screen 5 — Booking Summary `Route: /summary`

- Selected movie + theatre + date + time
- List of selected seats (e.g. A4, B7, C2)
- Pricing breakdown: base price × qty + static booking fee (₹30)
- "Proceed to Pay" → mock payment screen
- State persists via `redux-persist` — survives page refresh

**Components:** `SummaryCard`, `PriceBreakdown`, `SeatList`

---

### Screen 6 — Payment (mock) `Route: /payment`

- Static card/UPI input fields (no real payment gateway)
- On confirm → `POST /api/bookings` → receive booking ID
- Success animation → redirect to My Bookings

**Components:** `PaymentForm`, `SuccessToast`  
**API:** `POST /api/bookings`

---

### Screen 7 — My Bookings `Route: /bookings` ⭐ Bonus Task

- List of digital tickets per booking
- Each ticket shows: movie, date, seats, transaction date, status badge
- **Mock QR code** via `qrcode.react` (bookingId as value)
- **Cancel button** → confirmation modal → `PATCH /api/bookings/:id/cancel` → seats freed in DB + Redux updated → seat matrix reflects freed seats

**Components:** `TicketCard`, `QRCode`, `CancelModal`  
**API:** `PATCH /api/bookings/:id/cancel`

---

## RESTful API Endpoints

Base URL: `/api`

| Method | Route | Source | Description |
|---|---|---|---|
| GET | `/api/movies/now-playing` | TMDB proxy | "Now Showing" list with posters |
| GET | `/api/movies/upcoming` | TMDB proxy | "Coming Soon" list |
| GET | `/api/movies/:tmdbId` | TMDB proxy | Movie detail + cast (normalised) |
| GET | `/api/theatres` | MongoDB | Theatre list with base pricing |
| GET | `/api/showtimes?tmdbMovieId=&date=` | MongoDB | Time slots filtered by movie + date |
| GET | `/api/showtimes/:id/seats` | MongoDB | Full seat matrix (156 seats) |
| POST | `/api/bookings` | MongoDB | Create booking, atomically lock seats |
| GET | `/api/bookings?userId=` | MongoDB | User's booking history |
| GET | `/api/bookings/:id` | MongoDB | Single booking detail + QR data |
| PATCH | `/api/bookings/:id/cancel` | MongoDB | Cancel booking, free seats |

---

## MongoDB Data Models

> Movie metadata (title, poster, cast, genres) is **not stored in MongoDB** — it's fetched live from TMDB. Only booking-related data lives in the database.

### Theatre
```js
{
  name: String,
  location: String,
  screens: [{ screenNumber, totalSeats }],
  basePrice: Number
}
```

### Showtime
```js
{
  tmdbMovieId: Number,          // TMDB movie ID — no Movie collection needed
  theatreId: ObjectId (ref: Theatre),
  screen: Number,
  format: String,               // "2D" | "3D" | "IMAX"
  date: Date,
  time: String,
  price: Number,
  seatMatrix: [[{ row, col, status }]]  // 13×12 grid
}
```

### Booking
```js
{
  userId: String,
  showtimeId: ObjectId (ref: Showtime),
  seats: [{ row, col }],
  totalAmount: Number,
  status: String,       // "active" | "cancelled"
  createdAt: Date
}
```

---

## Redux Store Structure

```
store/
├── movieSlice       → nowShowing[], comingSoon[], selectedMovie, selectedFormat
├── bookingSlice     → selectedDate, selectedTime, selectedTheatre, selectedSeats[], totalPrice
└── historySlice     → bookings[], loading, error
```

**Persistence config:**
- `redux-persist` whitelist: `['booking']` only
- Movie + history data re-fetched from API on mount
- Booking slice survives page refresh for mid-session recovery

---

## Phased Build Order

### Phase 1 — Backend Foundation `~1 day`

- Express app scaffold, MongoDB connection, `.env` config (including `TMDB_API_KEY`)
- Mongoose schemas: Theatre, Showtime, Booking (no Movie model — data comes from TMDB)
- `tmdbService.js` — Axios instance with API key, all TMDB fetch helpers
- All API routes + controllers (movie routes proxy to TMDB, booking routes hit MongoDB)
- Seed script: 2 theatres + showtimes linked to real TMDB movie IDs (no static movie data)
- CORS middleware setup

### Phase 2 — React Shell + Redux + Routing `~0.5 day`

- Vite + React setup with `max-w-[390px] mx-auto` root wrapper
- Redux store + `redux-persist` config
- React Router v6 with all routes defined
- `BottomNav` component with active-tab detection via `useLocation`
- Global Tailwind theme config (dark bg, purple accent)

### Phase 3 — Screens 1 → 2 → 3 `~1.5 days`

- Home page: movie carousels + theatre list (API-connected)
- Movie Detail: banner, format tabs, cast scroll, Book Now CTA
- Schedule: date strip + theatre time slots with Redux dispatch
- Pixel-match Figma layouts throughout

### Phase 4 — Seat Matrix Engine `~1.5 days`

- `SeatGrid` component: renders A–M × 1–12 programmatically
- `ScreenArc` SVG component at top
- `SeatCell` with three visual states + click handler (guards occupied)
- Live price ticker updating via Redux selector
- Max 6 seat validation in `toggleSeat` reducer
- Fetch real occupied seats from `GET /showtimes/:id/seats`

### Phase 5 — Booking Summary + Payment + Persistence `~1 day`

- Booking Summary screen with full price breakdown
- Mock Payment form → `POST /api/bookings` on confirm
- Test `redux-persist`: refresh mid-seat-selection → state must survive
- Success flow → redirect to My Bookings

### Phase 6 — Bonus: My Bookings + Cancellation `~1 day`

- Fetch + render digital ticket cards
- `qrcode.react` integration with bookingId
- Cancel modal → `PATCH /api/bookings/:id/cancel`
- Redux + API state sync after cancellation (seats freed, status updated)

---

## Folder Structure

```
project-root/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── MovieDetail.jsx
│       │   ├── Schedule.jsx
│       │   ├── SeatSelection.jsx
│       │   ├── BookingSummary.jsx
│       │   ├── Payment.jsx
│       │   └── MyBookings.jsx
│       ├── components/
│       │   ├── MovieCard.jsx
│       │   ├── SeatGrid.jsx
│       │   ├── SeatCell.jsx
│       │   ├── ScreenArc.jsx
│       │   ├── DateStrip.jsx
│       │   ├── BottomNav.jsx
│       │   ├── PriceSummary.jsx
│       │   └── TicketCard.jsx
│       ├── store/
│       │   ├── index.js
│       │   ├── movieSlice.js
│       │   ├── bookingSlice.js
│       │   └── historySlice.js
│       ├── services/
│       │   └── api.js          # Axios instance + all API calls
│       ├── hooks/
│       │   ├── useSeatMatrix.js
│       │   └── useBooking.js
│       └── utils/
│           ├── priceCalculator.js
│           └── seatHelpers.js
└── server/
    ├── models/
    │   ├── Theatre.js            # no Movie.js — movie data lives in TMDB
    │   ├── Showtime.js
    │   └── Booking.js
    ├── services/
    │   └── tmdbService.js        # Axios wrapper for TMDB API calls
    ├── routes/
    │   ├── movies.js             # proxy routes → TMDB
    │   ├── theatres.js
    │   ├── showtimes.js
    │   └── bookings.js
    ├── controllers/
    │   ├── movieController.js    # calls tmdbService, maps + returns response
    │   └── bookingController.js
    ├── middleware/
    │   └── errorHandler.js
    ├── seed/
    │   └── seedData.js           # seeds theatres + showtimes with real TMDB IDs
    └── server.js
```

---

## Key Implementation Notes

- **390px wrapper:** Apply `max-w-[390px] mx-auto min-h-screen` on the root `<div>` — that's the only viewport constraint needed.
- **TMDB key safety:** Never call TMDB directly from the React client — always proxy through your Express backend so the API key stays server-side only.
- **TMDB rate limits:** Free tier allows 40 requests/10 seconds, which is plenty. Optionally cache `now_playing` + `upcoming` responses in memory (e.g. `node-cache` with 5-min TTL) to avoid redundant calls on every Home page load.
- **Figma colors:** Dark background (~`#0D0D0D`), white text, purple accent (`#7B61FF`), occupied seat gray (`#9E9E9E`). Extract exact values from Figma dev panel.
- **SeatCell guard:** `onClick` fires only when `status !== "occupied"`. Use CSS `transition` on `background-color` for smooth state change.
- **Atomic seat locking:** On `POST /api/bookings`, use Mongoose `findOneAndUpdate` with `$set` on individual seat cells — prevents double-booking if two users book the same showtime simultaneously.
- **redux-persist whitelist:** Persist `booking` slice only. Movie/history data is always re-fetched from the API on component mount.
- **BottomNav visibility:** Use `useLocation` to conditionally hide the nav on `/seats`, `/summary`, `/payment` routes.
- **Mock QR:** `<QRCode value={bookingId} size={128} />` from `qrcode.react` — no external API needed.
- **Cancellation flow:** Cancel → `PATCH /api/bookings/:id/cancel` → backend sets `booking.status = "cancelled"` + loops through `booking.seats` and sets each cell back to `"available"` in the Showtime document → frontend refetches seat matrix.

---

*Total estimated build time: ~6.5 days (core) + ~1 day (bonus)*
