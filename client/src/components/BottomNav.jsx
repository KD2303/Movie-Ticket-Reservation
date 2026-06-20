import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/bookings', label: 'Tickets', icon: TicketIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

const HIDDEN_ROUTES = ['/seats', '/summary', '/payment'];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50">
      <div className="glass border-t border-white/10 px-2 py-2 flex justify-around items-center">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              id={`nav-${label.toLowerCase()}`}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-purple' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={22} filled={isActive} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-purple' : ''}`}>{label}</span>
              {isActive && <span className="w-1 h-1 bg-purple rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#7B61FF' : 'none'} stroke={filled ? '#7B61FF' : 'currentColor'} strokeWidth="2">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function SearchIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={filled ? '#7B61FF' : 'currentColor'} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#7B61FF' : 'none'} stroke={filled ? '#7B61FF' : 'currentColor'} strokeWidth="2">
      <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 000-4V9z" />
    </svg>
  );
}

function ProfileIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#7B61FF' : 'none'} stroke={filled ? '#7B61FF' : 'currentColor'} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
