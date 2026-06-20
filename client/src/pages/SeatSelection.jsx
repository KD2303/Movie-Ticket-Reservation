import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchSeats } from '../services/api';
import ScreenArc from '../components/ScreenArc';
import SeatGrid from '../components/SeatGrid';
import PriceSummary from '../components/PriceSummary';

const LEGEND = [
  { color: 'border-purple bg-white', label: 'Available' },
  { color: 'bg-gray-300 border-gray-300', label: 'Occupied' },
  { color: 'bg-purple border-purple', label: 'Selected' },
];

export default function SeatSelection() {
  const navigate = useNavigate();
  const { selectedShowtime, selectedSeats, selectedTheatre } = useSelector((s) => s.booking);
  const { selectedMovie } = useSelector((s) => s.movies);

  const [seatMatrix, setSeatMatrix] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedShowtime?._id) {
      navigate('/');
      return;
    }
    setLoading(true);
    fetchSeats(selectedShowtime._id)
      .then((r) => setSeatMatrix(r.data.data.seatMatrix))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedShowtime, navigate]);

  const canProceed = selectedSeats.length > 0;

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
        <div className="mt-4 flex justify-between items-end">
          <div>
            <h1 className="text-gray-900 font-extrabold text-lg leading-none">Select Seats</h1>
            <p className="text-gray-400 text-xs font-semibold mt-1">
              {selectedTheatre?.name || 'Screen 1'} · {selectedShowtime?.time || '10:00 AM'}
            </p>
          </div>
          <span className="text-purple font-extrabold text-sm">₹{selectedShowtime?.price || 350} <span className="text-[10px] text-gray-400 font-medium">/ seat</span></span>
        </div>
      </div>

      {/* Progress Bar (Step 3 / 4) */}
      <div className="px-5 mb-4">
        <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-purple rounded-full" style={{ width: '75%' }} />
        </div>
      </div>

      {/* Screen Curved Arc */}
      <ScreenArc />

      {/* Seat Matrix Grid */}
      <div className="px-3">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SeatGrid seatMatrix={seatMatrix} />
        )}
      </div>

      {/* Live Price Summary */}
      <div className="px-5 mb-4">
        <PriceSummary compact={true} />
      </div>

      {/* Legends */}
      <div className="flex justify-center gap-6 py-4 border-t border-gray-100 bg-white">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border ${color}`} />
            <span className="text-gray-500 text-[10px] font-bold">{label}</span>
          </div>
        ))}
      </div>

      {/* Sticky Bottom button above nav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 bg-white border-t border-gray-100">
        <button
          id="proceed-to-summary"
          disabled={!canProceed}
          onClick={() => navigate('/summary')}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all text-center ${
            canProceed
              ? 'gradient-purple text-white shadow-[0_4px_16px_rgba(95,51,225,0.25)]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          View Booking Summary
        </button>
      </div>
    </div>
  );
}
