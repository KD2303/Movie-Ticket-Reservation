import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../services/api';
import { clearBooking } from '../store/bookingSlice';

const PAYMENT_METHODS = ['Credit / Debit Card', 'UPI', 'Net Banking', 'Wallet'];

export default function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSeats, selectedShowtime, totalPrice } = useSelector((s) => s.booking);
  const { selectedMovie } = useSelector((s) => s.movies);

  const [method, setMethod] = useState('Credit / Debit Card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      await createBooking({
        userId: 'guest',
        showtimeId: selectedShowtime._id,
        seats: selectedSeats,
        totalAmount: totalPrice,
      });
      setSuccess(true);
      dispatch(clearBooking());
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="scale-in">
          <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center mx-auto mb-6 pulse-glow">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-white font-black text-2xl mb-2">Booking Confirmed!</h2>
          <p className="text-white/50 text-sm mb-2">Your tickets have been booked successfully</p>
          <p className="text-purple text-sm font-semibold">Redirecting to your bookings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-full flex items-center justify-center">
          <BackIcon />
        </button>
        <h1 className="text-white font-bold text-lg">Payment</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Order summary */}
        <div className="glass rounded-2xl p-4 mb-4 fade-up">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-semibold text-sm">{selectedMovie?.title || 'Movie'}</p>
              <p className="text-white/40 text-xs mt-0.5">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} · {selectedSeats.map((s) => `${s.row}${s.col}`).join(', ')}</p>
            </div>
            <p className="text-purple font-black text-xl">₹{totalPrice}</p>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="glass rounded-2xl p-4 mb-4 fade-up">
          <h3 className="text-white font-semibold text-sm mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                id={`pay-method-${m.replace(/\s+/g, '-')}`}
                onClick={() => setMethod(m)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
                  method === m ? 'gradient-purple text-white border-transparent' : 'border-white/20 text-white/60 hover:border-purple/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        {method === 'Credit / Debit Card' && (
          <div className="glass rounded-2xl p-4 mb-4 fade-up">
            <h3 className="text-white font-semibold text-sm mb-3">Card Details</h3>
            <div className="space-y-3">
              <Input
                label="Card Number"
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={(v) => setCard((c) => ({ ...c, number: v }))}
                maxLength={19}
              />
              <Input
                label="Cardholder Name"
                id="card-name"
                placeholder="John Doe"
                value={card.name}
                onChange={(v) => setCard((c) => ({ ...c, name: v }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry"
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(v) => setCard((c) => ({ ...c, expiry: v }))}
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  id="card-cvv"
                  placeholder="•••"
                  value={card.cvv}
                  onChange={(v) => setCard((c) => ({ ...c, cvv: v }))}
                  maxLength={3}
                  type="password"
                />
              </div>
            </div>
          </div>
        )}
        {method === 'UPI' && (
          <div className="glass rounded-2xl p-4 mb-4 fade-up">
            <Input label="UPI ID" id="upi-id" placeholder="name@upi" value={upi} onChange={setUpi} />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Pay CTA */}
      <div className="p-4 border-t border-white/10">
        <button
          id="confirm-payment"
          onClick={handlePay}
          disabled={loading}
          className="w-full gradient-purple py-4 rounded-2xl text-white font-bold text-base pulse-glow active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </span>
          ) : `Pay ₹${totalPrice}`}
        </button>
        <p className="text-center text-white/30 text-xs mt-3">🔒 Secured by 256-bit SSL encryption (mock)</p>
      </div>
    </div>
  );
}

function Input({ label, id, placeholder, value, onChange, maxLength, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="text-white/50 text-xs mb-1.5 block">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple transition-colors"
      />
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
