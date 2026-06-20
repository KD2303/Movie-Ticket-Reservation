import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { cancelBookingThunk, loadBookings } from '../store/historySlice';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import axios from 'axios';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'bg-green-50 text-green-600 border border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border border-red-200' },
};

export default function TicketCard({ booking }) {
  const dispatch = useDispatch();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [movieName, setMovieName] = useState('Movie');

  const showtime = booking.showtimeId;
  const theatre = showtime?.theatreId;
  const date = showtime?.date ? new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
  const seats = booking.seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—';
  const status = STATUS_MAP[booking.status] || STATUS_MAP.active;

  useEffect(() => {
    if (showtime?.tmdbMovieId) {
      axios.get(`/api/movies/${showtime.tmdbMovieId}`)
        .then((res) => {
          if (res.data?.data?.title) {
            setMovieName(res.data.data.title);
          }
        })
        .catch(() => {});
    }
  }, [showtime]);

  const handleCancel = async () => {
    setCancelling(true);
    await dispatch(cancelBookingThunk(booking._id));
    await dispatch(loadBookings());
    setCancelling(false);
    setShowCancel(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-5 fade-up">
      {/* Header strip */}
      <div className="gradient-purple px-5 py-4 flex justify-between items-center text-white">
        <div>
          <p className="font-extrabold text-sm leading-tight line-clamp-1">{movieName}</p>
          <p className="text-[10px] opacity-80 mt-0.5">{theatre?.name || '—'}</p>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${status.cls}`}>{status.label}</span>
      </div>

      <div className="p-5">
        {/* Details row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Detail label="Date" value={date} />
          <Detail label="Time" value={showtime?.time || '—'} />
          <Detail label="Screen" value={`Screen ${showtime?.screen || '—'}`} />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Detail label="Seats" value={seats} />
          <Detail label="Amount" value={`₹${booking.totalAmount}`} />
        </div>

        {/* Perforated divider */}
        <div className="flex items-center gap-1.5 my-4 relative">
          <div className="w-4 h-4 rounded-full bg-gray-100 border-r border-gray-100 absolute -left-7" />
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <div className="w-4 h-4 rounded-full bg-gray-100 border-l border-gray-100 absolute -right-7" />
        </div>

        {/* QR Code toggle */}
        <div className="flex flex-col items-center">
          <button
            id={`qr-toggle-${booking._id}`}
            onClick={() => setShowQR(!showQR)}
            className="text-purple font-extrabold text-xs flex items-center gap-1 mb-2 hover:underline"
          >
            {showQR ? 'Hide Ticket Barcode ▲' : 'Show Ticket Barcode ▼'}
          </button>
          {showQR && (
            <div className="flex justify-center p-4 bg-white border border-gray-100 rounded-2xl mb-4 scale-in shadow-sm">
              <QRCode value={booking._id} size={110} />
            </div>
          )}
        </div>

        {/* Cancel button */}
        {booking.status === 'active' && (
          <button
            id={`cancel-btn-${booking._id}`}
            onClick={() => setShowCancel(true)}
            className="w-full py-2.5 mt-2 rounded-xl text-red-500 border border-red-100 bg-red-50/50 text-xs font-bold hover:bg-red-50 transition-all text-center"
          >
            Cancel Reservation
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-[320px] w-full scale-in shadow-xl border border-gray-100">
            <h3 className="text-gray-900 font-extrabold text-base mb-1">Cancel Reservation?</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-5">Your seats will be freed and returned to inventory. Refunds are processed automatically within 2-3 business days.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold transition-all"
              >
                Keep
              </button>
              <button
                id={`confirm-cancel-${booking._id}`}
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-xs font-extrabold transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
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
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{label}</p>
      <p className="text-xs text-gray-800 font-extrabold mt-0.5">{value}</p>
    </div>
  );
}
