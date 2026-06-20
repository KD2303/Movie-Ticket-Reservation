# 🐛 Bug Report — Movie Ticket Reservation
**Project:** Movie Ticket Reservation (React + Redux + Node.js/Express + MongoDB)  
**Report Date:** 2026-06-21  
**Prepared For:** Antigravity Team  
**Total Issues Found:** 30 (6 Critical · 8 Major · 7 Minor · 9 Missing Features)

---

## Quick Summary

| Severity | Count | What it means |
|---|---|---|
| 🔴 Critical | 6 | Core feature is broken or will crash in normal use |
| 🟠 Major | 8 | Significant deviation from plan; bad UX or data integrity risk |
| 🟡 Minor | 7 | Code quality, dead code, or small UX gaps |
| 🟣 Missing | 9 | Feature listed in the implementation plan but not built yet |

---

## How to Read This Report

Each issue follows this structure:

```
ID      — Unique identifier (C = Critical, M = Major, N = Minor, F = Feature/Missing)
File(s) — Exact file(s) where the problem lives
Problem — What is wrong
Plan    — What the implementation plan says should happen
Fix     — Concrete code change or approach to resolve it
```

---

---

# 🔴 CRITICAL BUGS

> These break core functionality. Fix these before anything else.

---

### C-01 — Booking Fee Mismatch Between Screens

**Files:** `client/src/pages/Payment.jsx` · `client/src/store/bookingSlice.js` · `client/src/pages/BookingSummary.jsx` · `server/controllers/bookingController.js`

**Problem:**  
`Payment.jsx` hardcodes `BOOKING_FEE = 20` while every other file in the system uses `₹30`. This means:
- The **Booking Summary screen** shows a total with ₹30 booking fee
- The **Payment/Checkout screen** shows a total with ₹20 booking fee (₹10 less)
- The **backend** also calculates the total using ₹30

The user sees one price on the summary screen and a different (lower) price on checkout, and the backend charges the ₹30 amount regardless.

**Plan says:**  
> Price formula: `totalPrice = selectedSeats.length × seatPrice + ₹30 (booking fee)`

**Current code in `Payment.jsx`:**
```js
// Payment.jsx — LINE 8
const BOOKING_FEE = 20;  // ❌ Wrong — should be 30
```

**Fix:**  
Change `BOOKING_FEE` in `Payment.jsx` to `30`. Better yet, extract it to a shared constants file so it can never drift again:

```js
// src/constants.js  (new file)
export const BOOKING_FEE = 30;

// Then in bookingSlice.js, Payment.jsx, BookingSummary.jsx:
import { BOOKING_FEE } from '../constants';
```

---

### C-02 — Booking Fee Added Even When Zero Seats Are Selected

**File:** `client/src/store/bookingSlice.js`

**Problem:**  
In the `toggleSeat` reducer, `totalPrice` is recalculated as:
```js
state.totalPrice = state.selectedSeats.length * state.seatPrice + BOOKING_FEE;
```
When the user deselects their last seat, `selectedSeats.length` becomes `0`, so:
```
totalPrice = 0 × price + 30 = ₹30
```
The price ticker shows ₹30 with no seats selected, and this ₹30 value is persisted to `localStorage` via `redux-persist`. On the next screen load, the user sees ₹30 as a starting price before selecting anything.

**Fix:**  
Only add the booking fee when at least one seat is selected:

```js
// bookingSlice.js — in toggleSeat reducer
const count = state.selectedSeats.length;
state.totalPrice = count > 0
  ? count * state.seatPrice + BOOKING_FEE
  : 0;
```

---

### C-03 — Race Condition in Seat Locking (Double Booking Possible)

**File:** `server/controllers/bookingController.js`

**Problem:**  
The current seat-locking logic is a two-step read-then-write:
1. `findById` — reads the showtime and checks if seats are available
2. Loop of `updateOne` calls — marks each seat as occupied

