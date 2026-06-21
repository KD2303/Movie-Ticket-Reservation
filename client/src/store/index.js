import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import movieReducer from './movieSlice';
import bookingReducer from './bookingSlice';
import historyReducer from './historySlice';

// Inline localStorage adapter — avoids Vite ESM resolution issues with redux-persist/lib/storage
const storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const bookingPersistConfig = {
  key: 'booking',
  storage,
  // 'selectedShowtime' intentionally excluded — it contains ObjectId refs that corrupt on rehydrate
  // (serializes as string "F"), causing 500 errors on /api/bookings. Keep in session memory only.
  whitelist: ['selectedDate', 'selectedTime', 'selectedTheatre', 'selectedSeats', 'seatPrice', 'totalPrice'],
};

const moviePersistConfig = {
  key: 'movies',
  storage,
  whitelist: ['selectedMovie', 'selectedFormat'],
};

const rootReducer = combineReducers({
  movies: persistReducer(moviePersistConfig, movieReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  history: historyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
