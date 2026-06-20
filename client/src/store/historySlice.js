import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchBookings, cancelBooking as cancelBookingApi } from '../services/api';

export const loadBookings = createAsyncThunk('history/loadBookings', async (userId = 'guest') => {
  const res = await fetchBookings(userId);
  return res.data.data;
});

export const cancelBookingThunk = createAsyncThunk('history/cancelBooking', async (id) => {
  const res = await cancelBookingApi(id);
  return res.data.data;
});

const historySlice = createSlice({
  name: 'history',
  initialState: {
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBookings.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loadBookings.fulfilled, (s, a) => { s.loading = false; s.bookings = a.payload; })
      .addCase(loadBookings.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(cancelBookingThunk.fulfilled, (s, a) => {
        const idx = s.bookings.findIndex((b) => b._id === a.payload._id);
        if (idx >= 0) s.bookings[idx] = a.payload;
      });
  },
});

export default historySlice.reducer;
