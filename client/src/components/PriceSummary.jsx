import { useSelector } from 'react-redux';

const BOOKING_FEE = 30;

export default function PriceSummary({ compact = false }) {
  const { selectedSeats, seatPrice, totalPrice } = useSelector((s) => s.booking);
  const count = selectedSeats.length;

  if (count === 0 && compact) return null;

  return (
    <div className={`glass rounded-2xl p-4 ${compact ? 'mx-4' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">Selected Seats</span>
        <div className="flex gap-1 flex-wrap justify-end max-w-[160px]">
          {count === 0 ? (
            <span className="text-sm text-white/30">None</span>
          ) : (
            selectedSeats.map((s) => (
              <span key={`${s.row}${s.col}`} className="text-xs bg-purple/20 text-purple px-2 py-0.5 rounded-full font-semibold">
                {s.row}{s.col}
              </span>
            ))
          )}
        </div>
      </div>
      {!compact && (
        <>
          <div className="flex justify-between text-sm text-white/60 mb-1">
            <span>{count} × ₹{seatPrice}</span>
            <span>₹{count * seatPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-white/60 mb-3">
            <span>Booking Fee</span>
            <span>₹{count > 0 ? BOOKING_FEE : 0}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white">
            <span>Total</span>
            <span className="text-purple text-lg">₹{totalPrice}</span>
          </div>
        </>
      )}
      {compact && (
        <div className="flex justify-between font-bold text-white items-center">
          <span className="text-white/60 text-sm">{count} seat{count !== 1 ? 's' : ''}</span>
          <span className="text-purple text-xl">₹{totalPrice}</span>
        </div>
      )}
    </div>
  );
}
