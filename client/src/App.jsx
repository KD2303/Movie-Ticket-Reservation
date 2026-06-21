import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Schedule from './pages/Schedule';
import SeatSelection from './pages/SeatSelection';
import BookingSummary from './pages/BookingSummary';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

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
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
