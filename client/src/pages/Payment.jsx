import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BOOKING_FEE } from '../constants';
import { createBooking } from '../services/api';
import { clearBooking } from '../store/bookingSlice';

export default function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSeats, selectedShowtime, totalPrice, seatPrice } = useSelector((s) => s.booking);
  const { selectedMovie } = useSelector((s) => s.movies);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    // Strict guard: _id must be a non-empty string (not a corrupt rehydration value like "F")
    if (!selectedShowtime?._id || typeof selectedShowtime._id !== 'string') {
      navigate('/');
    }
  }, [selectedShowtime, navigate]);

  const baseTotal = selectedSeats.length * seatPrice;

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'wallet'
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [saveDetails, setSaveDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createBooking({
        showtimeId: selectedShowtime._id,
        seats: selectedSeats,
        totalAmount: totalPrice,
      });
      const bookingId = res.data.data._id;
      setSuccess(true);
      dispatch(clearBooking());
      setTimeout(() => navigate(`/bookings/${bookingId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="scale-in">
          <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-gray-900 font-extrabold text-xl mb-1">Payment Successful!</h2>
          <p className="text-gray-400 text-xs mb-3">Your tickets have been reserved</p>
          <p className="text-purple text-xs font-bold animate-pulse">Redirecting to Ticket Details…</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-gray-900 font-extrabold text-lg">Checkout</h1>
        </div>
      </div>

      {/* Progress Bar (Step 4 / 4 Complete) */}
      <div className="px-5 mb-5">
        <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-purple rounded-full" style={{ width: '99%' }} />
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* Receipt / Summary Details */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-gray-800 font-extrabold text-xs uppercase tracking-wide mb-3">Summary</p>
          <div className="space-y-2 text-xs font-semibold text-gray-500">
            <div className="flex justify-between">
              <span>{selectedSeats.length}x Tickets</span>
              <span className="text-gray-800 font-bold">₹{baseTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking Fee</span>
              <span className="text-gray-800 font-bold">₹{BOOKING_FEE}</span>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex justify-between items-center font-bold text-sm">
              <span className="text-gray-900 font-black">Total</span>
              <span className="text-purple text-base font-black">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Choose Payment Method */}
        <div>
          <p className="text-gray-800 font-extrabold text-xs uppercase tracking-wide mb-3">Choose payment method</p>
          <div className="flex gap-4 items-center mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="w-4 h-4 text-purple focus:ring-purple border-gray-300"
              />
              <span className="text-xs font-bold text-gray-800">Credit/Debit Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'wallet'}
                onChange={() => setPaymentMethod('wallet')}
                className="w-4 h-4 text-purple focus:ring-purple border-gray-300"
              />
              <span className="text-xs font-bold text-gray-800">Mobile Wallet</span>
            </label>
          </div>

          {/* Form fields for Card */}
          {paymentMethod === 'card' ? (
            <div className="flex flex-col gap-3.5">
              <Input
                label="Name on card"
                id="card-name"
                placeholder="Name on card"
                value={card.name}
                onChange={(v) => setCard((c) => ({ ...c, name: v }))}
              />
              <Input
                label="Card number"
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={(v) => setCard((c) => ({ ...c, number: v }))}
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry date"
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(v) => setCard((c) => ({ ...c, expiry: v }))}
                  maxLength={5}
                />
                <Input
                  label="CVV/CVC"
                  id="card-cvv"
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={(v) => setCard((c) => ({ ...c, cvv: v }))}
                  maxLength={3}
                  type="password"
                />
              </div>

              {/* Save payment details */}
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveDetails}
                  onChange={(e) => setSaveDetails(e.target.checked)}
                  className="w-4 h-4 text-purple rounded border-gray-300 focus:ring-purple"
                />
                <span className="text-[11px] font-bold text-gray-500">Save payment details for the next purchase</span>
              </label>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-xs text-gray-400">
              Mobile Wallet checkout selected (Mock integration)
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom button above nav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-white border-t border-gray-100">
        <button
          id="confirm-payment"
          onClick={handlePay}
          disabled={loading}
          className="w-full gradient-purple py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(95,51,225,0.25)] transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing…</span>
            </>
          ) : (
            <span>Complete Payment</span>
          )}
        </button>
      </div>
    </div>
  );
}

function Input({ label, id, placeholder, value, onChange, maxLength, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="text-gray-700 text-xs font-bold mb-1.5 block">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-xs font-semibold placeholder-gray-300 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
      />
    </div>
  );
}
