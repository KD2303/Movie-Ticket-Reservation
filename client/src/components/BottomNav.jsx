import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/bookings', label: 'Tickets', icon: TicketIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const HIDDEN_PATHS = ['/schedule', '/seats', '/summary', '/payment'];
  if (HIDDEN_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? (location.pathname === '/' || location.pathname.startsWith('/movie'))
            : location.pathname === path;

          return (
            <button
              key={path}
              id={`nav-${label.toLowerCase()}`}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200 ${
                isActive ? 'text-purple' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} filled={isActive} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TicketIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="6" y1="5" x2="6" y2="19" strokeDasharray="3" />
      <line x1="18" y1="5" x2="18" y2="19" strokeDasharray="3" />
    </svg>
  );
}

function ProfileIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
