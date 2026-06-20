import { useDispatch, useSelector } from 'react-redux';
import { toggleSeat } from '../store/bookingSlice';

export function SeatCell({ seat }) {
  const dispatch = useDispatch();
  const selectedSeats = useSelector((s) => s.booking.selectedSeats);
  const isSelected = selectedSeats.some((s) => s.row === seat.row && s.col === seat.col);
  const isOccupied = seat.status === 'occupied';

  const handleClick = () => {
    if (isOccupied) return;
    dispatch(toggleSeat({ row: seat.row, col: seat.col }));
  };

  let cellClass = 'w-6 h-6 rounded-md border transition-all duration-150 ';
  if (isOccupied) {
    cellClass += 'bg-[#9E9E9E] border-[#9E9E9E] cursor-not-allowed';
  } else if (isSelected) {
    cellClass += 'bg-purple border-purple scale-110 pulse-glow cursor-pointer';
  } else {
    cellClass += 'bg-transparent border-white/30 cursor-pointer hover:border-purple/60 hover:scale-105';
  }

  return (
    <button
      className={cellClass}
      onClick={handleClick}
      disabled={isOccupied}
      aria-label={`Seat ${seat.row}${seat.col} ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'available'}`}
    />
  );
}

export default function SeatGrid({ seatMatrix }) {
  if (!seatMatrix || seatMatrix.length === 0) return null;

  const AISLE_AFTER = ['D', 'I']; // gaps after these rows

  return (
    <div className="flex flex-col items-center gap-1.5 py-2 overflow-x-auto px-2">
      {seatMatrix.map((row, rIdx) => {
        const rowLabel = row[0]?.row;
        const showAisle = AISLE_AFTER.includes(rowLabel);
        return (
          <div key={rIdx}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/30 w-4 text-center font-medium">{rowLabel}</span>
              <div className="flex gap-1">
                {row.slice(0, 6).map((seat, cIdx) => (
                  <SeatCell key={cIdx} seat={seat} />
                ))}
              </div>
              <div className="w-4" /> {/* aisle */}
              <div className="flex gap-1">
                {row.slice(6).map((seat, cIdx) => (
                  <SeatCell key={cIdx + 6} seat={seat} />
                ))}
              </div>
            </div>
            {showAisle && <div className="h-3" />}
          </div>
        );
      })}
    </div>
  );
}
