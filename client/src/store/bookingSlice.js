import { createSlice } from '@reduxjs/toolkit';

const BOOKING_FEE = 30;
const MAX_SEATS = 6;

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedDate: null,
    selectedTime: null,
    selectedTheatre: null,
    selectedShowtime: null,
    selectedSeats: [],
    seatPrice: 0,
    totalPrice: 0,
  },
  reducers: {
    setSelectedDate: (state, action) => { state.selectedDate = action.payload; },
    setSelectedTime: (state, action) => { state.selectedTime = action.payload; },
    setSelectedTheatre: (state, action) => { state.selectedTheatre = action.payload; },
    setSelectedShowtime: (state, action) => {
      state.selectedShowtime = action.payload;
      state.seatPrice = action.payload?.price || 0;
      state.selectedSeats = [];
      state.totalPrice = 0;
    },
    toggleSeat: (state, action) => {
      const seat = action.payload; // { row, col }
      const idx = state.selectedSeats.findIndex(
        (s) => s.row === seat.row && s.col === seat.col
      );
      if (idx >= 0) {
        state.selectedSeats.splice(idx, 1);
      } else {
        if (state.selectedSeats.length >= MAX_SEATS) return;
        state.selectedSeats.push(seat);
      }
      state.totalPrice = state.selectedSeats.length * state.seatPrice + BOOKING_FEE;
    },
    clearSeats: (state) => {
      state.selectedSeats = [];
      state.totalPrice = 0;
    },
    clearBooking: (state) => {
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedTheatre = null;
      state.selectedShowtime = null;
      state.selectedSeats = [];
      state.seatPrice = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  setSelectedDate, setSelectedTime, setSelectedTheatre, setSelectedShowtime,
  toggleSeat, clearSeats, clearBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
