import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-24 text-center px-6 bg-white fade-in">
        <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-gray-900 font-black text-xl mb-1">Guest User</h2>
        <p className="text-gray-400 text-sm">Sign in to sync your bookings across devices</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 gradient-purple px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(95,51,225,0.25)] transition-all active:scale-[0.98]"
        >
          Sign In
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="pb-24 bg-white min-h-screen fade-in">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-gray-900 font-black text-2xl">My Profile</h1>
      </div>

      {/* User Info Card */}
      <div className="px-5">
        <div className="flex flex-col items-center p-6 bg-gray-50 border border-gray-100 rounded-3xl text-center relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple/5 rounded-full" />

          {/* Profile Initials Avatar */}
          <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center text-white text-2xl font-black shadow-md mb-4 border-2 border-white">
            {initials}
          </div>

          <h2 className="text-gray-900 font-extrabold text-lg leading-snug">{user.name}</h2>
          <p className="text-gray-400 text-xs font-semibold leading-none mt-1">Active Account</p>
        </div>
      </div>

      {/* Fields & Actions */}
      <div className="px-5 mt-6 space-y-4">
        <h3 className="text-gray-800 font-bold text-xs">Account Details</h3>

        <div className="space-y-2">
          {/* Email field */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Email Address</p>
              <p className="text-gray-800 text-xs font-bold mt-1.5">{user.email}</p>
            </div>
            <span className="text-purple-500">📧</span>
          </div>

          {/* Phone field */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Phone Number</p>
              <p className="text-gray-800 text-xs font-bold mt-1.5">{user.phone}</p>
            </div>
            <span className="text-purple-500">📱</span>
          </div>
        </div>

        <h3 className="text-gray-800 font-bold text-xs pt-2">Management</h3>

        {/* Buttons list */}
        <div className="space-y-2">
          {/* Tickets link */}
          <button
            onClick={() => navigate('/bookings')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-left transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-gray-800">My Tickets</p>
              <p className="text-gray-400 text-[10px] font-semibold mt-1">View active and past bookings</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex justify-between items-center p-4 bg-red-50/50 hover:bg-red-50 border border-red-100/50 rounded-2xl text-left transition-colors text-red-600"
          >
            <div>
              <p className="text-xs font-bold">Sign Out</p>
              <p className="text-red-400 text-[10px] font-semibold mt-1">Log out of your account on this device</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
