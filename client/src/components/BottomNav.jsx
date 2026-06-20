import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Tickets', icon: GridIcon },
  { path: '/bookings', label: 'Favorites', icon: HeartIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          // Highlight Home for / and /movie/*, Tickets for /schedule, /seats, /summary, /payment, /bookings
          const isHomeActive = path === '/' && (location.pathname === '/' || location.pathname.startsWith('/movie'));
          const isTicketsActive = path === '/search' && (location.pathname === '/search' || location.pathname === '/schedule' || location.pathname === '/seats' || location.pathname === '/summary' || location.pathname === '/payment');
          const isFavActive = path === '/bookings' && location.pathname === '/bookings';
          const isProfileActive = path === '/profile' && location.pathname === '/profile';

          const isActive = isHomeActive || isTicketsActive || isFavActive || isProfileActive;

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

function GridIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HeartIcon({ size = 24, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
