import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const navigate = useNavigate();
  const { nowShowing, comingSoon } = useSelector((s) => s.movies);
  const all = [...nowShowing, ...comingSoon];

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-white font-black text-2xl mb-4">Search</h1>
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <span className="text-white/30 text-sm">Search movies, theatres…</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {all.slice(0, 9).map((m) => (
          <button key={m.id} onClick={() => navigate(`/movie/${m.id}`)} className="aspect-[2/3] rounded-xl overflow-hidden">
            {m.poster ? <img src={m.poster} alt={m.title} className="w-full h-full object-cover" /> : <div className="w-full h-full skeleton" />}
          </button>
        ))}
      </div>
    </div>
  );
}
