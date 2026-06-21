import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BOOKING_FEE } from '../constants';

export default function BookingSummary() {
  const navigate = useNavigate();
  const { selectedSeats, selectedDate, selectedTime, selectedTheatre, selectedShowtime, seatPrice, totalPrice } = useSelector((s) => s.booking);
  const { selectedMovie } = useSelector((s) => s.movies);
  const { isLoggedIn } = useSelector((s) => s.auth);

  // Auth guard — must be logged in to access checkout
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/summary', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Data guard — selectedShowtime is intentionally not persisted (avoids ObjectId corruption)
  // so only redirect away if the user is logged in but arrived here without a valid flow
  useEffect(() => {
    if (isLoggedIn && !selectedShowtime?._id) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, selectedShowtime, navigate]);

  const baseTotal = selectedSeats.length * seatPrice;

  if (!selectedMovie || selectedSeats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        <p className="text-5xl mb-4">🎬</p>
        <p className="text-gray-900 font-extrabold text-lg mb-1">Nothing to summarize</p>
        <p className="text-gray-400 text-xs mb-6">Select a movie and seats first</p>
        <button onClick={() => navigate('/')} className="gradient-purple px-6 py-3 rounded-2xl text-white font-bold text-xs">
          Browse Movies
        </button>
      </div>
    );
  }

  // Parse date string (YYYY-MM-DD) as local date to avoid UTC timezone shift
  const dateStr = selectedDate ? (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  })() : '—';

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-purple text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-red-500">Cancel</button>
        </div>
        <div className="mt-4">
          <h1 className="text-gray-900 font-extrabold text-lg">Booking Summary</h1>
        </div>
      </div>

      {/* Progress Bar (Step 4 / 4) */}
      <div className="px-5 mb-5">
        <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-purple rounded-full" style={{ width: '92%' }} />
        </div>
      </div>

      {/* Card Details */}
      <div className="px-5">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-5">
          {/* Movie Poster & Title */}
          <div className="flex gap-4">
            {selectedMovie.poster ? (
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="w-20 aspect-[2/3] object-cover rounded-2xl border border-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-20 aspect-[2/3] bg-gray-100 rounded-2xl" />
            )}
            <div className="flex flex-col justify-between py-0.5">
              <div>
                <h2 className="text-gray-900 font-extrabold text-base leading-tight">{selectedMovie.title}</h2>
                <p className="text-gray-400 text-xs mt-1 font-semibold">{selectedMovie.genres?.join(', ')}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-800">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-black">{selectedMovie.rating || '8.1'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <Detail label="Theatre" value={selectedTheatre?.name || '—'} />
            <Detail label="Date" value={dateStr} />
            <Detail label="Time" value={selectedTime || '—'} />
            <Detail label="Seats" value={selectedSeats.map((s) => `${s.row}${s.col}`).join(', ')} />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <h3 className="text-gray-800 font-extrabold text-xs uppercase tracking-wide mb-3">Receipt Details</h3>
          <div className="space-y-3">
            <PriceRow label={`${selectedSeats.length}x Tickets`} value={`₹${baseTotal}`} />
            <PriceRow label="Booking Fee" value={`₹${BOOKING_FEE}`} />
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex justify-between items-center font-bold text-sm">
              <span className="text-gray-900 font-black">Total</span>
              <span className="text-purple text-base font-black">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom button above nav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-white border-t border-gray-100">
        <button
          id="proceed-to-payment"
          onClick={() => navigate('/payment')}
          className="w-full gradient-purple py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(95,51,225,0.25)] transition-transform active:scale-95 text-center"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{label}</p>
      <p className="text-xs text-gray-800 font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs font-semibold text-gray-500">
      <span>{label}</span>
      <span className="text-gray-800 font-bold">{value}</span>
    </div>
  );
}
