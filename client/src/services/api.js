import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Movies
export const fetchNowPlaying = () => api.get('/movies/now-playing');
export const fetchUpcoming = () => api.get('/movies/upcoming');
export const fetchMovieById = (tmdbId) => api.get(`/movies/${tmdbId}`);

// Theatres
export const fetchTheatres = () => api.get('/theatres');

// Showtimes
export const fetchShowtimes = (tmdbMovieId, date) =>
  api.get('/showtimes', { params: { tmdbMovieId, date } });
export const fetchSeats = (showtimeId) => api.get(`/showtimes/${showtimeId}/seats`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const fetchBookings = (userId = 'guest') => api.get('/bookings', { params: { userId } });
export const fetchBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

export default api;
