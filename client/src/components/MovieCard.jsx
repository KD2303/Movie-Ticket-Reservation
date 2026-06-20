import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedMovie } from '../store/movieSlice';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setSelectedMovie(movie));
    navigate(`/movie/${movie.id}`);
  };

  return (
    <button
      id={`movie-card-${movie.id}`}
      onClick={handleClick}
      className="flex-shrink-0 w-[125px] flex flex-col text-left group transition-transform duration-200 active:scale-95 scroll-snap-item"
    >
      {/* Poster Container */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-xs">No Image</span>
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 flex items-center gap-1">
          <StarIcon />
          <span className="text-[10px] font-bold text-white">{movie.rating}</span>
        </div>
      </div>
      {/* Movie Details */}
      <div className="mt-2 px-1">
        <p className="text-gray-900 text-xs font-bold leading-tight truncate">{movie.title}</p>
        {movie.genres?.[0] && (
          <span className="text-gray-400 text-[10px] block mt-0.5 leading-none">{movie.genres[0]}</span>
        )}
      </div>
    </button>
  );
}

function StarIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="#FBBF24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
