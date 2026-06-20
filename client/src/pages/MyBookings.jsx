import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadBookings } from '../store/historySlice';
import TicketCard from '../components/TicketCard';

export default function MyBookings() {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((s) => s.history);

  useEffect(() => {
    dispatch(loadBookings('guest'));
  }, [dispatch]);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white font-black text-2xl">My Tickets</h1>
        <p className="text-white/40 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4">
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={() => dispatch(loadBookings('guest'))} className="mt-4 text-purple text-sm underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-6xl mb-4">🎟</p>
            <h3 className="text-white font-bold text-lg mb-2">No bookings yet</h3>
            <p className="text-white/40 text-sm">Your tickets will appear here after booking</p>
          </div>
        )}

        {!loading && bookings.map((booking) => (
          <TicketCard key={booking._id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