Between steps 1 and 2, another user can pass the same availability check and also book the same seat. Both bookings succeed. This is a classic **Time-of-Check Time-of-Use (TOCTOU) race condition**.

Additionally, the `updateOne` filter uses:
```js
{ _id: showtimeId, 'seatMatrix.row': seat.row, 'seatMatrix.col': seat.col }
```
`seatMatrix` is a nested array (`[[{row, col, status}]]`), so top-level field selectors like `seatMatrix.row` do not match anything in a nested array.

**Plan says:**  
> Use Mongoose `findOneAndUpdate` with `$set` on individual seat cells — prevents double-booking if two users book the same showtime simultaneously.

**Fix:**  
Use a single atomic `findOneAndUpdate` with an availability check in the filter itself:

```js
// For each seat, atomically flip status only if it is still 'available'
for (const seat of seats) {
  const result = await Showtime.findOneAndUpdate(
    {
      _id: showtimeId,
      seatMatrix: {
        $elemMatch: {
          $elemMatch: { row: seat.row, col: seat.col, status: 'available' }
        }
      }
    },
    {
      $set: { 'seatMatrix.$[row].$[cell].status': 'occupied' }
    },
    {
      arrayFilters: [{ 'row.row': seat.row }, { 'cell.col': seat.col, 'cell.status': 'available' }],
      new: true
    }
  );

  if (!result) {
    // Seat was taken between the availability check and this update
    // Roll back any seats already marked in this loop
    return res.status(409).json({ success: false, message: `Seat ${seat.row}${seat.col} just became unavailable` });
  }
}
```

---

### C-04 — TicketCard Bypasses Backend Proxy for TMDB Calls

**File:** `client/src/components/TicketCard.jsx`

**Problem:**  
`TicketCard.jsx` fetches the movie title by calling:
```js
axios.get(`/api/movies/${showtime.tmdbMovieId}`)
```
This uses a **raw `axios` import** (not the shared `api.js` instance) with a bare relative path. In development this hits `localhost:5173/api/movies/...` — the Vite dev server, not the Express backend. This will fail silently unless Vite proxy is configured (it isn't).

More critically, the plan is explicit: **the TMDB API key must never be called from the client side.** Using the wrong axios instance also bypasses the shared base URL (`http://localhost:5000`), timeout settings, and any future request interceptors.

**Plan says:**  
> Never call TMDB directly from the React client — always proxy through your Express backend so the API key stays server-side only.

**Current code:**
```js
// TicketCard.jsx — lines 5, 27-33
import axios from 'axios';  // ❌ raw axios, not the shared api.js instance

axios.get(`/api/movies/${showtime.tmdbMovieId}`)  // ❌ wrong base URL
```

**Fix:**
```js
// TicketCard.jsx
import { fetchMovieById } from '../services/api';  // ✅ use shared instance

useEffect(() => {
  if (showtime?.tmdbMovieId) {
    fetchMovieById(showtime.tmdbMovieId)
      .then((res) => {
        if (res.data?.data?.title) setMovieName(res.data.data.title);
      })
      .catch(() => {});
  }
}, [showtime]);
```

---

### C-05 — Seat Grid Aisle Layout Wrong (Contradicts Plan)

**File:** `client/src/components/SeatGrid.jsx`

**Problem:**  
The plan specifies:
> Aisle gaps after Row D and Row I

The current code only adds a gap after Row H:
```js
const AISLE_AFTER_ROW = ['H'];  // ❌ Wrong — should be ['D', 'I']
```

Additionally, the seat layout uses a fixed **2-8-2 column split** (side aisles after every 2 seats), which is not what the plan describes. The plan specifies a straight `A–M × 1–12` grid with horizontal (row) aisle gaps — not vertical column splits.

The seed also generates Row I (`ROWS = ['A'..'M']` includes I), but the gap check `['H']` never matches I, so there's a missing aisle between rows H and J that makes the seating chart look wrong.

**Fix:**
```js
// SeatGrid.jsx
const AISLE_AFTER_ROW = ['D', 'I'];  // ✅ matches plan specification

// And simplify the row layout — just render all 12 seats in a row:
<div className="flex items-center gap-1">
  {row.map((seat, cIdx) => (
    <SeatCell key={cIdx} seat={seat} />
  ))}
</div>
```

---

### C-06 — Schedule Page Filters by Format With No Way to Change It

**File:** `client/src/pages/Schedule.jsx`

**Problem:**  
When the user selects a theatre on the Schedule screen, the time slot list is filtered by `selectedFormat` from Redux (default `'2D'`). If a theatre has no 2D showtimes for the selected date (e.g., only 3D or IMAX), the user sees "No schedules for this theatre on selected date" even though valid showtimes exist.

The format badge is displayed but is **not clickable** — there is no way to change format on the Schedule screen. The user would have to go all the way back to Movie Detail to change it.

**Plan says:**  
> Schedule screen: theatre list with expandable time slot chips per screen

**Fix:**  
Add a format selector to the Schedule screen's "Choose Schedule" view:

```jsx
// Schedule.jsx — in the "localTheatre" view, replace the static format badge with:
<div className="flex gap-2">
  {['2D', '3D', 'IMAX'].map((fmt) => (
    <button
      key={fmt}
      onClick={() => dispatch(setSelectedFormat(fmt))}
      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
        selectedFormat === fmt
          ? 'border-purple text-purple bg-purple-light'
          : 'border-gray-200 text-gray-400'
      }`}
    >
      {fmt}
    </button>
  ))}
