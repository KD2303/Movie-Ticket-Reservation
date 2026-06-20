import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedMovie } from '../store/movieSlice';

export default function MovieCard({ movie, size = 'md' }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setSelectedMovie(movie));
    navigate(`/movie/${movie.id}`);
  };

  const isLarge = size === 'lg';

  return (
    <button
      id={`movie-card-${movie.id}`}
      onClick={handleClick}
      className={`flex-shrink-0 rounded-2xl overflow-hidden relative group transition-transform duration-200 active:scale-95 ${
        isLarge ? 'w-[160px] h-[240px]' : 'w-[120px] h-[180px]'
      }`}
    >
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-card flex items-center justify-center">
          <span className="text-white/30 text-xs">No Image</span>
        </div>
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {/* Rating badge */}
      <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-1.5 py-0.5 flex items-center gap-0.5">
        <StarIcon />
        <span className="text-[10px] font-semibold text-yellow-400">{movie.rating}</span>
      </div>
      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{movie.title}</p>
        {movie.genres?.[0] && (
          <span className="text-white/50 text-[9px]">{movie.genres[0]}</span>
        )}
      </div>
    </button>
  );
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
