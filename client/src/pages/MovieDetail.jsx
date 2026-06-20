import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMovieById, setSelectedFormat } from '../store/movieSlice';

const FORMATS = ['2D', '3D', 'IMAX'];

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie, selectedFormat, loading } = useSelector((s) => s.movies);

  useEffect(() => {
    dispatch(loadMovieById(id));
  }, [id, dispatch]);

  if (loading || !selectedMovie) {
    return (
      <div>
        <div className="h-[280px] skeleton" />
        <div className="px-4 mt-4">
          <div className="h-6 w-48 skeleton rounded-xl mb-3" />
          <div className="h-4 w-full skeleton rounded-xl mb-2" />
          <div className="h-4 w-3/4 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const m = selectedMovie;

  return (
    <div className="pb-28">
      {/* Banner */}
      <div className="relative h-[280px]">
        <img
          src={m.banner || m.poster}
          alt={m.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        {/* Back button */}
        <button
          id="back-btn"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 glass rounded-full flex items-center justify-center"
        >
          <BackIcon />
        </button>
        {/* Rating */}
        <div className="absolute top-4 right-4 glass rounded-xl px-2.5 py-1.5 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span className="text-yellow-400 text-xs font-bold">{m.rating}</span>
        </div>
      </div>

      <div className="px-4 -mt-6 relative fade-up">
        {/* Genres */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {m.genres?.map((g) => (
            <span key={g} className="text-[10px] bg-purple/20 text-purple px-2.5 py-1 rounded-full font-medium">{g}</span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-white font-black text-2xl leading-tight mb-2">{m.title}</h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-4 text-white/50 text-xs">
          {m.runtime && <span>⏱ {m.runtime} min</span>}
          {m.releaseDate && <span>📅 {new Date(m.releaseDate).getFullYear()}</span>}
          {m.imdbId && <span className="bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-bold">IMDb</span>}
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed mb-6">{m.description}</p>

        {/* Format Selector */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Select Format</h3>
          <div className="flex gap-2">
            {FORMATS.map((fmt) => (
              <button
                key={fmt}
                id={`format-${fmt}`}
                onClick={() => dispatch(setSelectedFormat(fmt))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  selectedFormat === fmt
                    ? 'gradient-purple text-white border-transparent'
                    : 'border-white/20 text-white/50 hover:border-purple/50 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Cast */}
        {m.cast && m.cast.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">Cast</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {m.cast.map((actor, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                  {actor.image ? (
                    <img src={actor.image} alt={actor.name} className="w-14 h-14 rounded-full object-cover border-2 border-purple/30" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-white/30 text-xl">👤</div>
                  )}
                  <p className="text-white text-[9px] font-medium text-center line-clamp-2 leading-tight">{actor.name}</p>
                  <p className="text-white/40 text-[8px] text-center line-clamp-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Now CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-bg/90 backdrop-blur-sm border-t border-white/10">
        <button
          id="book-now-cta"
          onClick={() => navigate('/schedule')}
          className="w-full gradient-purple py-4 rounded-2xl text-white font-bold text-base pulse-glow transition-transform active:scale-95"
        >
          🎟 Book Now — {selectedFormat}
        </button>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