</div>
```

---

---

# 🟠 MAJOR ISSUES

> These significantly deviate from the plan or create bad user experiences.

---

### M-01 — Bottom Nav Never Hides on Booking Flow Screens

**Files:** `client/src/App.jsx` · `client/src/components/BottomNav.jsx`

**Problem:**  
The plan explicitly says the bottom nav should be **hidden on `/seats`, `/summary`, and `/payment`**. Currently, `<BottomNav />` is rendered unconditionally in `App.jsx` outside the route tree, and `BottomNav.jsx` has no location-based visibility logic. The nav is always visible on every screen.

The sticky CTA buttons on these screens use `bottom-16` to sit above the nav — this is a workaround for the nav being there when it shouldn't be, and it wastes valuable viewport space on a 390px mobile screen.

**Plan says:**  
> Bottom nav (Home / Search / Tickets / Profile) persists on Screens 1–3. Hidden on Screens 4–6.

**Fix:**
```jsx
// BottomNav.jsx — add visibility check at the top
const HIDDEN_ON = ['/seats', '/summary', '/payment'];

export default function BottomNav() {
  const location = useLocation();
  if (HIDDEN_ON.includes(location.pathname)) return null;
  // ... rest of component
}
```

---

### M-02 — No Route Guards for Deep Links (Will Crash on Direct Navigation)

**Files:** `client/src/pages/SeatSelection.jsx` · `client/src/pages/Payment.jsx` · `client/src/pages/BookingSummary.jsx`

**Problem:**  
If a user navigates directly to `/seats`, `/summary`, or `/payment` (via a direct URL, browser back button after a refresh, or a shared link), `selectedShowtime` will be `null`.

- `SeatSelection.jsx`: silently skips the `fetchSeats` call — shows a blank seat grid forever
- `Payment.jsx`: calls `selectedShowtime._id` on line 36 → **TypeError crash** (cannot read property `_id` of null)
- `BookingSummary.jsx`: checks `!selectedMovie || selectedSeats.length === 0` but does NOT check `selectedShowtime`, so the summary renders with `₹—` and broken details

**Fix:**  
Add a redirect guard in each of these pages:

```jsx
// At the top of SeatSelection.jsx, Payment.jsx:
const { selectedShowtime } = useSelector((s) => s.booking);
const navigate = useNavigate();

