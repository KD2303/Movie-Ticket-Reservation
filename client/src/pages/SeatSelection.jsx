import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchSeats } from '../services/api';
import ScreenArc from '../components/ScreenArc';
import SeatGrid from '../components/SeatGrid';
import PriceSummary from '../components/PriceSummary';

const LEGEND = [
  { color: 'border-white/30 bg-transparent', label: 'Available' },
  { color: 'bg-[#9E9E9E] border-[#9E9E9E]', label: 'Occupied' },
  { color: 'bg-purple border-purple', label: 'Selected' },
];

export default function SeatSelection() {
  const navigate = useNavigate();
  const { selectedShowtime, selectedSeats } = useSelector((s) => s.booking);
  const { selectedMovie } = useSelector((s) => s.movies);

  const [seatMatrix, setSeatMatrix] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedShowtime?._id) return;
    setLoading(true);
    fetchSeats(selectedShowtime._id)
      .then((r) => setSeatMatrix(r.data.data.seatMatrix))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedShowtime]);

  const canProceed = selectedSeats.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-9 h-9 glass rounded-full flex items-center justify-center">
          <BackIcon />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-base">Select Seats</h1>
          {selectedMovie && <p className="text-white/40 text-xs line-clamp-1">{selectedMovie.title}</p>}
        </div>
        <div className="text-right">
          <p className="text-purple font-bold text-sm">₹{selectedShowtime?.price || 0}</p>
          <p className="text-white/40 text-[10px]">per seat</p>
        </div>
      </div>

      {/* Max seats notice */}
      <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-purple/10 border border-purple/20">
        <p className="text-purple text-xs text-center font-medium">Max 6 seats per booking · {6 - selectedSeats.length} remaining</p>
      </div>

      {/* Screen Arc */}
      <ScreenArc />

      {/* Seat Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SeatGrid seatMatrix={seatMatrix} />
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 py-3">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border ${color}`} />
            <span className="text-white/50 text-[10px]">{label}</span>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="px-4 pb-2">
        <PriceSummary compact />
      </div>

      {/* Proceed CTA */}
      <div className="p-4 border-t border-white/10">
        <button
          id="proceed-to-summary"
          disabled={!canProceed}
          onClick={() => navigate('/summary')}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
            canProceed ? 'gradient-purple text-white pulse-glow' : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {canProceed ? `Proceed with ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}` : 'Select seats to continue'}
        </button>
      </div>
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
