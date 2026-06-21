import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMovieById, setSelectedFormat, setSelectedMovie } from '../store/movieSlice';

const FORMATS = ['2D', '3D', 'IMAX'];

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie, selectedFormat, loading } = useSelector((s) => s.movies);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    dispatch(loadMovieById(id));
  }, [id, dispatch]);

  const m = selectedMovie;
  const isCorrectMovie = m && String(m.id) === String(id);

  if (!isCorrectMovie) {
    return (
      <div className="bg-white min-h-screen pb-24">
        <div className="h-[250px] skeleton" />
        <div className="px-5 mt-5">
          <div className="h-7 w-48 skeleton rounded-xl mb-4" />
          <div className="h-4 w-full skeleton rounded-xl mb-3" />
          <div className="h-4 w-3/4 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* Banner */}
      <div className="relative h-[250px]">
        {m.banner || m.poster ? (
          <img
            src={m.banner || m.poster}
            alt={m.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            id="back-btn"
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-800 transition-colors"
          >
            <BackIcon />
          </button>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-800 transition-colors"
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 relative fade-up">
        {/* Title Section */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-gray-900 font-extrabold text-xl leading-tight">{m.title}</h1>
            <p className="text-gray-400 text-xs mt-1 font-medium">{m.genres?.join(', ')}</p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">PG-13</span>
            <div className="flex items-center gap-1 mt-1 text-gray-800">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-xs font-black">{m.rating || '8.1'}</span>
            </div>
          </div>
        </div>

        {/* Synopsis / Description */}
        <p className="text-gray-500 text-xs leading-relaxed mt-4">
          {m.description}
        </p>

        {/* Formats */}
        <div className="mt-5">
          <p className="text-gray-800 text-xs font-bold mb-2">Format Available</p>
          <div className="flex gap-2">
            {FORMATS.map((fmt) => (
              <button
                key={fmt}
                id={`format-${fmt}`}
                onClick={() => dispatch(setSelectedFormat(fmt))}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedFormat === fmt
                    ? 'border-purple text-purple bg-purple-light'
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Release Date */}
        <div className="mt-5">
          <p className="text-gray-800 text-xs font-bold mb-1">Release Date</p>
          <p className="text-gray-500 text-xs">
            {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '16 June 2026'}
          </p>
        </div>

        {/* Cast */}
        {m.cast && m.cast.length > 0 && (
          <div className="mt-5">
            <p className="text-gray-800 text-xs font-bold mb-2.5">Cast</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {m.cast.map((actor, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center w-14">
                  {actor.image ? (
                    <img src={actor.image} alt={actor.name} className="w-11 h-11 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">👤</div>
                  )}
                  <p className="text-gray-800 text-[9px] font-bold text-center mt-1 leading-tight line-clamp-2 w-full">{actor.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Button wrapper (Sits directly above the bottom nav) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-white border-t border-gray-100">
        <button
          id="book-now-cta"
          onClick={() => {
            dispatch(setSelectedMovie(m));
            dispatch(setSelectedFormat(selectedFormat));
            navigate('/schedule');
          }}
          className="w-full gradient-purple py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(95,51,225,0.25)] transition-transform active:scale-95"
        >
          Get Tickets
        </button>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
