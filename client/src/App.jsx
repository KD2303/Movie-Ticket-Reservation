import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Schedule from './pages/Schedule';
import SeatSelection from './pages/SeatSelection';
import BookingSummary from './pages/BookingSummary';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Search from './pages/Search';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/seats" element={<SeatSelection />} />
        <Route path="/summary" element={<BookingSummary />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/profile" element={<ProfileStub />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function ProfileStub() {
  return (
    <div className="flex flex-col items-center justify-center h-screen pb-24 text-center px-6 bg-white">
      <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple/20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-gray-900 font-black text-xl mb-1">Guest User</h2>
      <p className="text-gray-400 text-sm">Sign in to sync your bookings across devices</p>
      <button className="mt-6 gradient-purple px-6 py-3 rounded-2xl text-white font-bold text-sm">
        Sign In (Coming Soon)
      </button>
    </div>
  );
}
