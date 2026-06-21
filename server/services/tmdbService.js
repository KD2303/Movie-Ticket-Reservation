const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5-min TTL

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' },
  headers: { 'Accept-Encoding': 'identity' },
  timeout: 10000,
});

// Retry once on transient network errors (ECONNRESET, ETIMEDOUT, etc.)
const withRetry = async (fn, retries = 1, delayMs = 600) => {
  try {
    return await fn();
  } catch (err) {
    const isNetworkErr = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND';
    if (retries > 0 && isNetworkErr) {
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs);
    }
    throw err;
  }
};

// Cache only the response DATA (not the full axios response with circular refs)
const cached = async (key, fn) => {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const result = await withRetry(fn);
  cache.set(key, result.data); // Store only serializable .data
  return result.data;
};

// All service functions now return the data object directly (not the axios response)
const getNowPlaying = () =>
  cached('now_playing', () => tmdb.get('/movie/now_playing', { params: { page: 1 } }));

const getUpcoming = () =>
  cached('upcoming', () => tmdb.get('/movie/upcoming', { params: { page: 1 } }));

const getMovieById = (id) =>
  cached(`movie_${id}`, () => tmdb.get(`/movie/${id}`));

const getCredits = (id) =>
  cached(`credits_${id}`, () => tmdb.get(`/movie/${id}/credits`));

module.exports = { getNowPlaying, getUpcoming, getMovieById, getCredits };
