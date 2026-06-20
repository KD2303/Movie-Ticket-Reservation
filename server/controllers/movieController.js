const tmdbService = require('../services/tmdbService');

const IMAGE_BASE = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

const mapMovie = (m) => ({
  id: m.id,
  title: m.title,
  description: m.overview,
  banner: m.backdrop_path ? `${IMAGE_BASE}${m.backdrop_path}` : null,
  poster: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null,
  rating: m.vote_average ? m.vote_average.toFixed(1) : '0.0',
  genres: m.genres?.map((g) => g.name) || [],
  runtime: m.runtime || null,
  imdbId: m.imdb_id || null,
  releaseDate: m.release_date || null,
});

const mapCast = (c) => ({
  name: c.name,
  character: c.character,
  image: c.profile_path ? `${IMAGE_BASE}${c.profile_path}` : null,
});

exports.getNowPlaying = async (req, res) => {
  try {
    const resp = await tmdbService.getNowPlaying();
    const movies = resp.data.results.map(mapMovie);
    res.json({ success: true, data: movies });
  } catch (err) {
    console.error('TMDB now_playing error:', err.message);
    res.status(502).json({ success: false, message: 'Failed to fetch movies from TMDB' });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const resp = await tmdbService.getUpcoming();
    const movies = resp.data.results.map(mapMovie);
    res.json({ success: true, data: movies });
  } catch (err) {
    console.error('TMDB upcoming error:', err.message);
    res.status(502).json({ success: false, message: 'Failed to fetch upcoming movies' });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const [movieResp, creditsResp] = await Promise.all([
      tmdbService.getMovieById(tmdbId),
      tmdbService.getCredits(tmdbId),
    ]);
    const movie = mapMovie(movieResp.data);
    const cast = creditsResp.data.cast.slice(0, 10).map(mapCast);
    res.json({ success: true, data: { ...movie, cast } });
  } catch (err) {
    console.error('TMDB movie detail error:', err.message);
    res.status(502).json({ success: false, message: 'Failed to fetch movie details' });
  }
};
