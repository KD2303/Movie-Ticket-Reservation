import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { cancelBookingThunk, loadBookings } from '../store/historySlice';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/20 text-red-400' },
};

export default function TicketCard({ booking }) {
  const dispatch = useDispatch();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const showtime = booking.showtimeId;
  const theatre = showtime?.theatreId;
  const date = showtime?.date ? new Date(showtime.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
  const seats = booking.seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—';
  const status = STATUS_MAP[booking.status] || STATUS_MAP.active;

  const handleCancel = async () => {
    setCancelling(true);
    await dispatch(cancelBookingThunk(booking._id));
    await dispatch(loadBookings());
    setCancelling(false);
    setShowCancel(false);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden fade-up mb-4">
      {/* Header strip */}
      <div className="gradient-purple px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-white font-bold text-sm line-clamp-1">{showtime?.tmdbMovieId ? `Movie #${showtime.tmdbMovieId}` : 'Movie'}</p>
          <p className="text-white/70 text-xs">{theatre?.name || '—'}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
      </div>

      <div className="px-4 py-3">
        {/* Details row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Detail label="Date" value={date} />
          <Detail label="Time" value={showtime?.time || '—'} />
          <Detail label="Screen" value={`Screen ${showtime?.screen || '—'}`} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Detail label="Seats" value={seats} />
          <Detail label="Amount" value={`₹${booking.totalAmount}`} />
        </div>

        {/* Perforated divider */}
        <div className="flex items-center gap-1 my-3">
          <div className="w-4 h-4 rounded-full bg-bg -ml-6" />
          <div className="flex-1 border-t border-dashed border-white/20" />
          <div className="w-4 h-4 rounded-full bg-bg -mr-6" />
        </div>

        {/* QR Code toggle */}
        <button
          id={`qr-toggle-${booking._id}`}
          onClick={() => setShowQR(!showQR)}
          className="w-full text-center text-xs text-purple/70 hover:text-purple mb-2 transition-colors"
        >
          {showQR ? 'Hide QR Code ▲' : 'Show QR Code ▼'}
        </button>
        {showQR && (
          <div className="flex justify-center p-3 bg-white rounded-xl mb-3 scale-in">
            <QRCode value={booking._id} size={128} />
          </div>
        )}

        {/* Cancel button */}
        {booking.status === 'active' && (
          <button
            id={`cancel-btn-${booking._id}`}
            onClick={() => setShowCancel(true)}
            className="w-full py-2 rounded-xl text-red-400 border border-red-400/30 text-sm font-medium hover:bg-red-400/10 transition-all"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6 fade-in">
          <div className="glass rounded-2xl p-6 max-w-[340px] w-full scale-in">
            <h3 className="text-white font-bold text-lg mb-2">Cancel Booking?</h3>
            <p className="text-white/60 text-sm mb-5">Your seats will be freed and the booking marked as cancelled. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
              >
                Keep it
              </button>
              <button
                id={`confirm-cancel-${booking._id}`}
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
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
