import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadNowPlaying, loadUpcoming, setSelectedMovie } from '../store/movieSlice';
import { setSelectedTheatre } from '../store/bookingSlice';
import { fetchTheatres } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nowShowing, comingSoon, loading } = useSelector((s) => s.movies);
  const [theatres, setTheatres] = useState([]);
  const [activeTab, setActiveTab] = useState('now'); // 'now' or 'coming'

  const handleTheatreBook = (t) => {
    if (nowShowing && nowShowing.length > 0) {
      dispatch(setSelectedMovie(nowShowing[0]));
    }
    dispatch(setSelectedTheatre(t));
    navigate('/schedule');
  };

  useEffect(() => {
    dispatch(loadNowPlaying());
    dispatch(loadUpcoming());
    fetchTheatres().then((r) => setTheatres(r.data.data)).catch(() => {});
  }, [dispatch]);

  const moviesToDisplay = activeTab === 'now' ? nowShowing : comingSoon;

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* Top Banner Area */}
      <div className="relative h-[220px] bg-gray-950 overflow-hidden">
        {nowShowing[0] ? (
          <>
            <img
              src={nowShowing[0].banner || nowShowing[0].poster}
              alt={nowShowing[0].title}
              className="w-full h-full object-cover opacity-80"
            />
            {/* Search Icon */}
            <div className="absolute top-4 right-4">
              <button onClick={() => navigate('/search')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
            {/* Mega Poster Text */}
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h1 className="text-2xl font-black tracking-wide uppercase">{nowShowing[0].title}</h1>
              <p className="text-[11px] opacity-70 mt-1">{nowShowing[0].genres?.join(', ')}</p>
            </div>
          </>
        ) : (
          <div className="w-full h-full skeleton" />
        )}
      </div>

      {/* Tabs Row */}
      <div className="px-5 mt-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex gap-6 pb-2">
          <button
            onClick={() => setActiveTab('now')}
            className={`text-sm font-bold pb-2 transition-all relative ${
              activeTab === 'now' ? 'text-purple' : 'text-gray-400'
            }`}
          >
            Now Showing
            {activeTab === 'now' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('coming')}
            className={`text-sm font-bold pb-2 transition-all relative ${
              activeTab === 'coming' ? 'text-purple' : 'text-gray-400'
            }`}
          >
            Coming Soon
            {activeTab === 'coming' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />}
          </button>
        </div>
        <button onClick={() => navigate('/search')} className="text-purple text-xs font-bold pb-2 hover:underline">View All</button>
      </div>

      {/* Movie Horizontal List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex gap-4 px-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[120px] h-[190px] rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-5 pb-3 scroll-snap-x">
            {moviesToDisplay.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
            {moviesToDisplay.length === 0 && (
              <div className="text-gray-400 text-xs py-10 w-full text-center">No movies available</div>
            )}
          </div>
        )}
      </div>

      {/* Section: Movie Theatres */}
      <div className="mt-6 px-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900 font-extrabold text-base">Movie Theatres</h2>
          <button onClick={() => navigate('/search')} className="text-purple text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="flex flex-col gap-3">
          {theatres.map((t) => (
            <div key={t._id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
              {/* Theatre Logo Placeholder */}
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-purple text-lg font-bold">
                🏛
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-bold text-sm leading-snug">{t.name}</p>
                <p className="text-gray-400 text-[11px] font-medium leading-none mt-1">📍 {t.location}</p>
                <p className="text-purple text-xs font-bold mt-1.5">₹{t.basePrice} - ₹{t.basePrice + 170}</p>
              </div>
              <button
                onClick={() => handleTheatreBook(t)}
                className="bg-purple-light hover:bg-purple/10 text-purple text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                Book
              </button>
            </div>
          ))}
          {theatres.length === 0 && (
            <div className="text-gray-400 text-sm text-center py-4">No theatres available</div>
          )}
        </div>
      </div>
    </div>
  );
}