useEffect(() => {
  if (!selectedShowtime?._id) {
    navigate('/');  // or navigate(-1)
  }
}, [selectedShowtime, navigate]);
```

---

### M-03 — MovieDetail Shows Unnecessary Loading Flash on Every Visit

**File:** `client/src/pages/MovieDetail.jsx` · `client/src/store/movieSlice.js`

**Problem:**  
When a user taps a movie card:
1. `MovieCard.jsx` dispatches `setSelectedMovie(movie)` — sets the movie in Redux
2. Navigates to `/movie/:id`
3. `MovieDetail.jsx` immediately dispatches `loadMovieById(id)` in `useEffect`
4. The `loadMovieById.pending` action sets `s.loading = true`
5. The loading guard `if (loading || !selectedMovie)` fires and shows the skeleton screen

This causes a visible flash to the skeleton loader every single time, even though the movie data is already in Redux state from step 1. The detail page has data, but the pending action triggers a skeleton anyway.

**Fix:**  
In `movieSlice.js`, only set loading to true if `selectedMovie` is not already the movie being requested. Or more simply, keep `selectedMovie` during a re-fetch:

```js
// movieSlice.js — extraReducers
.addCase(loadMovieById.pending, (s, a) => {
  s.loading = true;
  // DON'T clear selectedMovie here — keep what we have to avoid flash
  s.error = null;
})
```
Then in `MovieDetail.jsx`, only show the skeleton if `!selectedMovie` (ignore `loading`):
```jsx
if (!selectedMovie) return <SkeletonScreen />;
```

---

### M-04 — loadBookings Called Without userId After Cancellation

**File:** `client/src/components/TicketCard.jsx`

**Problem:**  
After cancelling a booking, `TicketCard.jsx` calls:
```js
await dispatch(cancelBookingThunk(booking._id));
await dispatch(loadBookings());  // ❌ no userId argument
```

The `cancelBookingThunk.fulfilled` case in `historySlice.js` already updates the booking in-place in the Redux store. The subsequent `loadBookings()` is redundant and creates a race condition where a stale response could overwrite the freshly-updated booking before the in-place update settles.

Also, calling `loadBookings()` without `userId` only works because the thunk defaults to `'guest'` — this will silently break if real user accounts are added.

**Fix:**  
Remove the redundant `loadBookings` call after cancel. The `historySlice` already handles the state update:

```js
const handleCancel = async () => {
  setCancelling(true);
  await dispatch(cancelBookingThunk(booking._id));
  // ✅ No need to re-fetch — historySlice updates in-place
  setCancelling(false);
  setShowCancel(false);
};
```

---

### M-05 — Showtime Date Filtering Is Timezone-Unsafe

**File:** `server/controllers/showtimeController.js`

**Problem:**  
The date filter creates a date range like this:
```js
const d = new Date(date);      // e.g. new Date("2025-06-21")
const next = new Date(d);
next.setDate(next.getDate() + 1);
filter.date = { $gte: d, $lt: next };
```

When the date string is `"2025-06-21"` (no time component), `new Date()` interprets it as **UTC midnight** (00:00:00 UTC). But the seed script stores dates using:
```js
d.setHours(0, 0, 0, 0);  // Local midnight
```

On an IST server (UTC+5:30), local midnight is `2025-06-20T18:30:00Z` in UTC. The query range starts at `2025-06-21T00:00:00Z` (UTC midnight) — 5.5 hours after the stored date. All showtimes for that day are missed.

**Fix:**  
Parse the date string as local time in the filter to match how the seed stores it:

```js
const [year, month, day] = date.split('-').map(Number);
const d = new Date(year, month - 1, day, 0, 0, 0, 0);       // Local midnight
const next = new Date(year, month - 1, day + 1, 0, 0, 0, 0); // Next local midnight
filter.date = { $gte: d, $lt: next };
```

---

### M-06 — IMAX Format Missing From MovieDetail — IMAX Showtimes Unreachable

**File:** `client/src/pages/MovieDetail.jsx`

**Problem:**  
The format selector in `MovieDetail.jsx` only offers `['2D', '3D']`:
```js
const FORMATS = ['2D', '3D'];  // ❌ IMAX is missing
```

The plan and the `Showtime` Mongoose schema both include `'IMAX'` as a valid format. The seed script generates IMAX showtimes for every theatre. But because the user can never select IMAX on the MovieDetail screen, the `selectedFormat` in Redux is always `'2D'` or `'3D'`, and IMAX showtimes are completely unreachable through the normal booking flow.

**Fix:**
```js
const FORMATS = ['2D', '3D', 'IMAX'];  // ✅ matches plan and schema
```

---

### M-07 — Search Page Has a Disabled Input and No Search Logic

**File:** `client/src/pages/Search.jsx`

**Problem:**  
The search input field has the `disabled` attribute — it cannot be typed into:
```jsx
<input
  type="text"
  placeholder="Search movies, theatres…"
  disabled  // ❌
