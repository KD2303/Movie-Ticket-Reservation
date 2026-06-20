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

  let cellClass = 'w-5.5 h-5.5 rounded-[5px] text-[8px] font-black flex items-center justify-center border transition-all duration-150 ';
  if (isOccupied) {
    cellClass += 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed';
  } else if (isSelected) {
    cellClass += 'bg-purple border-purple text-white shadow-[0_2px_6px_rgba(95,51,225,0.3)] scale-105 cursor-pointer';
  } else {
    cellClass += 'bg-white border-purple/30 text-purple/80 hover:border-purple cursor-pointer';
  }

  // Row label A..M, and col index 1..12
  const label = `${seat.col}`;

  return (
    <button
      className={cellClass}
      onClick={handleClick}
      disabled={isOccupied}
      style={{ width: '22px', height: '22px' }}
      aria-label={`Seat ${seat.row}${seat.col} ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'available'}`}
    >
      {label}
    </button>
  );
}

export default function SeatGrid({ seatMatrix }) {
  if (!seatMatrix || seatMatrix.length === 0) return null;

  // Let's create rows A-H, then gap, then J-M
  const AISLE_AFTER_ROW = ['H']; // gap after H (since there's no row I in many theatres)

  return (
    <div className="flex flex-col items-center gap-1.5 py-4 overflow-x-auto w-full select-none">
      {seatMatrix.map((row, rIdx) => {
        const rowLabel = row[0]?.row;
        const showRowAisle = AISLE_AFTER_ROW.includes(rowLabel);

        return (
          <div key={rIdx} className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2">
              {/* Left row letter */}
              <span className="text-[10px] text-gray-400 w-3 text-center font-bold">{rowLabel}</span>
              
              {/* Row seats with 2-8-2 layout */}
              <div className="flex items-center gap-1.5">
                {/* First 2 seats */}
                <div className="flex gap-1">
                  {row.slice(0, 2).map((seat, cIdx) => (
                    <SeatCell key={cIdx} seat={seat} />
                  ))}
                </div>

                {/* Left Aisle */}
                <div className="w-2.5" />

                {/* Middle 8 seats */}
                <div className="flex gap-1">
                  {row.slice(2, 10).map((seat, cIdx) => (
                    <SeatCell key={cIdx + 2} seat={seat} />
                  ))}
                </div>

                {/* Right Aisle */}
                <div className="w-2.5" />

                {/* Last 2 seats */}
                <div className="flex gap-1">
                  {row.slice(10).map((seat, cIdx) => (
                    <SeatCell key={cIdx + 10} seat={seat} />
                  ))}
                </div>
              </div>

              {/* Right row letter */}
              <span className="text-[10px] text-gray-400 w-3 text-center font-bold">{rowLabel}</span>
            </div>

            {showRowAisle && <div className="h-3" />}
          </div>
        );
      })}
    </div>
  );
}
