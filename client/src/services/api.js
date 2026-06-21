import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Request interceptor to attach JWT token without circular dependency on Store
api.interceptors.request.use((config) => {
  try {
    const authPersist = localStorage.getItem('persist:auth');
    if (authPersist) {
      const authData = JSON.parse(authPersist);
      if (authData && authData.token) {
        let token = authData.token;
        // Strip string quotes if double-serialized by redux-persist
        if (token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1);
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    // Fail silently
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const fetchProfile = () => api.get('/auth/profile');

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
export const fetchBookings = () => api.get('/bookings');
export const fetchBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

export default api;
