import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadNowPlaying, loadUpcoming } from '../store/movieSlice';
import { fetchTheatres } from '../services/api';
import MovieCard from '../components/MovieCard';
import { useState } from 'react';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nowShowing, comingSoon, loading } = useSelector((s) => s.movies);
  const [theatres, setTheatres] = useState([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    dispatch(loadNowPlaying());
    dispatch(loadUpcoming());
    fetchTheatres().then((r) => setTheatres(r.data.data)).catch(() => {});
  }, [dispatch]);

  // Auto-cycle featured movie
  useEffect(() => {
    if (nowShowing.length === 0) return;
    const t = setInterval(() => setFeaturedIdx((i) => (i + 1) % Math.min(nowShowing.length, 5)), 4000);
    return () => clearInterval(t);
  }, [nowShowing]);

  const featured = nowShowing[featuredIdx];

  return (
    <div className="pb-24">
      {/* Hero Banner */}
      <div className="relative h-[260px] overflow-hidden">
        {featured ? (
          <img
            src={featured.banner || featured.poster}
            alt={featured.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full skeleton" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        {featured && (
          <div className="absolute bottom-4 left-4 right-4 fade-up">
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {featured.genres?.slice(0, 2).map((g) => (
                <span key={g} className="text-[9px] bg-purple/30 text-purple-light px-2 py-0.5 rounded-full font-medium">{g}</span>
              ))}
            </div>
            <h2 className="text-white font-bold text-xl leading-tight">{featured.title}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-yellow-400 text-xs font-semibold">{featured.rating}</span>
              </div>
              {featured.runtime && <span className="text-white/50 text-xs">{featured.runtime} min</span>}
              <button
                id="hero-book-now"
                onClick={() => navigate(`/movie/${featured.id}`)}
                className="ml-auto gradient-purple px-4 py-1.5 rounded-full text-xs font-bold text-white active:scale-95 transition-transform"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
        {/* Dots */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {nowShowing.slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => setFeaturedIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === featuredIdx ? 'bg-purple w-4' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Section: Now Showing */}
      <Section title="Now Showing" onSeeAll={() => {}}>
        {loading ? (
          <SkeletonCards count={4} />
        ) : (
          <HScroll>
            {nowShowing.map((m) => <MovieCard key={m.id} movie={m} size="lg" />)}
          </HScroll>
        )}
      </Section>

      {/* Section: Coming Soon */}
      <Section title="Coming Soon">
        {loading ? (
          <SkeletonCards count={4} />
        ) : (
          <HScroll>
            {comingSoon.map((m) => <MovieCard key={m.id} movie={m} size="md" />)}
          </HScroll>
        )}
      </Section>

      {/* Section: Theatres */}
      <Section title="Theatres Near You">
        <div className="px-4 flex flex-col gap-3">
          {theatres.map((t) => (
            <div key={t._id} className="glass rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{t.location}</p>
                <p className="text-white/40 text-xs">{t.screens?.length} screens</p>
              </div>
              <div className="text-right">
                <p className="text-purple font-bold">₹{t.basePrice}</p>
                <p className="text-white/40 text-[10px]">onwards</p>
              </div>
            </div>
          ))}
          {theatres.length === 0 && (
            <div className="text-white/30 text-sm text-center py-4">No theatres available</div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children, onSeeAll }) {
  return (
    <div className="mt-6">
      <div className="px-4 flex justify-between items-center mb-3">
        <h2 className="text-white font-bold text-base">{title}</h2>
        {onSeeAll && <button onClick={onSeeAll} className="text-purple text-xs font-medium">See all</button>}
      </div>
      {children}
    </div>
  );
}

function HScroll({ children }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scroll-snap-x">
      {children}
    </div>
  );
}

function SkeletonCards({ count }) {
  return (
    <div className="flex gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[120px] h-[180px] rounded-2xl skeleton" />
      ))}
    </div>
  );
}
