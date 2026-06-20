import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PriceSummary from '../components/PriceSummary';

export default function BookingSummary() {
  const navigate = useNavigate();
  const { selectedSeats, selectedDate, selectedTime, selectedTheatre, selectedShowtime, seatPrice, totalPrice } = useSelector((s) => s.booking);
  const { selectedMovie, selectedFormat } = useSelector((s) => s.movies);

  const BOOKING_FEE = 30;
  const baseTotal = selectedSeats.length * seatPrice;

  if (!selectedMovie || selectedSeats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p className="text-5xl mb-4">🎬</p>
        <p className="text-white font-bold text-lg mb-2">Nothing to summarize</p>
        <p className="text-white/50 text-sm mb-6">Select a movie and seats first</p>
        <button onClick={() => navigate('/')} className="gradient-purple px-6 py-3 rounded-2xl text-white font-bold">
          Browse Movies
        </button>
      </div>
    );
  }

  const dateStr = selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-full flex items-center justify-center">
          <BackIcon />
        </button>
        <h1 className="text-white font-bold text-lg">Booking Summary</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Movie card */}
        <div className="glass rounded-2xl overflow-hidden mb-4 fade-up">
          <div className="flex gap-3 p-4">
            {selectedMovie.poster && (
              <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-20 h-28 object-cover rounded-xl flex-shrink-0" />
            )}
            <div className="flex flex-col justify-between py-1">
              <div>
                <h2 className="text-white font-bold text-base leading-tight">{selectedMovie.title}</h2>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {selectedMovie.genres?.slice(0, 2).map((g) => (
                    <span key={g} className="text-[9px] bg-purple/20 text-purple px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                  <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{selectedFormat}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-yellow-400 text-xs font-semibold">{selectedMovie.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="glass rounded-2xl p-4 mb-4 fade-up">
          <h3 className="text-white font-semibold text-sm mb-3">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Date" value={dateStr} />
            <Detail label="Time" value={selectedTime || '—'} />
            <Detail label="Theatre" value={selectedTheatre?.name || '—'} />
            <Detail label="Screen" value={`Screen ${selectedShowtime?.screen || '—'}`} />
            <Detail label="Format" value={selectedFormat} />
            <Detail label="Seats" value={selectedSeats.map((s) => `${s.row}${s.col}`).join(', ')} />
          </div>
        </div>

        {/* Price breakdown */}
        <div className="glass rounded-2xl p-4 mb-4 fade-up">
          <h3 className="text-white font-semibold text-sm mb-3">Price Breakdown</h3>
          <div className="space-y-2">
            <PriceRow label={`${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''} × ₹${seatPrice}`} value={`₹${baseTotal}`} />
            <PriceRow label="Booking Fee" value={`₹${BOOKING_FEE}`} />
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
              <span className="text-white font-bold">Total</span>
              <span className="text-purple text-xl font-black">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-white/10">
        <button
          id="proceed-to-payment"
          onClick={() => navigate('/payment')}
          className="w-full gradient-purple py-4 rounded-2xl text-white font-bold text-base pulse-glow active:scale-95 transition-transform"
        >
          Proceed to Pay ₹{totalPrice}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-white font-semibold">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
