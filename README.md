# 🎬 CineBook — Movie Ticket Reservation

A full-stack mobile-first movie ticket booking app. Browse now-showing and coming-soon movies pulled live from TMDB, pick a theatre, choose seats from a real-time seat matrix, and get digital booking confirmations — all within a 390 px mobile shell.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture & Approach](#architecture--approach)
3. [State Management](#state-management)
4. [Seat Matrix & Price Logic](#seat-matrix--price-logic)
5. [Authentication](#authentication)
6. [UI Design Decisions](#ui-design-decisions)
7. [Assumptions](#assumptions)
8. [Project Structure](#project-structure)
9. [Running Locally](#running-locally)
10. [Environment Variables](#environment-variables)
11. [API Reference](#api-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Redux Toolkit, redux-persist, React Router v7 |
| Styling | Tailwind CSS v4, custom CSS animations |
| Backend | Node.js, Express 5 |
| Database | MongoDB via Mongoose 8 |
| Movie Data | TMDB API (The Movie Database) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Build | Vite 8 |

---

## Architecture & Approach

The application is structured as a **monorepo** with a clear `client/` / `server/` split:

```
/
├── client/          # Vite + React SPA
│   └── src/
│       ├── components/   # Shared UI primitives
│       ├── pages/        # Route-level screens
│       ├── store/        # Redux slices + store config
│       └── services/     # Axios API layer
└── server/          # Express REST API
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── seed/
    └── services/    # TMDB integration
```

### Frontend Flow

The booking journey is a **linear multi-step wizard** enforced by route guards rather than a stepper component:

```
Home → Movie Detail → Schedule → Seat Selection → Booking Summary → Payment → Confirmation
```

Each step writes its selection into Redux. Guards at `BookingSummary` and `Payment` redirect back if the required upstream state is missing (e.g., navigating directly to `/summary` without a showtime selected).

### Backend

Express serves a RESTful JSON API. Movies are **not stored in MongoDB** — they are fetched on-demand from TMDB and cached in memory using `node-cache` (10-minute TTL) to avoid hitting rate limits. Only theatres, showtimes, bookings, and users are persisted in MongoDB.

In **production** (`NODE_ENV=production`), Express also serves the compiled React build from `client/dist/`, making it deployable as a single process on platforms like Render.

---

## State Management

Redux Toolkit is used with **four slices**, each with a distinct responsibility:

### `movieSlice`
- Manages `nowShowing`, `comingSoon`, `selectedMovie`, `selectedFormat`.
- Uses `createAsyncThunk` for TMDB-backed API calls.
- **Persisted**: `selectedMovie` and `selectedFormat` survive page refresh so the user can reload the detail page without losing context.

### `bookingSlice`
- Carries all in-progress booking state across the wizard: `selectedDate`, `selectedTime`, `selectedTheatre`, `selectedSeats`, `seatPrice`, `totalPrice`.
- `toggleSeat` atomically adds/removes a seat and **recalculates `totalPrice` in-place** (no side effects, no selectors needed).
- **Selective persistence**: `selectedShowtime` is intentionally **excluded** from the persist whitelist. Because the showtime object contains a MongoDB ObjectId, redux-persist would serialize it to a string `"F"` on rehydration — passing that to `Booking.create()` caused a Mongoose 8 schema cast crash (`Parameter "obj" must be an object, got "F"`). All other booking fields are safe primitives and are persisted.

### `authSlice`
- Manages `user`, `token`, `isLoggedIn`, `loading`, `error`.
- **Persisted**: `user`, `token`, and `isLoggedIn` survive refresh so the user stays logged in.
- The Axios interceptor reads the JWT directly from `localStorage` under the `persist:auth` key (parsing redux-persist's double-serialized JSON) to avoid a circular import between `api.js` → `store/index.js` → slices → `api.js`.

### `historySlice`
- Fetches and caches the authenticated user's booking history.
- **Not persisted** — always fetched fresh from the server on mount to reflect real-time cancellation state.

### localStorage Key Map

| Key | Contents |
|---|---|
| `persist:auth` | `{ user, token, isLoggedIn }` |
| `persist:booking` | `{ selectedDate, selectedTime, selectedTheatre, selectedSeats, seatPrice, totalPrice }` |
| `persist:movies` | `{ selectedMovie, selectedFormat }` |

---

## Seat Matrix & Price Logic

### Data Structure

The seat matrix is stored in MongoDB as a **2D array of subdocuments** (`[[seatSchema]]`):

```js
seatMatrix: [
  [ { row: "A", col: 1, status: "available" }, { row: "A", col: 2, status: "occupied" }, ... ],
  [ { row: "B", col: 1, status: "available" }, ... ],
  ...
]
```

Each row is an array, giving O(1) lookup by `[rowIndex][colIndex]`.

### Atomic Seat Locking

When a booking is created, seats are locked **atomically one at a time** using the native MongoDB driver (bypassing Mongoose):

```js
col.updateOne(
  { _id: oid, seatMatrix: { $elemMatch: { $elemMatch: { row, col, status: 'available' } } } },
  { $set: { 'seatMatrix.$[row].$[cell].status': 'occupied' } },
  { arrayFilters: [{ 'row.row': seat.row }, { 'cell.col': seat.col, 'cell.status': 'available' }] }
)
```

> **Why native driver?** Mongoose 8 runs schema casting on `arrayFilters` properties *before* checking `{ strict: false }`. Any plain-value comparison against a 2D subdocument array causes: `Parameter "obj" to Document() must be an object, got "A"`. Using `mongoose.connection.db.collection()` bypasses all casting.

If any seat in the batch fails to lock (already taken), all previously locked seats in that request are rolled back before returning a 409 error.

### Price Calculation

```
totalPrice = (seatCount × seatPrice) + BOOKING_FEE
```

- `seatPrice` comes from the `Showtime.price` field (set per showtime in the seed data).
- `BOOKING_FEE` is a shared constant (`30`) imported by both `bookingSlice.js` (frontend) and `bookingController.js` (backend) — preventing any mismatch between the displayed and charged amounts.
- `totalPrice` is recalculated synchronously inside the `toggleSeat` reducer, so the displayed price is always consistent with `selectedSeats.length` with zero async overhead.

### Seat Grid Rendering

`SeatGrid` renders each row with row labels on both sides. Aisle gaps are inserted after rows `D` and `I` for visual clarity. Each `SeatCell` reads only `selectedSeats` from Redux and derives its visual state (`available`, `selected`, `occupied`) locally — no prop drilling required.

---

## Authentication

JWT-based auth is implemented entirely in-house:

- **Register**: `POST /api/auth/register` — hashes password with bcryptjs (10 rounds), returns signed JWT.
- **Login**: `POST /api/auth/login` — verifies hash, returns signed JWT.
- **Profile**: `GET /api/auth/profile` — protected route returning user fields (no password).
- **Demo user**: On every server startup, `seedDemoUser()` upserts `demo@example.com / password123` so the app is immediately usable without registration.

### Route Protection

| Route | Guard |
|---|---|
| `POST /api/bookings` | JWT required (server middleware) |
| `GET /api/bookings` | JWT required — returns only the authenticated user's bookings |
| `/summary` | `isLoggedIn` check in `useEffect`; redirects to `/login?redirect=/summary` |
| `/bookings` | `isLoggedIn` check; redirects to `/login?redirect=/bookings` |
| `SeatSelection` proceed button | Navigates to `/login?redirect=/summary` if not logged in |

---

## UI Design Decisions

- **390 px max-width shell**: The `#root` flexbox centers a `.app-shell` div capped at `max-width: 390px`. This constrains every component to mobile dimensions while letting the grey background fill widescreen viewports.
- **Bottom navigation**: Hidden on booking-flow screens (`/schedule`, `/seats`, `/summary`, `/payment`) and auth screens (`/login`, `/register`) to keep the user focused on the task.
- **Minimalist palette**: White backgrounds, `#5F33E1` purple accent, `#111827` near-black text. No coloured backgrounds except the gradient CTA buttons.
- **Micro-animations**: `fadeUp`, `fadeIn`, `scaleIn`, `shimmer` (skeleton loader) are defined once in `index.css` and applied via utility classes — no animation library needed.
- **Seat cell sizing**: Fixed `22×22 px` cells with `gap-1` spacing. At 12 columns per row this totals ~300 px, fitting within the 390 px shell without horizontal scroll.

---

## Assumptions

1. **TMDB as the movie source of truth** — Movie metadata (title, poster, cast, genres, runtime) is fetched live from TMDB. No movie data is stored in MongoDB. The `tmdbMovieId` field on `Showtime` links the two systems.
2. **Showtimes are pre-seeded** — Theatre managers would populate showtimes via an admin tool in production. For this project, `server/seed/seedData.js` seeds theatres and generates showtimes for the next 7 days.
3. **No real payment processing** — The payment screen simulates a successful payment after a 1.5s delay. In production this would integrate Razorpay/Stripe.
4. **Single-device sessions** — JWT tokens are stored in `localStorage` (via redux-persist), not `httpOnly` cookies. This is intentional for simplicity; a production app would use refresh token rotation with `httpOnly` cookies.
5. **Seat capacity** — Users can select a maximum of 6 seats per booking, which covers the typical group cinema trip without overloading the UI.
6. **Timezone handling** — Date selectors use local-time parsing (`new Date(y, m-1, d)`) to avoid UTC midnight rollovers causing the wrong date to be displayed in IST.

---

## Project Structure

```
client/src/
├── components/
│   ├── BottomNav.jsx      # Tab navigation, auto-hidden on flow screens
│   ├── MovieCard.jsx      # Poster card used in home carousels
│   ├── PriceSummary.jsx   # Live price ticker shown in SeatSelection
│   ├── ScreenArc.jsx      # SVG cinema screen arc decorative element
│   ├── SeatGrid.jsx       # 2D seat matrix renderer + SeatCell
│   └── TicketCard.jsx     # Booking history card
├── pages/
│   ├── Home.jsx           # Now Showing + Coming Soon carousels, theatre list
│   ├── MovieDetail.jsx    # Poster, synopsis, cast, format picker
│   ├── Schedule.jsx       # Date scroller + theatre/time slot picker
│   ├── SeatSelection.jsx  # Seat matrix page with live price summary
│   ├── BookingSummary.jsx # Order review before payment
│   ├── Payment.jsx        # Card/wallet UI, booking creation
│   ├── BookingDetail.jsx  # Single booking confirmation / QR view
│   ├── MyBookings.jsx     # Booking history list
│   ├── Search.jsx         # Full-text movie search
│   ├── Login.jsx          # JWT login with demo credential auto-fill
│   ├── Register.jsx       # New account creation
│   └── Profile.jsx        # User details + logout
├── store/
│   ├── index.js           # Store config, persist configs, middleware
│   ├── authSlice.js       # Auth state (user, token, isLoggedIn)
│   ├── bookingSlice.js    # In-progress booking wizard state
│   ├── movieSlice.js      # TMDB movie data + async thunks
│   └── historySlice.js    # Booking history async thunks
├── services/
│   └── api.js             # Axios instance, JWT interceptor, all endpoints
└── constants.js           # BOOKING_FEE shared constant

server/
├── controllers/
│   ├── authController.js       # register, login, profile, seedDemoUser
│   ├── bookingController.js    # createBooking (native driver), getBookings
│   ├── movieController.js      # TMDB proxy with node-cache
│   ├── showtimeController.js   # Showtime queries + seat fetch
│   └── theatreController.js    # Theatre listings
├── middleware/
│   ├── auth.js            # JWT verification middleware
│   └── errorHandler.js    # Global Express error handler
├── models/
│   ├── User.js            # name, email, password (hashed), phone
│   ├── Booking.js         # userId, showtimeId, seats[], totalAmount, status
│   ├── Showtime.js        # tmdbMovieId, theatreId, seatMatrix[][]
│   └── Theatre.js         # name, location, basePrice
├── routes/                # Express routers
├── seed/
│   └── seedData.js        # Theatre + showtime seed script
└── services/
    └── tmdbService.js     # TMDB API wrapper
```

---

## Running Locally

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/atlas))
- [TMDB API key](https://www.themoviedb.org/settings/api) (free)

### 1. Clone & install

```bash
git clone <repo-url>
cd Movie-Ticket-Reservation

# Install server dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/movie-reservation
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
PORT=5000
JWT_SECRET=your_secret_key_here
```

### 3. Seed the database

```bash
npm run seed
```

This creates theatre records and generates showtimes for the next 7 days.

### 4. Start development servers

```bash
# Terminal 1 — Express API (port 5000)
npm run dev

# Terminal 2 — Vite dev server (port 5173)
npm run client
```

Or run both concurrently:

```bash
npm run dev:all
```

Open **http://localhost:5173** in your browser.

### 5. Demo account

The server auto-creates a demo user on every startup:

| Field | Value |
|---|---|
| Email | `demo@example.com` |
| Password | `password123` |

Or use the **"Auto-fill Demo Account"** button on the Login screen.

### Production build

```bash
npm run build          # Builds client to client/dist/
NODE_ENV=production npm start   # Express serves the built SPA on port 5000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `TMDB_API_KEY` | ✅ | TMDB v3 API key |
| `TMDB_BASE_URL` | ✅ | `https://api.themoviedb.org/3` |
| `TMDB_IMAGE_BASE` | ✅ | `https://image.tmdb.org/t/p/w500` |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `PORT` | ❌ | Server port (default: `5000`) |
| `CLIENT_ORIGIN` | ❌ | Production frontend URL for CORS allowlist |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/profile` | JWT | Get current user |

### Movies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies/now-playing` | TMDB now-playing (cached) |
| GET | `/api/movies/upcoming` | TMDB upcoming (cached) |
| GET | `/api/movies/:tmdbId` | Movie detail + cast |

### Theatres & Showtimes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/theatres` | All theatres |
| GET | `/api/showtimes?tmdbMovieId=&date=` | Showtimes for a movie on a date |
| GET | `/api/showtimes/:id/seats` | Live seat matrix for a showtime |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | JWT | Create booking, lock seats atomically |
| GET | `/api/bookings` | JWT | Current user's booking history |
| GET | `/api/bookings/:id` | JWT | Single booking detail |
| PATCH | `/api/bookings/:id/cancel` | JWT | Cancel a booking |

---

## License

MIT
