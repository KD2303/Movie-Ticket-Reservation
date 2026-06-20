import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadNowPlaying, loadUpcoming } from '../store/movieSlice';

export default function Search() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { nowShowing, comingSoon } = useSelector((s) => s.movies);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (nowShowing.length === 0) dispatch(loadNowPlaying());
    if (comingSoon.length === 0) dispatch(loadUpcoming());
  }, [dispatch, nowShowing.length, comingSoon.length]);

  // Deduplicate by TMDB ID — a movie can appear in both lists
  const seen = new Set();
  const allMovies = [...nowShowing, ...comingSoon].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  const filteredMovies = allMovies.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pb-32 bg-white min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-gray-900 font-extrabold text-2xl">Search</h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">Explore all movies showing now</p>
      </div>

      {/* Input */}
      <div className="px-5 mb-5">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search movies, genres…"
            className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 placeholder-gray-400 w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="px-5">
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          {filteredMovies.map((m) => (
            <div key={m.id} className="flex flex-col gap-1.5 items-center">
              <button
                onClick={() => navigate(`/movie/${m.id}`)}
                className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:scale-105 active:scale-95 transition-all bg-gray-50 relative group"
              >
                {m.poster ? (
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No poster</div>
                )}
              </button>
              <span className="text-gray-900 font-bold text-[10px] text-center leading-tight line-clamp-2 w-full px-1">
                {m.title}
              </span>
            </div>
          ))}
          {filteredMovies.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-400 text-xs font-semibold">No movies found</div>
          )}
        </div>
      </div>
    </div>
  );
}
