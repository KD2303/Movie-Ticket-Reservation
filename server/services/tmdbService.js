const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5-min TTL

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL,
  params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' },
});

const cached = async (key, fn) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const result = await fn();
  cache.set(key, result);
  return result;
};

const getNowPlaying = () =>
  cached('now_playing', () => tmdb.get('/movie/now_playing', { params: { page: 1 } }));

const getUpcoming = () =>
  cached('upcoming', () => tmdb.get('/movie/upcoming', { params: { page: 1 } }));

const getMovieById = (id) =>
  cached(`movie_${id}`, () => tmdb.get(`/movie/${id}`));

const getCredits = (id) =>
  cached(`credits_${id}`, () => tmdb.get(`/movie/${id}/credits`));

module.exports = { getNowPlaying, getUpcoming, getMovieById, getCredits };