/>
```

The page also only displays movies that are already loaded in Redux state (from a previous Home page visit). If the user navigates directly to `/search`, the grid is empty because `nowShowing` and `comingSoon` are never fetched here.

There is also no title shown on the movie poster grid, so all posters look like anonymous images with no labels.

**Fix:**
1. Remove `disabled` from the input
2. Add `useEffect` to dispatch `loadNowPlaying()` + `loadUpcoming()` if state is empty
3. Add a `useState` for `query` and filter `all` movies by title match
4. Add a title label below each poster in the grid

---

### M-08 — No `.env` or `.env.example` File in the Repo

**Files:** `server/server.js` · `server/services/tmdbService.js` · `server/seed/seedData.js`

**Problem:**  
The server requires four environment variables:
- `MONGODB_URI`
- `TMDB_API_KEY`
- `TMDB_BASE_URL`
- `TMDB_IMAGE_BASE`

Neither a `.env` file nor a `.env.example` template exists in the repository. When the server starts without these variables:
- All TMDB calls return `502` errors (API key is `undefined`)
- MongoDB connection fails silently (URI is `undefined`)
- The seed script fails with a confusing Mongoose error

The plan explicitly lists all four variables with example values in the Setup section.

**Fix:**  
Create `server/.env.example` (committed to the repo) and add `server/.env` to `.gitignore`:

```env
# server/.env.example
MONGODB_URI=mongodb://localhost:27017/movie-tickets
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
PORT=5000
```

Also add a startup check in `server.js`:
```js
const required = ['MONGODB_URI', 'TMDB_API_KEY'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing env var: ${key}. Copy server/.env.example to server/.env`);
    process.exit(1);
  }
});
```

---

---

# 🟡 MINOR ISSUES

> Code quality, dead code, and small UX gaps.

---

### N-01 — App.css Contains Vite Scaffold Boilerplate (Dead Code)

**File:** `client/src/App.css`

**Problem:**  
`App.css` contains the full default Vite starter CSS (`.counter`, `.hero`, `#center`, `#next-steps`, `#spacer`, `.ticks` etc.). None of these classes are used anywhere in the app. This is dead code left over from the initial scaffold that was never cleaned up.

**Fix:**  
Delete the entire contents of `App.css` (or delete the file and remove the import from `App.jsx` if it exists).

---

### N-02 — Bottom Nav Labels and Icons Don't Match Routes

**File:** `client/src/components/BottomNav.jsx`

**Problem:**  
The nav items are configured as:

| Label | Route | Icon |
|---|---|---|
| Home | `/` | Home icon ✅ |
| **Tickets** | `/search` | Grid icon ❌ |
| **Favorites** | `/bookings` | Heart icon ❌ |
| Profile | `/profile` | Profile icon ✅ |

The plan specifies: **Home / Search / Tickets / Profile**. The current code has the second and third items swapped (both in label and destination). "Tickets" navigates to the Search page. "Favorites" (with a heart icon) navigates to My Bookings, which shows tickets — not favorites.

**Fix:**
```js
// BottomNav.jsx
const navItems = [
  { path: '/',         label: 'Home',    icon: HomeIcon    },
  { path: '/search',   label: 'Search',  icon: SearchIcon  },  // ✅ correct
  { path: '/bookings', label: 'Tickets', icon: TicketIcon  },  // ✅ correct
  { path: '/profile',  label: 'Profile', icon: ProfileIcon },
];
```

---

### N-03 — PriceSummary Component Exists But Is Never Used on Seat Selection Screen

**Files:** `client/src/components/PriceSummary.jsx` · `client/src/pages/SeatSelection.jsx`

**Problem:**  
The plan calls for a **live price ticker** in the top-right of the seat selection screen that updates on every seat select/deselect. The `PriceSummary` component is built and connected to Redux. However, it is **never imported or rendered** in `SeatSelection.jsx`. The price is shown only as a static label (`₹{selectedShowtime?.price || 350} / seat`) — there is no live total.

**Fix:**  
Import and use `PriceSummary` in `SeatSelection.jsx`:

```jsx
// SeatSelection.jsx
import PriceSummary from '../components/PriceSummary';

// Add in the JSX, above the seat grid or in the header:
<PriceSummary compact />
```

---

### N-04 — `dev:all` Script Uses Windows-Only Syntax

**File:** `package.json` (root)

**Problem:**  
```json
"dev:all": "start \"Backend\" node server/server.js && start \"Frontend\" npm run dev --prefix client"
```
The `start` command is **Windows CMD only**. This fails on macOS and Linux with `command not found: start`.

**Fix:**  
Install `concurrently` and update the script:
```bash
npm install --save-dev concurrently
```
```json
"dev:all": "concurrently \"node server/server.js\" \"npm run dev --prefix client\""
```

---

### N-05 — No nodemon — Server Requires Manual Restart on Every Code Change

**File:** `package.json` (root)

**Problem:**  
The `dev` script is identical to `start`:
```json
"dev": "node server/server.js"
```
Any server-side code change requires killing and restarting the process manually.

**Fix:**
```bash
npm install --save-dev nodemon
```
```json
"dev": "nodemon server/server.js"
```

---

### N-06 — Duplicate Import Line in store/index.js

**File:** `client/src/store/index.js`

**Problem:**  
```js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';  // ❌ separate line for same package
```
`combineReducers` can be destructured on the same import line as `configureStore`.

**Fix:**
```js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
```

---

### N-07 — "View All" and "Book" Buttons on Home Page Are Dead

**File:** `client/src/pages/Home.jsx`

**Problem:**  
Three buttons on the Home page have no `onClick` handlers and do nothing:
1. "View All" next to the Now Showing / Coming Soon tabs
2. "View All" next to the Movie Theatres section
3. "Book" button on each theatre card

These render as tappable buttons but trigger no action, which is confusing on a mobile interface.

**Fix:**  
For now, wire them to navigate to relevant screens:
```jsx
// "View All" for movies → navigate to /search
<button onClick={() => navigate('/search')}>View All</button>

// Theatre "Book" button → navigate to /schedule with that theatre pre-selected
<button onClick={() => navigate('/schedule')}>Book</button>
```

---

---

# 🟣 MISSING FEATURES

> Items from the implementation plan that have not been built yet.

---

### F-01 — `hooks/` and `utils/` Directories Not Created

**Plan location:** `client/src/hooks/` · `client/src/utils/`

**Missing files:**
- `hooks/useSeatMatrix.js`
- `hooks/useBooking.js`
- `utils/priceCalculator.js`
- `utils/seatHelpers.js`

Seat logic and price calculation are currently scattered inline across components and slices. The plan calls for these to be centralised in dedicated files.

---

### F-02 — `SeatCell` Is Not a Separate Component File

**Plan location:** `client/src/components/SeatCell.jsx`

`SeatCell` is defined as a named export inside `SeatGrid.jsx` instead of its own file. The plan's folder structure lists it as a standalone component.

---

### F-03 — `DateStrip` Is Not a Reusable Component

**Plan location:** `client/src/components/DateStrip.jsx`

The date strip (7-day horizontal scroller) is inlined entirely within `Schedule.jsx`. The plan calls for a standalone `DateStrip` component that could be reused elsewhere.

---

### F-04 — TMDB `/movie/{id}/images` Endpoint Not Implemented

**Plan location:** `server/services/tmdbService.js`

The plan lists `GET /movie/{id}/images` as one of the TMDB endpoints used (for higher-resolution backdrop images). `tmdbService.js` does not have a `getImages()` function. The app falls back to `backdrop_path` from the movie detail response, which works but misses better backdrop options.

---

### F-05 — Movie Title Placeholder "Movie" Has No Loading State in TicketCard

**File:** `client/src/components/TicketCard.jsx`

`TicketCard` shows the hardcoded string `"Movie"` as a placeholder while the movie title is being fetched. If the fetch fails, it permanently shows "Movie" with no error indication. There is no skeleton/shimmer on the ticket card header during the fetch.

**Fix:**  
Add a loading state and error fallback:

```jsx
const [movieName, setMovieName] = useState(null);  // null = loading
// In the JSX:
<p className="font-extrabold text-sm">
  {movieName ?? <span className="opacity-50 text-xs">Loading…</span>}
</p>
```

---

### F-06 — `SuccessToast` Component Not Built

**Plan location:** `client/src/components/SuccessToast.jsx`

The plan calls for a `SuccessToast` component for the post-payment success animation. The current implementation uses an inline JSX block with a `scale-in` CSS animation — a functional substitute, but not the reusable component the plan describes.

---

### F-07 — No Theatre Detail Endpoint

**Plan location:** `server/routes/theatres.js`

`theatreController.js` only exports `getAllTheatres`. There is no `GET /theatres/:id` endpoint. This will be needed as the app grows.

---

### F-08 — Search Page Does Not Fetch Data Independently

**File:** `client/src/pages/Search.jsx`

The Search page only renders movies already in Redux state from a prior Home page visit. If the user navigates directly to `/search`, the grid is empty. The page should dispatch `loadNowPlaying()` and `loadUpcoming()` on mount if the state arrays are empty.

---

### F-09 — No Cache Invalidation or Force-Refresh for TMDB Data

**File:** `server/services/tmdbService.js`

The 5-minute `node-cache` TTL for `now_playing` and `upcoming` has no manual invalidation mechanism. There is no way for a client to force a refresh (e.g., a pull-to-refresh gesture on the Home screen). If TMDB updates its listings mid-TTL, users see stale data until the TTL expires.

---

---

## Fix Priority Order

| Priority | Issues | Reason |
|---|---|---|
| **1 — Do first** | C-01, C-02, C-03 | Price bugs affect every booking; race condition risks data integrity |
| **2 — Do next** | C-04, M-08 | API key exposure risk; app won't start without env vars |
| **3 — Core UX** | C-05, C-06, M-01, M-06 | Seat grid wrong, IMAX unreachable, nav always visible |
| **4 — Stability** | M-02, M-03, M-05 | Crash on direct navigation, timezone bug, loading flash |
| **5 — Polish** | M-04, M-07, N-01 through N-07 | Redundant calls, dead buttons, dead code |
| **6 — Backlog** | F-01 through F-09 | Missing features from plan — build after bugs are fixed |

---

*Report generated from full codebase review against `movie-ticket-reservation-plan.md`*
