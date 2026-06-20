import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNowPlaying, fetchUpcoming, fetchMovieById } from '../services/api';

export const loadNowPlaying = createAsyncThunk('movies/loadNowPlaying', async () => {
  const res = await fetchNowPlaying();
  return res.data.data;
});

export const loadUpcoming = createAsyncThunk('movies/loadUpcoming', async () => {
  const res = await fetchUpcoming();
  return res.data.data;
});

export const loadMovieById = createAsyncThunk('movies/loadMovieById', async (tmdbId) => {
  const res = await fetchMovieById(tmdbId);
  return res.data.data;
});

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    nowShowing: [],
    comingSoon: [],
    selectedMovie: null,
    selectedFormat: '2D',
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedMovie: (state, action) => { state.selectedMovie = action.payload; },
    setSelectedFormat: (state, action) => { state.selectedFormat = action.payload; },
    clearSelectedMovie: (state) => { state.selectedMovie = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNowPlaying.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loadNowPlaying.fulfilled, (s, a) => { s.loading = false; s.nowShowing = a.payload; })
      .addCase(loadNowPlaying.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(loadUpcoming.fulfilled, (s, a) => { s.comingSoon = a.payload; })
      .addCase(loadMovieById.pending, (s) => { s.loading = true; })
      .addCase(loadMovieById.fulfilled, (s, a) => { s.loading = false; s.selectedMovie = a.payload; })
      .addCase(loadMovieById.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export const { setSelectedMovie, setSelectedFormat, clearSelectedMovie } = movieSlice.actions;
export default movieSlice.reducer;
